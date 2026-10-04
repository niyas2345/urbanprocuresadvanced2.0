// Urban Procures Advanced
// Master Greenfield Cloudflare Edge Backend Server
// Runs Cloudflare D1 (SQLite) + Cloudflare R2 storage + Cloudflare Worker API routes

import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { D1Database } from './urbanprocures advanced/database/d1Database.ts';
import { R2StorageEngine } from './urbanprocures advanced/workers/r2Storage.ts';
import { AuthHelper } from './urbanprocures advanced/workers/authHelper.ts';
import { IdentityMaskingService } from './urbanprocures advanced/workers/identityMasking.ts';
import { ServiceChargeEngine } from './urbanprocures advanced/workers/serviceChargeEngine.ts';
import { AuditService } from './urbanprocures advanced/workers/auditService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Cloudflare D1 Relational Engine & R2 Object Storage
D1Database.getDb();
R2StorageEngine.init();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth Context Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'contractor' | 'vendor' | 'admin' | 'operations';
    contractorId?: string;
    vendorId?: string;
  };
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const session = D1Database.queryFirst<{ user_id: string; role: any; expires_at: string }>(
      'SELECT user_id, role, expires_at FROM auth_sessions WHERE token = ?',
      [token]
    );

    if (session && new Date(session.expires_at) > new Date()) {
      const user = D1Database.queryFirst<{ id: string; email: string; role: any; status: string }>(
        'SELECT id, email, role, status FROM users WHERE id = ?',
        [session.user_id]
      );

      if (user && user.status === 'active') {
        let contractorId: string | undefined;
        let vendorId: string | undefined;

        if (user.role === 'contractor') {
          const c = D1Database.queryFirst<{ id: string }>('SELECT id FROM contractors WHERE user_id = ?', [user.id]);
          contractorId = c?.id;
        } else if (user.role === 'vendor') {
          const v = D1Database.queryFirst<{ id: string }>('SELECT id FROM vendors WHERE user_id = ?', [user.id]);
          vendorId = v?.id;
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          contractorId,
          vendorId,
        };
      }
    }
  } catch (err) {
    console.error('Session verification error:', err);
  }
  next();
};

app.use(authMiddleware);

// Record formatters ensuring client gets both camelCase and database snake_case
function formatRfqRecord(rfq: any, items: any[] = [], documents: any[] = [], extra: any = {}) {
  const formattedItems = items.map((it: any) => ({
    ...it,
    id: it.id,
    rfqId: it.rfq_id || it.rfqId,
    itemNumber: it.item_number ?? it.itemNumber,
    description: it.description,
    quantity: it.quantity,
    unit: it.unit,
    specifications: it.specifications || '',
  }));

  const formattedDocuments = documents.map((doc: any) => ({
    ...doc,
    id: doc.id,
    rfqId: doc.rfq_id || doc.rfqId,
    publicQuoteId: doc.public_quote_id || doc.publicQuoteId,
    quotationId: doc.quotation_id || doc.quotationId,
    fileName: doc.file_name || doc.fileName,
    fileType: doc.file_type || doc.fileType,
    fileSizeBytes: doc.file_size_bytes || doc.fileSizeBytes,
    r2ObjectKey: doc.r2_object_key || doc.r2ObjectKey,
    documentPurpose: doc.document_purpose || doc.documentPurpose,
    sha256Hash: doc.sha256_hash || doc.sha256Hash,
    createdAt: doc.created_at || doc.createdAt,
  }));

  return {
    ...rfq,
    id: rfq.id,
    referenceCode: rfq.reference_code || rfq.referenceCode,
    contractorId: rfq.contractor_id || rfq.contractorId,
    title: rfq.title,
    category: rfq.category,
    projectName: rfq.project_name || rfq.projectName,
    locationEmirate: rfq.location_emirate || rfq.locationEmirate,
    submissionDeadline: rfq.submission_deadline || rfq.submissionDeadline,
    targetCompletionDate: rfq.target_completion_date || rfq.targetCompletionDate,
    scopeDescription: rfq.scope_description || rfq.scopeDescription,
    estimatedBudgetAed: rfq.estimated_budget_aed ?? rfq.estimatedBudgetAed,
    status: rfq.status,
    createdAt: rfq.created_at || rfq.createdAt,
    publishedAt: rfq.published_at || rfq.publishedAt,
    awardedAt: rfq.awarded_at || rfq.awardedAt,
    items: formattedItems,
    documents: formattedDocuments,
    ...extra,
  };
}

function formatQuotationRecord(q: any, items: any[] = [], extra: any = {}) {
  const formattedItems = items.map((it: any) => ({
    ...it,
    id: it.id,
    quotationId: it.quotation_id || it.quotationId,
    rfqItemId: it.rfq_item_id || it.rfqItemId,
    unitRateAed: it.unit_rate_aed ?? it.unitRateAed,
    totalPriceAed: it.total_price_aed ?? it.totalPriceAed,
    remarks: it.remarks || '',
  }));

  return {
    ...q,
    id: q.id,
    referenceCode: q.reference_code || q.referenceCode,
    rfqId: q.rfq_id || q.rfqId,
    vendorId: q.vendor_id || q.vendorId,
    totalAmountAed: q.total_amount_aed ?? q.totalAmountAed,
    leadTimeDays: q.lead_time_days ?? q.leadTimeDays,
    validityDays: q.validity_days ?? q.validityDays,
    paymentTerms: q.payment_terms || q.paymentTerms,
    notes: q.notes || '',
    status: q.status,
    submittedAt: q.submitted_at || q.submittedAt,
    items: formattedItems,
    ...extra,
  };
}

