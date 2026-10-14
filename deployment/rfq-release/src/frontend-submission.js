var Qe = ({ rfq: e, onSubmitted: t }) => {
  const [file,setFile]=(0,b.useState)(null),[busy,setBusy]=(0,b.useState)(false),[error,setError]=(0,b.useState)(''),[values,setValues]=(0,b.useState)({totalAmountAed:'',leadTimeDays:'',validityDays:'',paymentTerms:'',notes:''});
  const book=e.excelWorkbook,isPdf=file?.name.toLowerCase().endsWith('.pdf'),allowPdf=book?.parentKind==='contractor';
  const field=(key,label,type='text')=>(0,x.jsxs)('label',{className:'block text-sm font-semibold',children:[label,(0,x.jsx)(type==='textarea'?'textarea':'input',{className:'block border rounded p-2 mt-2 w-full',type:type==='textarea'?undefined:type,required:key!=='notes',min:type==='number'?1:undefined,step:key==='totalAmountAed'?'0.01':undefined,value:values[key],disabled:busy,onChange:ev=>setValues({...values,[key]:ev.target.value})})]},key);
  const submit=async ev=>{ev.preventDefault();setBusy(true);setError('');try{
    if(!file||file.size>1e7||!file.name.toLowerCase().endsWith('.xlsx')&&!(allowPdf&&isPdf))throw Error('Choose a completed XLSX workbook'+(allowPdf?' or PDF quotation':'')+', up to 10 MB.');
    const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(Error('Could not read file'));r.readAsDataURL(file);});
    const fileData={fileName:file.name,fileType:isPdf?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',fileSizeBytes:file.size,dataUrl,documentPurpose:'boq'};
    const body=isPdf?{pdfFile:fileData,totalAmountAed:Number(values.totalAmountAed),leadTimeDays:Number(values.leadTimeDays),validityDays:Number(values.validityDays),paymentTerms:values.paymentTerms,notes:values.notes}:{excelFile:fileData};
    const url=book.parentKind==='public'?'/api/vendor/rfq-workbooks/'+encodeURIComponent(book.id)+'/quote':'/api/vendor/rfqs/'+encodeURIComponent(e.id)+'/quote';
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();if(!r.ok||!j.success)throw Error(j.error||'Upload failed');await t();
  }catch(e){setError(e.message);}finally{setBusy(false);}};
  if(!book)return (0,x.jsxs)('div',{className:'bg-white border rounded p-6',children:[(0,x.jsx)('h3',{className:'font-bold',children:'RFQ awaiting review'}),(0,x.jsx)('p',{className:'mt-2 text-sm',children:'Quotation submission will be available after the reviewed workbook is published.'})]});
  return (0,x.jsxs)('form',{className:'bg-white border border-[#e1e7e4] rounded p-6 space-y-4',onSubmit:submit,children:[
    (0,x.jsx)('h3',{className:'font-bold text-[#123540]',children:allowPdf?'Upload your quotation':'Complete and upload the Excel quotation'}),
    (0,x.jsx)('p',{className:'text-sm',children:'Download revision '+book.revision+', fill the blank vendor fields and upload the same workbook. Keep the source schedule unchanged.'+(allowPdf?' You may also upload a PDF quotation. Quotations are reviewed and vendor identity is masked before a contractor receives the Urban Procures PDF.':'')}),
    book.preliminary&&(0,x.jsx)('p',{className:'text-sm text-[#a54b22]',children:'Preliminary RFQ: quantities need verification. An award cannot be made from this revision.'}),
    (0,x.jsx)('button',{type:'button',disabled:busy,className:'border border-[#123f47] rounded px-4 py-2',onClick:async()=>{try{await Ze(book.id,book.revision);}catch(e){setError(e.message);}},children:'Download Excel RFQ'}),
    (0,x.jsxs)('label',{className:'block text-sm font-semibold',children:[allowPdf?'Completed Excel workbook or PDF quotation':'Completed Excel workbook',(0,x.jsx)('input',{className:'block mt-2',type:'file',accept:allowPdf?'.xlsx,.pdf':'.xlsx',required:true,disabled:busy,onChange:ev=>setFile(ev.target.files?.[0]??null)})]}),
    isPdf&&(0,x.jsxs)('div',{className:'space-y-3',children:[(0,x.jsx)('p',{className:'text-sm',children:'Enter your quotation total and proposed terms. These are checked against your PDF during review. Include all pricing, quantities and commercial terms in the PDF.'}),field('totalAmountAed','Total quotation (AED)','number'),field('leadTimeDays','Proposed lead time (days)','number'),field('validityDays','Quotation validity (days)','number'),field('paymentTerms','Payment terms','textarea'),field('notes','Additional notes (optional)','textarea')]}),
    error&&(0,x.jsx)('p',{role:'alert',className:'text-red-700',children:error}),
    (0,x.jsx)('button',{disabled:busy,className:'bg-[#123f47] text-white rounded px-5 py-2',children:busy?'Please wait…':'Submit quotation'})]});
}
