# Authorization & RBAC Specification: Urban Procures Advanced

## 1. Principles
Every sensitive API endpoint and data access request must satisfy the explicit evaluation:
$$\text{Decision} = f(\text{Subject / Who}, \text{Action}, \text{Resource}, \text{Contextual Conditions})$$

No endpoint relies purely on frontend route guards.

---

## 2. Roles
1. **`public`**: Unauthenticated guest (Property owner using Get a Quote).
2. **`contractor`**: Verified main contractor, fit-out company, or interior design practice.
3. **`vendor`**: Verified supplier, subcontractor, or specialist trade firm.
4. **`admin`**: Urban Procures platform administrator with audit and oversight authority.
5. **`operations`**: Urban Procures representative managing site visits and vendor onboarding.

---

## 3. Authorization Matrix

| Resource | Action | Public | Contractor | Vendor | Admin / Ops | Conditions / Guard |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Quote** | Create | Allowed | Allowed | Allowed | Allowed | Valid payload + optional site visit flag. |
| **Public Quote** | Read Details | Denied | Denied | Denied | Allowed | Only authorized admin can inspect client contact info. |
| **RFQ** | Create / Edit | Denied | Allowed | Denied | Allowed | Contractor can only edit own RFQ in `draft` state. |
| **RFQ** | Publish | Denied | Allowed | Denied | Allowed | Contractor must own the RFQ. Admin can approve. |
| **RFQ** | View List | Denied | Allowed (Own) | Allowed (Eligible) | Allowed (All) | Vendor sees masked contractor details. |
| **RFQ Details** | View | Denied | Allowed (Own) | Allowed | Allowed | Vendor requires accepted Terms & Conditions. |
| **Quotation** | Create | Denied | Denied | Allowed | Denied | Vendor must have accepted terms; RFQ must be in `receiving_quotations` state. |
| **Quotation** | View | Denied | Allowed (Masked) | Allowed (Own only)| Allowed (Full) | Contractor sees only masked vendor info before award. |
| **Award** | Confirm | Denied | Allowed (Own RFQ)| Denied | Allowed | Only RFQ owner can award; must select valid quotation. |
| **Contact Info** | View (Post-Award)| Denied | Allowed (Winner) | Allowed (Awarded) | Allowed (Both) | Only unmasked if record exists in `awards` table. |
| **R2 Document** | Upload | Allowed (Quote)| Allowed (RFQ) | Allowed (Qte) | Allowed | Size $\le 25\text{MB}$, valid MIME types only. |
| **R2 Document** | Download/View| Denied | Allowed (Own RFQ)| Allowed (RFQ doc)| Allowed (All) | Signed URL generated on-demand with 15-minute TTL. |
| **Audit Log** | View | Denied | Denied | Denied | Allowed | Immutable write-only for non-admin actors. |

---

## 4. Middleware Implementation
Worker authorization middleware intercepts requests before route handlers:

```typescript
export async function requireAuth(c: Context, next: Next) {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) return c.json({ error: 'Unauthorized: Missing token' }, 401);
  
  const session = await verifySession(token, c.env.JWT_SECRET, c.env.SESSIONS_KV);
  if (!session) return c.json({ error: 'Unauthorized: Session invalid or expired' }, 401);
  
  c.set('user', session);
  await next();
}

export function requireRole(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden: Insufficient privileges' }, 403);
    }
    await next();
  };
}
```
