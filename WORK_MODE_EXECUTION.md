# Urban Procures Advanced - Work Mode execution guide

This guide continues the user's uploaded Phase-2 handoff; it does not supersede the
production isolation or approved frontend requirements. Repository authorized by the user:
https://github.com/niyas2345/urbanprocuresadvanced2.0 . No other repository is in scope.

## Verified baseline and current checkpoint

The uploaded archive has 61 files. Git blob SHA comparison against the complete remote tree
confirmed every uploaded file matches `main` commit `c7004f30603f20d363697c034cddabf44c1d0bee`.
No AGENTS.md or GitHub workflow was present in that tree. The archive does not contain a
prior Phase-2 revision diff; assertions about exactly which files AI Studio changed in an
interrupted run cannot be reconstructed from this snapshot alone.

Working state: partial implementation. Backend and Cloudflare integration are not complete.
Existing documentation describes desired architecture and must not be treated as evidence.
The current execution guide and checkpoint are the grounded status references.

## Continuation audit

| Requirement | Baseline classification | File evidence / remaining work |
| --- | --- | --- |
| Approved frontend/assets | COMPLETED for preservation | Existing HomePage, CSS, index.html and logo/hero assets retained byte-for-byte; browser rendering not yet verified here. |
| Worker API | PARTIALLY COMPLETED | workers/index.ts implements public quote POST and document view only; other APIs previously returned a misleading 200 fallback. |
| D1 architecture | BROKEN / INCONSISTENT | database/d1Database.ts uses node:sqlite. schema.sql has 20 tables; migrations create 14 with incompatible names, columns and foreign keys. |
| Authentication | PARTIALLY COMPLETED | authHelper hashes passwords; Express persists bearer sessions locally. Login/register/me/logout missing from Worker. |
| Authorization | BROKEN / INCONSISTENT | Local Admin routes have no role gate. Local document routes lack authentication/ownership checks. Award route lacks RFQ ownership check. |
| Contractor clickwrap | NOT STARTED | ContractorPage and local registration lack explicit acceptance; no Contractor acceptance schema. |
| Vendor clickwrap | MOCKED / BROKEN | VendorPage uses mockStore; local registration sets terms_accepted_at and inserts acceptance without an explicit checkbox payload. |
| Acceptance evidence/versioning | PARTIALLY COMPLETED | Vendor-only terms_acceptances omits organization, role, type and status; no active version policy or reacceptance enforcement. |
| Get a Quote | PARTIALLY COMPLETED | Page uses API; local Express handles attachments and site visits. Worker does not persist attachments/site-visit row/audit; reference has a small random collision space. |
| Contractor | PARTIALLY COMPLETED | API-backed page and Express routes exist; lacks clickwrap, coherent Worker routes and draft edit/submit endpoints. |
| Vendor | MOCKED | VendorPage uses mockStore for login, register, Terms, RFQs, bids, awards and contacts. Worker routes absent. |
| Admin | MOCKED | AdminPage uses mockStore for queues, profiles, approvals, documents, account status, charges, invitations and audit. No genuine Admin sign-in gate. |
| Pre-award masking | PARTIALLY COMPLETED / INCONSISTENT | Helpers delete selected camelCase fields from cloned objects; must test extra/snake_case fields and nested records. Default fictional emails are present. |
| Award/contact release | BROKEN / INCONSISTENT | Local route uses selected quote amount but lacks ownership/state validation and accepted-Terms link. Missing Worker award transaction. |
| Quotation security | BROKEN / INCONSISTENT | Local submit accepts browser totals; no category, Terms, deadline/state or BoQ-ownership checks. |
| Service Charge | PARTIALLY COMPLETED | Unit-tested default max(2.5%, AED 500) engine; local persistence referenced a nonexistent calculation field, corrected in this checkpoint. |
| R2 storage/upload | MOCKED outside Worker read | r2Storage.ts writes to local filesystem and seeds sample documents; r2Service signed URL is simulated. No real Worker upload route. |
| Document viewer | PARTIALLY COMPLETED / MOCKED | Viewer renders illustrative previews and sample records; authenticated real blob retrieval/inspection/download remains required. |
| RFQ lifecycle | PARTIALLY COMPLETED | rfqStateMachine has a transition graph; must integrate authorization and validation into every API transition. |
| Audit | PARTIALLY COMPLETED | Express writes local audit_logs; Worker lacks real workflow events. Historical Terms protection not implemented. |
| Email/invitations | MOCKED | EmailService logs and returns success/provider=zoho without provider call; invitation links point at production. No mail sent in this session. |
| Tests | PARTIALLY COMPLETED | 20 supplied pure unit checks pass; these do not exercise D1/R2, browser authentication or real procurement flows. TestSuitePage badges are not execution evidence. |
| Isolation | BROKEN baseline; safeguards added | Original wrangler used production environment/domain and non-Advanced resource names. This checkpoint fixes config and adds runtime/config tests. |