// ==========================================
// 1. AUTHENTICATION & SESSION ENDPOINTS
// ==========================================

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = D1Database.queryFirst<{ id: string; email: string; password_hash: string; salt: string; role: string; status: string }>(
    'SELECT id, email, password_hash, salt, role, status FROM users WHERE email = ?',
    [email.trim().toLowerCase()]
  );

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'Account suspended. Please contact Urban Procures administration.' });
  }

  const isValid = AuthHelper.verifyPassword(password, user.salt, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Create persistent session in D1
  const token = AuthHelper.generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  const now = new Date().toISOString();

  D1Database.execute(
    'INSERT INTO auth_sessions (token, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
    [token, user.id, user.role, expiresAt, now]
  );

  // Fetch role-specific profile
  let contractorProfile = null;
  let vendorProfile = null;

  if (user.role === 'contractor') {
    contractorProfile = D1Database.queryFirst('SELECT * FROM contractors WHERE user_id = ?', [user.id]);
  } else if (user.role === 'vendor') {
    vendorProfile = D1Database.queryFirst('SELECT * FROM vendors WHERE user_id = ?', [user.id]);
  }

  // Log Audit Event
  D1Database.execute(
    'INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [`aud-${Date.now()}`, user.id, user.role, 'USER_LOGIN', 'user', user.id, JSON.stringify({ email: user.email }), req.ip || '127.0.0.1', now]
  );

  return res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role, status: user.status },
    contractor: contractorProfile,
    vendor: vendorProfile,
  });
});

