-- Originals remain immutable/private. Derived artifacts require a new, explicit review.
ALTER TABLE rfq_documents ADD COLUMN standardization_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE rfq_documents ADD COLUMN standardization_error TEXT;
ALTER TABLE rfq_documents ADD COLUMN standardized_content_json TEXT;
ALTER TABLE rfq_documents ADD COLUMN standardized_r2_key TEXT;
ALTER TABLE rfq_documents ADD COLUMN standardized_file_type TEXT;
ALTER TABLE rfq_documents ADD COLUMN standardized_size_bytes INTEGER;
ALTER TABLE rfq_documents ADD COLUMN standardized_sha256 TEXT;
ALTER TABLE rfq_documents ADD COLUMN standardized_at TEXT;
