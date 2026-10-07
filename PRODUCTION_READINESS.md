# Production readiness — 2026-10-05 (Asia/Dubai)

**NOT READY FOR BLANKET PRODUCTION ACCEPTANCE**

Production OAuth binding gate is resolved: all three secrets verified active,
health HTTP 200/authenticated true, 24 preview checks pass. Persistent logs and
traces are enabled on version `4ea934fe-9f2f-42cd-a397-67e464a62c4c`.
Full production workflow and live-domain acceptance remain pending; older
missing-secret statements are historical.

Current checkpoint (7 October 2026): release source `4ec462f` is pinned on both
Workers. Staging passed 137 API and 14 click-driven browser checks; real outbox
provider acceptance and owner inbox receipt passed. Remote recovery matched
29 full table contents, 77 schema/index/trigger definitions and ten R2 objects.
Seventeen QA logins are suspended, their sessions revoked and fixture notices
suppressed. Immutable regression evidence remains only in private staging.

The new independent production preview passed 24 HTTPS/auth/Terms/empty-data
checks. Its ten migrations and approved owner Admin are verified, with no staging
QA data copied. Production OAuth bindings are still missing on this NEW Worker.
Existing production and both live domains are unchanged. The exact remaining
secure-binding action and cutover sequence are in PRODUCTION_CUTOVER_PLAN.md.
Older checkpoint entries below are historical.

Latest continuation: actual staging OAuth authentication is confirmed by the owner's
browser screenshot (HTTP 200/authenticated true/no email). Notification outbox and
owner-only test endpoint are now deployed to staging, migration 0009 applied;
automatic sending remains disabled. See NOTIFICATION_READINESS.md and
deployment/staging-notification-deployment-20261007.json for current evidence,
backup checks and remaining delivery/rollback limitations. Earlier grant-error
descriptions below are historical and no longer the current authentication blocker.

2026-10-07 continuation: published runtime revision 15 is attached. Credential readiness
metadata remains unknown. The environment-to-Worker secret upload helper is now disabled:
proxy-backed environment values are not raw secrets and must not be persisted into Worker
bindings. Configure actual OAuth credentials directly in the existing staging Worker's
encrypted secret settings. Previous runtime `invalid_code` and staging
`invalid_client_secret` are distinct, historical results, not proof of current credentials
or a new live test. Owner Admin staging login was already verified; no password is missing.
The 90 OAuth contract and 13 native workerd checks passed again using provider HTTP doubles;
they do not establish live mail readiness. No Mac-control tools are exposed in this task.
Production remains untouched.

Master handoff authorizes production only after all mandatory actual deployed staging gates and rollback/data-safety checks pass. The independent Advanced staging Worker, D1 and private R2 are created and deployed; all eight canonical migrations applied. Existing production resources and domains remain unchanged. No Git push or outbound email occurred.

Local implementation now includes RFQ creation/draft editing/BoQ/private R2 attachments, Admin publication with explicit identity review, Vendor and Contractor license verification, real queues/accounts/quotations/awards/charges/audit inspection, document ownership and reviewed release, quotation submission/amendments, immutable Terms gates and award linkage, concurrent award protection, HttpOnly strict cookies, CSRF origin checks, login throttling and single-use password recovery.

Vendor Terms 2026.2 clarifies the owner-confirmed AED 1/person/hour rule while preserving immutable 2026.1 history. Contractor/public Terms remain 2026.1. Standard Vendor charge max(2.5%, AED 500); Contractor AED 0; manpower persons × hours/day × days × AED 1 without standard double charging.

Passed: frozen npm installation, type checks, frontend build, Worker dry-run build; 96 Terms/commercial, 85 operations, 23 auth local workerd/D1/R2 checks; 45 Chromium checks including click-driven procurement; 88 offline migration/history checks; 20 boundary + 20 pure business checks. Retained local migrations 0001–0008 and exact Terms hashes verified. These are local tests, not deployed staging evidence.

Deployed staging evidence: `deployment/staging-qa-results.json` records 137 passing checks on real HTTPS Worker/D1/R2: browser role clickwrap, approved Terms hashes, permission denials, private document bytes, publication, quotations, masking, concurrent single-winner award, both standard charge examples and manpower 1/80/600, immutable evidence and persistent charges. `deployment/staging-browser-results.json` records the separate click-driven procurement flow, actual Admin image rendering/download, award and persisted contact/charge inspection. TLS verification remained enabled; Chromium required access to its NSS certificate store and the existing cloud proxy CA.

Zoho now uses server-side OAuth refresh authentication, with expiring token cache, concurrent refresh deduplication, one retry after provider 401, fixed regional endpoints, bounded requests and generic errors. No manually stored access token is used. The 90 OAuth contract checks use an explicit HTTP test double; 13 native workerd checks validate Request compatibility and redirect refusal with provider HTTP doubles. These checks they do not prove real provider authentication or delivery.

Remaining gates:
- Secure `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` values are available in the reopened runtime and bound to the isolated staging Worker. Owner-confirmed OAuth issuer is `https://accounts.zoho.com`; Mail origin `https://mail.zoho.ae`, account `6991914000000008002`, sender `urbanprocures@urbanprocures.com`. Staging binding is completed. The runtime incompatibility with redirect:error was fixed using manual redirects and tested in native workerd. Real refresh against the confirmed issuer now returns invalid_client_secret; the Admin-only authentication probe returns 503. Correct ZOHO_CLIENT_SECRET must match the existing ZOHO_CLIENT_ID. No credentials or access tokens are returned by the probe. Live provider authentication/delivery remain unverified; procurement/award notification delivery still requires implementation and provider validation. No outbound messages are currently authorized.
- Owner Admin email is `urbanprocures@urbanprocures.com`; Owner Admin is now bootstrapped only in staging and actual password login verified. Staging QA used isolated temporary accounts and actual credential login. No default production login exists. Support/Desk address is `desk@urbanprocures.com`.
- Additional mandatory staging acceptance/security gates, backup/rollback validation, production deployment, both live-domain workflows and QA cleanup remain pending. Existing production is read-only. No production resource may be reused, cloned, migrated, rebound or attached to Advanced staging. Production runtime isolation remains locked.

Current branch: work. Baseline `c7004f30603f20d363697c034cddabf44c1d0bee`; first staging source commit `c569212c0082f700fc554d0147c15b6af1cb537f`. Local commits do not prove a GitHub push or production deployment.
# Current staging evidence — 2026-10-07

Staging version `977e0867-9f77-4761-9dc6-a27e3b53acc4` passed 137 deployed
API checks and 14 click-driven browser checks. Actual deployed OAuth and
owner-only mail provider acceptance passed. Migration 0010 adds Admin review
notifications; automatic delivery remains disabled. Admin document labels now
show byte sizes accurately and distinguish account documents from public quotes.

Code rollback and restoration passed. D1 local restore and ten R2 backup hashes
passed; remote recovery verification is in progress in separate resources.
Remaining: controlled workflow-mail verification/activation, QA cleanup,
production resource/configuration review, domain cutover and live acceptance.
Production is unchanged and is not certified ready. Earlier status entries below
are historical and superseded where they conflict with these results.
