// Urban Procures Advanced
// Invitation Workflow & Candidate Onboarding Engine

import { InvitationRecord } from '../shared/types.ts';

export class InvitationService {
  /**
   * Generates a unique invitation token
   */
  public static generateInvitationToken(): string {
    return `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Creates an invitation payload for Cloudflare Queues
   */
  public static createInvitation(
    email: string,
    organizationName: string,
    type: 'contractor' | 'vendor'
  ): InvitationRecord {
    const token = this.generateInvitationToken();
    return {
      id: `inv-${Date.now()}`,
      recipientEmail: email,
      organizationName,
      inviteType: type,
      invitationToken: token,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Resolves invite link with attribution
   */
  public static getInviteUrl(token: string, type: 'contractor' | 'vendor'): string {
    return `https://urbanprocures.com/${type}/register?invite_token=${token}`;
  }
}
