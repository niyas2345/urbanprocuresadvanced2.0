# Testing Strategy: Urban Procures Advanced

## 1. Testing Philosophy
Testing is an integral component of the development lifecycle, not an afterthought. The platform implements multi-tier verification covering:
1. **Unit Tests**: Pure business logic (State machine transitions, service charge calculations, identity masking serializers).
2. **Integration Tests**: Worker handlers with D1 in-memory SQLite and R2 mock storage.
3. **Authorization & Security Tests**: Negative permission tests, cross-account tenant leakage tests, and pre-award masking validation.
4. **End-to-End (E2E) Test Suite**: Complete simulated lifecycles from public quote submission through contractor RFQ creation, vendor bidding, and final contract award.

---

## 2. Test Matrix

| Test Suite | Focus Area | Mandatory Test Cases |
| :--- | :--- | :--- |
| **`rfqStateMachine.test.ts`** | Procurement Workflow | - Draft cannot transition directly to Awarded.<br>- Submitted RFQ requires review before receiving bids.<br>- Award confirmation terminates quotation acceptance.<br>- Invalid transition throws deterministic state error. |
| **`identityMasking.test.ts`** | Pre/Post-Award Security | - Vendor API never returns contractor phone/email/trade license before award.<br>- Contractor API never returns vendor phone/license/name before award.<br>- Winning vendor unmasks contractor details post-award.<br>- Non-winning vendors remain strictly masked. |
| **`serviceChargeEngine.test.ts`**| Financial Rules | - AED 10,000 award calculates 2.5% = AED 500 (threshold reached).<br>- AED 5,000 award enforces minimum AED 500 charge (2.5% = 125, minimum applies).<br>- Optional site visit fee adds exactly AED 100.<br>- Precision rounding to 2 decimal places. |
| **`authorization.test.ts`** | RBAC Enforcement | - Unauthenticated request to `/api/contractor/rfqs` returns 401.<br>- Vendor attempting to create RFQ returns 403 Forbidden.<br>- Contractor attempting to award someone else's RFQ returns 403.<br>- Public user accessing admin routes returns 401/403. |
| **`vendorTerms.test.ts`** | Legal Compliance | - Quotation submission rejected if terms not accepted.<br>- Acceptance records valid ISO timestamp, IP, and terms version. |
| **`publicQuote.test.ts`** | Get-a-Quote Flow | - Anonymous user can submit villa/apartment request without bearer token.<br>- Reference code format verified (e.g. `GAQ-XXXX`).<br>- AED 100 site visit flag toggled and recorded accurately. |

---

## 3. Automated Test Runner & Live Harness
In addition to headless CI test commands, Urban Procures Advanced features an embedded, interactive test harness directly accessible at `/test-suite`. Operators and auditors can execute the full suite in real-time, inspect pass/fail assertions, and review the execution evidence log across all eight Production Acceptance Gates.
