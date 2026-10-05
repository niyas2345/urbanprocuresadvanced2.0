# Final clickwrap/commercial handoff report

2026-10-05 — Asia/Dubai. Implemented and verified in isolated local Cloudflare development/testing resources. Production was not changed. The approved homepage, assets and global styling remain unchanged.

| Item | Outcome and evidence |
| --- | --- |
| A. Terms files created | Three versioned Terms documents, preserved owner handoff, Worker `terms.ts`, `award.ts`, `procurement.ts`, `publicQuote.ts`, `TermsClickwrap.tsx`, `AdminTermsPanel.tsx`, migrations 0003/0004 and dedicated API/browser test scripts. Full paths below. |
| B. Terms files modified | Existing Worker auth/router/charge/authorization services; Vendor, Contractor, Get a Quote, Admin and documentation views; API client; schema reference; database/auth tests; package manifest/lockfile; continuation guidance/checkpoint. |
| C. Database migrations | `0003_clickwrap_commercial.sql` extends existing role Terms/evidence and adds public request consent, approved manpower configuration and award charge metadata. `0004_publish_terms_2026_1.sql` explicitly publishes owner-supplied content. Both applied to the isolated local D1 database; repeat migration reports no pending migrations. Legacy/snapshot history preservation and schema parity pass. |
| D. Vendor Terms 2026.1 | Published locally with all 19 provisions and deterministic SHA-256. Actual Worker-served content equals the saved document byte-for-byte. No remote publication. |
| E. Contractor Terms 2026.1 | Published locally with all 17 provisions, including explicit Contractor/Client AED 0 and Vendor-side obligations. Actual content/hash verified. No remote publication. |
| F. Vendor clickwrap | Full Terms viewer; unchecked by default and reset when returning to registration; completion disabled until affirmative acceptance. Real Worker session and D1 evidence replace mocked Vendor acceptance/registration. Browser tested. New Vendor verification stays pending. |
| G. Contractor clickwrap | Full viewer and unchecked control immediately before `ACCEPT TERMS & COMPLETE REGISTRATION`; server-side acceptance persists. Browser tested. Contractor verification is not automatically granted. |
| H. Server-side gate | All `/api/vendor/` and `/api/contractor/` routes pass authenticated active role/organization/current acceptance checks before procurement handlers. Missing acceptance returns `TERMS_ACCEPTANCE_REQUIRED`; obsolete mandatory acceptance returns `REACCEPTANCE_REQUIRED`. Wrong user/org/role, forged/unpublished IDs and suspended/revoked/expired sessions are rejected. |
| I. Versioning/re-acceptance | `ACTIVE` / `REACCEPTANCE_REQUIRED` status; mandatory updates block participation until explicit new acceptance. Nonmandatory updates can retain previously valid acceptance. Historical versions and acceptance evidence remain immutable. Tests cover both update policies. |
| J. Hashing | SHA-256 over exact UTF-8 published content; acceptance records copy the server-selected hash/version. Database guards require matching published content/version and preserve historical evidence. Tests verify source, publication and served content. |
| K. Standard Vendor charge | Worker validates BoQ rates and calculates quotation totals. Award uses persisted data, ignores browser charge overrides and calculates `max(award_value * 0.025, 500)`: AED 10,000 → AED 500; AED 100,000 → AED 2,500. |
| L. Contractor AED 0 | Explicit server result, database constraint, Terms wording and UI explanation. Vendor charges and public site visit fees are not assigned to the Contractor. |
| M. Manpower | Separate persisted classification, approved quantity/unit configuration, AED 1 rate and award trace. Standard and manpower formulas are not automatically combined. **BUSINESS RULE CONFIRMATION REQUIRED:** existing code only names `aed_1_rule`; it defines no unit. Real configuration remains unset and manpower awards are blocked. A disposable test-only approved unit demonstrates quantity 20 → AED 20, standard charge AED 0, Contractor charge AED 0. |
| N. Award/Terms traceability | Award saves Vendor acceptance ID/version, type, applicable rule, calculated amount/time and manpower data where applicable. Atomic D1 operations enforce ownership, eligibility, current Terms, source-value checks and one award/charge under concurrent attempts. Only the selected winning quotation receives permitted party contact fields; losing Vendors remain masked. |
| O. Admin visibility | Authenticated active Admin panel reads actual D1 evidence and exact accepted content/hash/audit reference. Organization and public consent views support pagination. No action creates another party's acceptance. Vendor access to evidence is denied. API and browser inspection tested. |
| P. Audit | Persistent Vendor/Contractor Terms viewed/accepted, re-acceptance-required and public-consent events; acceptance audit reference links exact evidence to its event. Award/charge event links the accepted Vendor obligation. No outbound messages were sent. |
| Q. Tests | Type checks and production frontend build pass. Final counts: 86 real Worker/D1/R2 Terms/commercial checks; 23 real local auth checks; 32 Chromium browser checks; 74 offline database/history checks; 20 boundary checks; 20 supplied business-rule checks. Frozen dependency setup and local migrations are repeatable. No remote Cloudflare or live-site tests were run. |
| R. Remaining gaps | Confirm the approved manpower unit. This completes the implemented Terms/commercial scope subject to that detail, not the entire Advanced launch: Contractor RFQ creation/editing/review APIs, broader Admin mock removal, document redaction/tenant workflows, authentication abuse controls and full platform production validation remain. The legacy Express server is not the compliant Cloudflare backend and must not be deployed as one. |
| S. Configurable legal wording | Governing-law/dispute wording remains pending owner approval; no jurisdiction was invented. A future legal/content change requires a new published immutable version with its own hash and re-acceptance policy. |
| T. Production touched | **NO.** urbanprocures.com, www, production Pages, Workers, D1, R2, KV, Queues, DNS, secrets and data were not modified. No deployment, remote migration, Git push, email or invitation was performed. |

