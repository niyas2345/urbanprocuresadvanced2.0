import React, { useState } from 'react';
import { FileText, Database, ShieldCheck, Cloud, CheckSquare, Layers, BookOpen } from 'lucide-react';

interface DocsViewerPageProps {
  onNavigate: (path: string) => void;
}

export const DocsViewerPage: React.FC<DocsViewerPageProps> = ({ onNavigate }) => {
  const [selectedDoc, setSelectedDoc] = useState<string>('ARCHITECTURE');

  const docs = [
    { id: 'ARCHITECTURE', title: 'ARCHITECTURE.md', icon: Layers, desc: 'High-level Cloudflare edge architecture, workflows & subsystems' },
    { id: 'DATABASE', title: 'DATABASE.md', icon: Database, desc: 'Complete Cloudflare D1 SQLite relational schema & data dictionary' },
    { id: 'BUSINESS_RULES', title: 'BUSINESS_RULES.md', icon: BookOpen, desc: 'Three primary categories, state machine, identity masking & service charges' },
    { id: 'AUTHORIZATION', title: 'AUTHORIZATION.md', icon: ShieldCheck, desc: 'Role-Based Access Control (RBAC) matrix & resource ownership' },
    { id: 'CLOUDFLARE', title: 'CLOUDFLARE.md', icon: Cloud, desc: 'Cloudflare Worker bindings, D1, R2, KV, Queues & wrangler config' },
    { id: 'TESTING', title: 'TESTING.md', icon: CheckSquare, desc: 'Automated test suite, unit tests, masking & E2E verification' },
    { id: 'PRODUCTION_CHECKLIST', title: 'PRODUCTION_CHECKLIST.md', icon: CheckSquare, desc: 'The 8 Production Acceptance Gates verification' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#123540] pb-16">
      {/* Top Banner */}
      <div className="bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']">
              <span>Master Engineering Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#eb6a32]" />
              Greenfield Engineering Blueprint Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
              Authoritative documentation residing in <code>urbanprocures advanced/docs/</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Doc List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Blueprint Documents
            </span>
            {docs.map((d) => {
              const Icon = d.icon;
              const isActive = selectedDoc === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoc(d.id)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 font-semibold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-mono">{d.title}</div>
                    <div className={`text-[10px] mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>{d.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Doc Viewer Content */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            {selectedDoc === 'ARCHITECTURE' && (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-200">
                  Cloudflare Architecture Blueprint
                </h2>
                <p className="text-slate-600">
                  Urban Procures Advanced is an independent greenfield platform running exclusively on Cloudflare edge primitives with zero third-party backend dependencies.
                </p>

                <div className="p-4 bg-slate-900 text-amber-400 font-mono text-[11px] rounded-lg overflow-x-auto space-y-1">
                  <div>+-------------------------------------------------------+</div>
                  <div>| Cloudflare Workers (Micro-Router & State Engine)      |</div>
                  <div>+-------------------------------------------------------+</div>
                  <div>  |-- D1 Database: Relational SQLite Cluster            |</div>
                  <div>  |-- R2 Storage: Private Drawings, BoQ, Specifications |</div>
                  <div>  |-- KV Cache: Session Verification & Sliding Windows  |</div>
                  <div>  |-- Queues: Vendor Onboarding & Candidate Invitations |</div>
                  <div>  +-- Email Service: Provider-independent (Zoho Ready)  |</div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-4">
                  Key Greenfield Isolation Rules
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Zero Supabase or Firebase dependencies:</strong> Cloudflare D1 provides all transactional relational persistence.</li>
                  <li><strong>Three Primary Launch Categories:</strong> Get a Quote (no account), Contractor (auth), Vendor (auth).</li>
                  <li><strong>Pre-Award Privacy:</strong> Masks all contact information and company names until formal contract award.</li>
                </ul>
              </div>
            )}

            {selectedDoc === 'DATABASE' && (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-200">
                  Cloudflare D1 Relational Schema
                </h2>
                <p className="text-slate-600">
                  Fully normalized SQLite schema with foreign key constraints, indexes, and audit logging tables.
                </p>

                <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto">
                  <pre>{`-- Core D1 Entities
1. users (id, email, password_hash, role, status)
2. contractor_profiles (id, user_id, company_name, trade_license_number, emirate)
3. vendor_profiles (id, user_id, company_name, trade_categories, verification_status)
4. vendor_terms_acceptance (id, vendor_id, terms_version, accepted_at, ip_address)
5. public_quote_requests (id, reference_code, property_type, site_visit_requested)
6. rfqs (id, reference_code, contractor_id, status, scope_description)
7. rfq_items (id, rfq_id, item_number, description, quantity, unit)
8. rfq_documents (id, rfq_id, file_name, r2_object_key, document_purpose)
9. quotations (id, reference_code, rfq_id, vendor_id, total_amount_aed, status)
10. quotation_items (id, quotation_id, rfq_item_id, unit_rate_aed, total_price_aed)
11. awards (id, rfq_id, quotation_id, calculated_service_charge_aed, contact_details_released_at)
12. service_charge_rules (id, percentage, minimum_charge_aed, site_visit_fee_aed)
13. audit_events (id, actor_role, action_type, resource_type, timestamp)`}</pre>
                </div>
              </div>
            )}

            {selectedDoc === 'BUSINESS_RULES' && (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-200">
                  Business Rules & State Machine
                </h2>
                <div className="space-y-4 text-slate-600">
                  <div>
                    <h4 className="font-bold text-slate-900">1. Exactly Three Primary Launch Categories</h4>
                    <p>
                      <strong>Get a Quote:</strong> Villa, apartment and personal property work. <em>Zero registration or login required</em>. Supports optional AED 100 site visit.<br />
                      <strong>Contractor:</strong> Registered professional procurement and RFQ management.<br />
                      <strong>Vendor:</strong> Registered supply and subcontracting. Click-wrap terms acceptance required.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">2. Service Charge Terminology & Formula</h4>
                    <p>
                      Platform charge is always termed <strong>SERVICE CHARGE</strong> (never &quot;commission&quot;). Standard rule: 2.5% of final awarded contract value with a minimum threshold of AED 500.00.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">3. Identity Masking & Contact Release</h4>
                    <p>
                      Before award: Contractors see <code>Vendor #VND-XXXX</code>; Vendors see <code>Client #RFQ-XXXX</code>. Unmasking occurs strictly post-award when the authorized contractor clicks &quot;Confirm Award&quot;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDoc !== 'ARCHITECTURE' && selectedDoc !== 'DATABASE' && selectedDoc !== 'BUSINESS_RULES' && (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] pb-2 border-b border-slate-200">
                  {selectedDoc}.md Specification
                </h2>
                <p className="text-slate-600">
                  The complete specification is stored in <code>urbanprocures advanced/docs/{selectedDoc}.md</code> and is actively tested in the verification harness.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  Document version 2.0.0-greenfield verified against all 8 Production Acceptance Gates.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
