# Business Rules Specification: Urban Procures Advanced

## 1. Primary Categories & Target Audiences

The platform operates strictly on **three primary launch categories**:

| Category | Target Audience | Registration Requirement | Core Value Proposition |
| :--- | :--- | :--- | :--- |
| **1. GET A QUOTE** | Villa, apartment & personal property owners | **NO ACCOUNT REQUIRED** | Effortless quotation requests from verified UAE vendors without registration friction. Optional AED 100 site visit. |
| **2. CONTRACTOR** | Main contractors, fit-out firms, interior design firms, developers | **Mandatory Registration** & verification | Professional RFQ publishing, BoQ itemization, multi-vendor quotation comparison, and governed contract awards. |
| **3. VENDOR** | Verified suppliers, subcontractors, specialist service providers | **Mandatory Registration** & Click-Wrap Terms | Qualified RFQ discovery, itemized quotation submission, competitive evaluation, and verified contract awards. |

---

## 2. Procurement Lifecycle State Machine

```
[Draft]
   | (Contractor submits)
   v
[Submitted]
   | (Urban Procures Admin reviews & approves)
   v
[Reviewed / Published]
   | (Vendors discover RFQ)
   v
[Receiving Quotations]
   | (Deadline passes or Contractor triggers evaluation)
   v
[Under Evaluation]
   | (Contractor selects vendor and confirms award)
   v
[Awarded] ---> [Contact Release Executed]
   |
   v
[Closed / Completed]
```

### Deterministic State Transition Matrix
- An award CANNOT exist without a valid, published RFQ in `under_evaluation` state.
- Only the contractor who created the RFQ can transition it to `awarded`.
- Once an RFQ is awarded, no further quotations can be accepted or modified.
- If an RFQ is cancelled by contractor/admin, all pending quotations transition to `declined` with notification.

---

## 3. Strict Identity Masking Rules

### Pre-Award Confidentiality
1. **Contractor Identity Protection**:
   - In all public and vendor-facing views, the contractor's company name, trade license, phone number, physical address, and contact person are masked.
   - The vendor sees only a synthetic ID: `Client #RFQ-XXXX` and high-level project location (e.g. "Dubai Marina / Fit-out Project").
2. **Vendor Identity Protection**:
   - In all contractor-facing quotation review views, the vendor's company name, license, contact details, and identifying remarks are masked.
   - The contractor sees only a synthetic ID: `Vendor #VND-XXXX` with trade category, unit rates, lead time, and warranty specs.
3. **Backend Enforcement**:
   - Masking is strictly applied in the API serializer layer in Workers.
   - Unmasked contractor or vendor objects are NEVER sent in pre-award JSON payloads.

### Post-Award Contact Release
- Upon the contractor clicking **Confirm Award**, the system records an atomic award transaction.
- The `contact_details_released_at` timestamp is written.
- The winning vendor is notified and receives the full contractor contact card (company name, contact person, phone, email, project site address).
- The contractor receives the winning vendor contact card (company name, trade license, manager name, direct phone, email).
- Non-winning vendors remain masked to the contractor, and the contractor remains masked to non-winning vendors.

---

## 4. Financial & Service Charge Rules

1. **Approved Terminology**:
   - Always refer to Urban Procures' platform remuneration as a **SERVICE CHARGE**.
   - Under no circumstances shall it be described as a "commission".
2. **Centralized Engine Architecture**:
   - The charge engine is implemented as an isolated, configurable module (`serviceChargeEngine.ts`).
   - Default configuration parameters:
     * Standard Platform Charge: `2.5%` of final awarded contract value.
     * Minimum Charge Threshold: `AED 500`.
     * Manpower / Labour Rule: Special calculation rate hook (`aed_1_rule`).
     * Optional Property Site Visit: `AED 100` fixed fee.
3. **Site Visit Workflow**:
   - Available exclusively in the **Get a Quote** journey.
   - Clear UI distinction:
     * Option A: *Submit requirement directly* (AED 0).
     * Option B: *Request AED 100 Site Visit with an Urban Procures representative* to inspect site dimensions and prepare the RFQ scope.

---

## 5. Vendor Click-Wrap Terms Acceptance

1. All vendors must explicitly accept the Urban Procures Vendor Terms & Conditions before submitting any quotation or browsing proprietary BoQ details.
2. The system captures immutable audit evidence:
   - `vendor_id`
   - `terms_version` (e.g. `v2026.1`)
   - `accepted_at` (UTC timestamp)
   - `ip_address`
   - `user_agent`
3. A simple client-side unchecked box is legally insufficient; the backend rejects any quotation submission without a verified acceptance record on file.
