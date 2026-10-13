-- Separate integration authentication; existing website sessions and customer records are unchanged.
CREATE TABLE admin_integration_grants (
 token_digest TEXT PRIMARY KEY,
 owner_user_id TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL,
 last_refreshed_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 absolute_expires_at TEXT NOT NULL,
 revoked_at TEXT
);
CREATE INDEX admin_integration_owner ON admin_integration_grants(owner_user_id);
