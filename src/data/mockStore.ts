import {
  User,
  ContractorProfile,
  VendorProfile,
  PublicQuoteRequest,
  RFQ,
  Quotation,
  AwardRecord,
  ServiceChargeRule,
  AuditEvent,
  InvitationRecord,
  DocumentMetadata,
  UserRole,
} from '../types/index.ts';
import { RFQStateMachine } from '../../urbanprocures advanced/workers/rfqStateMachine.ts';
import { IdentityMaskingService } from '../../urbanprocures advanced/workers/identityMasking.ts';
import { ServiceChargeEngine } from '../../urbanprocures advanced/workers/serviceChargeEngine.ts';
import { AuditService } from '../../urbanprocures advanced/workers/auditService.ts';

// Initial Seeds
const INITIAL_USERS: User[] = [
  { id: 'usr-cnt-01', email: 'procurement@apexfitout.ae', password: 'password', role: 'contractor', status: 'active', createdAt: '2026-09-10T08:00:00Z' },
  { id: 'usr-vnd-01', email: 'bids@emiratesjoinery.ae', password: 'password', role: 'vendor', status: 'active', createdAt: '2026-09-12T09:30:00Z' },
  { id: 'usr-vnd-02', email: 'sales@gulfacoustic.ae', password: 'password', role: 'vendor', status: 'active', createdAt: '2026-09-15T11:00:00Z' },
  { id: 'usr-adm-01', email: 'admin@urbanprocures.com', password: 'password', role: 'admin', status: 'active', createdAt: '2026-08-01T00:00:00Z' },
];

const INITIAL_CONTRACTORS: ContractorProfile[] = [
  {
    id: 'cnt-01',
    userId: 'usr-cnt-01',
    companyName: 'Apex Fit-Out Contracting LLC',
    tradeLicenseNumber: 'CN-778102',
    tradeLicenseExpiry: '2027-05-15',
    emirate: 'Dubai',
    address: 'Al Quoz Industrial Area 3, Street 18',
    contactPerson: 'Tariq Mansoor',
    contactPhone: '+971 50 442 8891',
    verifiedAt: '2026-09-11T10:00:00Z',
  },
];

const INITIAL_VENDORS: VendorProfile[] = [
  {
    id: 'vnd-01',
    userId: 'usr-vnd-01',
    companyName: 'Emirates Joinery & Woodcraft LLC',
    tradeLicenseNumber: 'TL-228910',
    tradeCategories: ['Joinery & Carpentry', 'Custom Cabinetry', 'Doors & Paneling'],
    emiratesServiced: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    verificationStatus: 'verified',
    contactPerson: 'Suresh Kumar',
    contactPhone: '+971 55 331 4455',
    termsAcceptedAt: '2026-09-13T14:22:00Z',
  },
  {
    id: 'vnd-02',
    userId: 'usr-vnd-02',
    companyName: 'Gulf Acoustic & Partition Specialists',
    tradeLicenseNumber: 'TL-441029',
    tradeCategories: ['Gypsum & Drywall', 'Acoustic Ceilings', 'Partitions'],
    emiratesServiced: ['Dubai', 'Sharjah'],
    verificationStatus: 'verified',
    contactPerson: 'Khalid Al-Marzouqi',
    contactPhone: '+971 52 889 0012',
    termsAcceptedAt: '2026-09-16T10:15:00Z',
  },
];

