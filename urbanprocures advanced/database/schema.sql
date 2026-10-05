-- Urban Procures Advanced
-- Cloudflare D1 Relational Database Schema (SQLite Edge)
-- Architecture: Cloudflare Workers + D1 + R2
-- Canonical Advanced-only schema; no automatic demo seeding.

PRAGMA foreign_keys = ON;

-- 1. Users & Credentials (Salted Cryptographic Password Hashes)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('contractor', 'vendor', 'admin', 'operations')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('contractor', 'vendor')),
    trade_license_number TEXT NOT NULL,
    emirate TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 3. Contractor Profiles
CREATE TABLE IF NOT EXISTS contractors (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    trade_license_number TEXT NOT NULL,
    trade_license_expiry TEXT,
    emirate TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    verified_at TEXT,
    created_at TEXT NOT NULL
);

-- 4. Vendor Profiles
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    trade_license_number TEXT NOT NULL,
    trade_categories TEXT NOT NULL, -- JSON Array for quick retrieval: ["Joinery & Carpentry"]
    emirates_serviced TEXT NOT NULL, -- JSON Array: ["Dubai", "Abu Dhabi"]
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    terms_accepted_at TEXT,
    created_at TEXT NOT NULL
);

-- 5. Vendor Trade Categories (Normalized Relationship)
CREATE TABLE IF NOT EXISTS vendor_categories (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 6. Vendor Terms Acceptances (Immutable Click-Wrap Audit Trail)
CREATE TABLE IF NOT EXISTS terms_acceptances (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terms_version TEXT NOT NULL,
    accepted_at TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL
);

-- 7. Public "Get a Quote" Requests (No registration/account required)
CREATE TABLE IF NOT EXISTS get_a_quote_requests (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL, -- GAQ-2026-XXXX
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('villa', 'apartment', 'townhouse', 'commercial_personal')),
    location_emirate TEXT NOT NULL,
    location_community TEXT NOT NULL,
    work_category TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_bracket TEXT,
    site_visit_requested INTEGER NOT NULL DEFAULT 0, -- 0 = AED 0 direct, 1 = AED 100 site visit
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'site_visit_scheduled', 'dispatched_to_vendors', 'completed', 'cancelled')),
    created_at TEXT NOT NULL
);

-- 8. Site Visits (For AED 100 optional on-site dimension surveys)
CREATE TABLE IF NOT EXISTS site_visits (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES get_a_quote_requests(id) ON DELETE CASCADE,
    scheduled_date TEXT,
    inspector_name TEXT,
    fee_aed REAL NOT NULL DEFAULT 100.0,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TEXT NOT NULL
);

-- 9. RFQs (Requests for Quotation - Contractor Initiated Packages)
CREATE TABLE IF NOT EXISTS rfqs (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL, -- RFQ-2026-XXXX
    contractor_id TEXT NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    project_name TEXT NOT NULL,
    location_emirate TEXT NOT NULL,
    submission_deadline TEXT NOT NULL,
    target_completion_date TEXT,
    scope_description TEXT NOT NULL,
    estimated_budget_aed REAL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed_published', 'receiving_quotations', 'under_evaluation', 'awarded', 'closed', 'cancelled')),
    created_at TEXT NOT NULL,
    published_at TEXT,
    awarded_at TEXT
);

-- 10. RFQ Bill of Quantities / Line Items
CREATE TABLE IF NOT EXISTS rfq_items (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL, -- 'sqm', 'lm', 'nos', 'lump_sum', 'kg', 'ton'
    specifications TEXT
);

-- 11. RFQ Documents & Attachments (Stored in Cloudflare R2)
CREATE TABLE IF NOT EXISTS rfq_documents (
    id TEXT PRIMARY KEY,
    rfq_id TEXT REFERENCES rfqs(id) ON DELETE CASCADE,
    public_quote_id TEXT REFERENCES get_a_quote_requests(id) ON DELETE CASCADE,
    quotation_id TEXT,
    uploader_user_id TEXT REFERENCES users(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    r2_object_key TEXT NOT NULL,
    document_purpose TEXT NOT NULL CHECK (document_purpose IN ('boq', 'drawing', 'specification', 'photo', 'trade_license', 'other')),
    sha256_hash TEXT,
    created_at TEXT NOT NULL
);

-- 12. Vendor Quotations
CREATE TABLE IF NOT EXISTS vendor_quotes (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL, -- QTE-2026-XXXX
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    total_amount_aed REAL NOT NULL,
    lead_time_days INTEGER NOT NULL,
    validity_days INTEGER NOT NULL DEFAULT 30,
    payment_terms TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'awarded', 'declined')),
    submitted_at TEXT NOT NULL
);

-- 13. Quotation Line Items (Vendor Unit Rates per BoQ item)
CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quotation_id TEXT NOT NULL REFERENCES vendor_quotes(id) ON DELETE CASCADE,
    rfq_item_id TEXT NOT NULL REFERENCES rfq_items(id) ON DELETE CASCADE,
    unit_rate_aed REAL NOT NULL,
    total_price_aed REAL NOT NULL,
    remarks TEXT
);

