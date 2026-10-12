export type QuantitySource='Stated'|'Measured'|'TBC';
export interface StandardItem {id:string;itemNumber:number;description:string;specRef:string;unit:string;quantity:number|null;quantitySource:QuantitySource;remarks:string;changed:boolean}
export interface StandardAttachment {documentId:string;id:string;title:string;type:string;pages:number|null;revision:string;linkedItems:number[];referenceOnly:boolean}
export interface StandardRFQ {
 schemaVersion:'2026.1';reference:string;revision:number;issueDate:string;quotationDeadline:string|null;requiredBy:string|null;
 title:string;category:string;location:string;requestType:'Itemized BOQ'|'Scope Quotation'|'Preliminary Quotation';
 overview:string;scope:string[];siteConditions:string;workingHours:string;materialSupply:string;
 items:StandardItem[];attachments:StandardAttachment[];clarifications:{topic:string;status:'Open'|'Resolved'|'Exclusion';statement:string}[];
 instructions:{validityDays:number;paymentTerms:string;dlp:string;warranty:string;vat:string};siteVisitOption:boolean;changeSummary:string;
}
export interface StandardHold {hard:string[];soft:string[];status:'Ready'|'Pending Clarification'}
const str=(v:unknown,max=3000)=>{if(v===undefined||v===null)return '';if(typeof v!=='string'||v.length>max)throw Error('INVALID_STANDARD_TEXT');return v.trim();};
const date=(v:unknown)=>{const s=str(v,100);if(!s)return null;if(!Number.isFinite(Date.parse(s)))throw Error('INVALID_STANDARD_DATE');return new Date(s).toISOString();};
export function normalizeStandard(raw:any,base:{reference:string;revision:number;issueDate:string},clean:(s:string)=>string):StandardRFQ {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('INVALID_STANDARD_PACKAGE');
 const text=(v:unknown,max=3000)=>clean(str(v,max));
 if(!Array.isArray(raw.items)||raw.items.length>500||!Array.isArray(raw.scope)||raw.scope.length>100||!Array.isArray(raw.attachments)||raw.attachments.length>30)throw Error('INVALID_STANDARD_COLLECTION');
 const ids=new Set<string>();
 const items=raw.items.map((r:any,i:number)=>{
  const id=typeof r.id==='string'&&/^[a-zA-Z0-9_-]{1,128}$/.test(r.id)?r.id:crypto.randomUUID();if(ids.has(id))throw Error('DUPLICATE_STANDARD_ITEM');ids.add(id);
  let quantity:number|null=null;if(r.quantity!==null&&r.quantity!==undefined&&r.quantity!==''&&r.quantity!=='TBC'){quantity=typeof r.quantity==='number'?r.quantity:Number(r.quantity);if(quantity===null||!Number.isFinite(quantity)||quantity<=0||quantity>1e9)throw Error('INVALID_STANDARD_QUANTITY');}
  const source:QuantitySource=quantity===null?'TBC':r.quantitySource;if(quantity!==null&&!['Stated','Measured'].includes(source))throw Error('QUANTITY_SOURCE_REQUIRED');
  if(source==='Measured'&&!str(r.measurementEvidence))throw Error('MEASUREMENT_EVIDENCE_REQUIRED');
  return {id,itemNumber:i+1,description:text(r.description),specRef:text(r.specRef,250),unit:text(r.unit,100)||'TBC',quantity,quantitySource:source,remarks:text(r.remarks,1000),changed:r.changed===true};
 });
 const attachments=raw.attachments.map((a:any,i:number)=>{if(typeof a.documentId!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(a.documentId))throw Error('INVALID_ATTACHMENT_REFERENCE');return {documentId:a.documentId,id:'ATT-'+String(i+1).padStart(2,'0'),title:text(a.title,250)||'Reviewed attachment',type:['Drawing','Photo','Spec Sheet','BOQ','Other'].includes(a.type)?a.type:'Other',pages:Number.isSafeInteger(a.pages)&&a.pages>0?a.pages:null,revision:text(a.revision,100)||'Not provided',linkedItems:Array.isArray(a.linkedItems)?a.linkedItems.filter((n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0&&n<=items.length):[],referenceOnly:a.type==='Photo'||a.referenceOnly===true};});
 const requestType=['Itemized BOQ','Scope Quotation','Preliminary Quotation'].includes(raw.requestType)?raw.requestType:'Itemized BOQ';
 const validityDays=raw.instructions?.validityDays??30;if(!Number.isSafeInteger(validityDays)||validityDays<30||validityDays>365)throw Error('MINIMUM_VALIDITY_30_DAYS');
 const clarifications=(Array.isArray(raw.clarifications)?raw.clarifications:[]).slice(0,100).map((c:any)=>({topic:text(c.topic,250),status:['Open','Resolved','Exclusion'].includes(c.status)?c.status:'Open',statement:text(c.statement)}));
 return {...base,schemaVersion:'2026.1',quotationDeadline:date(raw.quotationDeadline),requiredBy:date(raw.requiredBy),title:text(raw.title,250),category:text(raw.category,250),location:text(raw.location,250),requestType,overview:text(raw.overview,12000),scope:raw.scope.map((s:unknown)=>text(s)).filter(Boolean),siteConditions:text(raw.siteConditions)||'Not provided',workingHours:text(raw.workingHours)||'Not provided',materialSupply:text(raw.materialSupply)||'Not provided',items,attachments,clarifications,instructions:{validityDays,paymentTerms:text(raw.instructions?.paymentTerms)||'Not provided',dlp:text(raw.instructions?.dlp)||'Not provided',warranty:text(raw.instructions?.warranty)||'Not provided',vat:'Quote in AED excluding VAT. Confirm VAT registration and applicability; show 5% UAE VAT separately where applicable.'},siteVisitOption:raw.siteVisitOption===true,changeSummary:text(raw.changeSummary,2000)||'Initial standardized issue'};
}
export function standardHolds(p:StandardRFQ,evidence:{hasPrivateContact:boolean;unreadableAttachments?:boolean;quantityConflict?:boolean}):StandardHold {
 const hard:string[]=[],soft:string[]=[];
 if(!p.overview||!p.scope.length)hard.push('SCOPE_REQUIRED');if(!p.location)hard.push('GENERAL_LOCATION_REQUIRED');if(!evidence.hasPrivateContact)hard.push('PRIVATE_REQUESTER_CONTACT_REQUIRED');
 if(evidence.unreadableAttachments)hard.push('UNREADABLE_ATTACHMENT');if(evidence.quantityConflict)hard.push('QUANTITY_CONFLICT');
 if(!p.category)hard.push('TRADE_CATEGORY_REQUIRED');if(!p.attachments.length&&!p.siteVisitOption)hard.push('ATTACHMENT_OR_SITE_VISIT_REQUIRED');
 if(!p.quotationDeadline)soft.push('QUOTATION_DEADLINE_REQUIRED');else if(Date.parse(p.quotationDeadline)<=Date.now())hard.push('QUOTATION_DEADLINE_PASSED');
 if(!p.requiredBy)soft.push('REQUIRED_BY_DATE_NOT_PROVIDED');if(!p.items.length)soft.push('PRICING_BASIS_REQUIRED');
 if(p.items.some(i=>i.quantity===null||i.unit==='TBC'))soft.push('QUANTITY_OR_UNIT_NOT_PROVIDED');if(p.items.some(i=>!i.description))hard.push('ITEM_DESCRIPTION_REQUIRED');
 if(p.items.some(i=>!i.specRef))soft.push('SPECIFICATIONS_NOT_PROVIDED');
 if(p.instructions.paymentTerms==='Not provided')soft.push('PAYMENT_TERMS_NOT_PROVIDED');if(p.instructions.dlp==='Not provided')soft.push('DLP_NOT_PROVIDED');if(p.instructions.warranty==='Not provided')soft.push('WARRANTY_NOT_PROVIDED');
 if(p.clarifications.some(c=>c.status==='Open'))soft.push('OPEN_CLARIFICATIONS');
 return {hard,soft,status:hard.length||soft.length?'Pending Clarification':'Ready'};
}
export const preliminaryNotice='Preliminary: rates indicative, quantities unverified';
export const pricingColumns=['Item No','Description','Spec/Ref','Unit','Qty','Qty Source','Unit Rate (AED)','Amount (AED)','Remarks'];
