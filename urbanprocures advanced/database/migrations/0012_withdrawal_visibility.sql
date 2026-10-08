-- Preserve quotation and document history; never delete business records.
ALTER TABLE vendor_quotes ADD COLUMN withdrawn_at TEXT;
ALTER TABLE vendor_quotes ADD COLUMN deleted_at TEXT;
CREATE TRIGGER rfq_lifecycle_admin_notice AFTER UPDATE OF status,deleted_at ON rfqs
WHEN (NEW.status IN ('draft','cancelled') AND OLD.status<>NEW.status) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) BEGIN
 INSERT INTO notifications(id,user_id,role,title,message,notification_type,link,created_at)
 SELECT lower(hex(randomblob(16))),id,'admin','RFQ withdrawn',NEW.reference_code||CASE WHEN NEW.deleted_at IS NOT NULL THEN ' removed by Contractor.' WHEN NEW.status='draft' THEN ' recalled to draft by Contractor.' ELSE ' cancelled by Contractor.' END,'warning','/admin',strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM users WHERE role='admin' AND status='active';
END;
CREATE TRIGGER quotation_lifecycle_admin_notice AFTER UPDATE OF withdrawn_at,deleted_at ON vendor_quotes
WHEN (NEW.withdrawn_at IS NOT NULL AND OLD.withdrawn_at IS NULL) OR (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) BEGIN
 INSERT INTO notifications(id,user_id,role,title,message,notification_type,link,created_at)
 SELECT lower(hex(randomblob(16))),id,'admin','Quotation withdrawn',NEW.reference_code||CASE WHEN NEW.deleted_at IS NOT NULL THEN ' removed by Vendor.' ELSE ' recalled by Vendor.' END,'warning','/admin',strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM users WHERE role='admin' AND status='active';
END;
-- Resubmissions need their own review event, even after the first was suppressed.
DROP TRIGGER admin_rfq_transition_email;
CREATE TRIGGER admin_rfq_transition_email AFTER UPDATE OF status ON rfqs WHEN NEW.status='submitted' AND OLD.status='draft' BEGIN
 INSERT INTO email_outbox(id,event_key,user_id,subject,content)
 SELECT lower(hex(randomblob(16))),'admin-rfq:'||NEW.id||':'||lower(hex(randomblob(16)))||':'||u.id,u.id,'Urban Procures RFQ review','RFQ '||NEW.reference_code||' was resubmitted and is awaiting review.' FROM users u WHERE u.role='admin' AND u.status='active';
END;