// Register Contractor
app.post('/api/auth/register-contractor', (req: Request, res: Response) => {
  const { companyName, tradeLicenseNumber, emirate, address, contactPerson, contactPhone, email, password } = req.body;

  if (!companyName || !tradeLicenseNumber || !email || !password || !contactPerson || !contactPhone) {
    return res.status(400).json({ success: false, error: 'All company registration details are required' });
  }

  const existing = D1Database.queryFirst('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
  }

  const userId = `usr-cnt-${Date.now()}`;
  const orgId = `org-cnt-${Date.now()}`;
  const contractorId = `cnt-${Date.now()}`;
  const salt = AuthHelper.generateSalt();
  const passwordHash = AuthHelper.hashPassword(password, salt);
  const now = new Date().toISOString();

  // Insert User, Organization & Contractor in transaction
  D1Database.exec('BEGIN TRANSACTION;');
  try {
    D1Database.execute(
      'INSERT INTO users (id, email, password_hash, salt, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, email.trim().toLowerCase(), passwordHash, salt, 'contractor', 'active', now, now]
    );

    D1Database.execute(
      'INSERT INTO organizations (id, name, org_type, trade_license_number, emirate, address, contact_person, contact_phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orgId, companyName.trim(), 'contractor', tradeLicenseNumber.trim(), emirate || 'Dubai', address || `${emirate || 'Dubai'}, UAE`, contactPerson.trim(), contactPhone.trim(), now]
    );

    D1Database.execute(
      'INSERT INTO contractors (id, user_id, organization_id, company_name, trade_license_number, trade_license_expiry, emirate, address, contact_person, contact_phone, verified_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [contractorId, userId, orgId, companyName.trim(), tradeLicenseNumber.trim(), null, emirate || 'Dubai', address || `${emirate || 'Dubai'}, UAE`, contactPerson.trim(), contactPhone.trim(), now, now]
    );

    // Create session token
    const token = AuthHelper.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    D1Database.execute(
      'INSERT INTO auth_sessions (token, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [token, userId, 'contractor', expiresAt, now]
    );

    // Audit log
    D1Database.execute(
      'INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`aud-${Date.now()}`, userId, 'contractor', 'CONTRACTOR_REGISTERED', 'contractor', contractorId, JSON.stringify({ companyName }), req.ip || '127.0.0.1', now]
    );

    D1Database.exec('COMMIT;');

    const contractorProfile = D1Database.queryFirst('SELECT * FROM contractors WHERE id = ?', [contractorId]);

    return res.json({
      success: true,
      token,
      user: { id: userId, email, role: 'contractor', status: 'active' },
      contractor: contractorProfile,
    });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// Register Vendor
app.post('/api/auth/register-vendor', (req: Request, res: Response) => {
  const { companyName, tradeLicenseNumber, tradeCategories, emiratesServiced, contactPerson, contactPhone, email, password } = req.body;

  if (!companyName || !tradeLicenseNumber || !email || !password || !contactPerson || !contactPhone) {
    return res.status(400).json({ success: false, error: 'All vendor organization details are required' });
  }

  const existing = D1Database.queryFirst('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
  }

  const userId = `usr-vnd-${Date.now()}`;
  const orgId = `org-vnd-${Date.now()}`;
  const vendorId = `vnd-${Date.now()}`;
  const salt = AuthHelper.generateSalt();
  const passwordHash = AuthHelper.hashPassword(password, salt);
  const now = new Date().toISOString();

  const categories = Array.isArray(tradeCategories) ? tradeCategories : ['Joinery & Carpentry'];
  const emirates = Array.isArray(emiratesServiced) ? emiratesServiced : ['Dubai'];

  D1Database.exec('BEGIN TRANSACTION;');
  try {
    D1Database.execute(
      'INSERT INTO users (id, email, password_hash, salt, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, email.trim().toLowerCase(), passwordHash, salt, 'vendor', 'active', now, now]
    );

    D1Database.execute(
      'INSERT INTO organizations (id, name, org_type, trade_license_number, emirate, address, contact_person, contact_phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orgId, companyName.trim(), 'vendor', tradeLicenseNumber.trim(), emirates[0] || 'Dubai', `${emirates[0] || 'Dubai'}, UAE`, contactPerson.trim(), contactPhone.trim(), now]
    );

    D1Database.execute(
      'INSERT INTO vendors (id, user_id, organization_id, company_name, trade_license_number, trade_categories, emirates_serviced, verification_status, contact_person, contact_phone, terms_accepted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [vendorId, userId, orgId, companyName.trim(), tradeLicenseNumber.trim(), JSON.stringify(categories), JSON.stringify(emirates), 'verified', contactPerson.trim(), contactPhone.trim(), now, now]
    );

    // Insert normalized categories
    for (const cat of categories) {
      D1Database.execute(
        'INSERT INTO vendor_categories (id, vendor_id, category_name, created_at) VALUES (?, ?, ?, ?)',
        [`vc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, vendorId, cat, now]
      );
    }

    // Insert terms acceptance
    D1Database.execute(
      'INSERT INTO terms_acceptances (id, vendor_id, user_id, terms_version, accepted_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`ta-${Date.now()}`, vendorId, userId, 'v2026.1', now, req.ip || '127.0.0.1', req.headers['user-agent'] || 'Web Client']
    );

    // Create session token
    const token = AuthHelper.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    D1Database.execute(
      'INSERT INTO auth_sessions (token, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [token, userId, 'vendor', expiresAt, now]
    );

    // Audit log
    D1Database.execute(
      'INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`aud-${Date.now()}`, userId, 'vendor', 'VENDOR_REGISTERED', 'vendor', vendorId, JSON.stringify({ companyName, categories }), req.ip || '127.0.0.1', now]
    );

    D1Database.exec('COMMIT;');

    const vendorProfile = D1Database.queryFirst('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (vendorProfile && typeof vendorProfile.trade_categories === 'string') {
      try {
        vendorProfile.trade_categories = JSON.parse(vendorProfile.trade_categories);
      } catch {}
    }

    return res.json({
      success: true,
      token,
      user: { id: userId, email, role: 'vendor', status: 'active' },
      vendor: vendorProfile,
    });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Vendor registration failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    D1Database.execute('DELETE FROM auth_sessions WHERE token = ?', [token]);
  }
  return res.json({ success: true });
});

// Get Current User Session Info
app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ authenticated: false });
  }

  let contractorProfile = null;
  let vendorProfile = null;

  if (req.user.role === 'contractor') {
    contractorProfile = D1Database.queryFirst('SELECT * FROM contractors WHERE user_id = ?', [req.user.id]);
  } else if (req.user.role === 'vendor') {
    vendorProfile = D1Database.queryFirst('SELECT * FROM vendors WHERE user_id = ?', [req.user.id]);
    if (vendorProfile && typeof vendorProfile.trade_categories === 'string') {
      try {
        vendorProfile.tradeCategories = JSON.parse(vendorProfile.trade_categories);
      } catch {}
    }
  }

  return res.json({
    authenticated: true,
    user: req.user,
    contractor: contractorProfile,
    vendor: vendorProfile,
  });
});

// ==========================================
// 2. GET A QUOTE (NO ACCOUNT REQUIRED)
// ==========================================

app.post('/api/quotes/public', async (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    propertyType,
    locationEmirate,
    locationCommunity,
    workCategory,
    description,
    budgetBracket,
    siteVisitRequested,
    attachments,
  } = req.body;

  if (!customerName || !customerPhone || !customerEmail || !description) {
    return res.status(400).json({ success: false, error: 'Name, contact phone, email and description are required' });
  }

  const id = `gaq-${Date.now()}`;
  const referenceCode = `GAQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const status = siteVisitRequested ? 'site_visit_scheduled' : 'received';

  D1Database.exec('BEGIN TRANSACTION;');
  try {
    D1Database.execute(
      `INSERT INTO get_a_quote_requests (
        id, reference_code, customer_name, customer_phone, customer_email,
        property_type, location_emirate, location_community, work_category,
        description, budget_bracket, site_visit_requested, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        referenceCode,
        customerName.trim(),
        customerPhone.trim(),
        customerEmail.trim(),
        propertyType || 'villa',
        locationEmirate || 'Dubai',
        locationCommunity || 'Dubai Area',
        workCategory || 'Interior Fit-Out',
        description.trim(),
        budgetBracket || 'AED 20,000 - 50,000',
        siteVisitRequested ? 1 : 0,
        status,
        now,
      ]
    );

    // If site visit requested, record site visit item
    if (siteVisitRequested) {
      D1Database.execute(
        `INSERT INTO site_visits (id, request_id, scheduled_date, fee_aed, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`sv-${Date.now()}`, id, null, 100.0, 'pending', 'AED 100 in-person dimension measurement visit requested', now]
      );
    }

    // Handle document attachments in Cloudflare R2
    const savedDocs = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const r2Key = att.r2ObjectKey || R2StorageEngine.generateKey('quotes', id, att.fileName || 'attachment.pdf');

        if (att.dataUrl) {
          const base64Data = att.dataUrl.split(',')[1] || att.dataUrl;
          await R2StorageEngine.put(r2Key, base64Data, att.fileType || 'application/pdf');
        }

        D1Database.execute(
          `INSERT INTO rfq_documents (
            id, rfq_id, public_quote_id, quotation_id, uploader_user_id,
            file_name, file_type, file_size_bytes, r2_object_key, document_purpose, sha256_hash, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            docId,
            null,
            id,
            null,
            null,
            att.fileName || 'attachment.pdf',
            att.fileType || 'application/pdf',
            att.fileSizeBytes || 1024,
            r2Key,
            att.documentPurpose || 'drawing',
            null,
            now,
          ]
        );
        savedDocs.push({ id: docId, fileName: att.fileName, r2ObjectKey: r2Key });
      }
    }

    // Audit log
    D1Database.execute(
      `INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${Date.now()}`, 'public_customer', 'public', 'PUBLIC_QUOTE_CREATED', 'get_a_quote', id, JSON.stringify({ referenceCode, propertyType, siteVisitRequested }), req.ip || '127.0.0.1', now]
    );

    D1Database.exec('COMMIT;');

    const created = D1Database.queryFirst('SELECT * FROM get_a_quote_requests WHERE id = ?', [id]);
    return res.json({
      success: true,
      data: {
        ...created,
        siteVisitRequested: Boolean(created.site_visit_requested),
        attachments: savedDocs,
      },
    });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Failed to submit quote request' });
  }
});

// ==========================================
// 3. CONTRACTOR WORKFLOW & RFQs
// ==========================================

// Get RFQs for Contractor
app.get('/api/contractor/rfqs', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'contractor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Contractor access required' });
  }

  const contractorId = req.user.contractorId || 'cnt-01';
  const rfqs = D1Database.queryAll('SELECT * FROM rfqs WHERE contractor_id = ? ORDER BY created_at DESC', [contractorId]);

  const result = rfqs.map((rfq) => {
    const items = D1Database.queryAll('SELECT * FROM rfq_items WHERE rfq_id = ? ORDER BY item_number ASC', [rfq.id]);
    const documents = D1Database.queryAll('SELECT * FROM rfq_documents WHERE rfq_id = ?', [rfq.id]);
    const quotesCount = D1Database.queryFirst<{ count: number }>(
      'SELECT COUNT(*) as count FROM vendor_quotes WHERE rfq_id = ?',
      [rfq.id]
    )?.count || 0;
    return formatRfqRecord(rfq, items, documents, { quotesCount });
  });

  return res.json({ success: true, data: result });
});

// Create RFQ
app.post('/api/contractor/rfqs', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'contractor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Contractor access required' });
  }

  const {
    title,
    category,
    projectName,
    locationEmirate,
    submissionDeadline,
    targetCompletionDate,
    scopeDescription,
    estimatedBudgetAed,
    items,
    documents,
    status = 'submitted',
  } = req.body;

  if (!title || !projectName || !scopeDescription) {
    return res.status(400).json({ success: false, error: 'Title, project name, and scope description are required' });
  }

  const contractorId = req.user.contractorId || 'cnt-01';
  const id = `rfq-${Date.now()}`;
  const referenceCode = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  D1Database.exec('BEGIN TRANSACTION;');
  try {
    D1Database.execute(
      `INSERT INTO rfqs (
        id, reference_code, contractor_id, title, category, project_name,
        location_emirate, submission_deadline, target_completion_date,
        scope_description, estimated_budget_aed, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        referenceCode,
        contractorId,
        title.trim(),
        category || 'Joinery & Carpentry',
        projectName.trim(),
        locationEmirate || 'Dubai',
        submissionDeadline || '2026-11-20',
        targetCompletionDate || '2026-12-30',
        scopeDescription.trim(),
        estimatedBudgetAed || 100000.0,
        status,
        now,
      ]
    );

    // Insert BoQ Items
    if (Array.isArray(items)) {
      items.forEach((item: any, idx: number) => {
        D1Database.execute(
          `INSERT INTO rfq_items (id, rfq_id, item_number, description, quantity, unit, specifications)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `item-${Date.now()}-${idx}`,
            id,
            idx + 1,
            item.description || `Item #${idx + 1}`,
            item.quantity || 1,
            item.unit || 'sqm',
            item.specifications || '',
          ]
        );
      });
    }

    // Insert and store Documents in Cloudflare R2
    if (Array.isArray(documents)) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const docId = `doc-${Date.now()}-${i}`;
        const r2Key = doc.r2ObjectKey || R2StorageEngine.generateKey('rfq', id, doc.fileName || `doc_${i}.pdf`);

        if (doc.dataUrl) {
          const base64Data = doc.dataUrl.split(',')[1] || doc.dataUrl;
          await R2StorageEngine.put(r2Key, base64Data, doc.fileType || 'application/pdf');
        }

        D1Database.execute(
          `INSERT INTO rfq_documents (
            id, rfq_id, public_quote_id, quotation_id, uploader_user_id,
            file_name, file_type, file_size_bytes, r2_object_key, document_purpose, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            docId,
            id,
            null,
            null,
            req.user.id,
            doc.fileName || 'document.pdf',
            doc.fileType || 'application/pdf',
            doc.fileSizeBytes || 1024,
            r2Key,
            doc.documentPurpose || 'drawing',
            now,
          ]
        );
      }
    }

    // Audit log
    D1Database.execute(
      `INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${Date.now()}`, req.user.id, 'contractor', 'RFQ_CREATED', 'rfq', id, JSON.stringify({ referenceCode, title }), req.ip || '127.0.0.1', now]
    );

    D1Database.exec('COMMIT;');

    const createdRfq = D1Database.queryFirst('SELECT * FROM rfqs WHERE id = ?', [id]);
    const boqItems = D1Database.queryAll('SELECT * FROM rfq_items WHERE rfq_id = ? ORDER BY item_number ASC', [id]);
    const rfqDocs = D1Database.queryAll('SELECT * FROM rfq_documents WHERE rfq_id = ?', [id]);

    return res.json({
      success: true,
      data: formatRfqRecord(createdRfq, boqItems, rfqDocs, { quotesCount: 0 }),
    });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Failed to create RFQ' });
  }
});

// View Quotations for RFQ with STRICT SERVER-SIDE IDENTITY MASKING
app.get('/api/contractor/rfqs/:id/quotations', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'contractor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Contractor access required' });
  }

  const rfqId = req.params.id;
  const quotes = D1Database.queryAll('SELECT * FROM vendor_quotes WHERE rfq_id = ?', [rfqId]);
  const award = D1Database.queryFirst('SELECT * FROM awards WHERE rfq_id = ?', [rfqId]);

  // Apply server-side identity masking: vendor details must NOT leak before award
  const maskedQuotes = quotes.map((q) => {
    const vendor = D1Database.queryFirst<{ id: string; company_name: string; contact_person: string; contact_phone: string; trade_license_number: string }>(
      'SELECT id, company_name, contact_person, contact_phone, trade_license_number FROM vendors WHERE id = ?',
      [q.vendor_id]
    );

    const isWinner = award && award.quotation_id === q.id;
    const items = D1Database.queryAll('SELECT * FROM quote_items WHERE quotation_id = ?', [q.id]);

    if (!isWinner) {
      // PRE-AWARD: Strictly mask vendor identity
      return {
        id: q.id,
        referenceCode: q.reference_code,
        rfqId: q.rfq_id,
        vendorId: q.vendor_id,
        vendorDisplayName: IdentityMaskingService.maskVendorIdentity(q.vendor_id),
        totalAmountAed: q.total_amount_aed,
        leadTimeDays: q.lead_time_days,
        validityDays: q.validity_days,
        paymentTerms: q.payment_terms,
        notes: (q.notes || '').replace(/\b(call|contact|email|phone|\+971|05\d|www\.)\S*/gi, '[REDACTED]'),
        status: q.status,
        submittedAt: q.submitted_at,
        items,
        isWinner: false,
      };
    } else {
      // POST-AWARD: Reveal vendor contact information to the contractor
      return {
        id: q.id,
        referenceCode: q.reference_code,
        rfqId: q.rfq_id,
        vendorId: q.vendor_id,
        vendorDisplayName: vendor?.company_name || 'Winning Vendor',
        vendorCompany: vendor?.company_name,
        vendorContact: {
          contactPerson: vendor?.contact_person,
          contactPhone: vendor?.contact_phone,
          tradeLicenseNumber: vendor?.trade_license_number,
        },
        totalAmountAed: q.total_amount_aed,
        leadTimeDays: q.lead_time_days,
        validityDays: q.validity_days,
        paymentTerms: q.payment_terms,
        notes: q.notes,
        status: 'awarded',
        submittedAt: q.submitted_at,
        items,
        isWinner: true,
      };
    }
  });

  return res.json({ success: true, data: maskedQuotes, award });
});

// Confirm Contract Award (Calculates 2.5% or AED 500 service charge & unmasks identities)
app.post('/api/contractor/rfqs/:id/award', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'contractor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Contractor access required' });
  }

  const rfqId = req.params.id;
  const { quotationId } = req.body;

  if (!quotationId) {
    return res.status(400).json({ success: false, error: 'quotationId is required' });
  }

  const rfq = D1Database.queryFirst('SELECT * FROM rfqs WHERE id = ?', [rfqId]);
  const quote = D1Database.queryFirst('SELECT * FROM vendor_quotes WHERE id = ? AND rfq_id = ?', [quotationId, rfqId]);

  if (!rfq || !quote) {
    return res.status(404).json({ success: false, error: 'RFQ or Quotation not found' });
  }

  const existingAward = D1Database.queryFirst('SELECT id FROM awards WHERE rfq_id = ?', [rfqId]);
  if (existingAward) {
    return res.status(400).json({ success: false, error: 'This RFQ has already been awarded' });
  }

  // Calculate platform service charge (2.5% or AED 500 minimum)
  const calc = ServiceChargeEngine.calculate({
    contractAmountAed: quote.total_amount_aed,
  });

  const awardId = `awd-${Date.now()}`;
  const serviceChargeId = `sc-${Date.now()}`;
  const now = new Date().toISOString();

  D1Database.exec('BEGIN TRANSACTION;');
  try {
    // 1. Insert Award Record
    D1Database.execute(
      `INSERT INTO awards (
        id, rfq_id, quotation_id, contractor_id, vendor_id,
        contract_amount_aed, calculated_service_charge_aed, awarded_at, contact_details_released_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [awardId, rfqId, quotationId, rfq.contractor_id, quote.vendor_id, quote.total_amount_aed, calc.totalServiceChargeAed, now, now]
    );

    // 2. Insert Service Charge Record
    D1Database.execute(
      `INSERT INTO service_charges (
        id, award_id, rfq_id, vendor_id, contract_amount_aed,
        percentage, calculated_amount_aed, minimum_charge_applied,
        manpower_rule_applied, site_visit_fee_included, total_charge_aed, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceChargeId,
        awardId,
        rfqId,
        quote.vendor_id,
        quote.total_amount_aed,
        calc.appliedPercentage,
        calc.calculatedServiceChargeAed,
        calc.minimumChargeEnforced ? 1 : 0,
        0,
        0.0,
        calc.totalServiceChargeAed,
        'pending',
        now,
      ]
    );

    // 3. Update RFQ status to awarded
    D1Database.execute('UPDATE rfqs SET status = ?, awarded_at = ? WHERE id = ?', ['awarded', now, rfqId]);

    // 4. Update winning quote to awarded, others to declined
    D1Database.execute('UPDATE vendor_quotes SET status = ? WHERE id = ?', ['awarded', quotationId]);
    D1Database.execute('UPDATE vendor_quotes SET status = ? WHERE rfq_id = ? AND id != ?', ['declined', rfqId, quotationId]);

    // 5. Immutable Audit Log
    D1Database.execute(
      `INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        req.user.id,
        'contractor',
        'RFQ_AWARDED',
        'rfq',
        rfqId,
        JSON.stringify({ quotationId, vendorId: quote.vendor_id, amountAed: quote.total_amount_aed, serviceChargeAed: calc.totalServiceChargeAed }),
        req.ip || '127.0.0.1',
        now,
      ]
    );

    D1Database.exec('COMMIT;');

    const awardRecord = D1Database.queryFirst('SELECT * FROM awards WHERE id = ?', [awardId]);
    return res.json({ success: true, award: awardRecord, serviceCharge: calc });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Award confirmation failed' });
  }
});

// ==========================================
// 4. VENDOR WORKFLOW & BIDS
// ==========================================

// Discover Matching RFQs for Vendor (with server-side contractor masking)
app.get('/api/vendor/rfqs', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Vendor access required' });
  }

  const vendorId = req.user.vendorId || 'vnd-01';
  const vendor = D1Database.queryFirst('SELECT * FROM vendors WHERE id = ?', [vendorId]);

  let vendorCategories: string[] = [];
  if (vendor && vendor.trade_categories) {
    try {
      vendorCategories = JSON.parse(vendor.trade_categories);
    } catch {}
  }

  // Eligible statuses
  const rfqs = D1Database.queryAll(
    "SELECT * FROM rfqs WHERE status IN ('reviewed_published', 'receiving_quotations', 'under_evaluation', 'awarded') ORDER BY created_at DESC"
  );

  const awardsForVendor = D1Database.queryAll('SELECT rfq_id FROM awards WHERE vendor_id = ?', [vendorId]).map((a) => a.rfq_id);

  // Apply server-side masking
  const sanitizedRfqs = rfqs.map((rfq) => {
    const isWinner = awardsForVendor.includes(rfq.id);
    const contractor = D1Database.queryFirst<{ id: string; company_name: string; contact_person: string; contact_phone: string; address: string; emirate: string }>(
      'SELECT id, company_name, contact_person, contact_phone, address, emirate FROM contractors WHERE id = ?',
      [rfq.contractor_id]
    );

    const items = D1Database.queryAll('SELECT * FROM rfq_items WHERE rfq_id = ? ORDER BY item_number ASC', [rfq.id]);
    const documents = D1Database.queryAll('SELECT * FROM rfq_documents WHERE rfq_id = ?', [rfq.id]);

    let contractorDisplayName = IdentityMaskingService.maskContractorIdentity(rfq.reference_code);
    let contractorCompany = undefined;
    let contractorContact = undefined;

    if (isWinner && contractor) {
      contractorDisplayName = contractor.company_name;
      contractorCompany = contractor.company_name;
      contractorContact = {
        contactPerson: contractor.contact_person,
        contactPhone: contractor.contact_phone,
        address: `${contractor.address}, ${contractor.emirate}`,
      };
    }

    const matchesCategory =
      vendorCategories.length === 0 ||
      vendorCategories.some((cat) => rfq.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(rfq.category.toLowerCase()));

    return formatRfqRecord(rfq, items, documents, {
      contractorDisplayName,
      contractorCompany,
      contractorContact,
      matchesCategory,
      isWinner,
    });
  });

  return res.json({ success: true, data: sanitizedRfqs });
});

// Submit Quotation
app.post('/api/vendor/rfqs/:id/quote', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Vendor access required' });
  }

  const rfqId = req.params.id;
  const vendorId = req.user.vendorId || 'vnd-01';
  const { totalAmountAed, leadTimeDays, validityDays, paymentTerms, notes, items } = req.body;

  if (!totalAmountAed || totalAmountAed <= 0) {
    return res.status(400).json({ success: false, error: 'Total quotation amount must be greater than zero' });
  }

  const rfq = D1Database.queryFirst('SELECT * FROM rfqs WHERE id = ?', [rfqId]);
  if (!rfq) {
    return res.status(404).json({ success: false, error: 'RFQ not found' });
  }

  const quoteId = `qte-${Date.now()}`;
  const referenceCode = `QTE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  D1Database.exec('BEGIN TRANSACTION;');
  try {
    D1Database.execute(
      `INSERT INTO vendor_quotes (
        id, reference_code, rfq_id, vendor_id, total_amount_aed,
        lead_time_days, validity_days, payment_terms, notes, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteId,
        referenceCode,
        rfqId,
        vendorId,
        totalAmountAed,
        leadTimeDays || 30,
        validityDays || 30,
        paymentTerms || 'Standard Payment Terms',
        notes || '',
        'submitted',
        now,
      ]
    );

    if (Array.isArray(items)) {
      items.forEach((item: any, idx: number) => {
        D1Database.execute(
          `INSERT INTO quote_items (id, quotation_id, rfq_item_id, unit_rate_aed, total_price_aed, remarks)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`qi-${Date.now()}-${idx}`, quoteId, item.rfqItemId, item.unitRateAed || 0, item.totalPriceAed || 0, item.remarks || '']
        );
      });
    }

    if (rfq.status === 'reviewed_published') {
      D1Database.execute('UPDATE rfqs SET status = ? WHERE id = ?', ['receiving_quotations', rfqId]);
    }

    // Audit log
    D1Database.execute(
      `INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`aud-${Date.now()}`, req.user.id, 'vendor', 'QUOTATION_SUBMITTED', 'quotation', quoteId, JSON.stringify({ referenceCode, rfqId, totalAmountAed }), req.ip || '127.0.0.1', now]
    );

    D1Database.exec('COMMIT;');

    const createdQuote = D1Database.queryFirst('SELECT * FROM vendor_quotes WHERE id = ?', [quoteId]);
    return res.json({ success: true, data: createdQuote });
  } catch (err: any) {
    D1Database.exec('ROLLBACK;');
    return res.status(500).json({ success: false, error: err.message || 'Quotation submission failed' });
  }
});

// Get Vendor's Own Submitted Quotes with Award Status & Unmasked Contractor Details
app.get('/api/vendor/my-quotes', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Vendor access required' });
  }

  const vendorId = req.user.vendorId || 'vnd-01';
  const quotes = D1Database.queryAll('SELECT * FROM vendor_quotes WHERE vendor_id = ? ORDER BY submitted_at DESC', [vendorId]);

  const result = quotes.map((q) => {
    const rfq = D1Database.queryFirst('SELECT * FROM rfqs WHERE id = ?', [q.rfq_id]);
    const award = D1Database.queryFirst('SELECT * FROM awards WHERE quotation_id = ?', [q.id]);
    const isAwarded = !!award;

    let contractorContact = null;
    if (isAwarded && rfq) {
      const c = D1Database.queryFirst<{ company_name: string; trade_license_number: string; contact_person: string; contact_phone: string; address: string; emirate: string }>(
        'SELECT company_name, trade_license_number, contact_person, contact_phone, address, emirate FROM contractors WHERE id = ?',
        [rfq.contractor_id]
      );
      if (c) {
        contractorContact = {
          companyName: c.company_name,
          tradeLicenseNumber: c.trade_license_number,
          contactPerson: c.contact_person,
          contactPhone: c.contact_phone,
          address: `${c.address}, ${c.emirate}`,
        };
      }
    }

    return {
      ...q,
      rfqTitle: rfq?.title,
      isAwarded,
      contractorContact,
    };
  });

  return res.json({ success: true, data: result });
});

