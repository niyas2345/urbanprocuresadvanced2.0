-- Urban Procures Advanced
-- Seed Data for Cloudflare D1
-- Password for all seeded accounts is: "password"

-- 1. Users
INSERT OR IGNORE INTO users (id, email, password_hash, salt, role, status, created_at, updated_at) VALUES
('usr-cnt-01', 'procurement@apexfitout.ae', '80ba059794e30e6998ca4fcd217df0ec860b5264fe6013398bdd0f9fd6f3f746', 'seed_salt_2026_up', 'contractor', 'active', '2026-09-10T08:00:00Z', '2026-09-10T08:00:00Z'),
('usr-vnd-01', 'bids@emiratesjoinery.ae', '80ba059794e30e6998ca4fcd217df0ec860b5264fe6013398bdd0f9fd6f3f746', 'seed_salt_2026_up', 'vendor', 'active', '2026-09-12T09:30:00Z', '2026-09-12T09:30:00Z'),
('usr-vnd-02', 'sales@gulfacoustic.ae', '80ba059794e30e6998ca4fcd217df0ec860b5264fe6013398bdd0f9fd6f3f746', 'seed_salt_2026_up', 'vendor', 'active', '2026-09-15T11:00:00Z', '2026-09-15T11:00:00Z'),
('usr-adm-01', 'admin@urbanprocures.com', '80ba059794e30e6998ca4fcd217df0ec860b5264fe6013398bdd0f9fd6f3f746', 'seed_salt_2026_up', 'admin', 'active', '2026-08-01T00:00:00Z', '2026-08-01T00:00:00Z');

-- 2. Organizations
INSERT OR IGNORE INTO organizations (id, name, org_type, trade_license_number, emirate, address, contact_person, contact_phone, created_at) VALUES
('org-cnt-01', 'Apex Fit-Out Contracting LLC', 'contractor', 'CN-778102', 'Dubai', 'Al Quoz Industrial Area 3, Street 18', 'Tariq Mansoor', '+971 50 442 8891', '2026-09-10T08:00:00Z'),
('org-vnd-01', 'Emirates Joinery & Woodcraft LLC', 'vendor', 'TL-228910', 'Dubai', 'Dubai Investment Park (DIP 1), Bay 4', 'Suresh Kumar', '+971 55 331 4455', '2026-09-12T09:30:00Z'),
('org-vnd-02', 'Gulf Acoustic & Partition Specialists', 'vendor', 'TL-441029', 'Dubai', 'Ras Al Khor Industrial Area 2', 'Khalid Al-Marzouqi', '+971 52 889 0012', '2026-09-15T11:00:00Z');

-- 3. Contractors
INSERT OR IGNORE INTO contractors (id, user_id, organization_id, company_name, trade_license_number, trade_license_expiry, emirate, address, contact_person, contact_phone, verified_at, created_at) VALUES
('cnt-01', 'usr-cnt-01', 'org-cnt-01', 'Apex Fit-Out Contracting LLC', 'CN-778102', '2027-05-15', 'Dubai', 'Al Quoz Industrial Area 3, Street 18', 'Tariq Mansoor', '+971 50 442 8891', '2026-09-11T10:00:00Z', '2026-09-10T08:00:00Z');

-- 4. Vendors
INSERT OR IGNORE INTO vendors (id, user_id, organization_id, company_name, trade_license_number, trade_categories, emirates_serviced, verification_status, contact_person, contact_phone, terms_accepted_at, created_at) VALUES
('vnd-01', 'usr-vnd-01', 'org-vnd-01', 'Emirates Joinery & Woodcraft LLC', 'TL-228910', '["Joinery & Carpentry", "Custom Cabinetry", "Doors & Paneling"]', '["Dubai", "Abu Dhabi", "Sharjah"]', 'verified', 'Suresh Kumar', '+971 55 331 4455', '2026-09-13T14:22:00Z', '2026-09-12T09:30:00Z'),
('vnd-02', 'usr-vnd-02', 'org-vnd-02', 'Gulf Acoustic & Partition Specialists', 'TL-441029', '["Gypsum & Drywall", "Acoustic Ceilings", "Partitions"]', '["Dubai", "Sharjah"]', 'verified', 'Khalid Al-Marzouqi', '+971 52 889 0012', '2026-09-16T10:15:00Z', '2026-09-15T11:00:00Z');

-- 5. Vendor Trade Categories
INSERT OR IGNORE INTO vendor_categories (id, vendor_id, category_name, created_at) VALUES
('vc-01', 'vnd-01', 'Joinery & Carpentry', '2026-09-12T09:30:00Z'),
('vc-02', 'vnd-01', 'Custom Cabinetry', '2026-09-12T09:30:00Z'),
('vc-03', 'vnd-01', 'Doors & Paneling', '2026-09-12T09:30:00Z'),
('vc-04', 'vnd-02', 'Gypsum & Drywall', '2026-09-15T11:00:00Z'),
('vc-05', 'vnd-02', 'Acoustic Ceilings', '2026-09-15T11:00:00Z'),
('vc-06', 'vnd-02', 'Partitions', '2026-09-15T11:00:00Z');

