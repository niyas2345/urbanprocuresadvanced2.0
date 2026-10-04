# Cloudflare Infrastructure & Deployment Specification

## 1. Cloudflare Bindings Architecture

All backend capabilities are implemented via first-class Cloudflare bindings defined in `wrangler.toml`:

```toml
name = "urbanprocures-advanced-worker"
main = "workers/index.ts"
compatibility_date = "2026-10-01"
compatibility_flags = ["nodejs_compat"]

# 1. Cloudflare D1 Relational SQLite Database
[[d1_databases]]
binding = "DB"
database_name = "urbanprocures-d1"
database_id = "00000000-0000-0000-0000-000000000000" # Provisioned in Cloudflare dashboard
migrations_dir = "migrations"

# 2. Cloudflare R2 Document & Drawing Object Storage
[[r2_buckets]]
binding = "DOCUMENTS_BUCKET"
bucket_name = "urbanprocures-documents"

# 3. Cloudflare KV for High-Speed Session & Rate Limiting Cache
[[kv_namespaces]]
binding = "SESSIONS_KV"
id = "00000000000000000000000000000000"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "11111111111111111111111111111111"

# 4. Cloudflare Queues for Asynchronous Email Delivery & Invitations
[[queues.producers]]
binding = "INVITATIONS_QUEUE"
queue = "urbanprocures-invitations"

[[queues.producers]]
binding = "EMAIL_NOTIFICATIONS_QUEUE"
queue = "urbanprocures-emails"

[[queues.consumers]]
queue = "urbanprocures-emails"
max_batch_size = 10
max_batch_timeout = 5
```

---

## 2. Environment Variables & Secret Management

### Production Secrets (Configured via `wrangler secret put`)
- `JWT_SECRET`: High-entropy 256-bit encryption key for HMAC session signatures.
- `ZOHO_MAIL_CLIENT_ID`: Zoho API Client ID for transactional email delivery.
- `ZOHO_MAIL_CLIENT_SECRET`: Zoho API Secret key.
- `ZOHO_MAIL_REFRESH_TOKEN`: Long-lived token to generate OAuth Bearer headers for Zoho SMTP/API.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile anti-bot verification secret.

### Non-Secret Variables (`wrangler.toml` vars)
- `ENVIRONMENT`: `"production"` | `"staging"` | `"development"`
- `PLATFORM_DOMAIN`: `"urbanprocures.com"`
- `SERVICE_CHARGE_DEFAULT_PERCENT`: `"0.025"`
- `SERVICE_CHARGE_MINIMUM_AED`: `"500"`
- `SITE_VISIT_FEE_AED`: `"100"`

---

## 3. Worker Execution Flow

```
Inbound HTTP Request
      |
      v
Worker Fetch Handler
      |
      +---> 1. Cloudflare Turnstile Verification (Public endpoints)
      +---> 2. Rate Limiting Check (KV sliding window)
      +---> 3. Session Authentication & Token Verification (KV + JWT)
      +---> 4. Role-Based Access Control (RBAC middleware)
      +---> 5. Core Business Logic & D1 / R2 Transactions
      +---> 6. Response Serialization & Identity Masking
      |
      v
Outbound HTTP Response
```
