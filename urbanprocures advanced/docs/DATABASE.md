# Cloudflare D1 Database Specification

## 1. Design Principles
- Relational schema modeled specifically for UAE procurement.
- Strict foreign key constraints and indexed lookup paths.
- UTF-8 text collation supporting English and Arabic business names.
- Timestamps recorded as ISO8601 UTC strings.
- Monetary amounts stored in fils/halalas or decimal-preserving numeric formats (AED with 2 decimal precision).

---

## 2. Core Entities

```
+------------------+         +-------------------+         +---------------------+
|      users       |<--------|   contractors     |         |     quotations      |
+------------------+         +-------------------+         +---------------------+
| id (PK)          |         | id (PK)           |         | id (PK)             |
| email            |         | user_id (FK)      |         | rfq_id (FK)         |
| password_hash    |         | company_name      |         | vendor_id (FK)      |
| role             |         | trade_license_no  |         | total_amount_aed    |
| status           |         | contact_phone     |         | validity_days       |
+--------+---------+         +---------+---------+         | status              |
         |                             |                   +----------+----------+
         |                             |                              |
         |                   +---------v---------+                    |
         |                   |       rfqs        |<-------------------+
         |                   +-------------------+
         |                   | id (PK)           |
         |                   | contractor_id(FK) |
         |                   | title             |
         |                   | category          |
         |                   | location_emirate  |
         |                   | status            |
         |                   +---------+---------+
         |                             |
+--------v---------+                   |
|     vendors      |                   v
+------------------+         +-------------------+
| id (PK)          |         |      awards       |
| user_id (FK)     |         +-------------------+
| company_name     |         | id (PK)           |
| trade_categories |         | rfq_id (FK)       |
| verification_stat|         | quotation_id (FK) |
| terms_accepted_at|         | awarded_at        |
+------------------+         | unmasked_at       |
                             +-------------------+
```

---

## 3. Entity Definitions

### `users`
Master credential and account table.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `email`: TEXT UNIQUE NOT NULL
- `password_hash`: TEXT NOT NULL (Argon2id/PBKDF2)
- `role`: TEXT NOT NULL CHECK (role IN ('contractor', 'vendor', 'admin', 'operations'))
- `status`: TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended'))
- `created_at`: TEXT NOT NULL
- `updated_at`: TEXT NOT NULL

### `contractor_profiles`
Details of registered professional procurement entities.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `user_id`: TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `company_name`: TEXT NOT NULL
- `trade_license_number`: TEXT NOT NULL
- `trade_license_expiry`: TEXT
- `emirate`: TEXT NOT NULL
- `address`: TEXT NOT NULL
- `contact_person`: TEXT NOT NULL
- `contact_phone`: TEXT NOT NULL
- `verified_at`: TEXT

### `vendor_profiles`
Details of registered suppliers, subcontractors, and service firms.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `user_id`: TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `company_name`: TEXT NOT NULL
- `trade_license_number`: TEXT NOT NULL
- `trade_categories`: TEXT NOT NULL -- JSON array of specialized categories
- `emirates_serviced`: TEXT NOT NULL -- JSON array
- `verification_status`: TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'))
- `contact_person`: TEXT NOT NULL
- `contact_phone`: TEXT NOT NULL
- `created_at`: TEXT NOT NULL

### `vendor_terms_acceptance`
Click-wrap audit record for legal enforceability.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `vendor_id`: TEXT NOT NULL REFERENCES vendor_profiles(id)
- `terms_version`: TEXT NOT NULL
- `accepted_at`: TEXT NOT NULL
- `ip_address`: TEXT NOT NULL
- `user_agent`: TEXT NOT NULL

### `public_quote_requests`
Get a Quote requests submitted by property owners (no account required).
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `reference_code`: TEXT UNIQUE NOT NULL -- e.g. GAQ-2026-XXXX
- `customer_name`: TEXT NOT NULL
- `customer_phone`: TEXT NOT NULL
- `customer_email`: TEXT NOT NULL
- `property_type`: TEXT NOT NULL CHECK (property_type IN ('villa', 'apartment', 'townhouse', 'commercial_personal'))
- `location_emirate`: TEXT NOT NULL
- `location_community`: TEXT NOT NULL
- `work_category`: TEXT NOT NULL
- `description`: TEXT NOT NULL
- `budget_bracket`: TEXT
- `site_visit_requested`: INTEGER NOT NULL DEFAULT 0 -- 1 = AED 100 site visit requested
- `status`: TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'site_visit_scheduled', 'dispatched_to_vendors', 'completed', 'cancelled'))
- `created_at`: TEXT NOT NULL