Migration incompatibilities measured on empty SQLite databases:
- Missing in migration schema: audit_logs, auth_sessions, contractors, get_a_quote_requests,
  notifications, organizations, quote_items, service_charges, site_visits, terms_acceptances,
  vendor_categories, vendor_quotes, vendors.
- Migration-only legacy names include contractor_profiles, vendor_profiles,
  vendor_terms_acceptance, public_quote_requests, quotations, quotation_items, audit_events.
- Shared tables differ: users lacks salt in migrations; rfq_documents lacks quotation_id and
  sha256_hash; invitations has registered_at only in migrations.
- Never combine these blindly using CREATE TABLE IF NOT EXISTS: incompatible existing tables
  will remain unchanged. Prepare and test an explicit forward migration strategy.

## Changes completed in this continuation

1. Wrangler now uses Advanced-only resource names, no production domain/routes, disabled
   workers.dev, and an intentionally unresolved D1 placeholder. Removed unused KV/Queues bindings.
2. Worker rejects production hosts and non-Advanced environment configuration before data access.
3. Worker document view now rejects anonymous/inactive sessions and temporarily permits only
   active Admins. Vendor/Contractor document access is intentionally incomplete until tenant policy
   exists. This is a temporary fail-closed boundary, not a completed document workflow.
4. Unimplemented Worker routes return 404 instead of false success.
5. Supplied pure unit tests can run under Node 24 using type-only imports.
6. Corrected local award persistence from nonexistent calculatedServiceChargeAed to
   baseServiceChargeAed; this does not resolve the local route's authorization deficiencies.
7. Added repository/configuration checks, focused Worker boundary tests, AGENTS.md and checkpoint.

All existing src frontend files and assets remain unchanged in this checkpoint.

## Exact execution order and stage exit criteria

Work Mode should implement one coherent stage, validate it, and update the checkpoint before
continuing to the next. Do not stop for routine confirmations within this authorized scope.

### Stage 1 - Reconcile schema and real Worker runtime (NEXT)

Inspect package.json, tsconfig.json, schema.sql, both migrations, Worker index, API client and
shared types. Verify/install compatible dependencies in this repo, retain a lockfile and add
Cloudflare runtime types and local Wrangler development tooling. Do not choose package versions
from memory if registry evidence is available. Preserve all existing functional frontend files.
Create an explicit migration plan for this Advanced snapshot, keeping existing valid fields/data.
Test fresh-database migrations and the forward path from both existing schemas independently.
Do not assume any migrations were applied remotely. No remote database action is authorized
by a local passing test. Use local Wrangler D1 and R2 bindings to verify the Worker starts.
Exit: reproducible build/typecheck; schema parity; actual Worker responds; local bindings persist.

### Stage 2 - Authentication, Terms and authorization foundation

