-- Additive upgrade. Existing Terms IDs/history and award links are preserved.
ALTER TABLE terms_versions ADD COLUMN title TEXT NOT NULL DEFAULT '';
ALTER TABLE terms_versions ADD COLUMN effective_at TEXT;
ALTER TABLE terms_versions ADD COLUMN approval_reference TEXT;
ALTER TABLE terms_acceptance_evidence ADD COLUMN audit_reference TEXT;
ALTER TABLE terms_acceptance_evidence ADD COLUMN created_at TEXT;
CREATE UNIQUE INDEX terms_acceptance_audit_reference ON terms_acceptance_evidence(audit_reference);
CREATE TRIGGER terms_publication_metadata_lock BEFORE UPDATE ON terms_versions
WHEN OLD.status IN ('published','retired') AND
 (NEW.title!=OLD.title OR NEW.mandatory!=OLD.mandatory OR NEW.effective_at IS NOT OLD.effective_at OR NEW.approval_reference IS NOT OLD.approval_reference)
BEGIN SELECT RAISE(ABORT,'Published Terms metadata is immutable'); END;
CREATE TRIGGER terms_evidence_org_required BEFORE INSERT ON terms_acceptance_evidence
WHEN NEW.organization_id IS NULL
BEGIN SELECT RAISE(ABORT,'Terms acceptance requires an organization'); END;

-- Public users have no accounts. Keep their request-scoped consent separate from role evidence.
CREATE TABLE public_terms_documents (
 id TEXT PRIMARY KEY, terms_type TEXT NOT NULL CHECK(terms_type='get_a_quote'),
 terms_version TEXT NOT NULL, title TEXT NOT NULL, content_text TEXT NOT NULL,
 content_sha256 TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published','retired')),
 mandatory INTEGER NOT NULL DEFAULT 1 CHECK(mandatory IN (0,1)),
 effective_at TEXT NOT NULL, published_at TEXT, created_at TEXT NOT NULL, approval_reference TEXT NOT NULL,
 UNIQUE(terms_type,terms_version)
);
CREATE UNIQUE INDEX one_public_terms_published ON public_terms_documents(terms_type) WHERE status='published';
CREATE TRIGGER public_terms_immutable BEFORE UPDATE ON public_terms_documents
WHEN OLD.status IN ('published','retired') AND (NEW.id!=OLD.id OR NEW.terms_type!=OLD.terms_type
 OR NEW.terms_version!=OLD.terms_version OR NEW.title!=OLD.title OR NEW.content_text!=OLD.content_text
 OR NEW.content_sha256!=OLD.content_sha256 OR NEW.mandatory!=OLD.mandatory OR NEW.effective_at!=OLD.effective_at
 OR NEW.published_at IS NOT OLD.published_at OR NEW.created_at!=OLD.created_at OR NEW.approval_reference!=OLD.approval_reference)
BEGIN SELECT RAISE(ABORT,'Published public Terms are immutable'); END;
CREATE TRIGGER public_terms_no_delete BEFORE DELETE ON public_terms_documents WHEN OLD.status IN ('published','retired')
BEGIN SELECT RAISE(ABORT,'Published Terms history cannot be deleted'); END;
CREATE TABLE public_terms_acceptances (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE REFERENCES get_a_quote_requests(id) ON DELETE RESTRICT,
 terms_document_id TEXT NOT NULL REFERENCES public_terms_documents(id), terms_version TEXT NOT NULL,
 content_hash_at_acceptance TEXT NOT NULL, accepted_at TEXT NOT NULL,
 acceptance_method TEXT NOT NULL CHECK(acceptance_method='explicit_clickwrap'),
 audit_reference TEXT NOT NULL UNIQUE
);
CREATE TRIGGER public_evidence_guard BEFORE INSERT ON public_terms_acceptances
WHEN NOT EXISTS (SELECT 1 FROM public_terms_documents WHERE id=NEW.terms_document_id
 AND status='published' AND terms_version=NEW.terms_version AND content_sha256=NEW.content_hash_at_acceptance)
BEGIN SELECT RAISE(ABORT,'Consent must match published public Terms'); END;
CREATE TRIGGER public_evidence_no_update BEFORE UPDATE ON public_terms_acceptances
BEGIN SELECT RAISE(ABORT,'Public acceptance evidence is immutable'); END;
CREATE TRIGGER public_evidence_no_delete BEFORE DELETE ON public_terms_acceptances
BEGIN SELECT RAISE(ABORT,'Public acceptance evidence is immutable'); END;

ALTER TABLE rfqs ADD COLUMN procurement_type TEXT NOT NULL DEFAULT 'standard' CHECK(procurement_type IN ('standard','manpower'));
ALTER TABLE rfqs ADD COLUMN approved_manpower_quantity REAL;
CREATE TABLE manpower_charge_configuration (
 id TEXT PRIMARY KEY CHECK(id='manpower'), rate_aed REAL NOT NULL CHECK(rate_aed=1),
 approved_unit TEXT, approved_by TEXT REFERENCES users(id), approved_at TEXT,
 CHECK(approved_unit IS NULL OR (length(trim(approved_unit))>0 AND approved_by IS NOT NULL AND approved_at IS NOT NULL))
);
INSERT INTO manpower_charge_configuration (id,rate_aed) VALUES ('manpower',1);
ALTER TABLE awards ADD COLUMN award_type TEXT NOT NULL DEFAULT 'standard' CHECK(award_type IN ('standard','manpower'));
ALTER TABLE awards ADD COLUMN applicable_charge_rule TEXT;
ALTER TABLE awards ADD COLUMN contractor_service_charge_aed REAL NOT NULL DEFAULT 0 CHECK(contractor_service_charge_aed=0);
ALTER TABLE awards ADD COLUMN vendor_terms_version TEXT;
ALTER TABLE awards ADD COLUMN manpower_quantity REAL;
ALTER TABLE awards ADD COLUMN manpower_unit TEXT;
ALTER TABLE awards ADD COLUMN manpower_charge_aed REAL NOT NULL DEFAULT 0;
ALTER TABLE awards ADD COLUMN calculated_at TEXT;
