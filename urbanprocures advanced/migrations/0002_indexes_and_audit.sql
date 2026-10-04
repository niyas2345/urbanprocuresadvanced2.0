-- Migration 0002: Items, Quotes, Awards, Audit, and Performance Indexes
CREATE TABLE IF NOT EXISTS rfq_items (
    id TEXT PRIMARY KEY,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    specifications TEXT
);

CREATE TABLE IF NOT EXISTS rfq_documents (
    id TEXT PRIMARY KEY,
    rfq_id TEXT REFERENCES rfqs(id) ON DELETE CASCADE,
    public_quote_id TEXT REFERENCES public_quote_requests(id) ON DELETE CASCADE,
    uploader_user_id TEXT REFERENCES users(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    r2_object_key TEXT NOT NULL,
    document_purpose TEXT NOT NULL CHECK (document_purpose IN ('boq', 'drawing', 'specification', 'photo', 'trade_license', 'other')),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    rfq_id TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL REFERENCES vendor_profiles(id),
    total_amount_aed REAL NOT NULL,
    lead_time_days INTEGER NOT NULL,
    validity_days INTEGER NOT NULL DEFAULT 30,
    payment_terms TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'awarded', 'declined')),
    submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id TEXT PRIMARY KEY,
    quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    rfq_item_id TEXT NOT NULL REFERENCES rfq_items(id),
    unit_rate_aed REAL NOT NULL,
    total_price_aed REAL NOT NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS awards (
    id TEXT PRIMARY KEY,
    rfq_id TEXT UNIQUE NOT NULL REFERENCES rfqs(id),
    quotation_id TEXT UNIQUE NOT NULL REFERENCES quotations(id),
    contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id),
    vendor_id TEXT NOT NULL REFERENCES vendor_profiles(id),
    contract_amount_aed REAL NOT NULL,
    calculated_service_charge_aed REAL NOT NULL,
    awarded_at TEXT NOT NULL,
    contact_details_released_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_charge_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT NOT NULL,
    percentage REAL NOT NULL DEFAULT 0.025,
    minimum_charge_aed REAL NOT NULL DEFAULT 500.0,
    manpower_rate_rule TEXT DEFAULT 'aed_1_rule',
    site_visit_fee_aed REAL NOT NULL DEFAULT 100.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    effective_from TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
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

CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    invite_type TEXT NOT NULL CHECK (invite_type IN ('contractor', 'vendor')),
    invitation_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'opened', 'registered', 'expired')),
    sent_at TEXT,
    registered_at TEXT,
    created_at TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_contractor ON rfqs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_vendor ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp DESC);
