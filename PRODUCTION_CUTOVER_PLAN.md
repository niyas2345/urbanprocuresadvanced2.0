# Advanced live deployment — 7 October 2026

Both urbanprocures.com and www.urbanprocures.com now route to
urbanprocures-advanced-production-20261007. DNS is proxied AAAA 100::;
there is no legacy Pages origin or fallback. Owner explicitly authorized deletion
of the old project including www.urbanprocures.app, two legacy Workers, two D1
Databases, legacy KV and all six identified old R2 buckets. Advanced staging and
recovery resources, Nick and Fixperts remain separate and preserved.

Both actual-domain acceptance reports pass after retirement. The owner updated
ADMIN_INITIAL_PASSWORD securely after resetting the account; current login is
verified. Production preview workflows and owner inbox delivery passed. Logs,
traces, scheduled outbox and automatic mail are enabled.

Release controls: preserve the exact production bindings and route definitions in
wrangler.production.toml; run the --cutover production guard before future deploys;
never deploy legacy source. Recover or fix using Advanced versions/data only.
Private offline database retirement records are outside Git and are not deployable
fallback sites. No old application remains hosted.

## Historical cutover checkpoint (superseded)

# Advanced production cutover checkpoint — 7 October 2026

The current site remains on `urbanprocures-dev.pages.dev` for both apex and www.
Its DNS record IDs, targets, proxy state and TTL are preserved in
`deployment/production-cutover-readonly-inventory-20261007.json`.
No existing production Worker, Pages project, database, bucket or domain changed.

## New, independent production preview

- Worker: `urbanprocures-advanced-production-20261007`
- D1: `urbanprocures-advanced-production-20261007-db`
- Database ID: `3412487b-954b-4f21-92d3-20d85d30dc11`
- Private R2: `urbanprocures-advanced-production-20261007-documents`
- Preview: https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev

All ten canonical migrations were applied to the new empty database. Only the
approved owner login and non-login Terms publication authority exist. No staging
account, document, RFQ, quotation or award was migrated. The preview passed 24
HTTPS, login, authorization, Terms-content/hash and empty-data checks.
Automatic mail is disabled pending production mail acceptance.

## Exact remaining credential blocker

**Resolved, 7 October 2026:** all three encrypted production bindings are active.
Production OAuth health passed HTTP 200/authenticated true after deployment
`4ea934fe-9f2f-42cd-a397-67e464a62c4c`. Persistent invocation logs and traces
are enabled at 100% sampling. The credential instructions below are historical;
do not ask the owner to configure these bindings again.

The new Worker is missing encrypted `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and
`ZOHO_REFRESH_TOKEN` bindings. Existing staging bindings are intact. Cloudflare
does not expose encrypted secret values; runtime OAuth placeholders must never
be copied to Worker secrets. Use the same valid Self Client credentials, entered
securely on this NEW Worker's Settings → Variables and Secrets, then deploy the
updated version. Do not paste values into chat or generate new credentials merely
because the production bindings are missing.

Production non-secret mail settings already match the proven staging settings:
accounts.zoho.com, mail.zoho.com, account 6991914000000008002, sender
urbanprocures@urbanprocures.com. No further region or sender change is required.

## Gates after binding activation

1. Verify the three bindings by name, production owner login and OAuth health.
2. Run controlled production-preview notification/recovery and procurement,
   document, Terms, commercial and negative-permission acceptance tests.
3. Remove temporary preview test data and confirm no customer records are removed.
4. Preserve the verified new Worker version and current DNS/Pages domain state.
5. Configure the approved live origin and attach apex/www through Cloudflare's
   supported custom-domain workflow only after preview acceptance passes.
6. Verify both HTTPS domains and launch-critical workflows against actual bindings.
7. If a critical regression occurs, restore the preserved Pages/DNS routing;
   retain all newly submitted Advanced data and audit evidence for reconciliation.

Staging code rollback, remote D1 schema/full-row-content restoration and ten R2
byte-for-byte restoration checks passed. The private recovery resources are
`urbanprocures-advanced-staging-recovery-20261007-286fcbd36f-db` and
`upa-staging-recovery-20261007-286fcbd36f-docs`; neither is attached to an app.

## Retained staging QA fixtures

Seventeen reserved `qa-…@example.invalid` accounts were suspended and their
sessions revoked. Pending fixture notices were suppressed. Their private test
documents, immutable Terms acceptance and audit/award evidence remain solely
for regression and rollback evidence, using the master's documented-fixture
exception. The approved owner account remains active. Nothing was copied into
production. See `deployment/staging-qa-quarantine-20261007.json` for exact IDs.

## Latest production acceptance results

The new preview passed 137 actual API/security checks and 14 browser procurement
checks. The owner confirmed the production password-reset email arrived in the
inbox. Four reserved QA accounts and all their business records were removed,
including six RFQs/awards/charges, five private document objects and 42 queued
test notifications. A private pre-cleanup backup is retained outside Git;
immutable Terms guards and published Terms were verified preserved.

The final clean-preview owner login returned HTTP 401. The account is active;
the audit records a successful PASSWORD_RESET at 2026-10-07T10:53:36.878Z.
The current runtime password does not match the account's current password hash.
Do not overwrite that password or expose either value. Update the secure runtime
binding to the current password, then reverify login before cutover.

The prepared cutover uses only two exact Worker routes, urbanprocures.com/* and
www.urbanprocures.com/*, preserving existing proxied DNS and the Pages project.
HTTPS redirection is already enabled. `scripts/cutover-production.py` requires
the cutover configuration/acceptance guard and unchanged DNS inventory, then
runs actual apex/www acceptance. Failure removes only its newly created routes,
returning traffic to the preserved Pages site. This route method makes rollback
possible without deleting existing Pages custom-domain attachments.

The script has not been executed. Both real domains remain unchanged. Final
production acceptance is pending current owner login and live-domain checks.
