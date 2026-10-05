import type { Env } from './index.ts';
import type { Actor } from './terms.ts';
import { acceptanceFor, organizationFor } from './terms.ts';
import { ServiceChargeEngine } from './serviceChargeEngine.ts';
export async function awardRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null> {
  const match=new URL(request.url).pathname.match(/^\/api\/contractor\/rfqs\/([^/]+)\/award$/);
  if(!match || request.method!=='POST')return null;
  if(!actor || actor.role!=='contractor')return Response.json({success:false,error:'CONTRACTOR_REQUIRED'},{status:403});
  const contractor=await organizationFor(env,actor);
  let body:Record<string,unknown>;
  try{body=await request.json() as Record<string,unknown>;}catch{return Response.json({success:false,error:'INVALID_REQUEST'},{status:400});}
  if(!body || typeof body.quotationId!=='string')return Response.json({success:false,error:'INVALID_QUOTATION'},{status:400});
  const rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=? AND contractor_id=?').bind(match[1],contractor?.id||'').first<any>();
  if(!rfq)return Response.json({success:false,error:'RFQ_NOT_FOUND'},{status:404});
  if(!['receiving_quotations','under_evaluation'].includes(rfq.status))return Response.json({success:false,error:'INVALID_AWARD_STATE'},{status:409});
  const quote=await env.DB.prepare("SELECT q.*,v.user_id FROM vendor_quotes q JOIN vendors v ON v.id=q.vendor_id JOIN users u ON u.id=v.user_id WHERE q.id=? AND q.rfq_id=? AND q.status IN ('submitted','shortlisted','under_review') AND v.verification_status='verified' AND u.status='active'").bind(body.quotationId,rfq.id).first<any>();
  if(!quote)return Response.json({success:false,error:'ELIGIBLE_QUOTATION_REQUIRED'},{status:409});
  if(Date.now()>Date.parse(quote.submitted_at)+quote.validity_days*86400000)return Response.json({success:false,error:'QUOTATION_EXPIRED'},{status:409});
  const vendorActor={id:quote.user_id,email:'',role:'vendor',status:'active'};
  const vendorTerms=await acceptanceFor(env,vendorActor),contractorTerms=await acceptanceFor(env,actor);
  if(!vendorTerms || !contractorTerms)return Response.json({success:false,error:'TERMS_ACCEPTANCE_REQUIRED'},{status:403});
  // Classification and quantity come from persisted RFQ/approved configuration, never browser overrides.
  if(/manpower|labou?r/i.test(rfq.category) && rfq.procurement_type!=='manpower')return Response.json({success:false,error:'BUSINESS_RULE_CONFIRMATION_REQUIRED'},{status:409});
  let charge;
  try{charge=ServiceChargeEngine.calculateAward({awardValueAed:quote.total_amount_aed,awardType:rfq.procurement_type,manpowerPersons:rfq.manpower_persons,manpowerHoursPerPersonPerDay:rfq.manpower_hours_per_person_per_day,manpowerDays:rfq.manpower_days});}
  catch(error){return Response.json({success:false,error:(error as Error).message},{status:409});}
  const id=crypto.randomUUID(),now=new Date().toISOString();
  try {
    const results=await env.DB.batch([
      env.DB.prepare(`INSERT INTO awards (id,rfq_id,quotation_id,contractor_id,vendor_id,contract_amount_aed,calculated_service_charge_aed,awarded_at,contact_details_released_at,vendor_terms_acceptance_id,award_type,applicable_charge_rule,contractor_service_charge_aed,vendor_terms_version,manpower_quantity,manpower_unit,manpower_charge_aed,calculated_at,manpower_persons,manpower_hours_per_person_per_day,manpower_days,manpower_rate_aed)
      SELECT ?,r.id,q.id,r.contractor_id,q.vendor_id,q.total_amount_aed,?,?,?,?,?,?,0,?,?,?,?,?,?,?,?,?
      FROM rfqs r JOIN vendor_quotes q ON q.rfq_id=r.id JOIN vendors v ON v.id=q.vendor_id JOIN users u ON u.id=v.user_id
      WHERE r.id=? AND r.contractor_id=? AND q.id=? AND r.status IN ('receiving_quotations','under_evaluation')
      AND q.status IN ('submitted','shortlisted','under_review') AND v.verification_status='verified' AND u.status='active'
      AND q.total_amount_aed=? AND r.procurement_type=? AND r.approved_manpower_quantity IS ? AND r.manpower_persons IS ? AND r.manpower_hours_per_person_per_day IS ? AND r.manpower_days IS ?
      AND EXISTS(SELECT 1 FROM terms_acceptance_evidence e JOIN terms_versions t ON t.id=e.terms_version_id
        WHERE e.acceptance_id=? AND e.user_id=u.id AND t.status IN ('published','retired')
        AND NOT EXISTS(SELECT 1 FROM terms_versions n WHERE n.role='vendor' AND n.status IN ('published','retired') AND n.mandatory=1 AND n.published_at>t.published_at))
      AND EXISTS(SELECT 1 FROM users cu WHERE cu.id=? AND cu.status='active')
      AND EXISTS(SELECT 1 FROM terms_acceptance_evidence e JOIN terms_versions t ON t.id=e.terms_version_id
        WHERE e.acceptance_id=? AND t.status IN ('published','retired')
        AND NOT EXISTS(SELECT 1 FROM terms_versions n WHERE n.role='contractor' AND n.status IN ('published','retired') AND n.mandatory=1 AND n.published_at>t.published_at))`)
        .bind(id,charge.vendorServiceChargeAed,now,now,vendorTerms.acceptance_id,rfq.procurement_type,charge.applicableChargeRule,vendorTerms.terms_version,charge.manpowerQuantity,charge.manpowerUnit,charge.manpowerChargeAed,now,charge.manpowerPersons,charge.manpowerHoursPerPersonPerDay,charge.manpowerDays,charge.manpowerRateAed,rfq.id,contractor!.id,quote.id,quote.total_amount_aed,rfq.procurement_type,rfq.approved_manpower_quantity,rfq.manpower_persons,rfq.manpower_hours_per_person_per_day,rfq.manpower_days,vendorTerms.acceptance_id,actor.id,contractorTerms.acceptance_id),
      env.DB.prepare(`INSERT INTO service_charges (id,award_id,rfq_id,vendor_id,contract_amount_aed,percentage,calculated_amount_aed,minimum_charge_applied,manpower_rule_applied,site_visit_fee_included,total_charge_aed,status,created_at)
        SELECT ?,id,rfq_id,vendor_id,contract_amount_aed,?,?,?,?,0,?,'pending',? FROM awards WHERE id=?`)
        .bind(crypto.randomUUID(),rfq.procurement_type==='standard'?0.025:0,charge.vendorServiceChargeAed,rfq.procurement_type==='standard'&&charge.vendorServiceChargeAed===500?1:0,rfq.procurement_type==='manpower'?1:0,charge.totalVendorChargeAed,now,id),
      env.DB.prepare("UPDATE rfqs SET status='awarded',awarded_at=? WHERE id=? AND EXISTS(SELECT 1 FROM awards WHERE id=?)").bind(now,rfq.id,id),
      env.DB.prepare("UPDATE vendor_quotes SET status=CASE WHEN id=? THEN 'awarded' ELSE 'declined' END WHERE rfq_id=? AND EXISTS(SELECT 1 FROM awards WHERE id=?)").bind(quote.id,rfq.id,id),
      env.DB.prepare("INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,'contractor','AWARD_AND_SERVICE_CHARGE','award',id,?,? FROM awards WHERE id=?")
        .bind(crypto.randomUUID(),actor.id,JSON.stringify({vendorTermsAcceptanceId:vendorTerms.acceptance_id,vendorTermsVersion:vendorTerms.terms_version,...charge}),now,id)
    ]);
    if(!results[0].meta.changes)return Response.json({success:false,error:'AWARD_CONFLICT'},{status:409});
    return Response.json({success:true,data:{id,vendorTermsAcceptanceId:vendorTerms.acceptance_id,vendorTermsVersion:vendorTerms.terms_version,...charge}});
  } catch {return Response.json({success:false,error:'AWARD_CONFLICT'},{status:409});}
}
