# Existing-production quotation PDF release

This release patches the recovered production Worker (`SOURCE_COMMIT` 8b321eb8310859293f7d1592a90c4fb65abff23e) and its existing embedded frontend. The repository scaffold is not deployed. GitHub is not the deployment source.

`baseline/worker.mjs` and `baseline/assets/` were recovered by authorized Cloudflare API on 14 October 2026. No credentials or customer document payloads are included. The exact production logo is reused. Fonts are embedded under their bundled license; unsupported glyphs cause a review hold, never HTML substitution or silent text loss.

PDF submissions use `/api/vendor/rfqs/:id/quote`, with `pdfFile` and explicitly vendor-supplied comparison metadata. Existing `excelFile` validation is preserved. Original files remain private, byte-identical and hashed. `quotation_pdf_revisions` ties every new PDF/Excel submission to the current quotation nonce, RFQ workbook revision, original and derivative document. Financial data extracted from PDF stays as strings: no inferred quantities, missing prices, VAT or terms. AI output is a review candidate, not an approval.

Contractors receive the branded PDF only after the admin previews the original and latest derivative, corrects any warnings, reconciles the final total, and confirms identity review. Structured corrections reset approval; raw file replacement cannot bypass the quotation renderer. Superseded revisions cannot be rereleased as current. Approved earlier PDFs remain in revision history. Contractors never receive original quotation files, including after award. New pending revisions are withheld from comparison and award. Existing record access and application authorization are preserved.

Run `npm ci`, `python build.py`, and `node tests.mjs` here. Tests use the recovered production D1 schema with synthetic data. `staging.py`, `staging-check.py`, and `browser-check.mjs` operate on a separate temporary Worker, D1 and R2 bucket with synthetic accounts and email disabled. Generated fixtures, synthetic session credentials and provider snapshots are ignored by git.

`deploy.py` verifies that production source is unchanged since recovery, adds only the revision table/index, and deploys directly to the existing Worker. It inherits secrets and assets and checks all bindings, schedules and deployed module bytes afterward. No customer RFQ, document approval, terms record or quotation is directly modified through SQL. Runtime business changes remain through authenticated application APIs. No vendor messages are sent by this release; existing RFQ publication notifications remain intact.

PDF extraction can require human transcription/correction for scans, unsupported glyphs, ambiguity or incomplete content. The reviewer must check all rows and commercial terms against the private original; automated extraction and numeric reconciliation do not establish semantic accuracy or complete anonymization by themselves.
