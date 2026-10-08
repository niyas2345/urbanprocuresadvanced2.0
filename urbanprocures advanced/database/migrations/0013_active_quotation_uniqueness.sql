-- One active quotation per Vendor/RFQ; replacements preserve withdrawn history.
DROP INDEX one_vendor_quote_per_rfq;
CREATE UNIQUE INDEX one_vendor_quote_per_rfq ON vendor_quotes(rfq_id,vendor_id) WHERE withdrawn_at IS NULL AND deleted_at IS NULL;
