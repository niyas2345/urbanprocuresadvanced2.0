import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
export interface TermsDocument { id:string;title:string;terms_version:string;content_text:string;content_sha256:string }
export function TermsClickwrap({role,checked,onChange,onDocument}:{role:'vendor'|'contractor'|'get_a_quote';checked:boolean;onChange:(value:boolean)=>void;onDocument:(document:TermsDocument|null)=>void}) {
  const [document,setDocument]=useState<TermsDocument|null>(null),[open,setOpen]=useState(false),[error,setError]=useState('');
  useEffect(()=>{let active=true;onChange(false);onDocument(null);api.terms.get(role).then(res=>{if(active){setDocument(res.data);onDocument(res.data);}}).catch(err=>{if(active)setError(err.message);});return()=>{active=false;};},[role]);
  const label=role==='vendor'?'I have read and agree to the Urban Procures Vendor Terms & Conditions, including the applicable Urban Procures Service Charge and manpower-related charges where applicable.':role==='contractor'?'I have read and agree to the Urban Procures Contractor / Client Terms & Conditions.':'I confirm that the information provided is accurate and agree to the Urban Procures Get a Quote Terms and Privacy Notice.';
  const view=async()=>{try{const res=await api.terms.get(role,true);if(document?.id!==res.data.id)onChange(false);setDocument(res.data);onDocument(res.data);setOpen(true);}catch(err:any){setError(err.message);onChange(false);onDocument(null);}};
  return <div className="space-y-3 text-xs text-[#123540]">
    <button type="button" onClick={view} disabled={!document} className="font-bold text-[#123f47] underline disabled:opacity-50">{role==='vendor'?'VIEW VENDOR TERMS & CONDITIONS':role==='contractor'?'VIEW CONTRACTOR / CLIENT TERMS & CONDITIONS':'VIEW GET A QUOTE TERMS AND PRIVACY NOTICE'}</button>
    {document && <div className="text-[#63797b]">Version {document.terms_version}</div>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <label className="flex items-start gap-3"><input type="checkbox" checked={checked} disabled={!document} onChange={e=>onChange(e.target.checked)} className="mt-0.5 accent-[#eb6a32]"/><span>{label}</span></label>
    {role==='contractor' && <p>Contractor / Client Service Charge: AED 0.</p>}
    {open && document && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80"><section role="dialog" aria-modal="true" aria-label={document.title} className="bg-white rounded-[6px] border border-[#e1e7e4] max-w-2xl w-full max-h-[85vh] flex flex-col"><header className="p-5 bg-[#123f47] text-white flex justify-between gap-4"><h2>{document.title} — {document.terms_version}</h2><button type="button" aria-label="Close Terms" onClick={()=>setOpen(false)}>×</button></header><div className="overflow-y-auto p-6"><pre className="whitespace-pre-wrap font-['DM_Sans'] text-xs leading-relaxed">{document.content_text}</pre></div></section></div>}
  </div>;
}
export function TermsReacceptance({role,onAccepted}:{role:'vendor'|'contractor';onAccepted:()=>void}) {
  const [checked,setChecked]=useState(false),[document,setDocument]=useState<TermsDocument|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <section className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-[6px] border border-[#e1e7e4] space-y-5"><h2 className="font-bold text-[#123540]">Current Terms acceptance required</h2><TermsClickwrap role={role} checked={checked} onChange={setChecked} onDocument={setDocument}/>{error&&<p role="alert">{error}</p>}<button disabled={!checked||!document||busy} className="bg-[#eb6a32] text-white rounded px-5 py-3 disabled:opacity-50" onClick={async()=>{if(!checked||!document)return;setBusy(true);try{await api.terms.accept(document.id);onAccepted();}catch(err:any){setError(err.message);}finally{setBusy(false);}}}>Accept Current Terms</button></section>;
}
