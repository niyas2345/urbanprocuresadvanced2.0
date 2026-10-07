# Notification readiness — 2026-10-07

## Current live checkpoint

Advanced production mail is enabled. Actual OAuth health passes on both live
domains; the owner confirmed the production password-reset email arrived in the
inbox. Staging outbox provider acceptance/inbox delivery passed previously.
Registration, procurement and award events use the real D1 outbox and server-side
refresh-token OAuth. No browser OAuth credentials or manually maintained access
token are used. Five-minute processing, failure states and persisted logs are on.
The temporary production test outbox records were deleted before mail activation.

## Historical checkpoints (superseded)

Production OAuth is now verified: all three encrypted bindings are active and
the deployed health check returned HTTP 200/authenticated true. Version
`4ea934fe-9f2f-42cd-a397-67e464a62c4c` has persistent logs and traces enabled.
The 24 preview checks passed again. Automatic sending remains disabled pending
full production acceptance. Earlier missing-binding statements below are resolved.

Release source: `4ec462f`; current staging version:
`1783f55d-cc96-4869-827d-f3e7488da9f2`. Its source passed 137 deployed API
checks and 14 click-driven browser checks before the final metadata-only redeploy.
The actual deployed outbox owner-only send passed, and the owner confirmed inbox
receipt. Chromium certificate trust works with TLS verification enabled.

Migration 0010 adds Admin registration/RFQ-review notifications. The five-minute
outbox drain is deployed, but remains inert with `EMAIL_DELIVERY_ENABLED=false`.
Local operations/database checks pass (98/93); notification dispatch checks pass
(17, explicit provider double). Controlled real outbox dispatch passed four checks.
Ambiguous failures still require reconciliation before any manual retry.

Staging code rollback and return to the latest version passed genuine HTTPS,
owner login and outbox checks. D1 backup restored locally with integrity `ok`;
ten R2 snapshot objects matched their stored sizes and hashes. The separate
remote recovery drill passed: 29 full table contents, 77 schema/index/trigger
definitions and ten restored R2 byte sequences matched. Backup files are private,
outside Git. Seventeen QA accounts are suspended, their sessions revoked and
fixture notices suppressed; immutable evidence remains in private staging only.

The separate new production preview passed 24 HTTPS/auth/Terms/empty-data checks.
It is missing ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN bindings.
Existing production and both live domains remain unchanged. The notes below describe earlier checkpoints
and are superseded by these current results.

Deployed staging version: df675a6d-4281-4646-8038-236c1bccfb02.
Mail region was diagnosed with read-only checks and an authorized owner-only
send using the runtime credentials. mail.zoho.com accepted the send (HTTP 200,
Mail status 200); owner confirmed inbox receipt. Staging Mail origin is now
mail.zoho.com. This test ran from the cloud runtime, not the deployed Worker.
Automatic delivery remains disabled; Worker workflow delivery still needs testing.
Chromium trust setup for the current proxy CA is blocked by ungranted filesystem
permission. HTTPS verification must remain enabled.
Owner reported the initial delivery test failed with HTTP 503
EMAIL_DELIVERY_UNAVAILABLE. Safe diagnostic fields (phase, HTTP status,
whitelisted code and numeric Mail status) are now deployed; raw response
bodies never enter API responses. Twenty diagnostic contract checks pass.
No subsequent live delivery test has been run by this task.
Migration 0009 creates a transactional email outbox for new registration,
publication to matching verified Vendors, quotation submission to the owning
Contractor, and award confirmation to the Contractor and winning Vendor only.
Templates contain no pre-award counterparty identities or uploaded document content.
No existing records generate historical email.

Automatic sending is disabled (`EMAIL_DELIVERY_ENABLED=false`). Owner-only test
delivery was explicitly authorized in chat. The staging-only Admin test endpoint
requires the approved owner account and confirmation, accepts no caller-specified
recipient/content, and permits one attempt per hour. Provider acceptance is not
inbox-delivery evidence.

Delivery claims are atomic. QA `.invalid` recipients and inactive accounts are
suppressed. Ambiguous failures remain `review_required`; interrupted `sending`
records require reconciliation, never blind automatic retries. Pending batches
are bounded to ten and dispatched on successful mutations only when enabled.
Periodic draining/reconciliation, Admin notifications, live mail/sender validation
and production activation remain launch work; the implementation is not a claim
of end-to-end notification completion.

Staging D1 backup was restored into local SQLite and migration preservation
verified. Remote row counts are unchanged. This is not a remote restore drill,
an R2 backup, or completed production rollback verification. Backup is restricted
to mode 0600 at the path recorded in the deployment report, outside Git.

Actual local workerd/D1 checks passed; provider send tests use an explicit double.
Owner browser screenshot verified actual deployed OAuth authentication before this
update. This task's staging URL access still returns HTTP 403, so new deployed
endpoint and live delivery verification require the owner's browser or restored
authorized network access. Production remains untouched.
