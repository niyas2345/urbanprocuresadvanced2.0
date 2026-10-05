-- Explicit review prevents original documents leaking identities to Vendor discovery.
ALTER TABLE rfq_documents ADD COLUMN vendor_access_approved INTEGER NOT NULL DEFAULT 0 CHECK(vendor_access_approved IN (0,1));
CREATE UNIQUE INDEX one_vendor_quote_per_rfq ON vendor_quotes(rfq_id,vendor_id);
CREATE UNIQUE INDEX one_rfq_item_number ON rfq_items(rfq_id,item_number);