const INITIAL_PUBLIC_QUOTES: PublicQuoteRequest[] = [
  {
    id: 'gaq-01',
    referenceCode: 'GAQ-2026-8819',
    customerName: 'Rashid Al-Falasi',
    customerPhone: '+971 50 998 7712',
    customerEmail: 'rashid.falasi@gmail.com',
    propertyType: 'villa',
    locationEmirate: 'Dubai',
    locationCommunity: 'Palm Jumeirah (Frond G)',
    workCategory: 'Pergola, Decking & Exterior Joinery',
    description: 'Require bespoke teak wood pergola (6m x 4m) with integrated LED lighting and composite outdoor timber decking around the private swimming pool.',
    budgetBracket: 'AED 40,000 - 60,000',
    siteVisitRequested: true, // AED 100 site visit requested
    status: 'site_visit_scheduled',
    createdAt: '2026-10-02T11:20:00Z',
    attachments: [
      {
        id: 'doc-gaq-01',
        fileName: 'pool_terrace_dimensions.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 2450000,
        r2ObjectKey: 'quotes/gaq-01/pool_terrace_dimensions.pdf',
        documentPurpose: 'drawing',
        createdAt: '2026-10-02T11:20:00Z',
      },
    ],
  },
  {
    id: 'gaq-02',
    referenceCode: 'GAQ-2026-8820',
    customerName: 'Sophia Elena',
    customerPhone: '+971 54 221 9901',
    customerEmail: 'sophia.elena@outlook.com',
    propertyType: 'apartment',
    locationEmirate: 'Dubai',
    locationCommunity: 'Downtown Dubai (Burj Crown)',
    workCategory: 'Full Interior Painting & Wall Moldings',
    description: 'Repainting of 2-bedroom luxury apartment with high-end washable matte finish and neo-classical decorative polyurethane wall moldings.',
    budgetBracket: 'AED 15,000 - 25,000',
    siteVisitRequested: false, // direct submission
    status: 'dispatched_to_vendors',
    createdAt: '2026-10-03T15:00:00Z',
  },
];

