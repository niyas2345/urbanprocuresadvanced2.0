-- Advanced-only compliance schema groundwork. No Terms are published automatically.
CREATE TABLE terms_versions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('contractor','vendor')),
    terms_type TEXT NOT NULL CHECK(terms_type IN ('contractor','vendor')),
    terms_version TEXT NOT NULL,
    content_text TEXT NOT NULL,
    content_sha256 TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','retired')),
    mandatory INTEGER NOT NULL DEFAULT 1 CHECK(mandatory IN (0,1)),
    approved_by TEXT REFERENCES users(id),
    published_at TEXT,
    created_at TEXT NOT NULL,
    CHECK(role = terms_type),
    CHECK(status != 'published' OR (approved_by IS NOT NULL AND published_at IS NOT NULL)),
    UNIQUE(role,terms_type,terms_version)
);
CREATE UNIQUE INDEX idx_one_published_terms ON terms_versions(role,terms_type)
    WHERE status='published';
CREATE TABLE terms_acceptance_evidence (
    acceptance_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    organization_id TEXT REFERENCES organizations(id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK(role IN ('contractor','vendor')),
    terms_type TEXT NOT NULL CHECK(terms_type IN ('contractor','vendor')),
    terms_version_id TEXT NOT NULL REFERENCES terms_versions(id) ON DELETE RESTRICT,
    terms_version TEXT NOT NULL,
    content_sha256 TEXT NOT NULL,
    accepted_at TEXT NOT NULL,
    acceptance_status TEXT NOT NULL CHECK(acceptance_status='accepted'),
    acceptance_action TEXT NOT NULL CHECK(acceptance_action='explicit_clickwrap'),
    ip_address TEXT,
    user_agent TEXT,
    CHECK(role=terms_type),
    UNIQUE(user_id,terms_version_id)
);
-- WHEN guards avoid Wrangler's splitter confusing CASE END with trigger END.
CREATE TRIGGER terms_evidence_insert_guard BEFORE INSERT ON terms_acceptance_evidence
WHEN NOT EXISTS (
 SELECT 1 FROM terms_versions t JOIN users u ON u.id=NEW.user_id
 WHERE t.id=NEW.terms_version_id AND t.status='published' AND t.role=NEW.role
 AND u.role=NEW.role AND u.status='active' AND t.terms_type=NEW.terms_type
 AND t.terms_version=NEW.terms_version AND t.content_sha256=NEW.content_sha256
)
BEGIN SELECT RAISE(ABORT,'Acceptance must match an active user and published Terms version'); END;
CREATE TRIGGER terms_evidence_org_insert_guard BEFORE INSERT ON terms_acceptance_evidence
WHEN NEW.organization_id IS NOT NULL AND NOT EXISTS (
 SELECT 1 FROM contractors WHERE user_id=NEW.user_id AND organization_id=NEW.organization_id AND NEW.role='contractor'
 UNION ALL
 SELECT 1 FROM vendors WHERE user_id=NEW.user_id AND organization_id=NEW.organization_id AND NEW.role='vendor'
)
BEGIN SELECT RAISE(ABORT,'Acceptance organization must belong to the accepting user'); END;
CREATE TRIGGER terms_evidence_no_update BEFORE UPDATE ON terms_acceptance_evidence
BEGIN SELECT RAISE(ABORT,'Terms acceptance evidence is immutable'); END;
CREATE TRIGGER terms_evidence_no_delete BEFORE DELETE ON terms_acceptance_evidence
BEGIN SELECT RAISE(ABORT,'Terms acceptance evidence is immutable'); END;
CREATE TRIGGER terms_versions_content_lock BEFORE UPDATE ON terms_versions
WHEN (OLD.status IN ('published','retired') OR EXISTS(SELECT 1 FROM terms_acceptance_evidence WHERE terms_version_id=OLD.id))
 AND (NEW.id!=OLD.id OR NEW.role!=OLD.role OR NEW.terms_type!=OLD.terms_type
 OR NEW.terms_version!=OLD.terms_version OR NEW.content_text!=OLD.content_text
 OR NEW.content_sha256!=OLD.content_sha256 OR NEW.approved_by IS NOT OLD.approved_by
 OR NEW.published_at IS NOT OLD.published_at OR NEW.created_at!=OLD.created_at)
BEGIN SELECT RAISE(ABORT,'Published Terms content is immutable; create a new version'); END;
CREATE TRIGGER terms_versions_no_delete BEFORE DELETE ON terms_versions
WHEN OLD.status IN ('published','retired')
BEGIN SELECT RAISE(ABORT,'Published Terms history cannot be deleted'); END;
ALTER TABLE awards ADD COLUMN vendor_terms_acceptance_id TEXT REFERENCES terms_acceptance_evidence(acceptance_id);
CREATE INDEX idx_terms_evidence_user ON terms_acceptance_evidence(user_id,accepted_at);
