-- Owner-authorized publication from final 2026.1 handoff. No login/default credentials.
INSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES ('terms-owner-publication','terms-publication@example.invalid','!non-login-publication-authority','!no-credentials','operations','pending','2026-10-04T20:00:00.000Z','2026-10-04T20:00:00.000Z');
UPDATE terms_versions SET status='retired' WHERE role='vendor' AND status='published';
UPDATE terms_versions SET status='retired' WHERE role='contractor' AND status='published';
INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at,title,effective_at,approval_reference) VALUES ('vendor-2026.1','vendor','vendor','2026.1','# URBAN PROCURES — VENDOR TERMS & CONDITIONS

Version: 2026.1

## 1. ACCEPTANCE

By selecting the acceptance checkbox and clicking the acceptance button,
the Vendor confirms that it has read, understood and agreed to the Urban
Procures Vendor Terms & Conditions.

The person accepting confirms that they are authorized to bind the Vendor
organization.

## 2. PLATFORM PURPOSE

Urban Procures provides a procurement platform through which Contractors
and Clients may publish procurement requirements and approved Vendors may
submit quotations.

Urban Procures facilitates procurement interactions and does not become
the Vendor, supplier, subcontractor, Contractor or purchaser merely by
operating the platform.

## 3. VENDOR INFORMATION

The Vendor must provide accurate, complete and current information,
including where applicable:

- company information
- trade license
- contact details
- authorized representative
- trade categories
- supporting documents

False, misleading or unverifiable information may result in restriction
or suspension.

## 4. RFQ ACCESS

RFQs may be made available according to:

- registered trade categories
- eligibility
- verification/approval status
- platform rules

Access to an RFQ does not guarantee an award.

## 5. QUOTATIONS

The Vendor is responsible for the accuracy and completeness of its
quotation.

Where applicable, the quotation must accurately state:

- quantities
- unit rates
- total values
- specifications
- exclusions
- lead times
- validity
- payment terms
- delivery requirements

The Vendor must not knowingly submit misleading or deceptive quotation
information.

## 6. PRE-AWARD IDENTITY MASKING

Before award, Urban Procures may keep Contractor/Client and Vendor
identity/contact details masked.

The Vendor must not attempt to:

- bypass identity masking
- technically identify the Client
- contact the Client outside the permitted platform process
- obtain confidential competitor information
- circumvent Urban Procures

## 7. VENDOR SERVICE CHARGE

The Vendor expressly acknowledges and agrees that where business is awarded through Urban Procures, the applicable Urban Procures SERVICE CHARGE is 2.5% of the applicable awarded value OR AED 500 minimum, WHICHEVER IS HIGHER. This is a Vendor-side obligation. The Contractor / Client does NOT pay this Vendor Service Charge. Acceptance of these Terms includes acceptance of this Service Charge obligation.

## 8. MANPOWER CHARGE

Where an award concerns manpower/labour procurement, the Vendor acknowledges the Urban Procures manpower charge rule: AED 1 PER MANPOWER / LABOUR UNIT. The rule is applied according to approved Urban Procures business logic stored in the application. It remains a Vendor-side obligation, is not assigned to the Contractor / Client and is represented separately from the standard Vendor Service Charge.

## 9. NO CIRCUMVENTION

A Vendor must not intentionally use an opportunity, introduction,
procurement requirement or contact obtained through Urban Procures to
avoid an applicable Urban Procures Service Charge or manpower charge.

The Vendor must not intentionally move the same procurement transaction
outside the Urban Procures process solely to avoid applicable platform
obligations.

## 10. AWARD

Submission of a quotation does not constitute an award.

Shortlisting, communication, clarification or discussion does not
constitute an award.

An award exists only when an authorized Contractor / Client completes the
official Urban Procures award process.

## 11. IDENTITY RELEASE AFTER AWARD

Following a valid award, permitted contact information may be released
between the awarded Vendor and relevant Contractor / Client.

Non-awarded Vendors remain subject to applicable masking rules.

## 12. PERFORMANCE AFTER AWARD

The Vendor remains responsible for its supply/service obligations,
including as applicable:

- quality
- workmanship
- delivery
- warranty
- specifications
- payment/commercial terms
- other obligations agreed with the Contractor / Client

Urban Procures does not automatically become a party to the underlying
supply/service agreement.

## 13. PROCUREMENT DOCUMENTS

RFQ documents, drawings, specifications, BoQs and related materials may
contain confidential information.

They may be used only for the authorized procurement purpose.

Unauthorized copying, publication or distribution is prohibited.

## 14. ACCOUNT SECURITY

The Vendor is responsible for safeguarding account credentials and
authorized activity conducted through the account.

## 15. SUSPENSION

Urban Procures may restrict or suspend Vendor access for serious matters
including:

- fraudulent information
- unauthorized access
- abuse
- attempted security bypass
- identity-masking bypass
- serious procurement-rule violations
- unresolved verification problems
- material breach of these Terms

## 16. TERMS UPDATES

Urban Procures may publish updated Vendor Terms.

Where a new Terms version requires re-acceptance, the Vendor must
affirmatively accept the new version before continuing protected
procurement activity.

Historical acceptance records must remain preserved.

## 17. ELECTRONIC ACCEPTANCE

The Vendor agrees that affirmative acceptance through the Urban Procures
clickwrap process constitutes recorded acceptance of the specific Terms
version presented at the time of acceptance.

## 18. DATA / PRIVACY

Vendor and user information must be handled according to the applicable
Urban Procures privacy documentation and applicable law.

## 19. GOVERNING LAW / DISPUTES

Governing-law and dispute-resolution wording is pending separately approved wording. Any final clause will be presented through a new published Terms version.
','5376bf60d6ac3d1abd6d5ed4536f9c5e8d3556a918ffe9918a01f3195131f945','published',1,'terms-owner-publication','2026-10-04T20:00:00.000Z','2026-10-04T20:00:00.000Z','URBAN PROCURES — VENDOR TERMS & CONDITIONS','2026-10-04T20:00:00.000Z','owner-final-clickwrap-handoff-2026.1');
INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at,title,effective_at,approval_reference) VALUES ('contractor-2026.1','contractor','contractor','2026.1','# URBAN PROCURES — CONTRACTOR / CLIENT TERMS & CONDITIONS

Version: 2026.1

## 1. ACCEPTANCE

By selecting the acceptance checkbox and completing registration, the
Contractor / Client confirms that it has read, understood and agreed to
these Terms.

The person accepting confirms that they are authorized to bind the
relevant organization.

## 2. REGISTRATION INFORMATION

The Contractor / Client must provide accurate and current organization
and authorized representative information.

## 3. RFQ RESPONSIBILITY

The Contractor / Client is responsible for providing reasonably accurate:

- scope
- quantities
- BoQ
- specifications
- drawings
- delivery requirements
- procurement requirements

Urban Procures may request clarification or correction before publication.

## 4. DOCUMENT RIGHTS

The Contractor / Client confirms that it has the right or authority to
upload and distribute procurement documents through Urban Procures.

## 5. PRE-AWARD IDENTITY MASKING

Vendor identity and protected contact details may remain masked before
award.

The Contractor / Client must not attempt to bypass the masking process or
obtain protected Vendor information through unauthorized methods.

## 6. QUOTATION REVIEW

Vendor quotations are submitted by independent Vendors.

The Contractor / Client remains responsible for evaluating:

- price
- technical suitability
- specification
- delivery
- exclusions
- validity
- payment terms
- overall commercial suitability

before award.

## 7. CONTRACTOR / CLIENT SERVICE CHARGE

Urban Procures does NOT charge the Contractor / Client the Vendor Service Charge. Contractor / Client Urban Procures Service Charge: AED 0. The Vendor Service Charge applicable to an award is an obligation of the awarded Vendor. Neither the Vendor’s 2.5% / AED 500 rule nor manpower charges are assigned to the Contractor / Client.

## 8. AWARD AUTHORITY

Only an authorized Contractor / Client user may confirm an award.

Award confirmation may trigger:

- award records
- notifications
- permitted identity release
- applicable Vendor Service Charge obligations
- applicable Vendor manpower obligations where relevant

Award confirmation must therefore be an explicit action.

## 9. IDENTITY RELEASE

After a valid award, permitted information may be released between the
awarded Vendor and Contractor / Client.

Protected information relating to non-awarded Vendors must remain
restricted.

## 10. FAIR USE

The Contractor / Client must not:

- create fraudulent RFQs
- misuse Vendor information
- access another organization''s information
- manipulate the platform
- bypass authorization controls
- attempt technical identity disclosure
- create RFQs solely for abusive/deceptive purposes

## 11. CONFIDENTIALITY

Confidential Vendor and procurement information must be used only for the
relevant procurement process.

## 12. PLATFORM ROLE

Urban Procures facilitates procurement interactions.

Unless separately agreed in writing, Urban Procures does not become a
party to the underlying supply/service contract merely because an RFQ,
quotation or award is processed through the platform.

## 13. ACCOUNT SECURITY

The Contractor / Client is responsible for safeguarding organization
credentials and authorized account use.

## 14. TERMS UPDATES

Where a new mandatory Terms version requires acceptance, the Contractor /
Client may be required to accept the new version before continuing
protected procurement activities.

Historical acceptance records must remain preserved.

## 15. ELECTRONIC ACCEPTANCE

Affirmative acceptance through the Urban Procures clickwrap process
constitutes recorded acceptance of the displayed Terms version.

## 16. DATA / PRIVACY

Organization/user information must be handled according to applicable
Urban Procures privacy documentation and applicable law.

## 17. GOVERNING LAW / DISPUTES

Governing-law and dispute-resolution wording is pending separately approved wording. Any final clause will be presented through a new published Terms version.
','421c4442b38e6c9b1dd4447e8fe4aab0d6bdac3b3ec87ccbb132031febee9f25','published',1,'terms-owner-publication','2026-10-04T20:00:00.000Z','2026-10-04T20:00:00.000Z','URBAN PROCURES — CONTRACTOR / CLIENT TERMS & CONDITIONS','2026-10-04T20:00:00.000Z','owner-final-clickwrap-handoff-2026.1');
INSERT INTO public_terms_documents (id,terms_type,terms_version,title,content_text,content_sha256,status,effective_at,published_at,created_at,approval_reference) VALUES ('get-a-quote-2026.1','get_a_quote','2026.1','URBAN PROCURES — GET A QUOTE TERMS AND PRIVACY NOTICE','# URBAN PROCURES — GET A QUOTE TERMS AND PRIVACY NOTICE

Version: 2026.1

No account is required. By affirmatively confirming before submission, you confirm that the information provided is accurate and agree to this Get a Quote notice. Urban Procures handles submitted information according to its applicable privacy documentation and applicable law for the requested quotation process.

Ordinary submission: AED 0. If you select an optional site visit, the SITE VISIT FEE is AED 100. This is separate from the Vendor Service Charge. Selection does not itself confirm payment or a scheduled appointment.
','a1cd6f6678691326f2c039dce8a3be2e285664297117bc47dfeded97e45c60ec','published','2026-10-04T20:00:00.000Z','2026-10-04T20:00:00.000Z','2026-10-04T20:00:00.000Z','owner-final-clickwrap-handoff-2026.1');