Migrate authHelper and local auth routes into Worker-compatible code. Generate secure IDs/tokens,
use a documented password KDF, enforce active status on every request, revoke sessions on logout,
and validate role/profile from server data. Never use fake default profile IDs.
Create role-specific, server-controlled published Terms versions and immutable acceptance history
with id/user/organization/role/type/version/status/time and audit evidence. Preserve existing
vendor acceptance history without treating auto-created records as verified explicit acceptance.
Server rejects unchecked/omitted acceptance and stale/wrong-role versions. Contractor/Vendor
onboarding checkboxes start unchecked; show Terms and use Accept Terms & Complete Registration.
A mandatory new version must block participation until explicit reacceptance. No automatic
verification of trade licenses. Admin can inspect historical acceptance; vendors cannot access
procurement without current acceptance. Full approved Terms wording must come from the owner or
existing approved project materials; do not label invented legal wording as already approved.
Exit: direct API negative tests for acceptance bypass, role spoof, suspension, wrong version,
unauthorized Admin routes and revoked/expired sessions; successful versioned acceptance persists.

### Stage 3 - Public requests and authorized R2 documents

Validate all required public form data; persist unique tracking/status/timestamps and separate
AED 0 / AED 100 selection; create site-visit record where selected. Avoid claiming payment or
appointment scheduled before it is processed. Persist attachments in private R2 and metadata D1.
Validate actual bytes, size, file type, ownership and parent entity. Anonymous upload access needs
an unguessable request-scoped capability, not arbitrary publicQuoteId access. Add cleanup/recovery
for failures spanning D1 and R2. Enforce document role/tenant/category/award policy server-side.
Use authenticated fetch-to-blob or equivalent secure viewer access; don't expose bearer tokens
in URL query strings or public bucket URLs. Support real Admin open/inspect/download.
Exit: Worker + actual local D1/R2 persistence and retrieval tests, foreign-document denial,
unsupported/oversize file denial and public request visible in genuine Admin queue.

### Stage 4 - Contractor and RFQ lifecycle

Finish company/license handling, draft create/edit/submit, BoQ storage, uploads, ownership and
valid state transitions. Connect the existing Contractor page and return stable camelCase DTOs.
Admin review/publish requires correct role, state and audit record. All IDs are resolved against
session-owned organization. Exit: two-Contractor tenant-isolation tests and persisted RFQ/BoQ flow.

### Stage 5 - Vendor and quotations

Implement Worker discovery by verified Vendor category/permission and accepted Terms. Connect
existing VendorPage to APIs only after routes work. Deadline/closure checks use server time.
Validate every line refers to the RFQ's BoQ; calculate line/quote totals server-side with defined
money rounding; reject foreign BoQ IDs, duplicate items and invalid rates. Persist all commercial
fields and allow only permitted quotation modifications. Own quotations only; no competitors.
Exit: matching/nonmatching categories, current Terms, deadlines, cross-vendor privacy and totals
verified via direct APIs; UI works without mockStore for Vendor procurement.

### Stage 6 - Award, identity release and Service Charge

Owning Contractor alone confirms selected valid quotation. Recheck Vendor eligibility/Terms,
RFQ state and quote validity. Use atomic D1 operations with concurrency guards; one award per RFQ.
Associate award/charge with Vendor accepted Terms record/version and server-calculated amount.
Use max(award value * 0.025, 500); optional public site visit is a separate AED 100 selection.
Do not import the older manpower rule from seeds or historical project memory.
Construct allowlisted API DTOs rather than spread-and-delete masking. Cover snake_case, nested
fields, arbitrary notes/attachments and storage metadata that could reveal protected identities.
Define review/redaction for identifying document content; deleting JSON keys does not sanitize PDFs.
Only winning parties receive permitted contact fields; losing Vendors stay masked.
Persist award, charge and identity-release audit records together; no fictional contact defaults.
Exit: wrong-owner/direct bypass/concurrent award tests, financial calculations, pre-award JSON
and document privacy, winning contact release and losing-Vendor masking.

### Stage 7 - Genuine Admin, frontend mock removal and full evidence

