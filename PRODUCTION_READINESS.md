# Production readiness — 2026-10-05 (Asia/Dubai)

**NOT READY FOR BLANKET PRODUCTION ACCEPTANCE**

Master handoff authorizes production only after all mandatory actual deployed staging gates and rollback/data-safety checks pass. The independent Advanced staging Worker, D1 and private R2 are created and deployed; all eight canonical migrations applied. Existing production resources and domains remain unchanged. No Git push or outbound email occurred.

Local implementation now includes RFQ creation/draft editing/BoQ/private R2 attachments, Admin publication with explicit identity review, Vendor and Contractor license verification, real queues/accounts/quotations/awards/charges/audit inspection, document ownership and reviewed release, quotation submission/amendments, immutable Terms gates and award linkage, concurrent award protection, HttpOnly strict cookies, CSRF origin checks, login throttling and single-use password recovery.

Vendor Terms 2026.2 clarifies the owner-confirmed AED 1/person/hour rule while preserving immutable 2026.1 history. Contractor/public Terms remain 2026.1. Standard Vendor charge max(2.5%, AED 500); Contractor AED 0; manpower persons × hours/day × days × AED 1 without standard double charging.

Passed: frozen npm installation, type checks, frontend build, Worker dry-run build; 96 Terms/commercial, 85 operations, 23 auth local workerd/D1/R2 checks; 45 Chromium checks including click-driven procurement; 88 offline migration/history checks; 20 boundary + 20 pure business checks. Retained local migrations 0001–0008 and exact Terms hashes verified. These are local tests, not deployed staging evidence.

Deployed staging evidence: `deployment/staging-qa-results.json` records 137 passing checks on real HTTPS Worker/D1/R2: browser role clickwrap, approved Terms hashes, permission denials, private document bytes, publication, quotations, masking, concurrent single-winner award, both standard charge examples and manpower 1/80/600, immutable evidence and persistent charges. `deployment/staging-browser-results.json` records the separate click-driven procurement flow, actual Admin image rendering/download, award and persisted contact/charge inspection. TLS verification remained enabled; Chromium required access to its NSS certificate store and the existing cloud proxy CA.

Zoho now uses server-side OAuth refresh authentication, with expiring token cache, concurrent refresh deduplication, one retry after provider 401, fixed regional endpoints, bounded requests and generic errors. No manually stored access token is used. The 85 OAuth contract checks use an explicit HTTP test double; they do not prove real provider authentication or delivery.

Remaining gates:
- Secure `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` values are available in the reopened runtime and bound to the isolated staging Worker. UAE Accounts origin is `https://accounts.zoho.ae`; Mail origin `https://mail.zoho.ae`, account `6991914000000008002`, sender `urbanprocures@urbanprocures.com`. Staging binding is completed. Direct UAE token refresh returned HTTP 400 with HTML; the deployed Admin-only authentication probe returns 503. The issuing Zoho Accounts region/grant needs confirmation. No credentials or access tokens are returned by the probe. Live provider authentication/delivery remain unverified; procurement/award notification delivery still requires implementation and provider validation. No outbound messages are currently authorized.
- Owner Admin email is `urbanprocures@urbanprocures.com`; Owner Admin is now bootstrapped only in staging and actual password login verified. Staging QA used isolated temporary accounts and actual credential login. No default production login exists. Support/Desk address is `desk@urbanprocures.com`.
- Additional mandatory staging acceptance/security gates, backup/rollback validation, production deployment, both live-domain workflows and QA cleanup remain pending. Existing production is read-only. No production resource may be reused, cloned, migrated, rebound or attached to Advanced staging. Production runtime isolation remains locked.

Current branch: work. Baseline `c7004f30603f20d363697c034cddabf44c1d0bee`; first staging source commit `c569212c0082f700fc554d0147c15b6af1cb537f`. Local commits do not prove a GitHub push or production deployment.
