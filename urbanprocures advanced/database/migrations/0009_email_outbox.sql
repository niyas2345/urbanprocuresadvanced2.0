-- Transactional notification events. No historical records are backfilled.
CREATE TABLE email_outbox (
 id TEXT PRIMARY KEY,
 event_key TEXT NOT NULL UNIQUE,
 user_id TEXT NOT NULL REFERENCES users(id),
 subject TEXT NOT NULL,
 content TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','review_required','suppressed')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 completed_at TEXT
);
CREATE INDEX email_outbox_pending ON email_outbox(status,created_at);

CREATE TRIGGER contractor_registration_email AFTER INSERT ON contractors BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 VALUES(lower(hex(randomblob(16))),'registration:'||NEW.user_id,NEW.user_id,
 'Urban Procures registration received','Your registration has been received. Registration does not mean your company or trade license has been verified. Sign in to check your account status.');
END;
CREATE TRIGGER vendor_registration_email AFTER INSERT ON vendors BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 VALUES(lower(hex(randomblob(16))),'registration:'||NEW.user_id,NEW.user_id,
 'Urban Procures registration received','Your registration has been received. Registration does not mean your company or trade license has been verified. Sign in to check your account status.');
END;

CREATE TRIGGER quotation_submission_email AFTER INSERT ON vendor_quotes BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'quotation:'||NEW.id,c.user_id,
 'Urban Procures quotation received','A quotation is available for RFQ '||r.reference_code||'. Sign in to review it. Vendor identities remain protected until a valid award.'
 FROM rfqs r JOIN contractors c ON c.id=r.contractor_id WHERE r.id=NEW.rfq_id;
END;

CREATE TRIGGER award_confirmation_email AFTER INSERT ON awards BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'award:contractor:'||NEW.id,c.user_id,
 'Urban Procures award confirmed','Your award for RFQ '||r.reference_code||' is confirmed. Sign in to review the award and authorized contact details. Contractor Service Charge is AED 0.'
 FROM contractors c JOIN rfqs r ON r.id=NEW.rfq_id WHERE c.id=NEW.contractor_id;
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'award:vendor:'||NEW.id,v.user_id,
 'Urban Procures award confirmed','You have been awarded RFQ '||r.reference_code||'. Sign in to review the award, authorized contacts and applicable Service Charge.'
 FROM vendors v JOIN rfqs r ON r.id=NEW.rfq_id WHERE v.id=NEW.vendor_id;
END;

CREATE TRIGGER rfq_publication_email AFTER UPDATE OF status ON rfqs
 WHEN NEW.status='reviewed_published' AND OLD.status='submitted' BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'rfq:'||NEW.id||':'||v.user_id,v.user_id,
 'Urban Procures procurement opportunity','RFQ '||NEW.reference_code||' is available. Sign in to check eligibility and the submission deadline. Client identities remain protected.'
 FROM vendors v JOIN users u ON u.id=v.user_id
 WHERE u.status='active' AND v.verification_status='verified'
 AND EXISTS(SELECT 1 FROM json_each(v.trade_categories) WHERE value=NEW.category);
END;
