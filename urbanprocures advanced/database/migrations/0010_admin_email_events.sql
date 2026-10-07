-- New events only; no backfill or automatic verification.
CREATE TRIGGER contractor_admin_registration_email AFTER INSERT ON contractors BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'admin-registration:'||NEW.user_id||':'||u.id,u.id,
 'Urban Procures registration review','A Contractor registration is awaiting document review. Sign in to the Admin portal. Registration does not imply verification.'
 FROM users u WHERE u.role='admin' AND u.status='active';
END;
CREATE TRIGGER vendor_admin_registration_email AFTER INSERT ON vendors BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'admin-registration:'||NEW.user_id||':'||u.id,u.id,
 'Urban Procures registration review','A Vendor registration is awaiting document review. Sign in to the Admin portal. Registration does not imply verification.'
 FROM users u WHERE u.role='admin' AND u.status='active';
END;
CREATE TRIGGER admin_rfq_submission_email AFTER INSERT ON rfqs WHEN NEW.status='submitted' BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'admin-rfq:'||NEW.id||':'||u.id,u.id,
 'Urban Procures RFQ review','RFQ '||NEW.reference_code||' is awaiting review. Sign in to inspect documents and review publication eligibility.'
 FROM users u WHERE u.role='admin' AND u.status='active';
END;
CREATE TRIGGER admin_rfq_transition_email AFTER UPDATE OF status ON rfqs
 WHEN NEW.status='submitted' AND OLD.status='draft' BEGIN
 INSERT OR IGNORE INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'admin-rfq:'||NEW.id||':'||u.id,u.id,
 'Urban Procures RFQ review','RFQ '||NEW.reference_code||' is awaiting review. Sign in to inspect documents and review publication eligibility.'
 FROM users u WHERE u.role='admin' AND u.status='active';
END;
