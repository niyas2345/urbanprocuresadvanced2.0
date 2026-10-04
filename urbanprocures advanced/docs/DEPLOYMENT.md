# Deployment Guide: Urban Procures Advanced

## 1. Prerequisites
- Node.js $\ge 20$
- Cloudflare Wrangler CLI (`npm install -g wrangler`)
- Cloudflare Account with Workers Paid plan (recommended for D1 and R2 production workloads)
- Configured domain in Cloudflare DNS (`urbanprocures.com`)

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Provision Cloudflare Resources
```bash
# Login to Cloudflare
wrangler login

# Create D1 Database
wrangler d1 create urbanprocures-d1

# Create R2 Document Storage Bucket
wrangler r2 bucket create urbanprocures-documents

# Create KV Namespaces
wrangler kv namespace create SESSIONS_KV
wrangler kv namespace create RATE_LIMIT_KV

# Create Queues
wrangler queues create urbanprocures-invitations
wrangler queues create urbanprocures-emails
```

### Step 2: Apply Database Schema & Migrations
```bash
# Apply initial schema & migrations to remote D1
wrangler d1 migrations apply urbanprocures-d1 --remote
```

### Step 3: Configure Production Secrets
```bash
wrangler secret put JWT_SECRET
wrangler secret put ZOHO_MAIL_CLIENT_ID
wrangler secret put ZOHO_MAIL_CLIENT_SECRET
wrangler secret put ZOHO_MAIL_REFRESH_TOKEN
wrangler secret put TURNSTILE_SECRET_KEY
```

### Step 4: Build & Deploy Frontend and Worker
```bash
# Build production bundle
npm run build

# Deploy Worker to Cloudflare edge network
wrangler deploy
```

---

## 3. Custom Domain & DNS Mapping
- Map `api.urbanprocures.com` -> Cloudflare Worker Route.
- Map `urbanprocures.com` -> Cloudflare Pages / Edge Assets.
- Enable Cloudflare HSTS, TLS 1.3, and HTTP/3.
