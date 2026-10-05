// Urban Procures Advanced
// Identity Masking & Data Sanitization Engine

import type { RFQ, Quotation, ContractorProfile, VendorProfile } from '../shared/types.ts';

export class IdentityMaskingService {
  /**
   * Generates a synthetic pseudonym for a contractor prior to award
   * e.g., "Client #RFQ-8291"
   */
  public static maskContractorIdentity(rfqRef: string): string {
    const cleanRef = rfqRef.replace(/[^A-Za-z0-9]/g, '');
    const shortHash = cleanRef.slice(-4).toUpperCase();
    return `Client #RFQ-${shortHash || '7721'}`;
  }

  /**
   * Generates a synthetic pseudonym for a vendor prior to award
   * e.g., "Vendor #VND-4102"
   */
  public static maskVendorIdentity(vendorId: string): string {
    const cleanId = vendorId.replace(/[^A-Za-z0-9]/g, '');
    const shortHash = cleanId.slice(-4).toUpperCase();
    return `Vendor #VND-${shortHash || '5501'}`;
  }

  /**
   * Sanitizes RFQ object for vendor viewing
   * CONTRACTOR DETAILS MUST NEVER LEAK IN PRE-AWARD STAGE
   */
  public static sanitizeRfqForVendor(
    rfq: RFQ,
    contractor: ContractorProfile & { email?: string },
    isAwardedToThisVendor: boolean = false
  ): RFQ {
    const cloned = JSON.parse(JSON.stringify(rfq)) as RFQ;

    if (!isAwardedToThisVendor) {
      // PRE-AWARD or NON-AWARDED: Strictly mask contractor identity
      cloned.contractorDisplayName = this.maskContractorIdentity(rfq.referenceCode);
      delete cloned.contractorCompany;
      delete cloned.contractorContact;
    } else {
      // POST-AWARD: Unmask contact details only for the winning vendor
      cloned.contractorDisplayName = contractor.companyName;
      cloned.contractorCompany = contractor.companyName;
      cloned.contractorContact = {
        contactPerson: contractor.contactPerson,
        contactPhone: contractor.contactPhone,
        email: contractor.email || 'procurement@apexfitout.ae',
        address: `${contractor.address}, ${contractor.emirate}`,
      };
    }

    return cloned;
  }

  /**
   * Sanitizes Quotation object for contractor viewing
   * VENDOR DETAILS MUST NEVER LEAK IN PRE-AWARD STAGE
   */
  public static sanitizeQuotationForContractor(
    quotation: Quotation,
    vendor: VendorProfile & { email?: string },
    isAwarded: boolean = false
  ): Quotation {
    const cloned = JSON.parse(JSON.stringify(quotation)) as Quotation;

    if (!isAwarded) {
      // PRE-AWARD: Strictly mask vendor identity
      cloned.vendorDisplayName = this.maskVendorIdentity(quotation.vendorId);
      delete cloned.vendorCompany;
      delete cloned.vendorContact;
      // Strip any vendor-identifying remarks in notes if present
      if (cloned.notes) {
        cloned.notes = cloned.notes.replace(/\b(call|contact|email|phone|\+971|05\d|www\.)\S*/gi, '[REDACTED]');
      }
    } else {
      // POST-AWARD: Unmask contact details for the winning vendor
      cloned.vendorDisplayName = vendor.companyName;
      cloned.vendorCompany = vendor.companyName;
      cloned.vendorContact = {
        contactPerson: vendor.contactPerson,
        contactPhone: vendor.contactPhone,
        email: vendor.email || 'bids@emiratesjoinery.ae',
        tradeLicenseNumber: vendor.tradeLicenseNumber,
      };
    }

    return cloned;
  }
}
