// Urban Procures Advanced
// PARTIAL Cloudflare Worker entry point; see WORK_MODE_EXECUTION.md.
// Bindings: env.DB (Cloudflare D1), env.DOCUMENTS_BUCKET (Cloudflare R2), env.SESSIONS_KV (Cloudflare KV)

import { isIsolatedAdvancedRequest } from './isolation.ts';
import { authRoute, actorFor } from './auth.ts';
import { termsRoute, termsGate } from './terms.ts';
import { awardRoute } from './award.ts';
import { publicQuoteRoute } from './publicQuote.ts';
import { procurementRoute } from './procurement.ts';
import { operationsRoute } from './operations.ts';
import { dispatchNotifications } from './notifications.ts';
import { ServiceChargeEngine } from './serviceChargeEngine.ts';
import { RFQStateMachine } from './rfqStateMachine.ts';

export interface Env {
  EMAIL_DELIVERY_ENABLED?: string;
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_MAIL_ACCOUNT_ID?: string;
  ZOHO_MAIL_FROM_ADDRESS?: string;
  ZOHO_MAIL_API_ORIGIN?: string;
  ZOHO_ACCOUNTS_API_ORIGIN?: string;
  PUBLIC_APP_ORIGIN?: string;
  ASSETS?: Fetcher;
  DB: D1Database;
  DOCUMENTS_BUCKET: R2Bucket;
  SESSIONS_KV?: KVNamespace;
  ENVIRONMENT: string;
  PLATFORM_DOMAIN: string;
}

export default {
  async scheduled(_controller:ScheduledController,env:Env,ctx:ExecutionContext):Promise<void>{
    if(['advanced-staging','advanced-production'].includes(env.ENVIRONMENT)&&env.EMAIL_DELIVERY_ENABLED==='true'){
      ctx.waitUntil(dispatchNotifications(env).catch(()=>{}));
    }
  },
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!isIsolatedAdvancedRequest(request, env.ENVIRONMENT, env.PLATFORM_DOMAIN)) {
      return new Response(JSON.stringify({ success: false, error: 'Advanced environment isolation check failed' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const method = request.method;
    if (/^\/(test-suite|docs)(\/|$)/.test(pathname)) {
      return new Response('Page not found', {status:404, headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if(['POST','PUT','PATCH','DELETE'].includes(method)&&request.headers.has('Cookie')) {
      const origin=request.headers.get('Origin');let permitted=false;
      try{const parsed=new URL(origin||'');permitted=parsed.origin===url.origin||(env.ENVIRONMENT==='advanced-development'&&['localhost','127.0.0.1'].includes(parsed.hostname)&&['localhost','127.0.0.1'].includes(url.hostname));}catch{}
      if(!permitted)return Response.json({success:false,error:'REQUEST_ORIGIN_REJECTED'},{status:403});
    }
    try {
      const termsResponse=await termsRoute(request,env,await actorFor(request,env));
      if(termsResponse)return termsResponse;
      const authentication = await authRoute(request, env);
      if (authentication) {if(authentication.ok&&method==='POST'&&env.EMAIL_DELIVERY_ENABLED==='true')ctx.waitUntil(dispatchNotifications(env).catch(()=>{}));return authentication;}
      for(const role of ['vendor','contractor']) {
        if(pathname.startsWith(`/api/${role}/`)) {
          const rejected=await termsGate(request,env,await actorFor(request,env),role);
          if(rejected)return rejected;
        }
      }
      const operations=await operationsRoute(request.clone(),env,await actorFor(request,env));
      if(operations){if(operations.ok&&['POST','PUT','PATCH'].includes(method)&&env.EMAIL_DELIVERY_ENABLED==='true')ctx.waitUntil(dispatchNotifications(env).catch(()=>{}));return operations;}
      // 1. PUBLIC GET A QUOTE (No account required)
      const awardResponse=await awardRoute(request,env,await actorFor(request,env));
      if(awardResponse){if(awardResponse.ok&&env.EMAIL_DELIVERY_ENABLED==='true')ctx.waitUntil(dispatchNotifications(env).catch(()=>{}));return awardResponse;}
      const procurementResponse=await procurementRoute(request,env,await actorFor(request,env));
      if(procurementResponse){if(procurementResponse.ok&&['POST','PUT'].includes(method)&&env.EMAIL_DELIVERY_ENABLED==='true')ctx.waitUntil(dispatchNotifications(env).catch(()=>{}));return procurementResponse;}
      const publicResponse=await publicQuoteRoute(request,env);
      if(publicResponse)return publicResponse;

      if(!pathname.startsWith('/api/')&&env.ASSETS)return env.ASSETS.fetch(request);
      // Unimplemented routes must never look successful.
      return new Response(JSON.stringify({ success: false, error: 'API route not implemented in Advanced Worker' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: 'REQUEST_FAILED' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
