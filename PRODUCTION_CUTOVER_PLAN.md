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

This is a verified preview and cutover plan, not final production acceptance.