// Accept Vendor Terms & Conditions (Click-Wrap)
app.post('/api/vendor/terms/accept', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Vendor access required' });
  }

  const vendorId = req.user.vendorId || 'vnd-01';
  const now = new Date().toISOString();

  D1Database.execute(
    'INSERT INTO terms_acceptances (id, vendor_id, user_id, terms_version, accepted_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [`ta-${Date.now()}`, vendorId, req.user.id, 'v2026.1', now, req.ip || '127.0.0.1', req.headers['user-agent'] || 'Web Client']
  );

  D1Database.execute('UPDATE vendors SET terms_accepted_at = ? WHERE id = ?', [now, vendorId]);

  return res.json({ success: true, acceptedAt: now });
});

// ==========================================
// 5. ADMIN OPERATIONS CONSOLE
// ==========================================

// Get All Public Quote Requests
app.get('/api/admin/public-quotes', (req: Request, res: Response) => {
  const requests = D1Database.queryAll('SELECT * FROM get_a_quote_requests ORDER BY created_at DESC');
  const result = requests.map((r) => {
    const attachments = D1Database.queryAll('SELECT * FROM rfq_documents WHERE public_quote_id = ?', [r.id]);
    return {
      ...r,
      id: r.id,
      referenceCode: r.reference_code,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      propertyType: r.property_type,
      locationEmirate: r.location_emirate,
      locationCommunity: r.location_community,
      workCategory: r.work_category,
      description: r.description,
      budgetBracket: r.budget_bracket,
      siteVisitRequested: Boolean(r.site_visit_requested),
      status: r.status,
      createdAt: r.created_at,
      attachments: attachments.map(d => ({
        ...d,
        id: d.id,
        publicQuoteId: d.public_quote_id,
        fileName: d.file_name,
        fileType: d.file_type,
        fileSizeBytes: d.file_size_bytes,
        r2ObjectKey: d.r2_object_key,
        documentPurpose: d.document_purpose,
        createdAt: d.created_at,
      })),
    };
  });
  return res.json({ success: true, data: result });
});

