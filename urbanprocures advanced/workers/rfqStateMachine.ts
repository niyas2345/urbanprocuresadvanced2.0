// Urban Procures Advanced
// Deterministic Procurement Workflow State Machine

import type { RFQStatus } from '../shared/types.ts';

export interface StateTransitionResult {
  allowed: boolean;
  from: RFQStatus;
  to: RFQStatus;
  reason?: string;
}

// Valid transitions definition
const ALLOWED_TRANSITIONS: Record<RFQStatus, RFQStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['reviewed_published', 'cancelled'],
  reviewed_published: ['receiving_quotations', 'cancelled'],
  receiving_quotations: ['under_evaluation', 'cancelled'],
  under_evaluation: ['awarded', 'receiving_quotations', 'cancelled'],
  awarded: ['closed'],
  closed: [],
  cancelled: [],
};

export class RFQStateMachine {
  /**
   * Validate whether a state transition is legal according to procurement rules
   */
  public static validateTransition(
    currentStatus: RFQStatus,
    targetStatus: RFQStatus,
    context?: {
      hasItems?: boolean;
      quotationCount?: number;
      selectedQuotationId?: string;
      actorRole?: string;
    }
  ): StateTransitionResult {
    // 1. Check if target status is in the graph
    const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!validNextStates.includes(targetStatus)) {
      return {
        allowed: false,
        from: currentStatus,
        to: targetStatus,
        reason: `Illegal transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${validNextStates.join(', ')}]`,
      };
    }

    // 2. Business rule: Cannot submit an RFQ without BoQ items
    if (currentStatus === 'draft' && targetStatus === 'submitted') {
      if (context && context.hasItems === false) {
        return {
          allowed: false,
          from: currentStatus,
          to: targetStatus,
          reason: 'Cannot submit an RFQ without at least one BoQ line item.',
        };
      }
    }

    // 3. Business rule: Cannot award without a selected quotation
    if (targetStatus === 'awarded') {
      if (!context?.selectedQuotationId) {
        return {
          allowed: false,
          from: currentStatus,
          to: targetStatus,
          reason: 'Cannot confirm award without designating a winning quotation.',
        };
      }
    }

    return {
      allowed: true,
      from: currentStatus,
      to: targetStatus,
    };
  }

  /**
   * Determine required action banner for UI/dashboard based on state and role
   */
  public static getRequiredAction(status: RFQStatus, role: 'contractor' | 'vendor' | 'admin'): string {
    switch (status) {
      case 'draft':
        return role === 'contractor'
          ? 'Add Bill of Quantities items and submit for Urban Procures review'
          : 'Draft in progress';
      case 'submitted':
        return role === 'admin'
          ? 'Review specifications, verify BoQ clarity, and publish to vendor network'
          : 'Pending Urban Procures operational review';
      case 'reviewed_published':
      case 'receiving_quotations':
        return role === 'vendor'
          ? 'Eligible for review. Submit your itemized quotation before the deadline'
          : 'Awaiting vendor quotation submissions';
      case 'under_evaluation':
        return role === 'contractor'
          ? 'Review received anonymized quotations and confirm award'
          : 'Quotations under contractor review';
      case 'awarded':
        return 'Award confirmed. Contact information unmasked between parties';
      case 'closed':
        return 'Procurement completed and archived';
      case 'cancelled':
        return 'RFQ cancelled';
      default:
        return 'Status update pending';
    }
  }
}
