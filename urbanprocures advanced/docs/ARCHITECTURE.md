# Architecture Blueprint: Urban Procures Advanced

## 1. System Overview & Principles

Urban Procures Advanced is an independent, greenfield procurement platform engineered to replace the legacy system. It runs entirely on Cloudflare edge primitives with zero third-party backend dependencies.

```
                      +------------------------------------------+
                      |         Cloudflare Edge Network          |
                      |   (SSL, DDoS, Turnstile, Rate Limiting)  |
                      +--------------------+---------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
         +----------v-----------+                    +------------v------------+
         |   Public Traffic     |                    |  Authenticated Traffic  |
         |  (/get-a-quote, /)   |                    | (/contractor, /vendor)  |
         +----------+-----------+                    +------------+------------+
                    |                                             |
                    +----------------------+----------------------+
                                           |
                      +--------------------v---------------------+
                      |           Cloudflare Worker              |
                      |      (Hono/Worker Micro-Router)          |
                      +--+--------+--------+--------+---------+--+
                         |        |        |        |         |
      +------------------+        |        |        |         +-----------------+
      |                           |        |        |                           |
+-----v--------+            +-----v----+ +-v------v-+     +-----v--------+ +----v-------+
| D1 Database  |            |    KV    | | R2 Bucket|     | Cloudflare   | | Email Svc  |
| Edge SQLite  |            | Sessions | | Private  |     | Queue        | | (Zoho Mail |
| Transactions |            | & Cache  | | Documents|     | Invitations  | | Transport) |
+--------------+            +----------+ +----------+     +--------------+ +------------+
```

---

## 2. Core Subsystems

### A. Greenfield Isolation
- Zero shared runtime code with previous builds.
- Independent database schema designed from first principles.
- Independent authentication tokens (HMAC-SHA256 signed JWTs with rotating secret keys in Cloudflare Secrets).
- Clean URL routing structure without legacy file suffixes.

### B. Cloudflare Edge Service Mapping
| Functional Layer | Cloudflare Implementation | Key Role |
| :--- | :--- | :--- |
| **API & Business Logic** | Cloudflare Workers | Edge runtime executing RFQ state transitions, RBAC, and data filtering. |
| **Relational Database** | Cloudflare D1 | Globally distributed SQLite cluster with ACID transactions for RFQs, users, and audit records. |
| **Document Storage** | Cloudflare R2 | S3-compatible private object store for drawings, BoQs, specifications, and trade licenses. |
| **Session Cache & Throttles** | Cloudflare KV | Fast edge session validation and distributed IP rate-limiting. |
| **Asynchronous Tasks** | Cloudflare Queues | Background processing for vendor invitation emails and document metadata extraction. |
| **Anti-Bot Protection** | Cloudflare Turnstile | Protects public Get-a-Quote submissions and registration endpoints without intrusive CAPTCHAs. |

---

## 3. Data Flow Diagrams

### Journey 1: Public "Get a Quote" (Unauthenticated)
```
Property Owner (Villa/Apt)
    |
    | 1. Submits Form (Contact, Scope, Photos, AED 100 Site Visit Flag)
    v
Cloudflare Worker (/api/public/quotes)
    |
    | 2. Validates payload & uploads attachments to R2
    | 3. Inserts into D1 'public_quote_requests'
    | 4. Emits 'PUBLIC_QUOTE_CREATED' audit event
    v
Urban Procures Operations Dashboard
    |
    | 5. Admin reviews request & dispatches to matching verified vendors
```

### Journey 2: Professional Contractor RFQ & Award
```
Contractor (Auth)               Cloudflare Worker                 Vendor (Auth)
     |                                 |                                |
     |-- 1. Create RFQ + BoQ --------->|                                |
     |                                 |-- 2. RFQ Published ----------->| (Masked Contractor)
     |                                 |<-- 3. Submit Quotation --------|
     |<-- 4. Review Quotations --------|                                |
     |    (Masked Vendor VND-xxx)      |                                |
     |                                 |                                |
     |-- 5. Confirm Award ------------>|                                |
     |    (Atomic Transaction)         |-- 6. Trigger Contact Release ->|
     |<-- 7. Unmask Vendor Details ----|                                |
     |                                 |--- 8. Unmask Contractor ------>|
```
