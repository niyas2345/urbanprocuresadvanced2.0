# Registration and public discovery release

Contractor/Vendor registration now requires a private PDF/PNG/JPEG trade-license file in the browser. Existing accounts retain license upload. Admin company review links open the actual private file; verification remains blocked without a license and requires an explicit review confirmation. Registration alone does not verify a company.

Verified Vendors can use Matching My Trade or All Open RFQs; the latter now actually loads other trades. Quoting remains category-restricted. Homepage summaries include only open, Admin-published RFQs and mask client identity/contact information. Directory listings require active, verified businesses and explicit opt-in; existing businesses default to private. No license files, phone numbers or email addresses appear publicly.

Staging: 36 genuine API checks and 24 browser checks passed, including actual form registration and exact private license preview/download. Local operations 98, database 107, authentication 23 and Wrangler migration statements 128 passed; build/typecheck passed. Production preflight: 10 browser checks, private backup restore and foreign-key validation passed. Migration 0014 adds two opt-in flags without changing existing verification.

API registration without a license remains backward-compatible for pending accounts; these accounts cannot pass Admin verification. Existing real users must upload actual licenses and Admin must review them. No real accounts auto-approved; no test emails sent.
