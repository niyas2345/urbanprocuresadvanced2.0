# Urban Procures Advanced: mandatory continuation instructions

## Authorized scope

Work ONLY in `niyas2345/urbanprocuresadvanced2.0`.
Check both fetch and push URLs using `node scripts/check-repository.mjs` before Git writes.
Never inspect, edit, commit, push, or copy files from another repository.
The original uploaded ZIP is a byte-verified snapshot of commit
`c7004f30603f20d363697c034cddabf44c1d0bee` in this repository.

The user wants to continue the interrupted Google AI Studio Phase-2 work in Work Mode.
Read `WORK_MODE_EXECUTION.md` and `CONTINUATION_CHECKPOINT.json` before implementation.
Continue current files incrementally; do not regenerate, roll back, clone the old production
application, or repeat work already verified. The approved logo, colors, typography,
homepage and Get a Quote / Contractor / Vendor visual structure are locked.

## Production boundary

The master owner handoff authorizes production deployment and domain cutover ONLY after
all mandatory actual deployed staging gates pass and rollback/data-safety checks complete.
Until those gates pass, existing production resources and domains must remain unchanged.
Only new, independently verified Advanced resources may eventually be provisioned.
Run `node scripts/check-isolation.mjs` before infrastructure actions. For future remote
operations also run `node scripts/check-isolation.mjs --remote`; current placeholders
must fail that check. These checks are safeguards, not proof of remote resource identity.
The original migrations/ folder remains legacy and incompatible. The active database/migrations/
folder is now canonical for EMPTY Advanced databases; existing snapshots require the documented
preflight/upgrade path. Do not apply migration 0001 to a populated database.

## Authoritative requirements

Cloudflare Workers, D1, and private R2 are the only primary backend.
KV/Queues only if needed by implemented functionality. No Supabase or Firebase.
Public Get a Quote requires no account; ordinary submission AED 0; optional site visit AED 100.
Both Contractor and Vendor must explicitly accept the applicable versioned Terms via an
initially unchecked checkbox. Enforce acceptance on the server, including procurement access.
Vendor Terms must cover Service Charge: max(2.5% of award value, AED 500).
Use the term Service Charge. Contractor / Client Service Charge is AED 0.
The final owner clickwrap handoff supersedes earlier commercial guidance: manpower is a separate
Vendor-side AED 1 per person-hour obligation, confirmed by the master handoff.
Calculate persons × hours per person per day × days, persist all operands and total person-hours. Never automatically combine both formulas.
Preserve historical acceptance evidence and link awards to the Vendor's accepted version.
No account may be marked verified or Terms-accepted automatically.
Only the owning authorized Contractor confirms an award. Admin review does not authorize
Admin to award on a Contractor's behalf.
Protected identities remain masked in API responses until valid award, released only to
winning parties; losing Vendors remain masked. No cross-vendor quotation access.
Use server-side ownership checks, financial calculations, workflow transitions and audit records.
Admin must genuinely open and download authorized uploaded files; document counts are insufficient.

## Evidence and execution

Do not mistake Express/local SQLite/filesystem wrappers for deployed Cloudflare bindings.
Preserve useful algorithms; migrate working local routes to the real Worker with async D1/R2.
Replace mock behavior only after a real equivalent exists and its integration tests pass.
Never certify a feature from a file's existence, a UI test badge, seeded data or a simulated email.
Run appropriate negative API tests and full genuine workflows before claiming completion.
No outbound messages or invitations are authorized in this continuation.
Keep credentials out of Git and reports. Use separate test fixtures, not public default accounts.
Update the checkpoint after each completed stage. If interrupted, include last task,
partial file, completed/remaining files, passed/failed tests, remaining mocks, exact next
command/action, and production-resource status. Do not call Phase-2 complete until all
handoff requirements are implemented and genuine tests pass.

Owner after-publish handoff authorizes new isolated staging provision/deploy. For provisioning only, use check-isolation.mjs --remote --provision --config with the audited staging file and verify resource-name absence in the authenticated account before creation. Deploy/migrate requires --remote without --provision and actual independently verified D1 ID. Original local configuration remains protected.
