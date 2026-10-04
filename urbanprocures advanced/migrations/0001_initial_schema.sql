-- Migration 0001: Initial Core Schema
-- Applied to Cloudflare D1
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('contractor', 'vendor', 'admin', 'operations')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contractor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS vendor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    trade_license_number TEXT NOT NULL,
    trade_categories TEXT NOT NULL,
    emirates_serviced TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vendor_terms_acceptance (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    terms_version TEXT NOT NULL,
    accepted_at TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_quote_requests (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('villa', 'apartment', 'townhouse', 'commercial_personal')),
    location_emirate TEXT NOT NULL,
    location_community TEXT NOT NULL,
    work_category TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_bracket TEXT,
    site_visit_requested INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'site_visit_scheduled', 'dispatched_to_vendors', 'completed', 'cancelled')),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rfqs (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    project_name TEXT NOT NULL,
    location_emirate TEXT NOT NULL,
    submission_deadline TEXT NOT NULL,
    target_completion_date TEXT,
    scope_description TEXT NOT NULL,
    estimated_budget_aed REAL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed_published', 'receiving_quotations', 'under_evaluation', 'awarded', 'closed', 'cancelled')),
    created_at TEXT NOT NULL,
    published_at TEXT,
    awarded_at TEXT
);
