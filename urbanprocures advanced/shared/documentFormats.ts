export const MAX_DOCUMENT_BYTES=10_000_000;
export const MAX_RFQ_DOCUMENT_BYTES=20_000_000;
export const MAX_RFQ_DOCUMENTS=5;
export const DOCUMENT_MIME_TYPES:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',xls:'application/vnd.ms-excel',dwg:'image/vnd.dwg',dxf:'application/dxf'};
export const DOCUMENT_ACCEPT='.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.dwg,.dxf';
export function documentMime(name:string){return DOCUMENT_MIME_TYPES[name.split('.').pop()?.toLowerCase()??''];}
