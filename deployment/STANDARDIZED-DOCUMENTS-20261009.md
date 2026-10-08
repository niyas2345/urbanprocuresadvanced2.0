# Urban Procures document privacy and portal release

Live on urbanprocures.com and www.urbanprocures.com, 9 October 2026 (Dubai).
Application source: b6ed9e42dd377598e65454e67f5b6fe1fec44387.
Worker version: 142650a7-340c-4839-b370-5bc706a2aae3.

Original uploads stay private to the uploader and Admin before award. Eligible counterparties receive only separately generated, reviewed Urban Procures copies. Awarded originals remain limited to the winning parties. RFQ headings no longer expose raw customer titles. Where attachments exist, Vendor overviews use reviewed document summaries, with a preparation notice while review is pending.

The Worker extracts PDF/Excel technical text and image/scanned-PDF text through Cloudflare Workers AI. It rebuilds platform documents without source letterheads, image metadata, contacts or logos. English documents use PDF; Unicode content has an escaped, sandboxed HTML fallback. Detailed cleaned source text accompanies structured extraction to reduce omissions. Originals and source hashes are preserved. Extraction can be wrong: Admin must compare technical details and quantities against the original, actually open the generated copy, and explicitly approve its release. Unsupported CAD, unclear scans and geometry-dependent drawings need a checked identity-safe replacement; the system does not claim automatic reconstruction of drawing geometry.

Admin can upload a separate safe PDF/image replacement. Doing so revokes the previous release and requires a fresh preview before approval. Original bytes remain unchanged. Contractor and Vendor portal homes show actual verified-business counts, projects, open RFQs and awards. Public directory entries remain consent-based; no fake companies or awards are used.

The current published RFQ has three manually reviewed, corrected copies released: a complete 67-row BOQ, a 41-row supplementary BOQ and a design-reference description of the restaurant illustration. The illustration is not treated as a construction price schedule or measured drawing. Original-source SHA-256 values were independently checked against the pre-migration backup.

Verification: 35 actual deployed staging checks with the real AI provider, including PDF/Excel/image extraction, quotation delivery, protected headings, exact counterpart bytes and visible Admin preview/download/release; 42 final live browser checks; 103 local operations checks; 23 authentication checks; 110 offline database checks; 136 Wrangler migration statements; 11 artifact checks. Existing business records, D1/R2 bindings, OAuth secrets, mail settings, live routes and persisted logs/traces were checked. Migration 0015 adds derivative fields without deleting originals. Three document release flags changed only after the documented manual review. Twenty-three temporary staging accounts were quarantined and fixture mail suppressed. No test emails or invitations were sent during this release.

The code and deployed Worker are archived with hashes in standardization-release-lock-20261009.json. Database backup remains private outside Git. This release supersedes the earlier document-release behavior described in RFQ-DOCUMENT-RELEASE-20261008.md.
