# RFQ controls, BOQ documents and flexible quotations — live release

Deployed to `urbanprocures.com` and `www.urbanprocures.com` on 8 October 2026.
Production Worker version: `66e88b27-9257-45c1-b2f8-417d7cb842d7`.
Deployed application source: `5622a88353cc7289d19573a5dffe9a43bb13f65a`.
Existing Advanced production D1/R2 resources and domain routes were retained.

## Resulting behavior

- The owning Contractor can recall a submitted RFQ with no quotations to draft, edit it and resubmit. Other unawarded active RFQs can be cancelled. Unawarded posts can be removed from the dashboard; underlying records, documents and audit evidence are retained. Awarded/closed records cannot be removed.
- A stable creation key and database uniqueness prevent repeated clicks/retries from creating multiple copies of the same form submission. A new RFQ starts with cleared project fields and a new creation key. Existing production duplicate RFQs are preserved for their owner to remove individually.
- Optional supporting documents are available in Get a Quote, Contractor and Vendor. Formats: PDF, XLS, XLSX, DWG, DXF, PNG and JPEG. Limits: 5 files, 10,000,000 bytes per file, 20,000,000 bytes combined; server byte/type checks and private R2 access remain enforced.
- Contractors can choose entered BOQ rows or an attached BOQ package. An attached BOQ produces one explicitly described lump-sum scope; it does not claim to extract PDF/Excel rows automatically.
- Vendors can price the entered RFQ rows, enter a total package amount, or upload a quotation and enter its total. Package/file quotations do not invent unit rates. The server validates amounts; existing award and Service Charge rules remain unchanged.
- Quotation documents become available to the Contractor after identity review or an award to that quotation. Masked filenames retain the correct extension. PDFs/images support genuine private blob previews; Excel and CAD files are downloaded for opening in the appropriate application.

## Verification

| Check | Passed |
| --- | ---: |
| Type checks and production build | Yes |
| Local feature integration tests on Worker/D1/R2 | 98 |
| Existing operations regression tests | 98 |
| Existing Terms integration tests | 96 |
| Offline schema/upgrade/data preservation checks | 96 |
| Wrangler migration statements checked | 118 |
| Deployed staging API checks | 84 |
| Deployed staging browser checks | 31 |
| Live production preflight checks | 10 |
| Live checks after deployment | 14 |

The API run overlapped a staging display update; the RFQ/pricing mutation routes were unchanged. The final browser run checked the final staged release, including all three quotation methods, recall/edit/resubmit/removal and exact PDF downloads. Extra invalid-total and client-total tampering checks also passed locally.

A fresh private production D1 export was restored into offline SQLite with valid foreign keys before applying only additive migration `0011_rfq_submission_controls.sql`. After release, all original fields in all existing RFQ, BOQ, quotation, award, charge, document and Terms evidence records matched the pre-migration backup. In particular, all 3 production RFQs, 3 BOQ rows, 9 document records and 1 acceptance evidence record were preserved. No production QA users or RFQs were created.

Live browser checks verified both HTTPS domains, exact released frontend asset hashes, public upload formats, published Terms, existing owner login and Admin data access. Cloudflare browser integrity rejects Python clients with error 1010; the genuine browser checks passed without disabling TLS or changing Cloudflare security.

OAuth secret bindings, mail delivery, scheduled notifications, persisted invocation logs and traces remained enabled in production. No new email delivery tests were sent. The 14 temporary staging accounts were suspended, their sessions revoked and their pending fixture notifications suppressed; the staging owner account stayed unchanged. Staging owner credentials remain independent from the later production password reset.

## Recovery and continuation

Private exports are in `/tmp/upa-rfq-private-backups-20261008`, mode 0600 inside a mode 0700 directory. They contain private business/auth data and must never be committed or published. Production preservation evidence and sanitized staging/live reports accompany this document.

Migration 0011 is additive. A previous Advanced code version remains schema-compatible; do not remove the new columns or restore an old database over customer writes. Any recovery must use Advanced source/resources, never the retired legacy site. Do not repeat initial provisioning, migration 0001, preview fixture cleanup, or legacy resource deletion.
