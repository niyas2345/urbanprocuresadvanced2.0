-- Additive upgrade. Existing customer records and mail statuses are preserved.
CREATE TABLE email_campaign_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), status TEXT NOT NULL DEFAULT 'paused' CHECK(status IN ('paused','active')),
 daily_limit INTEGER NOT NULL DEFAULT 100 CHECK(daily_limit BETWEEN 0 AND 100),
 contractor_limit INTEGER NOT NULL DEFAULT 60, vendor_limit INTEGER NOT NULL DEFAULT 40,
 schedule_hour INTEGER NOT NULL DEFAULT 9 CHECK(schedule_hour BETWEEN 0 AND 23),
 provider_daily_limit INTEGER NOT NULL DEFAULT 0 CHECK(provider_daily_limit>=0),
 owner_limit_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(owner_limit_confirmed IN (0,1)),
 source_approved INTEGER NOT NULL DEFAULT 0 CHECK(source_approved IN (0,1)),
 validation_evidence TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL,
 CHECK(contractor_limit>=0 AND vendor_limit>=0 AND contractor_limit+vendor_limit=daily_limit)
);
INSERT INTO email_campaign_settings(id,updated_at) VALUES(1,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
CREATE TABLE email_sender_identities (
 address TEXT PRIMARY KEY, purpose TEXT NOT NULL, account_id TEXT NOT NULL DEFAULT '', verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN (0,1)),
 reply_to TEXT NOT NULL, verification_evidence TEXT NOT NULL DEFAULT ''
);
INSERT INTO email_sender_identities(address,purpose,reply_to) VALUES
 ('urbanprocures@urbanprocures.com','transactional','urbanprocures@urbanprocures.com'),
 ('invites@urbanprocures.com','onboarding','urbanprocures@urbanprocures.com'),
 ('rfq@urbanprocures.com','rfq','urbanprocures@urbanprocures.com');
CREATE TABLE email_templates (
 role TEXT PRIMARY KEY CHECK(role IN ('contractor','vendor')), subject TEXT NOT NULL, content TEXT NOT NULL
);
INSERT INTO email_templates VALUES
 ('contractor','Invitation to Urban Procures','Explore Urban Procures to manage construction procurement. Register through the Contractor journey.'),
 ('vendor','Invitation to Urban Procures','Explore Urban Procures for relevant construction procurement opportunities. Register through the Vendor journey.');
CREATE TABLE email_prospects (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, company TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('contractor','vendor')), trade TEXT NOT NULL, emirate TEXT NOT NULL,
 source_url TEXT NOT NULL, contact_basis TEXT NOT NULL CHECK(contact_basis IN ('explicit_consent','existing_business_relationship')),
 basis_evidence TEXT NOT NULL, verified_at TEXT, opted_out_at TEXT, created_at TEXT NOT NULL
);
CREATE TABLE email_suppressions (
 email TEXT PRIMARY KEY COLLATE NOCASE, reason TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE email_campaign_runs (
 day TEXT PRIMARY KEY, lease_until TEXT NOT NULL, lease_id TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('running','completed','failed')), started_at TEXT NOT NULL, completed_at TEXT, error_code TEXT
);
CREATE TABLE email_campaign_messages (
 id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL UNIQUE REFERENCES email_prospects(id),
 role TEXT NOT NULL, day TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE,
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','accepted','delivered','bounced','suppressed','review_required','failed')),
 subject TEXT NOT NULL, content TEXT NOT NULL, unsubscribe_digest TEXT NOT NULL UNIQUE,
 created_at TEXT NOT NULL, completed_at TEXT, provider_message_id TEXT, attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at TEXT, error_code TEXT
);
CREATE INDEX email_campaign_queue ON email_campaign_messages(status,next_attempt_at,created_at);
CREATE INDEX email_campaign_daily ON email_campaign_messages(day,role);
CREATE TABLE email_delivery_evidence (
 id TEXT PRIMARY KEY, message_id TEXT NOT NULL, channel TEXT NOT NULL CHECK(channel IN ('transactional','onboarding')),
 outcome TEXT NOT NULL CHECK(outcome IN ('accepted','delivered','bounced','failed','suppressed','review_required')),
 provider_message_id TEXT, evidence TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL,
 UNIQUE(message_id,channel,outcome)
);
CREATE TABLE email_provider_slots (slot INTEGER PRIMARY KEY, claimed_at TEXT NOT NULL);
ALTER TABLE email_outbox ADD COLUMN provider_message_id TEXT;
ALTER TABLE email_outbox ADD COLUMN provider_accepted_at TEXT;
ALTER TABLE email_outbox ADD COLUMN error_code TEXT;
