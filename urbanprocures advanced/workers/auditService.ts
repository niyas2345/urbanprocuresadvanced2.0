// Urban Procures Advanced
// Immutable Audit Logging Engine

import { AuditEvent, UserRole } from '../shared/types.ts';

export class AuditService {
  /**
   * Constructs an immutable audit event
   */
  public static createEvent(
    actionType: string,
    resourceType: string,
    resourceId: string,
    actorRole: UserRole | 'system',
    actorUserId?: string,
    payload?: Record<string, unknown>,
    ipAddress?: string
  ): AuditEvent {
    return {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actorUserId,
      actorRole,
      actionType,
      resourceType,
      resourceId,
      payloadJson: payload ? JSON.stringify(payload) : undefined,
      ipAddress: ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
  }
}
