-- Keep RFQ/quotation/audit history while allowing owners to remove their posts.
ALTER TABLE rfqs ADD COLUMN deleted_at TEXT;
ALTER TABLE rfqs ADD COLUMN creation_key TEXT;
ALTER TABLE rfqs ADD COLUMN creation_fingerprint TEXT;
CREATE UNIQUE INDEX rfq_creation_key_unique ON rfqs(contractor_id,creation_key) WHERE creation_key IS NOT NULL;

ALTER TABLE vendor_quotes ADD COLUMN pricing_mode TEXT NOT NULL DEFAULT 'itemized' CHECK(pricing_mode IN ('itemized','total','file'));
