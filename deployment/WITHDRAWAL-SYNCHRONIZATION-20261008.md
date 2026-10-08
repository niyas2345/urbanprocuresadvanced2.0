# RFQ and quotation withdrawal synchronization

Active Admin RFQs/documents/quotations exclude draft, cancelled, soft-removed RFQs and withdrawn quotations. The history toggle preserves evidence and private document access for Admin. History has no publication/document-release actions for withdrawn items. Existing duplicate real RFQs are not automatically deleted.

Successful Contractor recall/cancel/remove and Vendor recall/remove atomically create Admin in-console notices. No new outbound lifecycle emails are added. Open visible dashboards refresh every five seconds and on focus; the server rejects unavailable RFQs/quotations immediately. Admin polls a lightweight audit revision before reloading its data. Vendor quote forms close if the RFQ becomes unavailable.

Quotation withdrawal retains audit/financial/document history. Withdrawn quotations cannot be awarded, released, or downloaded by the Contractor. Award/withdrawal transactions guard the current persisted state. One active quotation per Vendor/RFQ is enforced; a replacement may be submitted after withdrawal while historical versions remain.

Migrations 0012/0013 are forward migrations; 0011 and existing data remain preserved. Do not recreate resources or restore an older database over live business writes. The previous live Worker version is 66e88b27-9257-45c1-b2f8-417d7cb842d7. Private pre-release SQL backups are outside Git, with restored-copy foreign-key validation. Production release completed on both approved domains after staging acceptance. Current Worker version: 5579ba02-c847-4c16-b4e4-9fc310bb054e; source: 7b9012e37c11544f9455ed1a0d375f0f243dea4f.

Verification: local feature suite 122, operations regression 98, schema/history preservation 104, Wrangler SQL checks 126, deployed staging API checks 123, multi-session browser checks 20, live release checks 14 and live lifecycle read checks 6. Staging and production result JSON files record current outcomes. QA accounts use reserved example.invalid addresses; staging delivery remains disabled.

Existing production business rows and all their original field values were preserved, including three RFQs and nine private documents. OAuth bindings, mail enablement, persisted logs/traces, D1/R2 bindings and both live routes remain intact. Thirteen temporary staging accounts were suspended, sessions revoked and fixture delivery suppressed. No production test RFQs or test emails were created. Existing tabs need one reload to load the new frontend.
