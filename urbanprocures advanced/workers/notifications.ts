import type {Env} from './index.ts';
import {sendZohoMail} from './zohoMail.ts';

// The owner must explicitly authorize outbound mail before this switch is enabled.
// Ambiguous delivery failures are held for review, never retried automatically.
export async function dispatchNotifications(env:Env,send=sendZohoMail,onlyEventId?:string) {
 if(env.EMAIL_DELIVERY_ENABLED!=='true')return {enabled:false,sent:0,reviewRequired:0,suppressed:0};
 const rows=await (onlyEventId
  ? env.DB.prepare("SELECT id FROM email_outbox WHERE status='pending' AND id=? LIMIT 1").bind(onlyEventId)
  : env.DB.prepare("SELECT id FROM email_outbox WHERE status='pending' ORDER BY created_at,id LIMIT 10")).all<{id:string}>();
 const result={enabled:true,sent:0,reviewRequired:0,suppressed:0};
 for(const row of rows.results){
  const claim=await env.DB.prepare("UPDATE email_outbox SET status='sending' WHERE id=? AND status='pending'").bind(row.id).run();
  if(!claim.meta.changes)continue;
  const event=await env.DB.prepare('SELECT o.subject,o.content,u.email,u.status FROM email_outbox o JOIN users u ON u.id=o.user_id WHERE o.id=?').bind(row.id).first<{subject:string;content:string;email:string;status:string}>();
  // QA recipients must never be sent to an external provider.
  if(!event||event.status!=='active'||/\.invalid$/i.test(event.email)){
   await env.DB.prepare("UPDATE email_outbox SET status='suppressed',completed_at=? WHERE id=?").bind(new Date().toISOString(),row.id).run();result.suppressed++;continue;
  }
  try {
   await send(env,{toAddress:event.email,subject:event.subject,content:event.content});
  }catch{
   await env.DB.prepare("UPDATE email_outbox SET status='review_required' WHERE id=? AND status='sending'").bind(row.id).run();result.reviewRequired++;continue;
  }
  // A crash after provider acceptance leaves 'sending' for manual reconciliation.
  await env.DB.prepare("UPDATE email_outbox SET status='sent',completed_at=? WHERE id=? AND status='sending'").bind(new Date().toISOString(),row.id).run();result.sent++;
 }
 return result;
}
