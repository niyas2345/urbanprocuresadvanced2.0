# Quotation PDF release verification — 14 October 2026

Recovered production source and embedded assets directly from the authorized Cloudflare API. Production `SOURCE_COMMIT` was 8b321eb8310859293f7d1592a90c4fb65abff23e, deployment version 64a49763-b9ea-452e-8d87-4bb892d5482a at 100%. GitHub main contained only the older c7004f3 scaffold; no repository AGENTS.md was found. The release uses the recovered Worker, not that scaffold.

Verified the account, Worker, domain routes, D1/R2 bindings, secret binding names, scheduled processing and owner admin connection. The production document bucket has public access disabled and no custom domains. The owner bridge returned HTTP 200, admin revision 151. Existing quotation document remains unapproved in manual review; this release does not approve or replace it.

KTL original RFQ is cancelled. Replacement RFQ is published with revision-1 workbook, 67 items, Shop 265 and required completion 11 November 2026. Downloaded the published R2 workbook, checked its recorded SHA-256 and compared both worksheets to generation from its approved content. Descriptions, quantities, units, blanks and conditional amount formulas agree with that approved schedule. This is verification against the approved revision; it does not claim a fresh human review of every original BOQ fact.

Actual verification:

- 52 local functional checks using the recovered production schema: PDF file validation, extraction, original integrity, masking, corporate rendering and pagination, font holds, total/currency reconciliation, role/terms/verification gates, original and derivative preview requirements, review corrections, revisions, contractor authorization, completed-XLSX validation, malicious workbook rejection, recomputed amounts, unrestricted trade visibility, atomic award eligibility and post-award original confidentiality.
- 26 checks through an isolated deployed Cloudflare Worker with separate D1/R2 and synthetic users/documents. Includes real Workers AI extraction of a readable synthetic PDF, preservation of rows/total, identity removal, candidate PDF generation, review/release, authorized derivative access, PDF revisions, preserved originals, completed-Excel submission and comparison/history integration. Email delivery was disabled.
- Four Chromium browser checks: Excel download–fill–upload; PDF upload with proposed terms; vendor pending-review and revision display; contractor comparison, approved PDF download and previous approved revisions. No page JavaScript errors. Corporate PDF was rasterized and visually inspected; the table/heading overlap found in the first candidate was fixed.

Automatic extraction is a candidate only. A reviewer must compare all values and terms with the private original, correct uncertainty/warnings and verify masking before release. Missing/foreign currency, inconsistent totals, unsupported glyphs and unresolved extraction remain held. No vendor notifications, invitations, awards or customer quotation/document approvals were performed in production during validation.

`deploy.py` performs a fresh production-source check and preserves secrets, assets, bindings and schedules. Post-deployment evidence is recorded separately in ignored generated artifacts and reported in the completion message.