const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq-01',
    referenceCode: 'RFQ-2026-9041',
    contractorId: 'cnt-01',
    title: 'Bespoke Oak Veneer Wall Paneling & Flush Doors',
    category: 'Joinery & Carpentry',
    projectName: 'DIFC Executive Suites Level 38',
    locationEmirate: 'Dubai',
    submissionDeadline: '2026-10-25',
    targetCompletionDate: '2026-12-15',
    scopeDescription: 'Fabrication, fire-rated acoustic treatment, and installation of premium European White Oak grooved acoustic wall panels and secret pivot doors as per architectural drawings.',
    estimatedBudgetAed: 180000,
    status: 'under_evaluation',
    createdAt: '2026-09-28T09:00:00Z',
    publishedAt: '2026-09-29T14:00:00Z',
    items: [
      {
        id: 'item-01',
        rfqId: 'rfq-01',
        itemNumber: 1,
        description: 'Supply & fix European White Oak veneer acoustic fluted paneling on 12mm FR MDF backing with Class 0 fire retardant lacquer finish',
        quantity: 340,
        unit: 'sqm',
        specifications: 'Sound absorption NRC 0.75 min, concealed clip installation',
      },
      {
        id: 'item-02',
        rfqId: 'rfq-01',
        itemNumber: 2,
        description: 'Supply & install 60-min fire-rated matching veneer concealed frame pivot doors with acoustic drop seals',
        quantity: 12,
        unit: 'nos',
        specifications: 'Dorma concealed pivot hardware, matching veneer grain orientation',
      },
    ],
    documents: [
      {
        id: 'doc-01',
        rfqId: 'rfq-01',
        fileName: 'DIFC_L38_Joinery_Details_RevC.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 4200000,
        r2ObjectKey: 'rfq/rfq-01/DIFC_L38_Joinery_Details_RevC.pdf',
        documentPurpose: 'drawing',
        createdAt: '2026-09-28T09:00:00Z',
      },
      {
        id: 'doc-02',
        rfqId: 'rfq-01',
        fileName: 'BoQ_Joinery_Schedule_V3.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSizeBytes: 650000,
        r2ObjectKey: 'rfq/rfq-01/BoQ_Joinery_Schedule_V3.xlsx',
        documentPurpose: 'boq',
        createdAt: '2026-09-28T09:00:00Z',
      },
    ],
  },
  {
    id: 'rfq-02',
    referenceCode: 'RFQ-2026-9042',
    contractorId: 'cnt-01',
    title: 'Commercial Office Acoustic Baffle Ceilings & MEP Integration',
    category: 'Gypsum & Drywall',
    projectName: 'Business Bay Prime Tower',
    locationEmirate: 'Dubai',
    submissionDeadline: '2026-10-30',
    targetCompletionDate: '2027-01-20',
    scopeDescription: 'Suspended metal linear acoustic baffle ceiling system with coordinated cutouts for linear LED architectural lighting and VRF diffusers.',
    estimatedBudgetAed: 95000,
    status: 'submitted', // Awaiting admin review & publishing
    createdAt: '2026-10-03T16:30:00Z',
    items: [
      {
        id: 'item-201',
        rfqId: 'rfq-02',
        itemNumber: 1,
        description: 'Linear acoustic felt baffles (150mm depth x 50mm width) suspended at 100mm pitch',
        quantity: 580,
        unit: 'sqm',
        specifications: 'Hunter Douglas or approved equivalent in Charcoal Grey',
      },
    ],
    documents: [
      {
        id: 'doc-201',
        rfqId: 'rfq-02',
        fileName: 'Reflected_Ceiling_Plan_RCP_Rev2.dwg',
        fileType: 'application/acad',
        fileSizeBytes: 8900000,
        r2ObjectKey: 'rfq/rfq-02/Reflected_Ceiling_Plan_RCP_Rev2.dwg',
        documentPurpose: 'drawing',
        createdAt: '2026-10-03T16:30:00Z',
      },
    ],
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qte-01',
    referenceCode: 'QTE-2026-3011',
    rfqId: 'rfq-01',
    vendorId: 'vnd-01',
    totalAmountAed: 168500,
    leadTimeDays: 28,
    validityDays: 30,
    paymentTerms: '20% mobilization advance, 70% delivery against inspection, 10% post-handover',
    notes: 'Premium FSC-certified European white oak with 10-year warranty on acoustic backing. All sample mockups delivered within 5 days of award.',
    status: 'submitted',
    submittedAt: '2026-10-01T10:15:00Z',
    items: [
      { id: 'qi-01', quotationId: 'qte-01', rfqItemId: 'item-01', unitRateAed: 395, totalPriceAed: 134300 },
      { id: 'qi-02', quotationId: 'qte-01', rfqItemId: 'item-02', unitRateAed: 2850, totalPriceAed: 34200 },
    ],
  },
  {
    id: 'qte-02',
    referenceCode: 'QTE-2026-3012',
    rfqId: 'rfq-01',
    vendorId: 'vnd-02',
    totalAmountAed: 176000,
    leadTimeDays: 24,
    validityDays: 45,
    paymentTerms: '30% advance, 70% progressive monthly certification',
    notes: 'Includes certified German Dorma architectural hardware. Lead time can be accelerated to 20 days upon contract signing.',
    status: 'submitted',
    submittedAt: '2026-10-02T14:40:00Z',
    items: [
      { id: 'qi-03', quotationId: 'qte-02', rfqItemId: 'item-01', unitRateAed: 415, totalPriceAed: 141100 },
      { id: 'qi-04', quotationId: 'qte-02', rfqItemId: 'item-02', unitRateAed: 2908.33, totalPriceAed: 34900 },
    ],
  },
];

const INITIAL_AUDITS: AuditEvent[] = [
  AuditService.createEvent('PLATFORM_INITIALIZED', 'system', 'sys-01', 'system', undefined, { version: '2.0.0-greenfield' }),
  AuditService.createEvent('RFQ_CREATED', 'rfq', 'rfq-01', 'contractor', 'usr-cnt-01', { reference: 'RFQ-2026-9041' }),
  AuditService.createEvent('RFQ_PUBLISHED', 'rfq', 'rfq-01', 'admin', 'usr-adm-01', { target: 'verified_vendors' }),
  AuditService.createEvent('QUOTATION_SUBMITTED', 'quotation', 'qte-01', 'vendor', 'usr-vnd-01', { amountAed: 168500 }),
  AuditService.createEvent('QUOTATION_SUBMITTED', 'quotation', 'qte-02', 'vendor', 'usr-vnd-02', { amountAed: 176000 }),
];

