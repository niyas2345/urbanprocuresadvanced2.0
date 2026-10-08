"""Offline SQLite verification; does not certify actual Cloudflare D1 runtime."""
import json
import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[1]
DBDIR = ROOT / 'urbanprocures advanced' / 'database'
checks = 0

def verify(condition, message):
    global checks
    assert condition, message
    checks += 1

def apply(db, sql):
    # D1 migrations execute transactionally; keep foreign keys enabled in offline tests.
    db.executescript('BEGIN;\n' + sql + '\nCOMMIT;')
    verify(not db.execute('PRAGMA foreign_key_check').fetchall(), 'Foreign keys must remain valid')

def columns(db):
    tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")]
    return {t: {r[1] for r in db.execute('PRAGMA table_info("' + t + '")')} for t in tables}

fresh = sqlite3.connect(':memory:')
fresh.execute('PRAGMA foreign_keys=ON')
for file in sorted((DBDIR / 'migrations').glob('*.sql')):
    apply(fresh, file.read_text())
reference = sqlite3.connect(':memory:')
reference.executescript((DBDIR / 'schema.sql').read_text())
verify(columns(fresh) == columns(reference), 'Canonical migrations must match reference schema')
verify(fresh.execute("SELECT count(*) FROM users WHERE id!='terms-owner-publication'").fetchone()[0] == 0, 'Fresh migration must not seed login accounts')
verify(fresh.execute("SELECT status,password_hash FROM users WHERE id='terms-owner-publication'").fetchone() == ('pending','!non-login-publication-authority'), 'Publication attribution principal cannot log in')
verify(fresh.execute("SELECT count(*) FROM terms_versions WHERE terms_version='2026.1' AND status='published'").fetchone()[0] == 1, 'Owner supplied Terms explicitly published by migration')
verify(fresh.execute('SELECT count(*) FROM terms_acceptance_evidence').fetchone()[0] == 0, 'Publication never implies acceptance')

legacy = sqlite3.connect(':memory:')
legacy.execute('PRAGMA foreign_keys=ON')
for file in sorted((ROOT / 'urbanprocures advanced' / 'migrations').glob('*.sql')):
    apply(legacy, file.read_text())
legacy.execute("INSERT INTO users VALUES('legacy-vendor','legacy@example.test','retained-hash','vendor','active','2026-10-04','2026-10-04')")
legacy.execute("INSERT INTO vendor_profiles VALUES('legacy-profile','legacy-vendor','Fixture Ltd','FIXTURE-TL','[]','[]','pending','Fixture Person','fixture-phone','2026-10-04')")
legacy.execute("INSERT INTO vendor_terms_acceptance VALUES('legacy-acceptance','legacy-profile','v2026.1','2026-10-04','fixture-ip','fixture-agent')")
legacy.commit()
apply(legacy, (DBDIR / 'upgrades' / 'from_legacy_migrations.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0002_terms_evidence.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0003_clickwrap_commercial.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0005_person_hours.sql').read_text().split('UPDATE manpower_charge_configuration')[0])
apply(legacy, (DBDIR / 'migrations' / '0006_document_review.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0007_auth_security.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0008_quote_revision.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0009_email_outbox.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0010_admin_email_events.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0011_rfq_submission_controls.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0012_withdrawal_visibility.sql').read_text())
apply(legacy, (DBDIR / 'migrations' / '0013_active_quotation_uniqueness.sql').read_text())
for table, names in columns(reference).items():
    verify(names <= columns(legacy).get(table, set()), 'Legacy upgrade missing columns in ' + table)
verify(legacy.execute("SELECT password_hash,status FROM users WHERE id='legacy-vendor'").fetchone() == ('retained-hash','pending'), 'Unsalted legacy credentials must be preserved but inactive')
verify(legacy.execute("SELECT user_id FROM terms_acceptances WHERE id='legacy-acceptance'").fetchone()[0] == 'legacy-vendor', 'Legacy Terms history must be retained')
verify(legacy.execute('SELECT count(*) FROM terms_acceptance_evidence').fetchone()[0] == 0, 'Legacy records must not become explicit clickwrap evidence')

