CREATE TABLE IF NOT EXISTS quotation_pdf_revisions (
 id TEXT PRIMARY KEY,
 quotation_id TEXT NOT NULL REFERENCES vendor_quotes(id),
 revision_number INTEGER NOT NULL CHECK(revision_number>0),
 revision_nonce TEXT NOT NULL,
 workbook_id TEXT NOT NULL REFERENCES rfq_workbook_revisions(id),
 document_id TEXT NOT NULL UNIQUE REFERENCES rfq_documents(id),
 input_kind TEXT NOT NULL CHECK(input_kind IN ('excel','pdf')),
 submitted_at TEXT NOT NULL,
 UNIQUE(quotation_id,revision_number), UNIQUE(quotation_id,revision_nonce)
);
CREATE INDEX IF NOT EXISTS quotation_pdf_current ON quotation_pdf_revisions(quotation_id,revision_nonce);