### `rfqs`
Professional procurement tenders.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `reference_code`: TEXT UNIQUE NOT NULL -- e.g. RFQ-2026-XXXX
- `contractor_id`: TEXT NOT NULL REFERENCES contractor_profiles(id)
- `title`: TEXT NOT NULL
- `category`: TEXT NOT NULL
- `project_name`: TEXT NOT NULL
- `location_emirate`: TEXT NOT NULL
- `submission_deadline`: TEXT NOT NULL
- `target_completion_date`: TEXT
- `scope_description`: TEXT NOT NULL
- `estimated_budget_aed`: REAL
- `status`: TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed_published', 'receiving_quotations', 'under_evaluation', 'awarded', 'closed', 'cancelled'))
- `created_at`: TEXT NOT NULL
- `published_at`: TEXT
- `awarded_at`: TEXT

### `rfq_items`
Detailed line-item Bill of Quantities.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `rfq_id`: TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE
- `item_number`: INTEGER NOT NULL
- `description`: TEXT NOT NULL
- `quantity`: REAL NOT NULL
- `unit`: TEXT NOT NULL -- e.g., 'sqm', 'lm', 'nos', 'lump_sum'
- `specifications`: TEXT

### `rfq_documents`
Attached engineering drawings, specifications, and schedules.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `rfq_id`: TEXT REFERENCES rfqs(id) ON DELETE CASCADE
- `public_quote_id`: TEXT REFERENCES public_quote_requests(id) ON DELETE CASCADE
- `uploader_user_id`: TEXT REFERENCES users(id)
- `file_name`: TEXT NOT NULL
- `file_type`: TEXT NOT NULL
- `file_size_bytes`: INTEGER NOT NULL
- `r2_object_key`: TEXT NOT NULL
- `document_purpose`: TEXT NOT NULL CHECK (document_purpose IN ('boq', 'drawing', 'specification', 'photo', 'trade_license', 'other'))
- `created_at`: TEXT NOT NULL

### `quotations`
Tender bids submitted by verified vendors.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `reference_code`: TEXT UNIQUE NOT NULL -- e.g. QTE-2026-XXXX
- `rfq_id`: TEXT NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE
- `vendor_id`: TEXT NOT NULL REFERENCES vendor_profiles(id)
- `total_amount_aed`: REAL NOT NULL
- `lead_time_days`: INTEGER NOT NULL
- `validity_days`: INTEGER NOT NULL DEFAULT 30
- `payment_terms`: TEXT NOT NULL
- `notes`: TEXT
- `status`: TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'awarded', 'declined'))
- `submitted_at`: TEXT NOT NULL

### `quotation_items`
Priced line items matching RFQ BoQ.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `quotation_id`: TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE
- `rfq_item_id`: TEXT NOT NULL REFERENCES rfq_items(id)
- `unit_rate_aed`: REAL NOT NULL
- `total_price_aed`: REAL NOT NULL
- `remarks`: TEXT

### `awards`
Formal contract award record linking RFQ to winning quotation.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `rfq_id`: TEXT UNIQUE NOT NULL REFERENCES rfqs(id)
- `quotation_id`: TEXT UNIQUE NOT NULL REFERENCES quotations(id)
- `contractor_id`: TEXT NOT NULL REFERENCES contractor_profiles(id)
- `vendor_id`: TEXT NOT NULL REFERENCES vendor_profiles(id)
- `contract_amount_aed`: REAL NOT NULL
- `calculated_service_charge_aed`: REAL NOT NULL
- `awarded_at`: TEXT NOT NULL
- `contact_details_released_at`: TEXT NOT NULL

### `service_charge_rules`
Configurable marketplace charge engine.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `rule_name`: TEXT NOT NULL
- `percentage`: REAL NOT NULL DEFAULT 0.025 -- 2.5%
- `minimum_charge_aed`: REAL NOT NULL DEFAULT 500.0
- `manpower_rate_rule`: TEXT DEFAULT 'aed_1_rule'
- `site_visit_fee_aed`: REAL NOT NULL DEFAULT 100.0
- `is_active`: INTEGER NOT NULL DEFAULT 1
- `effective_from`: TEXT NOT NULL

### `audit_events`
Immutable record of all high-value marketplace actions.
- `id`: TEXT (UUIDv4) PRIMARY KEY
- `actor_user_id`: TEXT
- `actor_role`: TEXT NOT NULL
- `action_type`: TEXT NOT NULL
- `resource_type`: TEXT NOT NULL
- `resource_id`: TEXT NOT NULL
- `payload_json`: TEXT
- `ip_address`: TEXT
- `timestamp`: TEXT NOT NULL