-- 6. Terms Acceptances
INSERT OR IGNORE INTO terms_acceptances (id, vendor_id, user_id, terms_version, accepted_at, ip_address, user_agent) VALUES
('ta-01', 'vnd-01', 'usr-vnd-01', 'v2026.1', '2026-09-13T14:22:00Z', '194.170.12.8', 'Mozilla/5.0 (Macintosh; UAE)'),
('ta-02', 'vnd-02', 'usr-vnd-02', 'v2026.1', '2026-09-16T10:15:00Z', '86.96.11.45', 'Mozilla/5.0 (Windows NT 10.0; UAE)');

-- 7. Public Get a Quote Requests
INSERT OR IGNORE INTO get_a_quote_requests (id, reference_code, customer_name, customer_phone, customer_email, property_type, location_emirate, location_community, work_category, description, budget_bracket, site_visit_requested, status, created_at) VALUES
('gaq-01', 'GAQ-2026-8819', 'Rashid Al-Falasi', '+971 50 998 7712', 'rashid.falasi@gmail.com', 'villa', 'Dubai', 'Palm Jumeirah (Frond G)', 'Pergola, Decking & Exterior Joinery', 'Require bespoke teak wood pergola (6m x 4m) with integrated LED lighting and composite outdoor timber decking around the private swimming pool.', 'AED 40,000 - 60,000', 1, 'site_visit_scheduled', '2026-10-02T11:20:00Z'),
('gaq-02', 'GAQ-2026-8820', 'Sophia Elena', '+971 54 221 9901', 'sophia.elena@outlook.com', 'apartment', 'Dubai', 'Downtown Dubai (Burj Crown)', 'Painting & Wall Finishes', 'Repainting of 2-bedroom luxury apartment with high-end washable matte finish and neo-classical decorative polyurethane wall moldings.', 'AED 15,000 - 25,000', 0, 'dispatched_to_vendors', '2026-10-03T15:00:00Z');

-- 8. Site Visits
INSERT OR IGNORE INTO site_visits (id, request_id, scheduled_date, inspector_name, fee_aed, status, notes, created_at) VALUES
('sv-01', 'gaq-01', '2026-10-08T10:00:00Z', 'Fahad Al-Qasimi (Site Engineer)', 100.0, 'scheduled', 'Take precision laser measurements of pool perimeter deck and structural pergola anchors.', '2026-10-02T12:00:00Z');

-- 9. RFQs
INSERT OR IGNORE INTO rfqs (id, reference_code, contractor_id, title, category, project_name, location_emirate, submission_deadline, target_completion_date, scope_description, estimated_budget_aed, status, created_at, published_at, awarded_at) VALUES
('rfq-01', 'RFQ-2026-9041', 'cnt-01', 'Bespoke Oak Veneer Wall Paneling & Flush Doors', 'Joinery & Carpentry', 'DIFC Executive Suites Level 38', 'Dubai', '2026-10-25', '2026-12-15', 'Fabrication, fire-rated acoustic treatment, and installation of premium European White Oak grooved acoustic wall panels and secret pivot doors as per architectural drawings.', 180000.0, 'under_evaluation', '2026-09-28T09:00:00Z', '2026-09-29T14:00:00Z', NULL),
('rfq-02', 'RFQ-2026-9042', 'cnt-01', 'Commercial Office Acoustic Baffle Ceilings & MEP Integration', 'Gypsum & Drywall', 'Business Bay Prime Tower', 'Dubai', '2026-10-30', '2027-01-20', 'Suspended metal linear acoustic baffle ceiling system with coordinated cutouts for linear LED architectural lighting and VRF diffusers.', 95000.0, 'submitted', '2026-10-03T16:30:00Z', NULL, NULL);

-- 10. RFQ Items (BoQ)
INSERT OR IGNORE INTO rfq_items (id, rfq_id, item_number, description, quantity, unit, specifications) VALUES
('item-01', 'rfq-01', 1, 'Supply & fix European White Oak veneer acoustic fluted paneling on 12mm FR MDF backing with Class 0 fire retardant lacquer finish', 340.0, 'sqm', 'Sound absorption NRC 0.75 min, concealed clip installation'),
('item-02', 'rfq-01', 2, 'Supply & install 60-min fire-rated matching veneer concealed frame pivot doors with acoustic drop seals', 12.0, 'nos', 'Dorma concealed pivot hardware, matching veneer grain orientation'),
('item-201', 'rfq-02', 1, 'Linear acoustic felt baffles (150mm depth x 50mm width) suspended at 100mm pitch', 580.0, 'sqm', 'Hunter Douglas or approved equivalent in Charcoal Grey');

