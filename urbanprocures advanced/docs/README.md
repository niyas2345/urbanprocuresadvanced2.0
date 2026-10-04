# Urban Procures Advanced
## Master Greenfield Architecture & Implementation

Urban Procures Advanced is an enterprise-grade, Greenfield rebuild of the Urban Procures procurement marketplace. Engineered specifically for **Cloudflare's serverless edge infrastructure** (Workers, D1, R2, KV, Queues), it provides an auditable, high-performance, and secure platform for the UAE construction, fit-out, and property services market.

---

### Core Architecture Highlights

- **Sole Backend Infrastructure**: 100% Cloudflare (Workers, D1 SQLite edge database, R2 private object storage, KV for sessions & rate limiting, Queues for background tasks).
- **Absolute No-Cloning Integrity**: Zero legacy code, no Supabase runtime dependencies, new database schema, new state machine, and fresh UI components.
- **Three Primary Launch Categories**:
  1. **Get a Quote**: Public villa, apartment, and personal property quotation requests. **Zero registration/account required**. Optional **AED 100 Site Visit**.
  2. **Contractor Portal**: Authenticated corporate portal for main contractors, interior fit-out firms, and developers to publish RFQs, manage BoQs, compare anonymized vendor quotations, and award contracts.
  3. **Vendor Portal**: Authenticated portal for verified subcontractors and material suppliers. Mandatory click-wrap terms acceptance, RFQ discovery, quotation submission, and post-award delivery.
- **Backend-Enforced Identity Masking**: Pre-award client and vendor anonymity enforced at the API serializer level, preventing private contact or identity leakage before formal contract award.
- **Post-Award Contact Release**: Formalized, audited unmasking triggered only when the authorized contractor confirms the award.
- **Configurable Service Charge Engine**: Centralized financial rules module supporting historical benchmarks (2.5%, AED 500 minimum, AED 1 manpower rule, AED 100 site visit) with full auditability.
- **Full Document Inspection for Admin**: Secure signed R2 links and operational review console for administrators to inspect drawings, specifications, and trade licenses.
- **Provider-Independent Email Architecture**: Clean abstraction layer ready for Zoho Mail production delivery with mock/test transports for staging.

---

### Project Structure

```
urbanprocures advanced/
├── database/
│   ├── schema.sql             # Full D1 SQLite DDL schema
│   └── seeds.sql              # Initial system seeds (roles, charge rules, terms)
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_indexes_and_audit.sql
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── BUSINESS_RULES.md
│   ├── AUTHORIZATION.md
│   ├── CLOUDFLARE.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── MIGRATION.md
│   └── PRODUCTION_CHECKLIST.md
├── workers/
│   ├── index.ts               # Main Worker fetch handler & router
│   ├── wrangler.toml          # Cloudflare Worker & D1/R2/Queue bindings
│   ├── rfqStateMachine.ts     # Deterministic procurement workflow
│   ├── identityMasking.ts     # Data sanitizer & masking policies
│   ├── r2Service.ts           # Secure private object storage access
│   ├── serviceChargeEngine.ts # Centralized financial calculation logic
│   ├── authorization.ts       # RBAC & resource ownership middleware
│   ├── auditService.ts        # Immutable audit log pipeline
│   ├── emailService.ts        # Email transport abstraction (Zoho ready)
│   └── invitationService.ts   # Queue-driven onboarding & attribution
├── shared/
│   └── types.ts               # Canonical TypeScript domain types & DTOs
└── tests/
    ├── rfqStateMachine.test.ts
    ├── identityMasking.test.ts
    ├── serviceChargeEngine.test.ts
    └── authorization.test.ts
```

---

### Quick Start (Local & Cloudflare)

1. **Install Dependencies**: `npm install`
2. **Local Preview**: `npm run dev`
3. **Execute Test Suite**: Run the built-in interactive test runner via `/test-suite` or automated test files.
4. **Deploy to Cloudflare Workers**:
   ```bash
   wrangler d1 migrations apply urbanprocures-d1 --remote
   wrangler deploy
   ```
