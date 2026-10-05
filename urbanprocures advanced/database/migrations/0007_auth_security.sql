CREATE TABLE auth_rate_limits (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL CHECK(attempts>0));
CREATE INDEX auth_rate_window ON auth_rate_limits(window_start);
CREATE TABLE password_reset_tokens (digest TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX reset_user ON password_reset_tokens(user_id);