Connect AdminPage to authenticated real queues/profiles/Terms/RFQs/documents/quotes/awards/charges/
account statuses/audit, with no fake counters or approval buttons. Replace App/Header mock role
switches with navigation/session state. Complete document viewer real blob behavior.
Keep mockStore only as an explicit test fixture if useful; no production application dependency.
Remove prefilled passwords and misleading success toasts/test status badges. Model unavailable
email truthfully; no sent/Zoho success without actual provider confirmation. Do not send messages
or invitations without the user's explicit authorization. Email setup must not trigger production
changes or block completing unrelated procurement code.
Run the complete handoff test list with actual local Worker+D1+R2 and browser workflows; then,
only when independently authorized/provisioned, verify on isolated Advanced Cloudflare resources.
Clean disposable test data in that environment only. Record exact commands and outcomes.
Exit: all handoff requirements demonstrated, no remaining runtime mocks, all checks pass.
No production deploy follows from passing this stage.

## Every remaining mock / simulation dependency located

- src/data/mockStore.ts: seeded users/profiles/RFQs/quotes/awards/public requests/audits,
  simulated auth/role changes/Terms, localStorage persistence, approval/invitation simulation.
- src/App.tsx: automatically calls setActiveUser on navigation and role switching.
- src/components/Header.tsx: role-switch calls to mockStore.
- src/pages/VendorPage.tsx: all mockStore auth/registration/Terms/discovery/quotation/award/contact data.
- src/pages/AdminPage.tsx: all mockStore collections and mutations, simulated invitation success.
- src/components/DocumentViewerModal.tsx: illustrative file previews and unverified integrity/download labels.
- src/pages/TestSuitePage.tsx: declarative evidence/status claims, not genuine integration output.
- src/pages/DocsViewerPage.tsx and urbanprocures advanced/docs: aspirational architecture claims and
  legacy schema/deployment descriptions; update after corresponding implementation evidence exists.
- database/seeds.sql and bundled urbanprocures_d1.sqlite: demo data, not live Cloudflare data.
- database/d1Database.ts: local SQLite wrapper and automatic seeding, not a Cloudflare D1 binding.
- workers/r2Storage.ts: filesystem bucket and synthetic seeded PDF/XLSX/DWG contents.
- workers/r2Service.ts: simulated signatures, not cryptographically authenticated access.
- workers/emailService.ts: console output reported as successful Zoho delivery.
- workers/invitationService.ts: synthesized tokens and production-domain invite URL.
- src/services/api.ts: localStorage bearer token is client session storage, not fake persistence by
  itself; choose session protection deliberately during authentication migration.
- GetAQuotePage/ContractorPage FileReader: encoding upload payloads is not inherently mocked;
  permanent D1/R2 storage must be verified separately. Do not remove FileReader merely by keyword.

## Test evidence for this checkpoint

Node v24.19.0, no downloaded project dependencies required for these checks:
- node scripts/check-repository.mjs: PASS, only authorized origin fetch/push URLs.
- node scripts/check-isolation.mjs: PASS.
- node scripts/check-isolation.mjs --remote: EXPECTED REJECTION, placeholder D1 ID.
- node scripts/test-continuation.mjs: PASS, 20 boundary checks + 20 supplied business unit checks.
  Worker boundary checks use explicit D1/R2 doubles; 0 genuine Cloudflare integration tests run.
- SQLite baseline schema-vs-migrations comparison: executed, mismatch confirmed; not fixed.
- npm run build: BLOCKED (vite executable absent; dependencies not installed).
- npm run lint: BLOCKED (tsc executable absent; dependencies not installed).
- Browser E2E: NOT RUN. Cloudflare resources: NOT CREATED/CHANGED. Email: NOT SENT.

These tests verify the new safeguards and retained pure helpers only. They do not certify
registration, clickwrap, R2 uploads, real masking, awards or production readiness.

## Progress report contract

After each implementation stage report concrete changes, relevant tests and blockers.
Update CONTINUATION_CHECKPOINT.json, including file-level work and remaining mocks.
Only at actual Phase-2 completion provide the full A-V report from the user's handoff:
frontend; created/modified files; remaining mocks; APIs; D1; R2; authentication; authorization;
clickwrap; public requests; Contractor; Vendor; Admin; documents; masking; award/release;
Service Charge; audit; tests; Cloudflare configuration; remaining work.
Explicitly report production Pages/Workers/D1/R2/DNS and urbanprocures.com/www deployment
status individually; all must remain NO throughout this authorized continuation.