Created files for this handoff:

- `urbanprocures advanced/terms/vendor-2026.1.md`
- `urbanprocures advanced/terms/contractor-2026.1.md`
- `urbanprocures advanced/terms/get-a-quote-2026.1.md`
- `urbanprocures advanced/terms/owner-final-clickwrap-handoff-2026.1.txt`
- `urbanprocures advanced/database/migrations/0003_clickwrap_commercial.sql`
- `urbanprocures advanced/database/migrations/0004_publish_terms_2026_1.sql`
- `urbanprocures advanced/workers/terms.ts`
- `urbanprocures advanced/workers/award.ts`
- `urbanprocures advanced/workers/procurement.ts`
- `urbanprocures advanced/workers/publicQuote.ts`
- `src/components/TermsClickwrap.tsx`
- `src/components/AdminTermsPanel.tsx`
- `scripts/local-worker-test.mjs`
- `scripts/test-terms.mjs`
- `scripts/test-terms-ui.mjs`
- This report.

The existing role-specific `terms_versions` and `terms_acceptance_evidence` models were reused. Separate public models are necessary because the existing role model requires an authenticated Contractor/Vendor and organization, whereas Get a Quote requires no account. Publication attribution uses a pending, non-login owner principal with no usable credentials; it is not a default enabled participant or Admin account and creates no acceptance evidence.

Validation commands, all executed:

```bash
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run lint
npm run build
npm run test:continuation
npm run test:database
npm run test:worker-auth
npm run test:terms
npm run test:terms-ui
XDG_CONFIG_HOME=/workspace/.config WRANGLER_SEND_METRICS=false npm run db:migrate:local
```

Browser tests use installed Chromium with `playwright-core`; `CHROMIUM_EXECUTABLE_PATH` can select another installed Chromium executable. API/browser tests create disposable local D1/R2 fixtures, including synthetic future Terms versions and the test-only manpower unit. They do not publish those fixtures to retained development or production resources. The retained local Worker publishes only the supplied 2026.1 documents.
