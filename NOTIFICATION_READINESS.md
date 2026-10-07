# Notification readiness — 2026-10-07

## Current verified checkpoint

Latest staging version: `977e0867-9f77-4761-9dc6-a27e3b53acc4`.
The deployed Worker OAuth health check and owner-only send both passed;
Zoho accepted the Worker message. Owner confirmed receipt of the earlier
cloud-runtime message; receipt of the subsequent Worker message is not asserted.
Chromium certificate trust is working with TLS verification enabled.
All 137 deployed API checks and 14 click-driven browser checks passed on this version.

Migration 0010 adds Admin registration/RFQ-review notifications. The five-minute
outbox drain is deployed, but remains inert with `EMAIL_DELIVERY_ENABLED=false`.
Local operations/database checks pass (98/93). Controlled deployed workflow
dispatch and reconciliation remain acceptance work before automatic activation.

Staging code rollback and return to the latest version passed genuine HTTPS,
owner login and outbox checks. D1 backup restored locally with integrity `ok`;
ten R2 snapshot objects matched their stored sizes and hashes. The separate
remote recovery drill is in progress. Backup files are private, outside Git.
Production remains unchanged. The notes below describe earlier checkpoints
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