-- 11. RFQ Documents (in R2)
INSERT OR IGNORE INTO rfq_documents (id, rfq_id, public_quote_id, quotation_id, uploader_user_id, file_name, file_type, file_size_bytes, r2_object_key, document_purpose, sha256_hash, created_at) VALUES
('doc-01', 'rfq-01', NULL, NULL, 'usr-cnt-01', 'DIFC_L38_Joinery_Details_RevC.pdf', 'application/pdf', 4200000, 'rfq/rfq-01/DIFC_L38_Joinery_Details_RevC.pdf', 'drawing', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-09-28T09:00:00Z'),
('doc-02', 'rfq-01', NULL, NULL, 'usr-cnt-01', 'BoQ_Joinery_Schedule_V3.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 650000, 'rfq/rfq-01/BoQ_Joinery_Schedule_V3.xlsx', 'boq', 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2', '2026-09-28T09:00:00Z'),
('doc-201', 'rfq-02', NULL, NULL, 'usr-cnt-01', 'Reflected_Ceiling_Plan_RCP_Rev2.dwg', 'application/acad', 8900000, 'rfq/rfq-02/Reflected_Ceiling_Plan_RCP_Rev2.dwg', 'drawing', 'a583a61f224b7a151834c9c1044464c8d1cf5ecbb4ef6e04d493a778c75d40db', '2026-10-03T16:30:00Z'),
('doc-gaq-01', NULL, 'gaq-01', NULL, NULL, 'pool_terrace_dimensions.pdf', 'application/pdf', 2450000, 'quotes/gaq-01/pool_terrace_dimensions.pdf', 'drawing', '8a1290b22a0756e0cf8710fa5c4d0a793c1284643c7b3c2c1c68e1467469a584', '2026-10-02T11:20:00Z');

-- 12. Vendor Quotes
INSERT OR IGNORE INTO vendor_quotes (id, reference_code, rfq_id, vendor_id, total_amount_aed, lead_time_days, validity_days, payment_terms, notes, status, submitted_at) VALUES
('qte-01', 'QTE-2026-3011', 'rfq-01', 'vnd-01', 168500.0, 28, 30, '20% mobilization advance, 70% delivery against inspection, 10% post-handover', 'Premium FSC-certified European white oak with 10-year warranty on acoustic backing. All sample mockups delivered within 5 days of award.', 'submitted', '2026-10-01T10:15:00Z'),
('qte-02', 'QTE-2026-3012', 'rfq-01', 'vnd-02', 176000.0, 24, 45, '30% advance, 70% progressive monthly certification', 'Includes certified German Dorma architectural hardware. Lead time can be accelerated to 20 days upon contract signing.', 'submitted', '2026-10-02T14:40:00Z');

-- 13. Quote Items
INSERT OR IGNORE INTO quote_items (id, quotation_id, rfq_item_id, unit_rate_aed, total_price_aed, remarks) VALUES
('qi-01', 'qte-01', 'item-01', 395.0, 134300.0, 'Class 0 fire retardant backing included'),
('qi-02', 'qte-01', 'item-02', 2850.0, 34200.0, 'Dorma concealed pivots included'),
('qi-03', 'qte-02', 'item-01', 415.0, 141100.0, 'Italian fluted acoustic oak veneer'),
('qi-04', 'qte-02', 'item-02', 2900.0, 34800.0, '60-min civil defence certified fire doors');

-- 14. Service Charge Rules (2.5% or AED 500 minimum rule)
INSERT OR IGNORE INTO service_charge_rules (id, rule_name, percentage, minimum_charge_aed, manpower_rate_rule, site_visit_fee_aed, is_active, effective_from) VALUES
('rule-default-v1', 'Standard UAE Procurement Service Charge', 0.025, 500.0, 'aed_1_rule', 100.0, 1, '2026-01-01T00:00:00Z');

-- 15. Audit Logs
INSERT OR IGNORE INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp) VALUES
('aud-01', 'system', 'system', 'PLATFORM_INITIALIZED', 'system', 'sys-01', '{"version": "2.1.0-cloudflare-d1"}', '127.0.0.1', '2026-08-01T00:00:00Z'),
('aud-02', 'usr-cnt-01', 'contractor', 'RFQ_CREATED', 'rfq', 'rfq-01', '{"reference": "RFQ-2026-9041"}', '194.170.12.8', '2026-09-28T09:00:00Z'),
('aud-03', 'usr-adm-01', 'admin', 'RFQ_PUBLISHED', 'rfq', 'rfq-01', '{"target": "verified_vendors"}', '86.96.11.45', '2026-09-29T14:00:00Z'),
('aud-04', 'usr-vnd-01', 'vendor', 'QUOTATION_SUBMITTED', 'quotation', 'qte-01', '{"amountAed": 168500.0}', '194.170.12.8', '2026-10-01T10:15:00Z'),
('aud-05', 'usr-vnd-02', 'vendor', 'QUOTATION_SUBMITTED', 'quotation', 'qte-02', '{"amountAed": 176000.0}', '86.96.11.45', '2026-10-02T14:40:00Z');
