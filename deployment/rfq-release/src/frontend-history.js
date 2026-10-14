function QuotationPdfHistory({quote}){
  if(!quote.quotationRevisions)return null;
  return (0,x.jsxs)('div',{className:'mt-3 text-xs space-y-2',children:[
    (0,x.jsx)('p',{children:'Quotation revision '+quote.quotationRevision+' — '+(quote.reviewStatus==='approved'?'Reviewed PDF available':'Awaiting document review')}),
    quote.staleRevision&&(0,x.jsx)('p',{className:'text-red-700',children:'This quotation uses a previous RFQ revision. Submit a quotation for the current RFQ before award.'}),
    ...quote.quotationRevisions.map(r=>(0,x.jsxs)('div',{children:[(0,x.jsx)('span',{children:'Revision '+r.revision+' ('+r.inputKind+')'+(r.current?' — current':' — previous')+' '}),...r.documents.map(d=>(0,x.jsxs)('span',{children:[(0,x.jsx)('a',{className:'underline mr-3',href:'/api/documents/'+encodeURIComponent(d.id)+'/standardized/view',target:'_blank',rel:'noopener',children:'View PDF'}),(0,x.jsx)('a',{className:'underline',href:'/api/documents/'+encodeURIComponent(d.id)+'/standardized/download',children:'Download PDF'})]},d.id))]},r.revision))
  ]});
}
