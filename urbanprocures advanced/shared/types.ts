// Urban Procures Advanced
// Shared Domain Models & Contracts

export type UserRole = 'contractor' | 'vendor' | 'admin' | 'operations' | 'public';
export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  companyName: string;
  tradeLicenseNumber: string;
  tradeLicenseExpiry?: string;
  emirate: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  companyName: string;
  tradeLicenseNumber: string;
  tradeCategories: string[];
  emiratesServiced: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  contactPerson: string;
  contactPhone: string;
  termsAcceptedAt?: string;
  createdAt?: string;
}

export type PropertyType = 'villa' | 'apartment' | 'townhouse' | 'commercial_personal';
export type PublicQuoteStatus = 'received' | 'under_review' | 'site_visit_scheduled' | 'dispatched_to_vendors' | 'completed' | 'cancelled';

export interface PublicQuoteRequest {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyType: PropertyType;
  locationEmirate: string;
  locationCommunity: string;
  workCategory: string;
  description: string;
  budgetBracket?: string;
  siteVisitRequested: boolean;
  status: PublicQuoteStatus;
  createdAt: string;
  attachments?: DocumentMetadata[];
}

export type RFQStatus =
  | 'draft'
  | 'submitted'
  | 'reviewed_published'
  | 'receiving_quotations'
  | 'under_evaluation'
  | 'awarded'
  | 'closed'
  | 'cancelled';

export interface RFQItem {
  id: string;
  rfqId: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface DocumentMetadata {
  id: string;
  rfqId?: string;
  quotationId?: string;
  publicQuoteId?: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  r2ObjectKey: string;
  documentPurpose: 'boq' | 'drawing' | 'specification' | 'photo' | 'trade_license' | 'other';
  createdAt: string;
  downloadUrl?: string;
  dataUrl?: string;
}

export interface RFQ {
  quotesCount?:number;
  manpowerPersons?:number;
  manpowerHoursPerPersonPerDay?:number;
  manpowerDays?:number;
  id: string;
  referenceCode: string;
  contractorId: string;
  title: string;
  category: string;
  projectName: string;
  locationEmirate: string;
  submissionDeadline: string;
  targetCompletionDate?: string;
  scopeDescription: string;
  estimatedBudgetAed?: number;
  status: RFQStatus;
  createdAt: string;
  publishedAt?: string;
  awardedAt?: string;
  items: RFQItem[];
  documents: DocumentMetadata[];
  // Anonymized or revealed depending on auth context
  contractorDisplayName?: string;
  contractorCompany?: string;
  contractorContact?: {
    contactPerson: string;
    contactPhone: string;
    email: string;
    address: string;
  };
}

export type QuotationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'awarded' | 'declined';

export interface QuotationItem {
  id: string;
  quotationId: string;
  rfqItemId: string;
  unitRateAed: number;
  totalPriceAed: number;
  remarks?: string;
}

export interface Quotation {
  pricingMode?: 'itemized'|'total'|'file';
  id: string;
  referenceCode: string;
  rfqId: string;
  vendorId: string;
  totalAmountAed: number;
  leadTimeDays: number;
  validityDays: number;
  paymentTerms: string;
  notes?: string;
  status: QuotationStatus;
  submittedAt: string;
  items: QuotationItem[];
  // Masked or unmasked based on award state
  vendorDisplayName?: string;
  vendorCompany?: string;
  vendorContact?: {
    contactPerson: string;
    contactPhone: string;
    email: string;
    tradeLicenseNumber: string;
  };
}

export interface AwardRecord {
  id: string;
  rfqId: string;
  quotationId: string;
  contractorId: string;
  vendorId: string;
  contractAmountAed: number;
  calculatedServiceChargeAed: number;
  awardedAt: string;
  contactDetailsReleasedAt: string;
}

export interface ServiceChargeRule {
  id: string;
  ruleName: string;
  percentage: number;
  minimumChargeAed: number;
  manpowerRateRule: string;
  siteVisitFeeAed: number;
  isActive: boolean;
  effectiveFrom: string;
}

export interface AuditEvent {
  id: string;
  actorUserId?: string;
  actorRole: UserRole | 'system';
  actionType: string;
  resourceType: string;
  resourceId: string;
  payloadJson?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface InvitationRecord {
  id: string;
  recipientEmail: string;
  organizationName: string;
  inviteType: 'contractor' | 'vendor';
  invitationToken: string;
  status: 'queued' | 'sent' | 'opened' | 'registered' | 'expired';
  sentAt?: string;
  registeredAt?: string;
  createdAt: string;
}