-- 14. Formal Awards & Identity Release
CREATE TABLE IF NOT EXISTS awards (
    id TEXT PRIMARY KEY,
    rfq_id TEXT UNIQUE NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    quotation_id TEXT UNIQUE NOT NULL REFERENCES vendor_quotes(id) ON DELETE CASCADE,
    contractor_id TEXT NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    contract_amount_aed REAL NOT NULL,
    calculated_service_charge_aed REAL NOT NULL,
    awarded_at TEXT NOT NULL,
    contact_details_released_at TEXT NOT NULL
);

-- 15. Service Charges (Centralized 2.5% or AED 500 minimum rule)
CREATE TABLE IF NOT EXISTS service_charges (
    id TEXT PRIMARY KEY,
    award_id TEXT UNIQUE NOT NULL REFERENCES awards(id) ON DELETE CASCADE,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id),
    vendor_id TEXT NOT NULL REFERENCES vendors(id),
    contract_amount_aed REAL NOT NULL,
    percentage REAL NOT NULL DEFAULT 0.025,
    calculated_amount_aed REAL NOT NULL,
    minimum_charge_applied INTEGER NOT NULL DEFAULT 0,
    manpower_rule_applied INTEGER NOT NULL DEFAULT 0,
    site_visit_fee_included REAL NOT NULL DEFAULT 0.0,
    total_charge_aed REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'settled', 'waived')),
    created_at TEXT NOT NULL
);

-- 16. Platform Service Charge Rules Table
CREATE TABLE IF NOT EXISTS service_charge_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT NOT NULL,
    percentage REAL NOT NULL DEFAULT 0.025,
    minimum_charge_aed REAL NOT NULL DEFAULT 500.0,
    manpower_rate_rule TEXT DEFAULT NULL,
    site_visit_fee_aed REAL NOT NULL DEFAULT 100.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    effective_from TEXT NOT NULL
);

-- 17. User Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'info',
    is_read INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at TEXT NOT NULL
);

-- 18. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT,
    actor_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    payload_json TEXT,
    ip_address TEXT,
    timestamp TEXT NOT NULL
);

-- 19. Authenticated Sessions / Tokens
CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 20. Candidate Partner Invitations
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    invite_type TEXT NOT NULL CHECK (invite_type IN ('contractor', 'vendor')),
    invitation_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'accepted', 'expired')),
    sent_at TEXT,
    created_at TEXT NOT NULL
);

-- Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contractors_user ON contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_contractor ON rfqs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_category ON rfqs(category);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_docs_rfq ON rfq_documents(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_docs_gaq ON rfq_documents(public_quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON vendor_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vendor ON vendor_quotes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_qte ON quote_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_awards_rfq ON awards(rfq_id);
CREATE INDEX IF NOT EXISTS idx_awards_vendor ON awards(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id);

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

-- Clickwrap/commercial schema upgrade (canonical migration 0003).
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

-- Owner master handoff confirms the unit; retain immutable 2026.1 history.
ALTER TABLE rfqs ADD COLUMN manpower_persons INTEGER CHECK(manpower_persons IS NULL OR manpower_persons>0);
ALTER TABLE rfqs ADD COLUMN manpower_hours_per_person_per_day REAL CHECK(manpower_hours_per_person_per_day IS NULL OR manpower_hours_per_person_per_day>0);
ALTER TABLE rfqs ADD COLUMN manpower_days INTEGER CHECK(manpower_days IS NULL OR manpower_days>0);
ALTER TABLE awards ADD COLUMN manpower_persons INTEGER;
ALTER TABLE awards ADD COLUMN manpower_hours_per_person_per_day REAL;
ALTER TABLE awards ADD COLUMN manpower_days INTEGER;
ALTER TABLE awards ADD COLUMN manpower_rate_aed REAL CHECK(manpower_rate_aed IS NULL OR manpower_rate_aed=1);
-- Explicit review prevents original documents leaking identities to Vendor discovery.
ALTER TABLE rfq_documents ADD COLUMN vendor_access_approved INTEGER NOT NULL DEFAULT 0 CHECK(vendor_access_approved IN (0,1));
CREATE UNIQUE INDEX one_vendor_quote_per_rfq ON vendor_quotes(rfq_id,vendor_id);
CREATE UNIQUE INDEX one_rfq_item_number ON rfq_items(rfq_id,item_number);

CREATE TABLE auth_rate_limits (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL CHECK(attempts>0));
CREATE INDEX auth_rate_window ON auth_rate_limits(window_start);
CREATE TABLE password_reset_tokens (digest TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX reset_user ON password_reset_tokens(user_id);

ALTER TABLE vendor_quotes ADD COLUMN revision_nonce TEXT;

ALTER TABLE rfqs ADD COLUMN revision_nonce TEXT;
