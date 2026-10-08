import {documentMime,MAX_DOCUMENT_BYTES,MAX_RFQ_DOCUMENT_BYTES,MAX_RFQ_DOCUMENTS} from '../shared/documentFormats.ts';
function validWorkbookZip(bytes:Uint8Array):boolean {
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
 if(end<0||view.getUint16(end+4,true)!==0||view.getUint16(end+6,true)!==0)return false;
 const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),offset=view.getUint32(end+16,true);
 if(!count||count>10000||offset+size!==end||end+22+view.getUint16(end+20,true)!==bytes.length)return false;
 const names=new Set<string>();let pos=offset;
 for(let i=0;i<count;i++){
  if(pos+46>end||view.getUint32(pos,true)!==0x02014b50)return false;
  const len=view.getUint16(pos+28,true),extra=view.getUint16(pos+30,true),comment=view.getUint16(pos+32,true);
  if(pos+46+len+extra+comment>end||(view.getUint16(pos+8,true)&1))return false;
  const name=new TextDecoder().decode(bytes.slice(pos+46,pos+46+len));
  if(names.has(name)||name.toLowerCase().endsWith('vbaproject.bin'))return false;
  names.add(name);pos+=46+len+extra+comment;
 }
 return pos===end&&names.has('[Content_Types].xml')&&names.has('xl/workbook.xml');
}
export function decodeDocument(file:any) {
 if(!file || typeof file.fileName!=='string' || !file.fileName.trim() || file.fileName.length>180 || /[\r\n"\\/]/.test(file.fileName))throw Error('INVALID_FILE_NAME');
 const data=file.dataUrl??file.data;
 const match=typeof data==='string'?data.match(/^data:([^;,]*);base64,([A-Za-z0-9+/=]+)$/):null;
 if(!match)throw Error('UNSUPPORTED_DOCUMENT_TYPE');
 const extension=file.fileName.split('.').pop().toLowerCase(),type=documentMime(file.fileName);
 if(!type)throw Error('DOCUMENT_EXTENSION_MISMATCH');
 const allowed=[type,'application/octet-stream',''];
 if(extension==='dwg')allowed.push('application/acad','application/x-acad','application/x-dwg');
 if(extension==='dxf')allowed.push('image/vnd.dxf','application/x-dxf','text/plain');
 if(!allowed.includes(match[1])||(file.fileType&&!allowed.includes(file.fileType)))throw Error('DOCUMENT_TYPE_MISMATCH');
 const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));
 if(!bytes.length || bytes.length>MAX_DOCUMENT_BYTES)throw Error('DOCUMENT_SIZE_INVALID');
 const text=new TextDecoder().decode(bytes.slice(0,1024));
 const valid=extension==='pdf'?text.startsWith('%PDF-'):extension==='png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):['jpg','jpeg'].includes(extension)?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:extension==='xls'?[208,207,17,224,161,177,26,225].every((v,i)=>bytes[i]===v):extension==='xlsx'?validWorkbookZip(bytes):extension==='dwg'?/^AC10\d{2}/.test(text):extension==='dxf'?(/^\s*0\s+SECTION\b/.test(text)||text.startsWith('AutoCAD Binary DXF\r\n')):false;
 if(!valid)throw Error('DOCUMENT_CONTENT_MISMATCH');
 if(!['boq','drawing','specification','photo','trade_license','other'].includes(file.documentPurpose??'other'))throw Error('INVALID_DOCUMENT_PURPOSE');
 return {name:file.fileName,type,bytes,purpose:file.documentPurpose??'other'};
}
export function decodeDocuments(files:any[]) {
 if(!Array.isArray(files)||files.length>MAX_RFQ_DOCUMENTS)throw Error('INVALID_DOCUMENTS');
 const documents=files.map(decodeDocument);
 if(documents.reduce((sum,d)=>sum+d.bytes.length,0)>MAX_RFQ_DOCUMENT_BYTES)throw Error('DOCUMENTS_TOO_LARGE');
 return documents;
}
