import React, {useRef,useState} from 'react';
import {DOCUMENT_ACCEPT,documentMime,MAX_DOCUMENT_BYTES,MAX_RFQ_DOCUMENT_BYTES,MAX_RFQ_DOCUMENTS} from '../../urbanprocures advanced/shared/documentFormats.ts';
export type Attachment={fileName:string;fileType:string;fileSizeBytes:number;dataUrl:string;documentPurpose:string};
export function DocumentAttachments({files,onChange,onBusy,disabled=false,id,label='Upload BOQ, drawings or supporting documents (optional)'}:{files:Attachment[];onChange:(files:Attachment[])=>void;onBusy:(busy:boolean)=>void;disabled?:boolean;id?:string;label?:string}) {
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 const select=async(e:React.ChangeEvent<HTMLInputElement>)=>{
  if(lock.current)return;const selected=Array.from(e.target.files??[]);e.target.value='';setError('');
  if(files.length+selected.length>MAX_RFQ_DOCUMENTS||selected.some(f=>!documentMime(f.name)||!f.size||f.size>MAX_DOCUMENT_BYTES)||files.reduce((s,f)=>s+f.fileSizeBytes,0)+selected.reduce((s,f)=>s+f.size,0)>MAX_RFQ_DOCUMENT_BYTES){setError('Choose supported files: up to 5 files, 10 MB each and 20 MB combined.');return;}
  lock.current=true;setBusy(true);onBusy(true);
  try{
   const added=await Promise.all(selected.map(async file=>({fileName:file.name,fileType:file.type||documentMime(file.name)!,fileSizeBytes:file.size,documentPurpose:'other',dataUrl:await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('File could not be read. Please select it again.'));reader.readAsDataURL(file);})})));
   onChange([...files,...added]);
  }catch(err){setError(err instanceof Error?err.message:'File could not be read.');}finally{lock.current=false;setBusy(false);onBusy(false);}
 };
 return <div className="space-y-2 text-xs"><label className="block font-semibold">{label}<input aria-label={label} type="file" id={id} multiple accept={DOCUMENT_ACCEPT} disabled={disabled||busy} onChange={select} className="block w-full mt-2 p-3 border border-dashed border-[#bccbca] rounded bg-[#f7f6f2]"/></label><p className="text-[#63797b]">PDF, Excel (.xls/.xlsx), drawings (.dwg/.dxf), PNG and JPEG. Up to 5 files; 10 MB each, 20 MB combined. PDFs and images can be previewed; Excel and CAD files can be downloaded.</p>{busy&&<p role="status">Reading files…</p>}{error&&<p role="alert" className="text-red-700">{error}</p>}{files.map((f,i)=><div key={i} className="flex flex-wrap items-center gap-2 p-2 border border-[#e1e7e4] rounded"><span className="break-all flex-1">{f.fileName} ({(f.fileSizeBytes/1024).toFixed(0)} KB)</span><select aria-label={'Purpose of '+f.fileName} disabled={disabled||busy} value={f.documentPurpose} onChange={e=>onChange(files.map((d,j)=>j===i?{...d,documentPurpose:e.target.value}:d))}>{['boq','drawing','specification','photo','other'].map(p=><option key={p} value={p}>{p==='boq'?'BOQ':p}</option>)}</select><button type="button" disabled={disabled||busy} onClick={()=>onChange(files.filter((_,j)=>i!==j))} className="underline text-red-700" aria-label={'Remove '+f.fileName}>Remove</button></div>)}</div>;
}
