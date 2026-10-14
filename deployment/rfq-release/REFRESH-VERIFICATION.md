# Owner-requested fresh RFQ reset — 14 October 2026

Current production was recovered and compared with deployed commit d3b1c24bc3c4bb8aac26ba54ce468244c4080f72 before changes. The contractor, vendor and existing owner admin accounts were authenticated through their normal website login flows. Credentials were used only in temporary browser memory; they are not stored in this source tree.

The owner requested removal of all existing RFQs and vendor quotations, followed by a new RFQ using the uploaded BOQ. There were no awards, and the existing vendor quotation was already removed. The contractor account's two visible RFQs were removed through its authenticated DELETE route. One remaining draft belongs to another contractor account; the new owner-admin removal endpoint retains the same no-award restriction, atomic checks, audit evidence and pending-email suppression. Removal hides records from active views while preserving originals/history for audit.

Fresh RFQ: 2563f82e-1998-4210-86f9-1d9e28b04594, reference RFQ-041afe9b-3497-4599-91bf-63765559631a. The source upload is byte-identical to the previously reviewed BOQ. The owner reconfirmed Shop 265 and completion on 11 November 2026; the original PDF's Shop 261 reference is preserved with a reviewed applicability note. The existing approved bid deadline remains 18 October 2026 at 00:00 UTC.

All 67 previously verified descriptions, quantities and units were supplied as native RFQ items and preserved in the reviewed workbook. Automatic extraction timed out and held the document in manual review. The original and masked derivative were previewed through the authenticated admin document workflow, then the unchanged verified content was reviewed/released. Approved workbook 63349148-2d39-49b8-b4d8-127e928eea72, revision 2, was previewed before publication. Revision 1 was an unapproved automatically prepared candidate. Styles and embedded logo compare identically to the previous approved workbook; all 67 rate cells are blank and amount formulas remain conditional. No default formats were redesigned.

Two existing display problems were fixed:

- Home unwrapped the discovery response twice, leaving its statistics undefined. It now uses the actual statistics returned by the existing API, including zero counts.
- Receiving Bids previously excluded reviewed/published RFQs until their first quotation arrived. It now includes reviewed_published and receiving_quotations while the submission deadline is still open, matching vendor eligibility. Draft, submitted, cancelled, awarded, expired and under-evaluation RFQs remain outside that accepting-bids filter.

Validation: 55 functional checks; 26 isolated deployed Cloudflare workflow checks, including real Workers AI extraction; isolated owner-admin removal validation; and five browser checks covering Home statistics, Excel/PDF submission, vendor revisions and contractor PDF download/history. The browser checks also validate the existing quotation workflow preserved by this release. A slow AI candidate encountered during browser verification remained held and was not approved; browser review checks were completed with manual structured review in isolated staging.

Post-deployment verification and final active-record counts are recorded in ignored execution artifacts and the completion message. Temporary synthetic validation resources are removed after completion. The public Get a Quote request record is retained; it is a customer request, not a published RFQ or vendor quotation.
