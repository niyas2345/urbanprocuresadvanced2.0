import React, {useState} from 'react';
import {api} from '../services/api.ts';
export function AccountDocuments(){
 const [status,setStatus]=useState('');
 return <section className="max-w-[1240px] mx-auto p-4 text-xs bg-white border border-[#e1e7e4]"><label className="font-semibold">Upload trade license for Admin review<input type="file" accept="application/pdf,image/png,image/jpeg" className="block mt-2" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setStatus('Uploading…');try{if(file.size>3000000)throw Error('Maximum file size is 3MB.');const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(Error('File could not be read'));reader.readAsDataURL(file);});await api.documents.upload({fileName:file.name,fileType:file.type,data,documentPurpose:'trade_license'});setStatus('Trade license uploaded. Admin verification is pending.');}catch(err:any){setStatus(err.message);}e.target.value='';}}/></label><p role="status" className="mt-2">{status}</p></section>;
}