// Persistent state wrapper
class MockDataStore {
  private users: User[] = INITIAL_USERS;
  private contractors: ContractorProfile[] = INITIAL_CONTRACTORS;
  private vendors: VendorProfile[] = INITIAL_VENDORS;
  private publicQuotes: PublicQuoteRequest[] = INITIAL_PUBLIC_QUOTES;
  private rfqs: RFQ[] = INITIAL_RFQS;
  private quotations: Quotation[] = INITIAL_QUOTATIONS;
  private awards: AwardRecord[] = [];
  private auditEvents: AuditEvent[] = INITIAL_AUDITS;
  private invitations: InvitationRecord[] = [
    {
      id: 'inv-01',
      recipientEmail: 'tenders@dubaimarble.ae',
      organizationName: 'Dubai Marble & Granite Supply',
      inviteType: 'vendor',
      invitationToken: 'inv_mrb_99182',
      status: 'queued',
      createdAt: '2026-10-02T10:00:00Z',
    },
  ];

  // Active simulated user for interactive testing
  public activeRole: UserRole = 'public';
  public currentUserId: string = '';

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem('urbanprocures_users', JSON.stringify(this.users));
      localStorage.setItem('urbanprocures_contractors', JSON.stringify(this.contractors));
      localStorage.setItem('urbanprocures_vendors', JSON.stringify(this.vendors));
      localStorage.setItem('urbanprocures_rfqs', JSON.stringify(this.rfqs));
      localStorage.setItem('urbanprocures_quotes', JSON.stringify(this.quotations));
      localStorage.setItem('urbanprocures_public_quotes', JSON.stringify(this.publicQuotes));
      localStorage.setItem('urbanprocures_awards', JSON.stringify(this.awards));
      localStorage.setItem('urbanprocures_audits', JSON.stringify(this.auditEvents));
      localStorage.setItem('urbanprocures_active_role', this.activeRole);
      localStorage.setItem('urbanprocures_current_user_id', this.currentUserId);
    } catch {
      // storage unavailable
    }
  }

  private loadFromStorage() {
    try {
      const savedUsers = localStorage.getItem('urbanprocures_users');
      if (savedUsers) this.users = JSON.parse(savedUsers);
      const savedContractors = localStorage.getItem('urbanprocures_contractors');
      if (savedContractors) this.contractors = JSON.parse(savedContractors);
      const savedVendors = localStorage.getItem('urbanprocures_vendors');
      if (savedVendors) this.vendors = JSON.parse(savedVendors);
      const savedRfqs = localStorage.getItem('urbanprocures_rfqs');
      if (savedRfqs) this.rfqs = JSON.parse(savedRfqs);
      const savedQuotes = localStorage.getItem('urbanprocures_quotes');
      if (savedQuotes) this.quotations = JSON.parse(savedQuotes);
      const savedPublicQuotes = localStorage.getItem('urbanprocures_public_quotes');
      if (savedPublicQuotes) this.publicQuotes = JSON.parse(savedPublicQuotes);
      const savedAwards = localStorage.getItem('urbanprocures_awards');
      if (savedAwards) this.awards = JSON.parse(savedAwards);
      const savedAudits = localStorage.getItem('urbanprocures_audits');
      if (savedAudits) this.auditEvents = JSON.parse(savedAudits);
      const savedRole = localStorage.getItem('urbanprocures_active_role') as UserRole;
      if (savedRole) this.activeRole = savedRole;
      const savedUserId = localStorage.getItem('urbanprocures_current_user_id');
      if (savedUserId) this.currentUserId = savedUserId;
    } catch {
      // fallback to initial
    }
  }

  public resetToFactory() {
    this.users = INITIAL_USERS;
    this.contractors = INITIAL_CONTRACTORS;
    this.vendors = INITIAL_VENDORS;
    this.publicQuotes = INITIAL_PUBLIC_QUOTES;
    this.rfqs = INITIAL_RFQS;
    this.quotations = INITIAL_QUOTATIONS;
    this.awards = [];
    this.auditEvents = INITIAL_AUDITS;
    this.activeRole = 'public';
    this.currentUserId = '';
    try {
      localStorage.clear();
    } catch {}
    this.saveToStorage();
  }

  // --- Real Authentication & Session ---
  public login(email: string, password?: string): { success: boolean; user?: User; error?: string } {
    const user = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found matching this email address.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Account suspended. Please contact Urban Procures administration.' };
    }
    // Check password if set
    if (user.password && password && user.password !== password) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    this.activeRole = user.role;
    this.currentUserId = user.id;
    this.recordAudit('USER_LOGGED_IN', 'user', user.id, { email: user.email, role: user.role });
    this.saveToStorage();
    return { success: true, user };
  }

  public logout(): void {
    const prevUserId = this.currentUserId;
    this.activeRole = 'public';
    this.currentUserId = '';
    this.recordAudit('USER_LOGGED_OUT', 'user', prevUserId || 'guest', {});
    this.saveToStorage();
  }

  public getCurrentUser(): User | undefined {
    return this.users.find((u) => u.id === this.currentUserId);
  }

  public getAllUsers(): User[] {
    return this.users;
  }

  public updateUserStatus(userId: string, status: User['status']): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      this.recordAudit('USER_STATUS_UPDATED', 'user', userId, { status });
      this.saveToStorage();
    }
  }

  // --- Identity & Users ---
  public setActiveUser(role: UserRole, userId?: string) {
    this.activeRole = role;
    if (role === 'contractor') {
      this.currentUserId = userId || this.contractors[0]?.userId || 'usr-cnt-01';
    } else if (role === 'vendor') {
      this.currentUserId = userId || this.vendors[0]?.userId || 'usr-vnd-01';
    } else if (role === 'admin') {
      this.currentUserId = userId || 'usr-adm-01';
    } else {
      this.currentUserId = '';
    }
    this.saveToStorage();
  }

  public getContractorProfile(userId?: string): ContractorProfile | undefined {
    const targetUserId = userId || this.currentUserId;
    return this.contractors.find((c) => c.userId === targetUserId) || this.contractors[0];
  }

  public getVendorProfile(userId?: string): VendorProfile | undefined {
    const targetUserId = userId || this.currentUserId;
    return this.vendors.find((v) => v.userId === targetUserId) || this.vendors[0];
  }

  public getAllContractors(): ContractorProfile[] {
    return this.contractors;
  }

  public getAllVendors(): VendorProfile[] {
    return this.vendors;
  }

  public registerContractor(data: {
    companyName: string;
    tradeLicenseNumber: string;
    emirate: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
    email: string;
    password?: string;
  }): ContractorProfile {
    const userId = `usr-cnt-${Date.now()}`;
    const contractorId = `cnt-${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: data.email,
      password: data.password || 'password',
      role: 'contractor',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const newProfile: ContractorProfile = {
      id: contractorId,
      userId,
      companyName: data.companyName,
      tradeLicenseNumber: data.tradeLicenseNumber,
      emirate: data.emirate,
      address: data.address,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.contractors.push(newProfile);
    this.setActiveUser('contractor', userId);
    this.recordAudit('CONTRACTOR_REGISTERED', 'contractor', contractorId, { company: data.companyName });
    this.saveToStorage();
    return newProfile;
  }

  public registerVendor(data: {
    companyName: string;
    tradeLicenseNumber: string;
    tradeCategories: string[];
    emiratesServiced: string[];
    contactPerson: string;
    contactPhone: string;
    email: string;
    password?: string;
  }): VendorProfile {
    const userId = `usr-vnd-${Date.now()}`;
    const vendorId = `vnd-${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: data.email,
      password: data.password || 'password',
      role: 'vendor',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const newProfile: VendorProfile = {
      id: vendorId,
      userId,
      companyName: data.companyName,
      tradeLicenseNumber: data.tradeLicenseNumber,
      tradeCategories: data.tradeCategories,
      emiratesServiced: data.emiratesServiced,
      verificationStatus: 'verified',
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      termsAcceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.vendors.push(newProfile);
    this.setActiveUser('vendor', userId);
    this.recordAudit('VENDOR_REGISTERED', 'vendor', vendorId, { company: data.companyName });
    this.saveToStorage();
    return newProfile;
  }

  public acceptVendorTerms(vendorId: string): void {
    const vendor = this.vendors.find((v) => v.id === vendorId);
    if (vendor) {
      vendor.termsAcceptedAt = new Date().toISOString();
      this.recordAudit('VENDOR_TERMS_ACCEPTED', 'vendor', vendorId, {
        termsVersion: 'v2026.1',
        acceptedAt: vendor.termsAcceptedAt,
        userAgent: navigator.userAgent,
      });
      this.saveToStorage();
    }
  }

  // --- Public Get A Quote (No account required) ---
  public createPublicQuote(data: Omit<PublicQuoteRequest, 'id' | 'referenceCode' | 'status' | 'createdAt'>): PublicQuoteRequest {
    const id = `gaq-${Date.now()}`;
    const referenceCode = `GAQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: PublicQuoteRequest = {
      ...data,
      id,
      referenceCode,
      status: data.siteVisitRequested ? 'site_visit_scheduled' : 'received',
      createdAt: new Date().toISOString(),
    };
    this.publicQuotes.unshift(newRequest);
    this.recordAudit('PUBLIC_QUOTE_CREATED', 'public_quote', id, {
      referenceCode,
      propertyType: data.propertyType,
      siteVisitRequested: data.siteVisitRequested,
    });
    this.saveToStorage();
    return newRequest;
  }

  public getPublicQuotes(): PublicQuoteRequest[] {
    return this.publicQuotes;
  }

  public updatePublicQuoteStatus(id: string, status: PublicQuoteRequest['status']) {
    const q = this.publicQuotes.find((item) => item.id === id);
    if (q) {
      q.status = status;
      this.recordAudit('PUBLIC_QUOTE_STATUS_CHANGED', 'public_quote', id, { status });
      this.saveToStorage();
    }
  }

  // --- Contractor RFQs ---
  public getRfqsForContractor(contractorId: string): RFQ[] {
    return this.rfqs.filter((r) => r.contractorId === contractorId);
  }

  public getAllRfqs(): RFQ[] {
    return this.rfqs;
  }

  public getRfqById(id: string): RFQ | undefined {
    return this.rfqs.find((r) => r.id === id);
  }

  public createRfq(data: {
    contractorId: string;
    title: string;
    category: string;
    projectName: string;
    locationEmirate: string;
    submissionDeadline: string;
    targetCompletionDate?: string;
    scopeDescription: string;
    estimatedBudgetAed?: number;
    items: Omit<RFQ['items'][0], 'id' | 'rfqId'>[];
    documents?: Omit<DocumentMetadata, 'id' | 'rfqId' | 'createdAt'>[];
  }): RFQ {
    const id = `rfq-${Date.now()}`;
    const referenceCode = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItems = data.items.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      rfqId: id,
    }));
    const newDocs = (data.documents || []).map((doc, idx) => ({
      ...doc,
      id: `doc-${Date.now()}-${idx}`,
      rfqId: id,
      createdAt: new Date().toISOString(),
    }));

    const newRfq: RFQ = {
      id,
      referenceCode,
      contractorId: data.contractorId,
      title: data.title,
      category: data.category,
      projectName: data.projectName,
      locationEmirate: data.locationEmirate,
      submissionDeadline: data.submissionDeadline,
      targetCompletionDate: data.targetCompletionDate,
      scopeDescription: data.scopeDescription,
      estimatedBudgetAed: data.estimatedBudgetAed,
      status: 'submitted', // submitted for admin review
      createdAt: new Date().toISOString(),
      items: newItems,
      documents: newDocs,
    };

    this.rfqs.unshift(newRfq);
    this.recordAudit('RFQ_CREATED', 'rfq', id, { referenceCode, title: data.title });
    this.saveToStorage();
    return newRfq;
  }

  public updateRfqStatus(rfqId: string, targetStatus: RFQ['status'], selectedQuotationId?: string): { success: boolean; error?: string } {
    const rfq = this.rfqs.find((r) => r.id === rfqId);
    if (!rfq) return { success: false, error: 'RFQ not found' };

    const validation = RFQStateMachine.validateTransition(rfq.status, targetStatus, {
      hasItems: rfq.items.length > 0,
      selectedQuotationId,
    });

    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    rfq.status = targetStatus;
    if (targetStatus === 'reviewed_published') {
      rfq.publishedAt = new Date().toISOString();
    } else if (targetStatus === 'awarded') {
      rfq.awardedAt = new Date().toISOString();
    }

    this.recordAudit('RFQ_STATUS_TRANSITION', 'rfq', rfqId, { from: validation.from, to: targetStatus });
    this.saveToStorage();
    return { success: true };
  }

  // --- Vendor RFQ Discovery & Quotation Submission ---
  public getRfqsForVendor(vendorId: string): RFQ[] {
    // Only published, receiving or under evaluation RFQs
    const eligible = this.rfqs.filter((r) =>
      ['reviewed_published', 'receiving_quotations', 'under_evaluation', 'awarded'].includes(r.status)
    );

    // Check awards to see if this vendor won any RFQ
    const awardedRfqs = this.awards.filter((a) => a.vendorId === vendorId).map((a) => a.rfqId);

    // Apply strict identity masking
    return eligible.map((rfq) => {
      const contractor = this.contractors.find((c) => c.id === rfq.contractorId) || this.contractors[0];
      const isWinner = awardedRfqs.includes(rfq.id);
      return IdentityMaskingService.sanitizeRfqForVendor(rfq, contractor, isWinner);
    });
  }

  public getQuotationsForRfq(rfqId: string, viewingActor: 'contractor' | 'vendor' | 'admin', vendorId?: string): Quotation[] {
    const rfq = this.rfqs.find((r) => r.id === rfqId);
    const award = this.awards.find((a) => a.rfqId === rfqId);
    let quotes = this.quotations.filter((q) => q.rfqId === rfqId);

    if (viewingActor === 'vendor') {
      // Vendor only sees their own quotes
      quotes = quotes.filter((q) => q.vendorId === vendorId);
      return quotes;
    }

    if (viewingActor === 'contractor') {
      // Contractor sees quotes, but identity MUST be masked if pre-award
      return quotes.map((q) => {
        const vendor = this.vendors.find((v) => v.id === q.vendorId) || this.vendors[0];
        const isAwardedWinner = award && award.quotationId === q.id;
        return IdentityMaskingService.sanitizeQuotationForContractor(q, vendor, !!isAwardedWinner);
      });
    }

    // Admin sees all details
    return quotes.map((q) => {
      const vendor = this.vendors.find((v) => v.id === q.vendorId);
      return {
        ...q,
        vendorDisplayName: vendor?.companyName || q.vendorId,
        vendorCompany: vendor?.companyName,
      };
    });
  }

  public submitQuotation(data: {
    rfqId: string;
    vendorId: string;
    totalAmountAed: number;
    leadTimeDays: number;
    validityDays: number;
    paymentTerms: string;
    notes?: string;
    items: { rfqItemId: string; unitRateAed: number; totalPriceAed: number; remarks?: string }[];
  }): { success: boolean; error?: string; quotation?: Quotation } {
    const rfq = this.rfqs.find((r) => r.id === data.rfqId);
    if (!rfq) return { success: false, error: 'RFQ not found' };

    // Move RFQ to receiving_quotations if it was reviewed_published
    if (rfq.status === 'reviewed_published') {
      rfq.status = 'receiving_quotations';
    }

    const id = `qte-${Date.now()}`;
    const referenceCode = `QTE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuotation: Quotation = {
      id,
      referenceCode,
      rfqId: data.rfqId,
      vendorId: data.vendorId,
      totalAmountAed: data.totalAmountAed,
      leadTimeDays: data.leadTimeDays,
      validityDays: data.validityDays,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      items: data.items.map((it, idx) => ({
        ...it,
        id: `qi-${Date.now()}-${idx}`,
        quotationId: id,
      })),
    };

    this.quotations.push(newQuotation);
    this.recordAudit('QUOTATION_SUBMITTED', 'quotation', id, {
      referenceCode,
      rfqId: data.rfqId,
      totalAmountAed: data.totalAmountAed,
    });
    this.saveToStorage();
    return { success: true, quotation: newQuotation };
  }

  // --- Formal Award & Identity Release ---
  public confirmAward(rfqId: string, quotationId: string): { success: boolean; error?: string; award?: AwardRecord } {
    const rfq = this.rfqs.find((r) => r.id === rfqId);
    const quotation = this.quotations.find((q) => q.id === quotationId);

    if (!rfq || !quotation) {
      return { success: false, error: 'RFQ or Quotation not found' };
    }

    // Check if already awarded
    const existingAward = this.awards.find((a) => a.rfqId === rfqId);
    if (existingAward) {
      return { success: false, error: 'RFQ has already been awarded' };
    }

    // Calculate service charge
    const chargeCalc = ServiceChargeEngine.calculate({
      contractAmountAed: quotation.totalAmountAed,
    });

    const now = new Date().toISOString();
    const awardRecord: AwardRecord = {
      id: `awd-${Date.now()}`,
      rfqId,
      quotationId,
      contractorId: rfq.contractorId,
      vendorId: quotation.vendorId,
      contractAmountAed: quotation.totalAmountAed,
      calculatedServiceChargeAed: chargeCalc.totalServiceChargeAed,
      awardedAt: now,
      contactDetailsReleasedAt: now,
    };

    this.awards.push(awardRecord);
    rfq.status = 'awarded';
    rfq.awardedAt = now;
    quotation.status = 'awarded';

    // Mark other quotations for this RFQ as declined
    this.quotations.forEach((q) => {
      if (q.rfqId === rfqId && q.id !== quotationId) {
        q.status = 'declined';
      }
    });

    this.recordAudit('RFQ_AWARDED', 'rfq', rfqId, {
      quotationId,
      vendorId: quotation.vendorId,
      contractAmountAed: quotation.totalAmountAed,
      serviceChargeAed: chargeCalc.totalServiceChargeAed,
    });
    this.recordAudit('CONTACT_DETAILS_RELEASED', 'award', awardRecord.id, {
      rfqId,
      contractorId: rfq.contractorId,
      vendorId: quotation.vendorId,
    });

    this.saveToStorage();
    return { success: true, award: awardRecord };
  }

  public getAwardForRfq(rfqId: string): AwardRecord | undefined {
    return this.awards.find((a) => a.rfqId === rfqId);
  }

  // --- Document Inspector & Review ---
  public getAllDocuments(): DocumentMetadata[] {
    const docs: DocumentMetadata[] = [];
    this.rfqs.forEach((r) => {
      r.documents?.forEach((d) => docs.push({ ...d, rfqId: r.id }));
    });
    this.publicQuotes.forEach((pq) => {
      pq.attachments?.forEach((d) => docs.push({ ...d, publicQuoteId: pq.id }));
    });
    return docs;
  }

  // --- Invitations ---
  public getInvitations(): InvitationRecord[] {
    return this.invitations;
  }

  public createInvitation(email: string, orgName: string, type: 'contractor' | 'vendor'): InvitationRecord {
    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const newInv: InvitationRecord = {
      id: `inv-${Date.now()}`,
      recipientEmail: email,
      organizationName: orgName,
      inviteType: type,
      invitationToken: token,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.invitations.unshift(newInv);
    this.recordAudit('INVITATION_SENT', 'invitation', newInv.id, { email, type });
    return newInv;
  }

  // --- Audit Trail ---
  public getAuditEvents(): AuditEvent[] {
    return [...this.auditEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private recordAudit(actionType: string, resourceType: string, resourceId: string, payload?: Record<string, unknown>) {
    const event = AuditService.createEvent(
      actionType,
      resourceType,
      resourceId,
      this.activeRole,
      this.currentUserId,
      payload
    );
    this.auditEvents.unshift(event);
  }
}

export const mockStore = new MockDataStore();