// Update Public Quote Status
app.patch('/api/admin/public-quotes/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status required' });

  D1Database.execute('UPDATE get_a_quote_requests SET status = ? WHERE id = ?', [status, req.params.id]);
  return res.json({ success: true, status });
});

// Get All RFQs for Admin Review
app.get('/api/admin/rfqs', (req: Request, res: Response) => {
  const rfqs = D1Database.queryAll('SELECT * FROM rfqs ORDER BY created_at DESC');
  const result = rfqs.map((rfq) => {
    const contractor = D1Database.queryFirst('SELECT * FROM contractors WHERE id = ?', [rfq.contractor_id]);
    const items = D1Database.queryAll('SELECT * FROM rfq_items WHERE rfq_id = ? ORDER BY item_number ASC', [rfq.id]);
    const documents = D1Database.queryAll('SELECT * FROM rfq_documents WHERE rfq_id = ?', [rfq.id]);
    return formatRfqRecord(rfq, items, documents, { contractor });
  });
  return res.json({ success: true, data: result });
});

// Approve & Publish RFQ to Verified Vendor Network
app.post('/api/admin/rfqs/:id/publish', (req: Request, res: Response) => {
  const rfqId = req.params.id;
  const now = new Date().toISOString();

  D1Database.execute(
    "UPDATE rfqs SET status = 'reviewed_published', published_at = ? WHERE id = ?",
    [now, rfqId]
  );

  D1Database.execute(
    `INSERT INTO audit_logs (id, actor_user_id, actor_role, action_type, resource_type, resource_id, payload_json, ip_address, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [`aud-${Date.now()}`, 'admin', 'admin', 'RFQ_PUBLISHED', 'rfq', rfqId, JSON.stringify({ status: 'reviewed_published' }), req.ip || '127.0.0.1', now]
  );

  return res.json({ success: true, status: 'reviewed_published' });
});

// Get All Users
app.get('/api/admin/users', (req: Request, res: Response) => {
  const users = D1Database.queryAll('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
  return res.json({ success: true, data: users });
});

// Toggle User Status
app.patch('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  D1Database.execute('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
  return res.json({ success: true, status });
});

// Get All Contractors
app.get('/api/admin/contractors', (req: Request, res: Response) => {
  const contractors = D1Database.queryAll('SELECT * FROM contractors ORDER BY created_at DESC');
  return res.json({ success: true, data: contractors });
});

// Get All Vendors
app.get('/api/admin/vendors', (req: Request, res: Response) => {
  const vendors = D1Database.queryAll('SELECT * FROM vendors ORDER BY created_at DESC');
  const result = vendors.map((v) => {
    let tradeCategories: string[] = [];
    if (v.trade_categories) {
      try {
        tradeCategories = JSON.parse(v.trade_categories);
      } catch {}
    }
    return {
      ...v,
      tradeCategories,
    };
  });
  return res.json({ success: true, data: result });
});

// Get All Registered Documents with R2 Metadata
app.get('/api/admin/documents', (req: Request, res: Response) => {
  const documents = D1Database.queryAll('SELECT * FROM rfq_documents ORDER BY created_at DESC');
  const result = documents.map((doc) => ({
    id: doc.id,
    rfqId: doc.rfq_id,
    publicQuoteId: doc.public_quote_id,
    fileName: doc.file_name,
    fileType: doc.file_type,
    fileSizeBytes: doc.file_size_bytes,
    r2ObjectKey: doc.r2_object_key,
    documentPurpose: doc.document_purpose,
    sha256Hash: doc.sha256_hash,
    createdAt: doc.created_at,
  }));
  return res.json({ success: true, data: result });
});

// Get All Service Charges
app.get('/api/admin/service-charges', (req: Request, res: Response) => {
  const charges = D1Database.queryAll('SELECT * FROM service_charges ORDER BY created_at DESC');
  return res.json({ success: true, data: charges });
});

// Get All Audit Logs
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  const logs = D1Database.queryAll('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
  return res.json({ success: true, data: logs });
});

// Candidate Partner Invitations
app.get('/api/admin/invitations', (req: Request, res: Response) => {
  const invitations = D1Database.queryAll('SELECT * FROM invitations ORDER BY created_at DESC');
  return res.json({ success: true, data: invitations });
});

app.post('/api/admin/invitations', (req: Request, res: Response) => {
  const { recipientEmail, organizationName, inviteType } = req.body;
  if (!recipientEmail || !organizationName) {
    return res.status(400).json({ success: false, error: 'Email and organization name are required' });
  }

  const id = `inv-${Date.now()}`;
  const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  D1Database.execute(
    `INSERT INTO invitations (id, recipient_email, organization_name, invite_type, invitation_token, status, sent_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, recipientEmail.trim(), organizationName.trim(), inviteType || 'vendor', token, 'sent', now, now]
  );

  return res.json({ success: true, id, token, sentAt: now });
});

