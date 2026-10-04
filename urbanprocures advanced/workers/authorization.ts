// Urban Procures Advanced
// RBAC & Resource Ownership Authorization Policies

import { UserRole } from '../shared/types.ts';

export interface AuthContext {
  userId?: string;
  role: UserRole;
  contractorId?: string;
  vendorId?: string;
  hasAcceptedTerms?: boolean;
}

export class AuthorizationPolicy {
  /**
   * Can this actor create or edit an RFQ?
   */
  public static canManageRfq(auth: AuthContext, rfqContractorId?: string): boolean {
    if (auth.role === 'admin' || auth.role === 'operations') return true;
    if (auth.role === 'contractor') {
      if (!rfqContractorId) return true; // Can create new
      return auth.contractorId === rfqContractorId; // Can edit own
    }
    return false;
  }

  /**
   * Can this actor submit a quotation for this RFQ?
   */
  public static canSubmitQuotation(auth: AuthContext, rfqStatus: string): { allowed: boolean; reason?: string } {
    if (auth.role !== 'vendor') {
      return { allowed: false, reason: 'Only verified vendors can submit quotations' };
    }
    if (!auth.hasAcceptedTerms) {
      return { allowed: false, reason: 'Must accept Vendor Terms & Conditions before quoting' };
    }
    if (rfqStatus !== 'reviewed_published' && rfqStatus !== 'receiving_quotations') {
      return { allowed: false, reason: `Cannot submit quotation while RFQ is in '${rfqStatus}' state` };
    }
    return { allowed: true };
  }

  /**
   * Can this actor confirm an award on this RFQ?
   */
  public static canAwardRfq(auth: AuthContext, rfqContractorId: string, rfqStatus: string): boolean {
    if (auth.role === 'admin') return true;
    if (auth.role === 'contractor' && auth.contractorId === rfqContractorId) {
      return rfqStatus === 'under_evaluation' || rfqStatus === 'receiving_quotations';
    }
    return false;
  }

  /**
   * Can this actor inspect sensitive documents (e.g. detailed BoQ, trade license)?
   */
  public static canInspectDocument(auth: AuthContext, docType: string, isOwner: boolean): boolean {
    if (auth.role === 'admin' || auth.role === 'operations') return true;
    if (isOwner) return true;
    if (docType === 'drawing' || docType === 'specification' || docType === 'boq') {
      return auth.role === 'vendor' && !!auth.hasAcceptedTerms;
    }
    return false;
  }
}
