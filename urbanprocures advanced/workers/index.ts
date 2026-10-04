// Urban Procures Advanced
// Cloudflare Worker Production Entry Point
// Bindings: env.DB (Cloudflare D1), env.DOCUMENTS_BUCKET (Cloudflare R2), env.SESSIONS_KV (Cloudflare KV)

import { IdentityMaskingService } from './identityMasking.ts';
import { ServiceChargeEngine } from './serviceChargeEngine.ts';
import { RFQStateMachine } from './rfqStateMachine.ts';

export interface Env {
  DB: D1Database;
  DOCUMENTS_BUCKET: R2Bucket;
  SESSIONS_KV?: KVNamespace;
  ENVIRONMENT: string;
  PLATFORM_DOMAIN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. PUBLIC GET A QUOTE (No account required)
      if (pathname === '/api/quotes/public' && method === 'POST') {
        const body = (await request.json()) as any;
        const id = `gaq-${Date.now()}`;
        const referenceCode = `GAQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();
        const status = body.siteVisitRequested ? 'site_visit_scheduled' : 'received';

        await env.DB.prepare(
          `INSERT INTO get_a_quote_requests (
            id, reference_code, customer_name, customer_phone, customer_email,
            property_type, location_emirate, location_community, work_category,
            description, budget_bracket, site_visit_requested, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            id,
            referenceCode,
            body.customerName,
            body.customerPhone,
            body.customerEmail,
            body.propertyType || 'villa',
            body.locationEmirate || 'Dubai',
            body.locationCommunity || 'Dubai Area',
            body.workCategory || 'Interior Fit-Out',
            body.description,
            body.budgetBracket || 'AED 20,000 - 50,000',
            body.siteVisitRequested ? 1 : 0,
            status,
            now
          )
          .run();

        return new Response(JSON.stringify({ success: true, referenceCode, id, status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. DOCUMENT DOWNLOAD / VIEW (From Cloudflare R2)
      if (pathname.startsWith('/api/documents/') && pathname.endsWith('/view') && method === 'GET') {
        const docId = pathname.split('/')[3];
        const doc = await env.DB.prepare('SELECT * FROM rfq_documents WHERE id = ?').bind(docId).first<any>();
        if (!doc) return new Response('Document not found in D1 index', { status: 404 });

        const r2Object = await env.DOCUMENTS_BUCKET.get(doc.r2_object_key);
        if (!r2Object) return new Response('Document payload not found in Cloudflare R2 bucket', { status: 404 });

        const headers = new Headers(corsHeaders);
        headers.set('Content-Type', doc.file_type || 'application/octet-stream');
        headers.set('Content-Disposition', `inline; filename="${doc.file_name}"`);
        return new Response(r2Object.body, { headers });
      }

      // Fallback
      return new Response(JSON.stringify({ status: 'Urban Procures Cloudflare Worker Active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