// ==========================================
// 6. REAL CLOUDFLARE R2 FILE ACCESS & DOWNLOAD
// ==========================================

// Stream Document for Preview (Images, PDFs, Drawings)
app.get('/api/documents/:id/view', (req: Request, res: Response) => {
  const doc = D1Database.queryFirst<{ id: string; file_name: string; file_type: string; r2_object_key: string }>(
    'SELECT * FROM rfq_documents WHERE id = ?',
    [req.params.id]
  );

  if (!doc) {
    return res.status(404).send('Document not found in Cloudflare D1 index');
  }

  const file = R2StorageEngine.get(doc.r2_object_key);
  if (!file) {
    return res.status(404).send('Document payload not found in Cloudflare R2 bucket');
  }

  res.setHeader('Content-Type', doc.file_type || file.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
  return res.send(file.buffer);
});

// Download Document from R2
app.get('/api/documents/:id/download', (req: Request, res: Response) => {
  const doc = D1Database.queryFirst<{ id: string; file_name: string; file_type: string; r2_object_key: string }>(
    'SELECT * FROM rfq_documents WHERE id = ?',
    [req.params.id]
  );

  if (!doc) {
    return res.status(404).send('Document not found in Cloudflare D1 index');
  }

  const file = R2StorageEngine.get(doc.r2_object_key);
  if (!file) {
    return res.status(404).send('Document payload not found in Cloudflare R2 bucket');
  }

  res.setHeader('Content-Type', doc.file_type || file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
  return res.send(file.buffer);
});

// Document Upload endpoint
app.post('/api/documents/upload', async (req: AuthenticatedRequest, res: Response) => {
  const { fileName, fileType, data, documentPurpose = 'drawing', rfqId, publicQuoteId } = req.body;
  if (!fileName || !data) {
    return res.status(400).json({ success: false, error: 'fileName and file data are required' });
  }

  const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const folder = rfqId ? 'rfq' : 'quotes';
  const entityId = rfqId || publicQuoteId || 'general';
  const r2Key = R2StorageEngine.generateKey(folder as any, entityId, fileName);

  const base64Content = data.includes(',') ? data.split(',')[1] : data;
  const putResult = await R2StorageEngine.put(r2Key, base64Content, fileType || 'application/octet-stream');

  const now = new Date().toISOString();
  D1Database.execute(
    `INSERT INTO rfq_documents (
      id, rfq_id, public_quote_id, quotation_id, uploader_user_id,
      file_name, file_type, file_size_bytes, r2_object_key, document_purpose, sha256_hash, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      docId,
      rfqId || null,
      publicQuoteId || null,
      null,
      req.user?.id || null,
      fileName,
      putResult.fileType,
      putResult.fileSizeBytes,
      putResult.r2ObjectKey,
      documentPurpose,
      putResult.sha256Hash,
      now,
    ]
  );

  return res.json({
    success: true,
    document: {
      id: docId,
      fileName,
      fileType: putResult.fileType,
      fileSizeBytes: putResult.fileSizeBytes,
      r2ObjectKey: putResult.r2ObjectKey,
      documentPurpose,
      sha256Hash: putResult.sha256Hash,
      createdAt: now,
    },
  });
});

// ==========================================
// 7. VITE / STATIC CLIENT MOUNTING
// ==========================================

async function startServer() {
  if (!isProduction) {
    // Vite Dev Server middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Urban Procures Advanced] Server running on port ${PORT}`);
    console.log(`[Cloudflare D1] Relational database online at urbanprocures advanced/database/urbanprocures_d1.sqlite`);
    console.log(`[Cloudflare R2] Document object store online at urbanprocures advanced/storage/r2_bucket`);
  });
}

startServer();
