// Urban Procures Advanced
// Unit & Integration Test Suite

import { RFQStateMachine } from '../workers/rfqStateMachine.ts';
import { IdentityMaskingService } from '../workers/identityMasking.ts';
import { ServiceChargeEngine } from '../workers/serviceChargeEngine.ts';
import { AuthorizationPolicy } from '../workers/authorization.ts';
import { RFQ, Quotation, ContractorProfile, VendorProfile } from '../shared/types.ts';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

export function runAllUrbanProcuresTests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, suite: string, name: string, message?: string) {
    results.push({
      suite,
      name,
      passed: condition,
      message: condition ? undefined : message || 'Assertion failed',
    });
  }

  // 1. RFQ State Machine Tests
  try {
    const draftToSubmitted = RFQStateMachine.validateTransition('draft', 'submitted', { hasItems: true });
    assert(draftToSubmitted.allowed, 'RFQ State Machine', 'Draft with BoQ can transition to Submitted');

    const draftWithoutItems = RFQStateMachine.validateTransition('draft', 'submitted', { hasItems: false });
    assert(!draftWithoutItems.allowed, 'RFQ State Machine', 'Draft without BoQ cannot transition to Submitted');

    const illegalSkip = RFQStateMachine.validateTransition('draft', 'awarded');
    assert(!illegalSkip.allowed, 'RFQ State Machine', 'Draft cannot jump directly to Awarded');

    const awardWithoutQuote = RFQStateMachine.validateTransition('under_evaluation', 'awarded');
    assert(!awardWithoutQuote.allowed, 'RFQ State Machine', 'Award requires designated quotation ID');

    const awardWithQuote = RFQStateMachine.validateTransition('under_evaluation', 'awarded', {
      selectedQuotationId: 'qte-123',
    });
    assert(awardWithQuote.allowed, 'RFQ State Machine', 'Award with selected quotation is valid');
  } catch (err) {
    assert(false, 'RFQ State Machine', 'Execution error', String(err));
  }

  // 2. Identity Masking Tests
  try {
    const mockContractor: ContractorProfile = {
      id: 'cnt-01',
      userId: 'usr-cnt-01',
      companyName: 'Al Hamra Fitout LLC',
      tradeLicenseNumber: 'CN-892110',
      emirate: 'Dubai',
      address: 'Business Bay, Tower 1',
      contactPerson: 'Tariq Mansoor',
      contactPhone: '+971 50 123 4567',
    };

    const mockVendor: VendorProfile = {
      id: 'vnd-01',
      userId: 'usr-vnd-01',
      companyName: 'Emirates Glass & Aluminum Works',
      tradeLicenseNumber: 'TL-551920',
      tradeCategories: ['glazing', 'metalwork'],
      emiratesServiced: ['Dubai', 'Sharjah'],
      verificationStatus: 'verified',
      contactPerson: 'Suresh Kumar',
      contactPhone: '+971 55 987 6543',
    };

    const mockRfq: RFQ = {
      id: 'rfq-01',
      referenceCode: 'RFQ-2026-9901',
      contractorId: 'cnt-01',
      title: 'Luxury Villa Glazing Package',
      category: 'Glazing',
      projectName: 'Palm Jumeirah Villa 42',
      locationEmirate: 'Dubai',
      submissionDeadline: '2026-10-20',
      scopeDescription: 'Supply and installation of thermal break acoustic glazing',
      status: 'receiving_quotations',
      createdAt: '2026-10-01',
      items: [],
      documents: [],
    };

    const mockQuotation: Quotation = {
      id: 'qte-01',
      referenceCode: 'QTE-2026-4401',
      rfqId: 'rfq-01',
      vendorId: 'vnd-01',
      totalAmountAed: 145000,
      leadTimeDays: 21,
      validityDays: 30,
      paymentTerms: '30% advance, 70% upon installation',
      status: 'submitted',
      submittedAt: '2026-10-02',
      items: [],
    };

    // Pre-award test for Vendor seeing RFQ: Contractor MUST be masked
    const vendorView = IdentityMaskingService.sanitizeRfqForVendor(mockRfq, mockContractor, false);
    assert(
      !vendorView.contractorCompany && Boolean(vendorView.contractorDisplayName?.startsWith('Client #RFQ-')),
      'Identity Masking',
      'Contractor company name is masked prior to award'
    );
    assert(
      !vendorView.contractorContact,
      'Identity Masking',
      'Contractor contact phone and address are deleted prior to award'
    );

    // Pre-award test for Contractor seeing Quotation: Vendor MUST be masked
    const contractorView = IdentityMaskingService.sanitizeQuotationForContractor(mockQuotation, mockVendor, false);
    assert(
      !contractorView.vendorCompany && Boolean(contractorView.vendorDisplayName?.startsWith('Vendor #VND-')),
      'Identity Masking',
      'Vendor company name is masked prior to award'
    );
    assert(
      !contractorView.vendorContact,
      'Identity Masking',
      'Vendor contact phone and trade license are deleted prior to award'
    );

    // Post-award unmasking test for the winning pair
    const unmaskedVendorView = IdentityMaskingService.sanitizeRfqForVendor(mockRfq, mockContractor, true);
    assert(
      unmaskedVendorView.contractorCompany === 'Al Hamra Fitout LLC',
      'Identity Masking',
      'Contractor identity successfully released post-award to winning vendor'
    );

    const unmaskedContractorView = IdentityMaskingService.sanitizeQuotationForContractor(mockQuotation, mockVendor, true);
    assert(
      unmaskedContractorView.vendorCompany === 'Emirates Glass & Aluminum Works',
      'Identity Masking',
      'Vendor identity successfully released post-award to contractor'
    );
  } catch (err) {
    assert(false, 'Identity Masking', 'Execution error', String(err));
  }

  // 3. Service Charge Calculation Tests
  try {
    // Test A: Normal percentage above minimum
    // 200,000 * 2.5% = 5,000
    const calcA = ServiceChargeEngine.calculate({ contractAmountAed: 200000 });
    assert(calcA.totalServiceChargeAed === 5000, 'Service Charge Engine', 'Standard 2.5% calculated correctly');
    assert(!calcA.minimumChargeEnforced, 'Service Charge Engine', 'Minimum threshold not triggered above AED 500');

    // Test B: Small contract triggering AED 500 minimum
    // 10,000 * 2.5% = 250 -> Enforces AED 500
    const calcB = ServiceChargeEngine.calculate({ contractAmountAed: 10000 });
    assert(calcB.totalServiceChargeAed === 500, 'Service Charge Engine', 'Minimum AED 500 enforced on small contract');
    assert(calcB.minimumChargeEnforced, 'Service Charge Engine', 'Minimum charge flag set to true');

    // Test C: Site visit fee addition
    const calcC = ServiceChargeEngine.calculate({ contractAmountAed: 50000, siteVisitRequested: true });
    // 50,000 * 2.5% = 1250 + 100 site visit = 1350
    assert(calcC.totalServiceChargeAed === 1350, 'Service Charge Engine', 'Optional AED 100 site visit fee added accurately');
  } catch (err) {
    assert(false, 'Service Charge Engine', 'Execution error', String(err));
  }

  // 4. Authorization & RBAC Tests
  try {
    const contractorAuth = { role: 'contractor' as const, contractorId: 'cnt-01' };
    const otherContractorAuth = { role: 'contractor' as const, contractorId: 'cnt-99' };
    const vendorAuthNoTerms = { role: 'vendor' as const, vendorId: 'vnd-01', hasAcceptedTerms: false };
    const vendorAuthWithTerms = { role: 'vendor' as const, vendorId: 'vnd-01', hasAcceptedTerms: true };

    assert(
      AuthorizationPolicy.canManageRfq(contractorAuth, 'cnt-01'),
      'Authorization Policy',
      'Contractor can manage own RFQ'
    );
    assert(
      !AuthorizationPolicy.canManageRfq(otherContractorAuth, 'cnt-01'),
      'Authorization Policy',
      'Contractor cannot manage another contractor RFQ'
    );
    assert(
      !AuthorizationPolicy.canSubmitQuotation(vendorAuthNoTerms, 'receiving_quotations').allowed,
      'Authorization Policy',
      'Vendor without accepted terms is blocked from submitting quotations'
    );
    assert(
      AuthorizationPolicy.canSubmitQuotation(vendorAuthWithTerms, 'receiving_quotations').allowed,
      'Authorization Policy',
      'Verified vendor with accepted terms can submit quotation to active RFQ'
    );
  } catch (err) {
    assert(false, 'Authorization Policy', 'Execution error', String(err));
  }

  return results;
}