# Upgrade a READ-ONLY copy of the uploaded SQLite snapshot; original file is untouched.
source = sqlite3.connect((DBDIR / 'urbanprocures_d1.sqlite').as_uri() + '?mode=ro&immutable=1', uri=True)
snapshot = sqlite3.connect(':memory:')
source.backup(snapshot)
source.close()
snapshot.execute('PRAGMA foreign_keys=ON')
old_counts = {t: snapshot.execute('SELECT count(*) FROM "' + t + '"').fetchone()[0] for t in columns(snapshot)}
apply(snapshot, (DBDIR / 'migrations' / '0002_terms_evidence.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0003_clickwrap_commercial.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0005_person_hours.sql').read_text().split('UPDATE manpower_charge_configuration')[0])
apply(snapshot, (DBDIR / 'migrations' / '0006_document_review.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0007_auth_security.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0008_quote_revision.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0009_email_outbox.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0010_admin_email_events.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0011_rfq_submission_controls.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0012_withdrawal_visibility.sql').read_text())
apply(snapshot, (DBDIR / 'migrations' / '0013_active_quotation_uniqueness.sql').read_text())
for table, count in old_counts.items():
    verify(snapshot.execute('SELECT count(*) FROM "' + table + '"').fetchone()[0] == count, 'Snapshot row count changed: ' + table)
verify(columns(snapshot) == columns(reference), 'Snapshot upgrade must match canonical columns')
verify(snapshot.execute('SELECT count(*) FROM terms_acceptance_evidence').fetchone()[0] == 0, 'Snapshot demo Terms are not genuine acceptance')

# Verify database-level evidence constraints with dedicated synthetic fixtures.
fresh.execute("INSERT INTO users VALUES('fixture-admin','admin@example.test','fixture-hash','fixture-salt','admin','active','now','now')")
fresh.execute("INSERT INTO users VALUES('fixture-vendor','vendor@example.test','fixture-hash','fixture-salt','vendor','active','now','now')")
fresh.execute("INSERT INTO organizations (id,name,org_type,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES('fixture-org','Fixture','vendor','F','Dubai','F','F','F','now')")
fresh.execute("INSERT INTO vendors (id,user_id,organization_id,company_name,trade_license_number,trade_categories,emirates_serviced,contact_person,contact_phone,created_at) VALUES('fixture-vendor-profile','fixture-vendor','fixture-org','F','F','[]','[]','F','F','now')")
fresh.execute("UPDATE terms_versions SET status='retired' WHERE role='vendor' AND status='published'")
fresh.execute("INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at) VALUES('fixture-terms','vendor','vendor','fixture-v1','TEST ONLY - NOT APPROVED LEGAL TEXT','fixture-digest','published',1,'fixture-admin','now','now')")
values = ('fixture-acceptance','fixture-vendor','fixture-org','vendor','vendor','fixture-terms','fixture-v1','fixture-digest','now','accepted','explicit_clickwrap',None,None,'fixture-audit','now')
fresh.execute('INSERT INTO terms_acceptance_evidence VALUES(' + ','.join(['?'] * 15) + ')', values)
checks += 1

def rejected(sql, params=()):
    try:
        fresh.execute(sql, params)
    except sqlite3.IntegrityError:
        verify(True, 'Rejected invalid operation')
    else:
        raise AssertionError('Operation should have been rejected: ' + sql)

rejected("UPDATE terms_acceptance_evidence SET accepted_at='changed'")
rejected('DELETE FROM terms_acceptance_evidence')
rejected("UPDATE terms_versions SET content_text='changed' WHERE id='fixture-terms'")
rejected('INSERT INTO terms_acceptance_evidence VALUES(' + ','.join(['?'] * 15) + ')', ('wrong-version',) + values[1:6] + ('wrong-version',) + values[7:13] + ('wrong-audit','now'))
rejected("INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at) VALUES('unapproved','contractor','contractor','fixture-v1','fixture','fixture-digest','published',1,NULL,NULL,'now')")
fresh.execute("UPDATE terms_versions SET status='retired' WHERE id='fixture-terms'")
checks += 1
rejected('INSERT INTO terms_acceptance_evidence VALUES(' + ','.join(['?'] * 15) + ')', ('retired-terms',) + values[1:13] + ('retired-audit','now'))
print(json.dumps({'offlineDatabaseChecksPassed': checks, 'freshMigrationTables': len(columns(fresh)), 'uploadedSnapshotRowsPreserved': True, 'legacyHistoryPreserved': True, 'actualCloudflareD1TestsRun': 0}, indent=2))
