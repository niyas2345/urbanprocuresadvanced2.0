import {useEffect,useState} from 'react';
import {api} from '../services/api.ts';

type Count={status?:string;role?:string;outcome?:string;count:number};
type Overview={settings:{status:string;daily_limit:number;contractor_limit:number;vendor_limit:number;schedule_hour:number;owner_limit_confirmed:number};activationAllowed:boolean;counts:Count[];eligibleRecipients:Count[];delivery:Count[];transactionalOutbox:Count[];allocatedToday:number;remainingAllowance:number;registeredFromInvitations:null;senders:{address:string;purpose:string;verified:number;reply_to:string}[];templates:{role:string;subject:string;content:string}[];runs:{day:string;status:string;error_code:string|null}[];audits:{action_type:string;timestamp:string}[]};
const emptyProspect={email:'',company:'',role:'vendor',trade:'',emirate:'Dubai',sourceUrl:'',contactBasis:'explicit_consent',basisEvidence:'',addressVerified:false};
export function AdminEmailAutomationPanel(){
 const [data,setData]=useState<Overview|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [daily,setDaily]=useState(100),[contractor,setContractor]=useState(60),[hour,setHour]=useState(9),[confirmed,setConfirmed]=useState(false);
 const [prospect,setProspect]=useState(emptyProspect),[suppressEmail,setSuppressEmail]=useState(''),[reason,setReason]=useState('');
 const [templateRole,setTemplateRole]=useState('vendor'),[subject,setSubject]=useState(''),[content,setContent]=useState('');
 const load=async()=>{const next=await api.admin.emailAutomation.get();setData(next);setDaily(next.settings.daily_limit);setContractor(next.settings.contractor_limit);setHour(next.settings.schedule_hour);setConfirmed(next.settings.owner_limit_confirmed===1);};
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 useEffect(()=>{const t=data?.templates.find(t=>t.role===templateRole);if(t){setSubject(t.subject);setContent(t.content);}},[data,templateRole]);
 const action=async(task:()=>Promise<unknown>)=>{setBusy(true);setError('');try{await task();await load();}catch(e){setError(e instanceof Error?e.message:'Operation failed');}finally{setBusy(false);}};
 const field='border border-[#bccbca] rounded p-2 w-full bg-white';
 const button='rounded bg-[#123540] text-white px-4 py-2 disabled:opacity-50';
 if(!data)return <p role="status">{error||'Loading email automation…'}</p>;
 return <div className="space-y-6 text-sm">
  <h2 className="text-xl font-bold">Email automation control centre</h2>
  {error&&<p role="alert" className="text-red-700">{error}</p>}
  <p>Campaign: <strong>{data.settings.status}</strong>. Eligible prospects: <strong>{data.eligibleRecipients.reduce((n,r)=>n+r.count,0)}</strong>. Allocated today: {data.allocatedToday}. Remaining allocation: {data.remainingAllowance}.</p>
  <p className="bg-[#fff5eb] border rounded p-3">External outreach requires verified senders, provider limits, an approved recipient source, staging evidence and owner confirmation. Provider acceptance and inbox delivery are tracked separately.</p>
  <div className="grid sm:grid-cols-3 gap-4">
   {([['Transactional outbox',data.transactionalOutbox],['Onboarding queue',data.counts],['Provider evidence',data.delivery]] as const).map(([label,counts])=><section key={label} className="bg-white border rounded p-4"><h3 className="font-bold">{label}</h3>{counts.length?counts.map((c,i)=><p key={i}>{c.status??c.outcome}: {c.count}</p>):<p>No records</p>}</section>)}
  </div>
  <form className="bg-white border rounded p-4 grid sm:grid-cols-3 gap-4" onSubmit={e=>{e.preventDefault();void action(()=>api.admin.emailAutomation.settings({dailyLimit:daily,contractorLimit:contractor,vendorLimit:daily-contractor,scheduleHour:hour,ownerLimitConfirmed:confirmed}));}}>
   <label>Daily invitation cap<input className={field} type="number" min={0} max={100} required value={daily} onChange={e=>setDaily(Number(e.target.value))}/></label>
   <label>Contractor allocation<input className={field} type="number" min={0} max={daily} required value={contractor} onChange={e=>setContractor(Number(e.target.value))}/></label>
   <label>Vendor allocation<input className={field} value={daily-contractor} readOnly/></label>
   <label>Start hour (Asia/Dubai)<input className={field} type="number" min={0} max={23} required value={hour} onChange={e=>setHour(Number(e.target.value))}/></label>
   <label className="flex items-center gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I confirm this daily limit.</label>
   <button className={button} disabled={busy}>Save settings and pause</button>
  </form>
  <div className="flex gap-3"><button className={button} disabled={busy} onClick={()=>void action(()=>api.admin.emailAutomation.pause())}>Pause</button><button className={button} disabled={busy||!data.activationAllowed} onClick={()=>void action(()=>api.admin.emailAutomation.resume())}>Resume verified campaign</button><button className={button} disabled={busy} onClick={()=>void action(load)}>Refresh</button></div>
  <form className="bg-white border rounded p-4 grid sm:grid-cols-2 gap-4" onSubmit={e=>{e.preventDefault();void action(async()=>{await api.admin.emailAutomation.prospect(prospect);setProspect(emptyProspect);});}}>
   <h3 className="font-bold sm:col-span-2">Add an authorized business prospect</h3>
   {(['company','email','trade','sourceUrl','basisEvidence'] as const).map(key=><label key={key}>{({company:'Company',email:'Business email',trade:'Trade',sourceUrl:'Contact source URL',basisEvidence:'Consent or relationship evidence'})[key]}<input className={field} type={key==='email'?'email':key==='sourceUrl'?'url':'text'} required value={prospect[key]} onChange={e=>setProspect({...prospect,[key]:e.target.value})}/></label>)}
   <label>Journey<select className={field} value={prospect.role} onChange={e=>setProspect({...prospect,role:e.target.value})}><option value="contractor">Contractor</option><option value="vendor">Vendor</option></select></label>
   <label>Emirate<select className={field} value={prospect.emirate} onChange={e=>setProspect({...prospect,emirate:e.target.value})}>{['Dubai','Abu Dhabi','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'].map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Contact basis<select className={field} value={prospect.contactBasis} onChange={e=>setProspect({...prospect,contactBasis:e.target.value})}><option value="explicit_consent">Explicit consent</option><option value="existing_business_relationship">Existing business relationship</option></select></label>
   <label className="flex gap-2"><input type="checkbox" checked={prospect.addressVerified} onChange={e=>setProspect({...prospect,addressVerified:e.target.checked})}/>Business address independently verified</label>
   <button className={button} disabled={busy}>Save prospect</button>
  </form>
  <form className="bg-white border rounded p-4 space-y-3" onSubmit={e=>{e.preventDefault();void action(()=>api.admin.emailAutomation.template({role:templateRole,subject,content}));}}>
   <h3 className="font-bold">Owner-controlled invitation template</h3><select className={field} value={templateRole} onChange={e=>setTemplateRole(e.target.value)}><option value="vendor">Vendor</option><option value="contractor">Contractor</option></select>
   <label className="block">Subject<input className={field} required maxLength={150} value={subject} onChange={e=>setSubject(e.target.value)}/></label><label className="block">Body<textarea className={field} required maxLength={4000} value={content} onChange={e=>setContent(e.target.value)}/></label><p>Do not include client identities or confidential RFQ content. The registration link and unsubscribe link are appended automatically.</p><button className={button} disabled={busy}>Save template</button>
  </form>
  <form className="bg-white border rounded p-4 grid sm:grid-cols-3 gap-3" onSubmit={e=>{e.preventDefault();void action(()=>api.admin.emailAutomation.suppress({email:suppressEmail,reason}));}}><label>Email to suppress<input className={field} type="email" required value={suppressEmail} onChange={e=>setSuppressEmail(e.target.value)}/></label><label>Reason<input className={field} required minLength={3} value={reason} onChange={e=>setReason(e.target.value)}/></label><button className={button} disabled={busy}>Suppress invitations</button></form>
  <section className="bg-white border rounded p-4"><h3 className="font-bold">Sender identities</h3>{data.senders.map(s=><p key={s.address}>{s.address} — {s.purpose} — {s.verified?'verified':'verification required'} — reply to {s.reply_to}</p>)}</section>
  <section className="bg-white border rounded p-4"><h3 className="font-bold">Recent scheduler runs</h3>{data.runs.length?data.runs.map(r=><p key={r.day}>{r.day}: {r.status} {r.error_code}</p>):<p>No runs</p>}<h3 className="font-bold mt-3">Recent changes</h3>{data.audits.map((a,i)=><p key={i}>{a.timestamp}: {a.action_type}</p>)}<p>Invitation registration attribution: not yet instrumented.</p></section>
 </div>;
}
