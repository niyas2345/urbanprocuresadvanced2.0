// Owner-requested RFQ removal. Preserve source documents and history for audit.
async function adminRemoveRfq(request,env,actor,id){
 if(actor?.role!=='admin'||actor.status!=='active'||env.ADMIN_INTEGRATION_OWNER_ID&&actor.id!==env.ADMIN_INTEGRATION_OWNER_ID)return fail2('OWNER_ADMIN_REQUIRED',403);
 const rfq=await env.DB.prepare('SELECT id,status,deleted_at FROM rfqs WHERE id=?').bind(id).first();
 if(!rfq)return fail2('RFQ_NOT_FOUND',404);
 if(rfq.deleted_at)return ok2({id,removed:true});
 if(['awarded','closed'].includes(rfq.status)||await env.DB.prepare('SELECT id FROM awards WHERE rfq_id=?').bind(id).first())return fail2('AWARDED_RFQ_NOT_REMOVABLE',409);
 const now=new Date().toISOString(),nonce=crypto.randomUUID();
 const results=await env.DB.batch([
  env.DB.prepare("UPDATE rfqs SET status='cancelled',deleted_at=?,revision_nonce=? WHERE id=? AND deleted_at IS NULL AND status NOT IN ('awarded','closed') AND NOT EXISTS(SELECT 1 FROM awards WHERE rfq_id=rfqs.id)").bind(now,nonce,id),
  env.DB.prepare("INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,'admin','RFQ_REMOVE','rfq',id,?,? FROM rfqs WHERE id=? AND revision_nonce=?").bind(crypto.randomUUID(),actor.id,JSON.stringify({from:rfq.status,to:'cancelled',reason:'Owner-requested removal'}),now,id,nonce),
  env.DB.prepare("UPDATE email_outbox SET status='suppressed',completed_at=? WHERE status='pending' AND (instr(event_key,?)=1 OR instr(event_key,?)=1) AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND revision_nonce=?)").bind(now,'admin-rfq:'+id+':','rfq:'+id+':',id,nonce)
 ]);
 return results[0].meta.changes?ok2({id,status:'cancelled',removed:true}):fail2('RFQ_CONFLICT',409);
}
