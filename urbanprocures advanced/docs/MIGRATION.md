# Data Migration Specification: Legacy to Greenfield D1

## 1. Core Principles
1. **Data Migration $\ne$ Code Migration**: Zero legacy code, controllers, or Supabase logic is imported.
2. **Schema Invariance**: Greenfield D1 schema is authoritative. Legacy data is transformed to fit the new normalized model.
3. **Data Integrity First**: No duplicate records, dangling foreign keys, or unverified password hashes.

---

## 2. Migration Pipeline

```
+--------------------+       +----------------------+       +----------------------+
| Legacy Supabase/DB | ----> | ETL Transformation   | ----> | Cloudflare D1        |
| Raw Export (JSON)  |       | Script (Validate/Map)|       | Batch Ingestion (SQL)|
+--------------------+       +----------------------+       +----------------------+
```

### Steps:
1. **Extraction**: Export legacy users, contractor organizations, vendor profiles, historical RFQs, and quotations to JSON staging files.
2. **Sanitization & Mapping**:
   - Hash reconciliation: Flag legacy accounts for one-time secure password upgrade or magic link verification.
   - Profile separation: Map legacy organizational tables into distinct `contractor_profiles` and `vendor_profiles`.
   - Category Normalization: Map legacy free-form trade text into standardized UAE procurement categories (e.g. Joinery, MEP, Civil, Glazing, Landscaping).
3. **Validation**: Check foreign key references and verify that historical awarded contracts match legitimate quotation records.
4. **Audit Trail Generation**: Inject synthetic audit records noting `DATA_MIGRATED_FROM_LEGACY` with source timestamps.