## Takeover checkpoint update (2026-10-05 Asia/Dubai)

The original audit table above describes the uploaded BASELINE, not the latest implemented fixes.
After user approval, continued Stage 1 locally:
- Added database/migrations/0001_canonical_schema.sql and 0002_terms_evidence.sql;
  wrangler now selects this folder instead of the old incompatible migrations folder.
- Added database/upgrades/from_legacy_migrations.sql; tested legacy ID/history preservation.
  Missing legacy salts are not invented: hashes retained, previously active unsalted accounts
  become pending until explicit password recovery is implemented.
- Fresh schema has 22 tables, pending default Vendor verification and no seeded accounts/Terms.
- Terms evidence/schema groundwork includes published-version matching and immutable history.
  No legal Terms published and no clickwrap/API feature is claimed complete.
- Uploaded SQLite file remains byte-for-byte untouched; tested its upgrade on an in-memory copy.
- Installed dependencies and retained package-lock.json. Fixed verified Vite/esbuild peer conflict
  using esbuild ^0.28.2; added wrangler 4.147.0 and Workers types 5.20261004.1 from registry metadata.
- Added worker:dev, db:migrate:local and test:database scripts. dev now uses Vite with /api proxy
  to localhost:8787; dev:legacy preserves original Express preview. Original start remains legacy.
- 65 offline SQLite checks PASS; frontend build PASS. Typecheck currently FAILS with eight errors:
  ContractorPage undefined quotes; api.ts response unknown (three errors); d1Database changes
  number|bigint mismatch; authHelper hex toString typings (three errors from global type overlap).
- Actual Wrangler/Cloudflare D1/R2 runtime has NOT been started/tested. Browser E2E NOT RUN.
- GitHub create_branch also returned 403 Resource not accessible by integration after approval.
  Local commits and cumulative patch exist; remote main/branches/files have NOT changed.

NEXT: resolve the eight typecheck errors with proper separate Worker/Node typing boundaries,
then npm run lint/build and test suites; start the actual local Worker and apply canonical
migrations ONLY to its new empty local DB; test persistence and R2. Continue Stages 2-7 afterward.
Do not repeat the already-passing offline database audit absent a new change/regression.

For a fresh Codex session, attach the NEW cumulative takeover patch plus original ZIP and PDF.
The earlier isolation-only patch does NOT contain these later schema/runtime changes. Apply the
new patch once to the exact verified baseline; never apply both patches sequentially. If the
repository has advanced, inspect changes and port only missing edits without overwriting work.

References used: Cloudflare D1 migrations and Wrangler local development configuration:
https://developers.cloudflare.com/d1/reference/migrations/
https://developers.cloudflare.com/workers/wrangler/configuration/

## Final owner clickwrap/commercial handoff implementation (2026-10-05 Asia/Dubai)

The latest owner handoff is preserved in terms/owner-final-clickwrap-handoff-2026.1.txt.
It supersedes earlier commercial instructions: Contractor AED 0, standard Vendor max(2.5%, AED 500),
and separate manpower AED 1 per approved unit. The actual unit remains undefined; do not invent it.
Read TERMS_IMPLEMENTATION_REPORT.md and the checkpoint for current results: role/public Terms
2026.1 published only in local isolated D1, genuine clickwrap/server gates/Admin evidence and
award linkage implemented, API and browser tests passing. Vendor runtime no longer uses mockStore.
Earlier audit entries describe the baseline and must not be read as current completion status.
Existing production remains untouched. Whole platform launch, broader Admin flows and document
redaction/auth hardening remain incomplete. No Phase-2 or live-site completion is claimed.

## Master handoff continuation
Latest scope and verified results are in PRODUCTION_READINESS.md and CONTINUATION_CHECKPOINT.json. Earlier undefined-manpower and production-authorization statements are superseded by MASTER_HANDOFF.txt. Existing production remains unchanged pending deployed staging gates.
