-- Additive RFQ standardization. Existing originals, items and awards are retained.
ALTER TABLE rfqs ADD COLUMN standard_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rfqs ADD COLUMN standard_published_json TEXT;
ALTER TABLE vendor_quotes ADD COLUMN rfq_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vendor_quotes ADD COLUMN standard_quote_items_json TEXT;
CREATE TABLE rfq_standard_revisions (
 rfq_id TEXT NOT NULL REFERENCES rfqs(id),
 revision INTEGER NOT NULL,
 content_json TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('draft','pending_clarification','reviewed','published','superseded','expired')),
 hold_reasons_json TEXT NOT NULL,
 created_at TEXT NOT NULL,
 created_by TEXT NOT NULL REFERENCES users(id),
 previewed_by TEXT REFERENCES users(id),
 previewed_at TEXT,
 published_at TEXT,
 clarification_requested_at TEXT,
 reminder_at TEXT,
 expires_at TEXT,
 PRIMARY KEY(rfq_id,revision)
);
CREATE TABLE rfq_shared_questions (
 id TEXT PRIMARY KEY,
 rfq_id TEXT NOT NULL REFERENCES rfqs(id),
 revision INTEGER NOT NULL,
 vendor_user_id TEXT NOT NULL REFERENCES users(id),
 question TEXT NOT NULL,
 answer TEXT,
 status TEXT NOT NULL CHECK(status IN ('pending','approved','answered','rejected')),
 reviewed_by TEXT REFERENCES users(id),
 created_at TEXT NOT NULL,
 answered_at TEXT
);
CREATE INDEX rfq_standard_hold_due ON rfq_standard_revisions(status,reminder_at,expires_at);
CREATE TRIGGER rfq_standard_published_content_immutable BEFORE UPDATE OF content_json ON rfq_standard_revisions
 WHEN OLD.status IN ('published','superseded') BEGIN SELECT RAISE(ABORT,'Published RFQ revisions are immutable'); END;
