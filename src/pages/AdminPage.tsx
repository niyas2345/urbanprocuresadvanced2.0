import {useDashboardRefresh} from '../hooks/useDashboardRefresh.ts';
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import { AdminTermsPanel } from '../components/AdminTermsPanel.tsx';
import { RFQ, PublicQuoteRequest, DocumentMetadata, AuditEvent, InvitationRecord, User } from '../types/index.ts';
import { useToast } from '../components/ToastContext.tsx';
import { ShieldCheck, FileText, CheckCircle2, Eye, Download, UserCheck, Calculator, Send, AlertTriangle, Layers, Clock, HardDrive, RefreshCw, Users, Check, X, Calendar, ArrowUpRight } from 'lucide-react';
import { DocumentViewerModal } from '../components/DocumentViewerModal.tsx';
import { ServiceChargeEngine } from '../../urbanprocures advanced/workers/serviceChargeEngine.ts';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<'documents' | 'rfqs' | 'public_quotes' | 'users' | 'vendors' | 'charges' | 'invitations' | 'audit' | 'terms'>('documents');
  const [inspectDoc, setInspectDoc] = useState<DocumentMetadata | null>(null);

  // Service Charge Simulator State
  const [simContractAmount, setSimContractAmount] = useState('180000');
  const [simSiteVisit, setSimSiteVisit] = useState(false);

  // Invitation Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrg, setInviteOrg] = useState('');
  const [inviteType, setInviteType] = useState<'contractor' | 'vendor'>('vendor');

  const [rfqs,setRfqs]=useState<RFQ[]>([]),[publicQuotes,setPublicQuotes]=useState<PublicQuoteRequest[]>([]),[contractors,setContractors]=useState<any[]>([]),[vendors,setVendors]=useState<any[]>([]),[users,setUsers]=useState<User[]>([]),[documents,setDocuments]=useState<DocumentMetadata[]>([]),[auditEvents,setAuditEvents]=useState<AuditEvent[]>([]),[invitations,setInvitations]=useState<InvitationRecord[]>([]);
  const [authorized,setAuthorized]=useState(false),[error,setError]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[charges,setCharges]=useState<any[]>([]),[awards,setAwards]=useState<any[]>([]),[quotations,setQuotations]=useState<any[]>([]);
  const [showHistory,setShowHistory]=useState(false),[notices,setNotices]=useState<any[]>([]);
  const load=async()=>{try{const session=await api.auth.me();if(!session.authenticated||session.user.role!=='admin'){setAuthorized(false);return;}
    const data=await Promise.all([(showHistory?api.admin.getRfqHistory():api.admin.getRfqs()),api.admin.getPublicQuotes(),api.admin.getContractors(),api.admin.getVendors(),api.admin.getUsers(),(showHistory?api.admin.getDocumentHistory():api.admin.getDocuments()),api.admin.getAuditLogs(),api.admin.getInvitations(),api.admin.getServiceCharges(),api.admin.getAwards(),api.admin.getQuotations(showHistory),api.admin.getNotifications()]);
    setNotices(data[11]);setRfqs(data[0]);setPublicQuotes(data[1]);setContractors(data[2]);setVendors(data[3]);setUsers(data[4]);setDocuments(data[5]);setAuditEvents(data[6]);setInvitations(data[7]);setCharges(data[8]);setAwards(data[9]);setQuotations(data[10]);setAuthorized(true);setError('');
  }catch(err:any){setError(err.message);}};
  useEffect(()=>{load();},[activeSection,showHistory]);
  const revisionRef=useRef<number|null>(null);
  useDashboardRefresh(async()=>{const revision=await api.admin.getRevision();if(revisionRef.current!==revision){await load();revisionRef.current=revision;}},authorized);
  const action=async(task:()=>Promise<any>,message:string)=>{try{await task();await load();showToast(message,'success');}catch(err:any){showToast(err.message,'error');}};
  const handleApproveRfq=(id:string)=>{if(window.confirm('Confirm that all RFQ text and BoQ have been reviewed and contain no protected identity or contact information.'))action(()=>api.admin.publishRfq(id),'RFQ approved and published.');};
  const handleSendInvite=(e:React.FormEvent)=>{e.preventDefault();showToast('Zoho Mail delivery is not configured. No invitation was sent.','error');};
  const handleToggleUserStatus=(id:string,status:User['status'])=>action(()=>api.admin.updateUserStatus(id,status==='active'?'suspended':'active'),'Account status updated.');
  const handleUpdateQuoteStatus=(id:string,status:PublicQuoteRequest['status'])=>action(()=>api.admin.updatePublicQuoteStatus(id,status),'Request status updated.');
  if(!authorized)return <div className="min-h-screen bg-[#f7f6f2] p-8 text-[#123540]"><form className="bg-white border rounded p-6 max-w-md mx-auto space-y-4" onSubmit={async e=>{e.preventDefault();try{const session=await api.auth.login(email,password);if(session.user.role!=='admin'){await api.auth.logout();throw Error('Active Admin account required.');}await load();}catch(err:any){setError(err.message);}}}><h1 className="font-bold text-xl">Urban Procures Operations Console</h1>{error&&<p role="alert">{error}</p>}<label className="block">Admin email<input className="border p-2 w-full" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block">Password<input className="border p-2 w-full" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="bg-[#123f47] text-white p-2 rounded">Sign In</button></form></div>;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']">
      {notices.length>0&&<aside className="p-4 border-b bg-[#fff5eb]" aria-label="Withdrawal notifications"><strong>Recent withdrawal notices</strong>{notices.slice(0,5).map(n=><p key={n.id}>{n.message} <small>{new Date(n.createdAt).toLocaleString()}</small></p>)}</aside>}
      {/* Top Banner (Approved Design) */}
      <div className="bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']">
              <span>Operational Administration</span>
              <span aria-hidden="true">·</span>
              <span>Document Review & Procurement Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-[#eb6a32]" />
              Urban Procures Operations Console
            </h1>
            <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
              Operational tools: Inspect uploaded drawings & BoQs, approve RFQs, review vendor terms, and audit service charges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#e3edeb] bg-[#082631] border border-[#194048] px-3 py-1.5 rounded-[5px] font-mono font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eb6a32] animate-pulse"></span>
              Admin Session Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#e1e7e4] pb-4 mb-6 text-xs">
          <button
            onClick={() => setActiveSection('documents')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'documents'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#eb6a32]" />
            Document Inspector ({documents.length})
          </button>

          <button
            onClick={() => setActiveSection('rfqs')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'rfqs'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            RFQ Publishing Queue ({rfqs.filter((r) => r.status === 'submitted').length} Pending)
          </button>

          <button
            onClick={() => setActiveSection('public_quotes')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'public_quotes'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Get a Quote Requests ({publicQuotes.length})
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'users'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            User & Account Controls ({users.length})
          </button>

          <button
            onClick={() => setActiveSection('vendors')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'vendors'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Vendor Terms & Verification ({vendors.length})
          </button>

          <button
            onClick={() => setActiveSection('charges')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'charges'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Service Charge Engine
          </button>

          <button
            onClick={() => setActiveSection('invitations')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'invitations'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Candidate Invitations
          </button>

          <button
            onClick={() => setActiveSection('audit')}
            className={`px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'audit'
                ? 'bg-[#123540] text-white'
                : 'text-[#63797b] hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Audit Trail ({auditEvents.length})
          </button>
        </div>

<div className="flex gap-4 mb-4 text-xs"><button className="underline" onClick={load}>Refresh Records</button> <label className="ml-4"><input type="checkbox" checked={showHistory} onChange={e=>setShowHistory(e.target.checked)}/> Show history (includes recalled/removed records)</label> <small className="ml-4">Updates automatically every 5 seconds.</small><button className="underline" onClick={async()=>{await api.auth.logout();setAuthorized(false);setPassword('');}}>Sign Out</button>{error&&<p role="alert">{error}</p>}</div>
        {/* SECTION 1: DOCUMENT INSPECTOR (Solves the legacy bug where admin could only see counters) */}
        <button onClick={()=>setActiveSection('terms')} className="mb-5 px-4 py-2 bg-[#123f47] text-white text-xs font-bold rounded-[5px]">Terms Acceptance Evidence</button>
        {activeSection === 'terms' && <AdminTermsPanel/>}
        {activeSection === 'documents' && (
          <div className="space-y-4">
            <div className="bg-[#eef6f5] border border-[#123f47]/30 p-4 rounded-[6px] text-xs text-[#123f47] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#eb6a32] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold font-['Manrope']">Document Review Capability (Resolved Legacy Defect)</strong>
                Administrators can directly OPEN, inspect metadata, review drawings, BoQs, and download files stored in Cloudflare R2.
              </div>
            </div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-[0_9px_25px_rgba(25,60,65,0.04)]">
              <div className="p-4 bg-[#f7f6f2] border-b border-[#e1e7e4] flex justify-between items-center text-xs font-bold text-[#123540]">
                <span>Registered Documents & Attachments ({documents.length} Files)</span>
                <span className="font-mono text-[#63797b]">Storage: private Cloudflare R2</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]">
                    <tr>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">R2 Object Key</th>
                      <th className="py-3 px-4">Associated Entity</th>
                      <th className="py-3 px-4">Document Purpose</th>
                      <th className="py-3 px-4 text-right">Size</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e7e4]">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#f7f6f2]/60">
                        <td className="py-3 px-4 font-semibold text-[#123540] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#eb6a32]" />
                          <span>{doc.fileName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#63797b]">
                          {doc.r2ObjectKey}
                        </td>
                        <td className="py-3 px-4">
                          {doc.rfqId ? (
                            <span className="font-mono text-[#123f47] bg-[#f7f6f2] border border-[#e1e7e4] px-2 py-0.5 rounded font-bold">
                              RFQ #{doc.rfqId}
                            </span>
                          ) : (
                            <span className="font-mono text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded font-bold">
                              {doc.publicQuoteId ? 'Public Quote' : 'Account document'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="uppercase font-mono text-[10px] bg-[#f7f6f2] border border-[#e1e7e4] px-2 py-0.5 rounded font-bold text-[#123540]">
                            {doc.documentPurpose}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#63797b]">
                          {doc.fileSizeBytes < 1024 ? `${doc.fileSizeBytes} B` : `${(doc.fileSizeBytes / 1024).toFixed(1)} KB`}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setInspectDoc(doc)}
                            className="bg-[#123540] hover:bg-[#082631] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#eb6a32]" />
                            <span>Open & Review</span>
                          </button>
                          {!showHistory&&doc.rfqId&&doc.documentPurpose!=='trade_license'&&<button className="block underline text-xs mt-2" onClick={()=>{if(window.confirm('Confirm this document contains no protected identity or contact information.'))action(()=>api.admin.releaseDocument(doc.id),'Document released to eligible Vendors.');}}>Approve identity-safe release</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: RFQ PUBLISHING QUEUE */}
        {activeSection === 'rfqs' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
              RFQ Tender Review & Publishing Operations
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {rfqs.map((rfq) => (
                <div key={rfq.id} className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                        {rfq.referenceCode}
                      </span>
                      <span className="text-xs font-bold text-[#eb6a32]">{rfq.category}</span>
                      <span className="text-[#bccbca]">·</span>
                      <span className="text-xs text-[#63797b]">{rfq.locationEmirate}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#123540] font-['Manrope']">{rfq.title}</h3>
                    <p className="text-xs text-[#63797b] mt-0.5">
                      BoQ: {rfq.items.length} items · Drawings: {rfq.documents.length} files · Status: <span className="font-mono uppercase font-bold text-[#eb6a32]">{rfq.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rfq.status === 'submitted' && (
                      <button
                        onClick={() => handleApproveRfq(rfq.id)}
                        className="bg-[#123f47] hover:bg-[#0e3037] text-white font-bold px-4 py-2 rounded-[4px] text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#eb6a32]" />
                        <span>Approve & Publish to Vendors</span>
                      </button>
                    )}
                    {rfq.documents[0] && (
                      <button
                        onClick={() => setInspectDoc(rfq.documents[0])}
                        className="px-3 py-2 rounded-[4px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]"
                      >
                        Inspect Specifications
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: PUBLIC GET A QUOTE QUEUE */}
        {activeSection === 'public_quotes' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
              Public Property Quotation Requests
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {publicQuotes.map((quote) => (
                <div key={quote.id} className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e1e7e4]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                          {quote.referenceCode}
                        </span>
                        <span className="font-bold text-[#123540] capitalize text-sm">{quote.propertyType}</span>
                        <span className="text-[#bccbca]">·</span>
                        <span className="text-xs text-[#63797b]">{quote.locationCommunity}, {quote.locationEmirate}</span>
                      </div>
                      <div className="text-xs text-[#63797b]">
                        Customer: <strong className="text-[#123540]">{quote.customerName}</strong> ({quote.customerPhone} · {quote.customerEmail})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {quote.siteVisitRequested ? (
                        <span className="bg-[#eb6a32]/10 text-[#eb6a32] border border-[#eb6a32]/30 font-bold px-3 py-1 rounded text-xs font-mono">
                          ★ AED 100 Site Visit Requested
                        </span>
                      ) : (
                        <span className="bg-[#f7f6f2] text-[#63797b] border border-[#e1e7e4] font-medium px-3 py-1 rounded text-xs">
                          Direct Submission (AED 0)
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold uppercase text-[#123f47] bg-[#eef6f5] px-2 py-1 rounded">
                        {quote.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#123540] leading-relaxed bg-[#f7f6f2] p-3 rounded border border-[#e1e7e4]">
                    <strong className="text-[#123540] block mb-0.5 font-['Manrope']">Work Description:</strong>
                    {quote.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                    <span className="text-[#a8b8b8]">Received: {new Date(quote.createdAt).toLocaleString()}</span>
                    
                    <div className="flex items-center gap-2">
                      {quote.attachments && quote.attachments.length > 0 && (
                        <button
                          onClick={() => setInspectDoc(quote.attachments![0])}
                          className="text-[#eb6a32] font-bold hover:underline flex items-center gap-1 mr-2"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Inspect Attached Drawing
                        </button>
                      )}

                      {quote.status === 'received' && (
                        <button
                          onClick={() => handleUpdateQuoteStatus(quote.id, 'under_review')}
                          className="bg-[#123540] hover:bg-[#082631] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {quote.siteVisitRequested && quote.status !== 'site_visit_scheduled' && (
                        <button
                          onClick={() => {const scheduledDate=window.prompt('Site visit date and time (ISO format)');const inspectorName=window.prompt('Inspector name');if(scheduledDate&&inspectorName)action(()=>api.admin.scheduleSiteVisit(quote.id,scheduledDate,inspectorName),'Site visit scheduled.');}}
                          className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs"
                        >
                          Schedule AED 100 Site Visit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: USER & ACCOUNT CONTROLS */}
        {activeSection === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
              User Accounts & Status Controls
            </h2><div className="space-y-3">{contractors.map(c=><div key={c.id} className="bg-white border rounded p-3 text-xs"><strong>{c.companyName}</strong> · License {c.tradeLicenseNumber} · {c.verifiedAt?'Verified':'Pending review'}{documents.filter(d=>d.uploaderUserId===c.userId&&d.documentPurpose==='trade_license').map(d=><button key={d.id} className="underline ml-3" onClick={()=>setInspectDoc(d)}>Review license: {d.fileName}</button>)}{!documents.some(d=>d.uploaderUserId===c.userId&&d.documentPurpose==='trade_license')&&<span className="ml-3 text-red-700">Trade license document not uploaded</span>}<button disabled={!documents.some(d=>d.uploaderUserId===c.userId&&d.documentPurpose==='trade_license')||!!c.verifiedAt} className="underline ml-3 disabled:opacity-50" onClick={()=>{if(window.confirm('Confirm you opened and reviewed this company’s trade license and verified the details.'))action(()=>api.admin.verifyContractor(c.id),'Contractor verified after document review.');}}>Verify after document review</button></div>)}</div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]">
                  <tr>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e7e4]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f7f6f2]/50">
                      <td className="py-3 px-4 font-bold text-[#123540]">{u.email}</td>
                      <td className="py-3 px-4 uppercase font-mono text-[10px] text-[#eb6a32] font-bold">{u.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-[#123f47] text-white'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#63797b]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-[4px] text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-[#123f47] text-white hover:bg-[#0e3037]'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: VENDOR VERIFICATION & TERMS AUDIT */}
        {activeSection === 'vendors' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
              Vendor Onboarding & Click-Wrap Terms Evidence
            </h2>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]">
                  <tr>
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Trade License</th>
                    <th className="py-3 px-4">Trade Categories</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Click-Wrap Terms Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e7e4]">
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td className="py-3 px-4 font-bold text-[#123540]">{v.companyName}</td>
                      <td className="py-3 px-4 font-mono">{v.tradeLicenseNumber}</td>
                      <td className="py-3 px-4 text-[#63797b]">{v.tradeCategories.join(', ')}</td>
                      <td className="py-3 px-4">
                        <span className="text-white bg-[#123f47] px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px]">
                          {v.verificationStatus}
                        </span>
                        <div className="mt-3 text-[#123540] normal-case text-xs">                          {documents.filter(d=>d.uploaderUserId===v.userId&&d.documentPurpose==='trade_license').map(d=><button key={d.id} className="block underline mt-2" onClick={()=>setInspectDoc(d)}>Review license: {d.fileName}</button>)}{!documents.some(d=>d.uploaderUserId===v.userId&&d.documentPurpose==='trade_license')&&<span className="block mt-2 text-red-700">Trade license document not uploaded</span>}<button disabled={!documents.some(d=>d.uploaderUserId===v.userId&&d.documentPurpose==='trade_license')||v.verificationStatus==='verified'} className="block underline mt-2 disabled:opacity-50" onClick={()=>{if(window.confirm('Confirm you opened and reviewed this company’s trade license and verified the details.'))action(()=>api.admin.verifyVendor(v.id,'verified'),'Vendor verified after trade-license review.');}}>Verify after document review</button>
</div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="underline" onClick={()=>setActiveSection('terms')}>Inspect authenticated Terms evidence</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 6: SERVICE CHARGE ENGINE */}
        {activeSection === 'charges' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
                Service Charge Records & Calculator
              </h2>
              <p className="text-xs text-[#63797b] mt-1">
                The standard <strong>Vendor Service Charge</strong> is a Vendor obligation. Contractor / Client Service Charge: AED 0.
              </p>
            </div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#123540] uppercase font-['Manrope']">
                Active Benchmark Configuration
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-[#f7f6f2] border border-[#e1e7e4] text-xs">
                <div>
                  <span className="text-[#63797b] block">Default Percentage</span>
                  <strong className="text-[#123540] font-mono text-sm">2.5%</strong>
                </div>
                <div>
                  <span className="text-[#63797b] block">Minimum Threshold</span>
                  <strong className="text-[#123540] font-mono text-sm">AED 500.00</strong>
                </div>
                <div>
                  <span className="text-[#63797b] block">Site Visit Fee</span>
                  <strong className="text-[#eb6a32] font-mono text-sm">AED 100.00</strong>
                </div>
                <div>
                  <span className="text-[#63797b] block">Manpower Rule</span>
                  <strong className="text-[#123540] font-mono text-sm">AED 1 per person per hour</strong>
                </div>
              </div>

              <div className="space-y-2">{awards.map(a=><p key={a.id} className="text-xs border rounded p-2">Award {a.id} · {a.awardType} · Vendor Terms {a.vendorTermsVersion} · Acceptance {a.vendorTermsAcceptanceId} · Contractor AED {a.contractorServiceChargeAed} · Manpower {a.manpowerQuantity??0} person-hours × AED {a.manpowerRateAed??0} = AED {a.manpowerChargeAed}</p>)}{quotations.map(q=><p key={q.id} className="text-xs border rounded p-2">Quotation {q.referenceCode} · RFQ {q.rfqId} · AED {q.totalAmountAed} · {q.status}</p>)}{charges.map(charge=><p key={charge.id} className="text-xs border rounded p-2">Award {charge.awardId} · Vendor charge AED {charge.totalChargeAed} · {charge.status}</p>)}</div>{/* Live Calculator */}
              <div className="pt-4 border-t border-[#e1e7e4]">
                <h4 className="text-xs font-bold uppercase text-[#123540] mb-3 font-['Manrope']">
                  Live Calculator & Audit Simulator
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#63797b] font-semibold mb-1">Contract Amount (AED)</label>
                    <input
                      type="number"
                      value={simContractAmount}
                      onChange={(e) => setSimContractAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#63797b] font-semibold mb-1">Site Visit Option</label>
                    <select
                      value={simSiteVisit ? 'yes' : 'no'}
                      onChange={(e) => setSimSiteVisit(e.target.value === 'yes')}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] text-sm bg-white"
                    >
                      <option value="no">Public quote without site visit (AED 0)</option>
                      <option value="yes">Separate public site visit fee: AED 100</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Result */}
                {(() => {
                  const calc = ServiceChargeEngine.calculate({
                    contractAmountAed: parseFloat(simContractAmount) || 0,
                  });

                  return (
                    <div className="mt-4 p-5 rounded-[6px] bg-[#123f47] text-white space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[#c3d9d8]">
                        <span>Calculated Service Charge Breakdown</span>
                        <span className="font-mono text-[#f6a47f] font-bold">ENGINE V2.0</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-[#f6a47f]">
                        Vendor Service Charge: AED {calc.totalServiceChargeAed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-[#e3edeb] text-[11px] leading-relaxed">
                        {calc.explanation}
                      </p>
                      <p>Contractor / Client Service Charge: AED 0. Separate public site visit fee: AED {simSiteVisit?100:0}.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: INVITATION ENGINE QUEUE */}
        {activeSection === 'invitations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
                Candidate Invitation & Onboarding Queue
              </h2>
              <p className="text-xs text-[#63797b] mt-1">
                Zoho Mail delivery must be configured before invitations can be sent.
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123540] mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Habtoor Glazing LLC"
                  value={inviteOrg}
                  onChange={(e) => setInviteOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123540] mb-1">Candidate Email</label>
                <input
                  type="email"
                  required
                  placeholder="tenders@org.ae"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123540] mb-1">Portal Type</label>
                <select
                  value={inviteType}
                  onChange={(e) => setInviteType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white"
                >
                  <option value="vendor">Vendor / Supplier</option>
                  <option value="contractor">Main Contractor</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-2.5 px-4 rounded-[5px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-[#eb6a32]" />
                  <span>Dispatch Invitation</span>
                </button>
              </div>
            </form>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]">
                  <tr>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Invitation Token</th>
                    <th className="py-3 px-4">Queue Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e7e4]">
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3 px-4 font-bold text-[#123540]">{inv.organizationName}</td>
                      <td className="py-3 px-4 text-[#63797b]">{inv.recipientEmail}</td>
                      <td className="py-3 px-4 uppercase font-mono text-[10px]">{inv.inviteType}</td>
                      <td className="py-3 px-4 font-mono text-[#63797b]">{inv.invitationToken}</td>
                      <td className="py-3 px-4">
                        <span className="text-white bg-[#123f47] px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px]">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 8: IMMUTABLE AUDIT TRAIL */}
        {activeSection === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
              Immutable Marketplace Audit Log
            </h2>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-[#f7f6f2] text-[#63797b] uppercase text-[10px] border-b border-[#e1e7e4]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Evidence Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e7e4]">
                  {auditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[#f7f6f2]/50">
                      <td className="py-2.5 px-4 text-[#63797b] text-[11px] whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#123540]">
                        {evt.actorRole}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#eb6a32]">
                        {evt.actionType}
                      </td>
                      <td className="py-2.5 px-4 text-[#63797b]">
                        {evt.resourceType} #{evt.resourceId}
                      </td>
                      <td className="py-2.5 px-4 text-[#63797b] text-[10px] truncate max-w-xs">
                        {evt.payloadJson || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Document Inspector Modal */}
      {inspectDoc && (
        <DocumentViewerModal
          document={inspectDoc}
          onClose={() => setInspectDoc(null)}
          viewerRole="admin"
          approvalActions={inspectDoc.documentPurpose==='trade_license'?<div className="flex flex-wrap gap-3 items-center"><strong>Trade license belongs to: {vendors.find(v=>v.userId===inspectDoc.uploaderUserId)?.companyName??contractors.find(c=>c.userId===inspectDoc.uploaderUserId)?.companyName??'Account owner'}</strong>{vendors.filter(v=>v.userId===inspectDoc.uploaderUserId).map(v=><button key={v.id} disabled={v.verificationStatus==='verified'} className="bg-[#eb6a32] text-white px-4 py-2 rounded disabled:opacity-50" onClick={()=>{if(window.confirm('Confirm you reviewed this license and approve this Vendor.'))action(()=>api.admin.verifyVendor(v.id,'verified'),'Vendor approved. Vendor dashboard will update automatically.');}}>{v.verificationStatus==='verified'?'Vendor approved':'Approve Vendor'}</button>)}{contractors.filter(c=>c.userId===inspectDoc.uploaderUserId).map(c=><button key={c.id} disabled={!!c.verifiedAt} className="bg-[#eb6a32] text-white px-4 py-2 rounded disabled:opacity-50" onClick={()=>{if(window.confirm('Confirm you reviewed this license and approve this Contractor.'))action(()=>api.admin.verifyContractor(c.id),'Contractor approved.');}}>{c.verifiedAt?'Contractor approved':'Approve Contractor'}</button>)}<p className="text-xs">Approval applies to this uploading account. Separate Contractor and Vendor accounts each require their own license upload.</p></div>:undefined}
        />
      )}
    </div>
  );
};
