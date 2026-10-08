import {DocumentAttachments,type Attachment} from '../components/DocumentAttachments.tsx';
import {AccountDocuments} from '../components/AccountDocuments.tsx';
import {PasswordRecovery} from '../components/PasswordRecovery.tsx';
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import { TermsClickwrap, TermsReacceptance, type TermsDocument } from '../components/TermsClickwrap.tsx';
import { RFQ, Quotation, VendorProfile, User } from '../types/index.ts';
import { useToast } from '../components/ToastContext.tsx';
import { HardHat, FileText, CheckCircle2, Lock, Unlock, ArrowRight, ShieldCheck, ChevronRight, AlertCircle, Award, Clock, LogIn, UserPlus, LogOut, Upload, Phone, Mail, Building2 } from 'lucide-react';
import { DocumentViewerModal } from '../components/DocumentViewerModal.tsx';

interface VendorPageProps {
  onNavigate: (path: string) => void;
}

export const VendorPage: React.FC<VendorPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'rfqs' | 'my_quotes' | 'profile'>('rfqs');
  const [categoryFilter, setCategoryFilter] = useState<'matching' | 'all'>('matching');
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Vendor Registration State
  const [regCompany, setRegCompany] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regCategories, setRegCategories] = useState<string[]>(['Joinery & Carpentry']);
  const [regEmirates, setRegEmirates] = useState<string[]>(['Dubai']);
  const [regContact, setRegContact] = useState('');
  const [regPhone, setRegPhone] = useState('+971 ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [termsModalOpen,setTermsModalOpen]=useState(false);
  const [regAccepted,setRegAccepted]=useState(false);
  const [regTerms,setRegTerms]=useState<TermsDocument|null>(null);
  const [currentUser,setCurrentUser]=useState<User|null>(null);
  const [vendor,setVendor]=useState<VendorProfile|null>(null);
  const [hasAcceptedTerms,setHasAcceptedTerms]=useState(false);
  useEffect(()=>{const blocked=()=>setHasAcceptedTerms(false);window.addEventListener('urbanprocures:terms-required',blocked);return()=>window.removeEventListener('urbanprocures:terms-required',blocked);},[]);
  const [eligibleRfqs,setEligibleRfqs]=useState<RFQ[]>([]);
  const [myQuotations,setMyQuotations]=useState<Quotation[]>([]);
  const [dataError,setDataError]=useState('');
  // Quotation Submission State
  const [quoteLeadTime, setQuoteLeadTime] = useState('24');
  const [quoteValidity, setQuoteValidity] = useState('30');
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [itemRates, setItemRates] = useState<Record<string, number>>({});
  const [quoteAttachments,setQuoteAttachments]=useState<Attachment[]>([]);
  const [filesBusy,setFilesBusy]=useState(false),[pricingMode,setPricingMode]=useState<'itemized'|'total'|'file'>('itemized'),[packageTotal,setPackageTotal]=useState('');
  const quoteLock=useRef(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const refreshVendor=async()=>{
    const session=await api.auth.me();
    if(!session.authenticated || session.user.role!=='vendor'){setCurrentUser(null);setVendor(null);return;}
    setCurrentUser(session.user);setVendor(session.vendor);setHasAcceptedTerms(session.termsAccepted===true);
    setDataError('');setEligibleRfqs([]);setMyQuotations([]);
    if(session.termsAccepted)try{setEligibleRfqs(await api.vendor.getMatchingRfqs());setMyQuotations(await api.vendor.getMyQuotes());}catch(err:any){setDataError(err.message);}
  };
  useEffect(()=>{refreshVendor().catch(err=>setDataError(err.message));},[]);
  const isVendorLoggedIn=currentUser?.role==='vendor';
  const matchingRfqs=eligibleRfqs;

  // Calculate total quote amount from item rates
  const calculateTotal = (rfq: RFQ) => {
    if(pricingMode!=='itemized')return Number(packageTotal)||0;
    return rfq.items.reduce((sum, item) => {
      const rate = itemRates[item.id] || 0;
      return sum + rate * item.quantity;
    }, 0);
  };

  const handleLoginSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoginError(null);
    try{const res=await api.auth.login(loginEmail,loginPassword);if(res.user.role!=='vendor'){await api.auth.logout();throw new Error('Vendor account required.');}await refreshVendor();setActiveTab('rfqs');}
    catch(err:any){setLoginError(err.message);}
  };
  const handleRegisterSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setRegError(null);
    if(!regAccepted||!regTerms){setRegError('Explicit acceptance of current Vendor Terms is required.');return;}
    try{
      await api.auth.registerVendor({companyName:regCompany.trim(),tradeLicenseNumber:regLicense.trim(),tradeCategories:regCategories,emiratesServiced:regEmirates,emirate:regEmirates[0],address:`${regEmirates[0]}, UAE`,contactPerson:regContact.trim(),contactPhone:regPhone.trim(),email:regEmail.trim(),password:regPassword,acceptTerms:regAccepted,termsVersionId:regTerms.id});
      await refreshVendor();setActiveTab('rfqs');showToast('Vendor registration recorded. Verification is pending.','success');
    }catch(err:any){setRegError(err.message);}
  };

  const handleQuotationSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();if(quoteLock.current||filesBusy)return;setQuoteError(null);if(!selectedRfq||!vendor)return;
    if(!hasAcceptedTerms){setTermsModalOpen(true);return;}
    quoteLock.current=true;setIsSubmittingQuote(true);
    try{
      const attachments=quoteAttachments;
      await api.vendor.submitQuote(selectedRfq.id,{attachments,pricingMode,totalAmountAed:Number(packageTotal),leadTimeDays:Number(quoteLeadTime),validityDays:Number(quoteValidity),paymentTerms:quotePaymentTerms,notes:quoteNotes,items:selectedRfq.items.map(item=>({rfqItemId:item.id,unitRateAed:itemRates[item.id]||0}))});
      await refreshVendor();setSelectedRfq(null);setActiveTab('my_quotes');showToast('Quotation saved.','success');
    }catch(err:any){setQuoteError(err.message);}finally{quoteLock.current=false;setIsSubmittingQuote(false);}
  };
  if(isVendorLoggedIn && (!hasAcceptedTerms||termsModalOpen))return <TermsReacceptance role="vendor" onAccepted={()=>{setTermsModalOpen(false);refreshVendor();}}/>;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']">
      {currentUser?<AccountDocuments/>:<PasswordRecovery/>}
      {dataError && <p role="alert" className="p-4 bg-white border border-[#e1e7e4] text-red-700 text-xs">{dataError}</p>}
      {/* Header Banner (Approved Design) */}
      <div className="bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']">
              <span>Vendor Portal</span>
              <span aria-hidden="true">·</span>
              <span>Subcontractor & Supplier Opportunities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3">
              <HardHat className="w-7 h-7 text-[#eb6a32]" />
              Vendor RFQ Discovery
            </h1>
            {isVendorLoggedIn && vendor ? (
              <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
                Organization: <strong className="text-white">{vendor.companyName}</strong> (License: {vendor.tradeLicenseNumber} · Categories: {vendor.tradeCategories.join(', ')})
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
                For suppliers, vendors, subcontractors, and specialist service providers.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isVendorLoggedIn && vendor ? (
              <>
                {!hasAcceptedTerms ? (
                  <button
                    onClick={() => setTermsModalOpen(true)}
                    className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Action: Accept Vendor Terms</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-[#e3edeb] bg-[#082631] border border-[#194048] px-3 py-1.5 rounded-[5px] font-medium font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#eb6a32]" />
                    Current Terms Accepted
                  </span>
                )}
                <button
                  onClick={() => {
                    api.auth.logout().then(()=>{setCurrentUser(null);setVendor(null);setEligibleRfqs([]);setMyQuotations([]);setHasAcceptedTerms(false);});
                    showToast('You have been signed out successfully.', 'info');
                  }}
                  className="text-xs text-[#c3d9d8] hover:text-white flex items-center gap-1 px-2 py-1 ml-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-[#c3d9d8]">
                Please sign in or register to browse RFQs and submit bids.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* VIEW 0: IF NOT LOGGED IN -> AUTH SCREEN */}
        {!isVendorLoggedIn ? (
          <div className="max-w-xl mx-auto bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.05)] p-8">
            <div className="flex border-b border-[#e1e7e4] mb-6">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'border-[#eb6a32] text-[#123540]'
                    : 'border-transparent text-[#63797b] hover:text-[#123540]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Vendor Login
              </button>
              <button
                onClick={() => {setRegAccepted(false);setRegTerms(null);setAuthMode('register');}}
                className={`flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${
                  authMode === 'register'
                    ? 'border-[#eb6a32] text-[#123540]'
                    : 'border-transparent text-[#63797b] hover:text-[#123540]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Register as Vendor
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {loginError}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Vendor Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Account Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5"
                >
                  Sign In to Vendor Portal
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {regError && (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}
                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Company / Trade Name <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Futtaim Glass & Aluminum"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Trade License Number <span className="text-[#eb6a32]">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TL-882910"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Primary Trade Category</label>
                    <select
                      value={regCategories[0] || 'Joinery & Carpentry'}
                      onChange={(e) => setRegCategories([e.target.value])}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white"
                    >
                      <option value="Joinery & Carpentry">Joinery & Carpentry</option>
                      <option value="Gypsum & Drywall">Gypsum & Drywall</option>
                      <option value="MEP & HVAC">MEP & HVAC</option>
                      <option value="Glazing & Facades">Glazing & Facades</option>
                      <option value="Flooring, Marble & Tiling">Flooring, Marble & Tiling</option>
                      <option value="Painting & Wall Finishes">Painting & Wall Finishes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Contact Person <span className="text-[#eb6a32]">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Mobile Phone <span className="text-[#eb6a32]">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 55 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Business Email <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="sales@vendorcompany.ae"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Set Account Password <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                  />
                </div>

                <TermsClickwrap role="vendor" checked={regAccepted} onChange={setRegAccepted} onDocument={setRegTerms}/>
                <button
                  type="submit"
                  disabled={!regAccepted || !regTerms}
                  className="w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5"
                >
                  ACCEPT TERMS & COMPLETE REGISTRATION
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1e7e4] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRfq(null);
                    setActiveTab('rfqs');
                  }}
                  className={`px-4 py-2 rounded-[5px] text-xs font-bold transition-colors ${
                    activeTab === 'rfqs' && !selectedRfq
                      ? 'bg-[#123540] text-white'
                      : 'text-[#63797b] hover:bg-white'
                  }`}
                >
                  Discover RFQ Tenders ({matchingRfqs.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedRfq(null);
                    setActiveTab('my_quotes');
                  }}
                  className={`px-4 py-2 rounded-[5px] text-xs font-bold transition-colors ${
                    activeTab === 'my_quotes'
                      ? 'bg-[#123540] text-white'
                      : 'text-[#63797b] hover:bg-white'
                  }`}
                >
                  My Quotations
                </button>
              </div>

              {activeTab === 'rfqs' && !selectedRfq && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#63797b]">Filter:</span>
                  <button
                    onClick={() => setCategoryFilter('matching')}
                    className={`px-2.5 py-1 rounded-[4px] font-semibold border ${
                      categoryFilter === 'matching'
                        ? 'bg-white border-[#123540] text-[#123540]'
                        : 'border-[#e1e7e4] text-[#63797b]'
                    }`}
                  >
                    Matching My Trade
                  </button>
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-[4px] font-semibold border ${
                      categoryFilter === 'all'
                        ? 'bg-white border-[#123540] text-[#123540]'
                        : 'border-[#e1e7e4] text-[#63797b]'
                    }`}
                  >
                    All Open RFQs ({eligibleRfqs.length})
                  </button>
                </div>
              )}
            </div>

            {/* VIEW 1: RFQ DISCOVERY */}
            {activeTab === 'rfqs' && !selectedRfq && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
                      Active RFQ Opportunities
                    </h2>
                    <p className="text-xs text-[#63797b] mt-0.5">
                      Pre-Award Confidentiality Active: Client contact details are masked as <code>Client #RFQ-XXXX</code>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {matchingRfqs.length === 0 ? (
                    <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]">
                      No RFQs found matching your categories. Switch filter to &quot;All Open RFQs&quot; above to see all public tenders.
                    </div>
                  ) : (
                    matchingRfqs.map((rfq) => {
                      const award = (rfq as any).award;
                      const isWon = award && award.vendorId === vendor?.id;

                      return (
                        <div
                          key={rfq.id}
                          className={`bg-white border rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.04)] hover:shadow-md transition-all ${
                            isWon ? 'border-2 border-[#123f47] bg-[#f7fbfb]' : 'border-[#e1e7e4]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e7e4]">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                                  {rfq.referenceCode}
                                </span>
                                <span className="text-xs font-bold text-[#eb6a32]">{rfq.category}</span>
                                <span className="text-[#bccbca]">·</span>
                                {/* STRICT MASKED CONTRACTOR DISPLAY NAME */}
                                <span className="text-xs font-bold text-[#123540] flex items-center gap-1 font-mono">
                                  {isWon ? <Unlock className="w-3.5 h-3.5 text-[#eb6a32]" /> : <Lock className="w-3.5 h-3.5 text-[#63797b]" />}
                                  {rfq.contractorDisplayName}
                                </span>
                              </div>
                              <h3 className="text-lg font-extrabold text-[#123540] font-['Manrope']">
                                {rfq.title}
                              </h3>
                              <p className="text-xs text-[#63797b] mt-0.5">
                                Project: {rfq.projectName} · Location: {rfq.locationEmirate}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {isWon ? (
                                <span className="text-xs font-bold text-white bg-[#123f47] px-3 py-1 rounded-[4px] font-mono uppercase">
                                  Awarded to You!
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-[#eb6a32] bg-[#eb6a32]/10 border border-[#eb6a32]/30 px-3 py-1 rounded-[4px] font-mono uppercase">
                                  Accepting Quotations
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  if (!hasAcceptedTerms) {
                                    setTermsModalOpen(true);
                                    return;
                                  }
                                  setSelectedRfq(rfq);setPricingMode('itemized');setPackageTotal('');setQuoteAttachments([]);setItemRates({});setQuoteError(null);
                                }}
                                className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 transition-colors shadow-sm active:translate-y-0.5"
                              >
                                <span>{isWon ? 'View Award Details' : 'Review & Submit Quote'}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#63797b]">
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Submission Deadline</span>
                              <span className="font-semibold text-[#123540]">{rfq.submissionDeadline}</span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">BoQ Item Count</span>
                              <span className="font-semibold text-[#123540]">{rfq.items.length} Line Items</span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Drawings & Specs</span>
                              <span className="font-semibold text-[#123540]">{rfq.documents.length} Files Attached</span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Identity Protection</span>
                              <span className="text-[#123f47] font-semibold">Pre-Award Masking Active</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: RFQ REVIEW & QUOTATION PREPARATION */}
            {selectedRfq && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setSelectedRfq(null)}
                  className="text-xs font-bold text-[#123540] hover:text-[#eb6a32] flex items-center gap-1"
                >
                  &larr; Back to RFQs
                </button>

                {/* RFQ Brief Card */}
                <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)]">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[#e1e7e4]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#63797b] mb-1">
                        <span>{selectedRfq.referenceCode}</span>
                        <span>·</span>
                        <span className="text-[#eb6a32] font-bold">{selectedRfq.category}</span>
                        <span>·</span>
                        <span>{selectedRfq.locationEmirate}</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#123540] font-['Manrope']">
                        {selectedRfq.title}
                      </h2>
                      <p className="text-xs text-[#63797b] mt-1">
                        Client Pseudonym: <strong className="font-mono text-[#123540]">{selectedRfq.contractorDisplayName}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedRfq.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setInspectDoc(doc)}
                          className="px-3 py-1.5 rounded-[4px] bg-[#f7f6f2] hover:bg-[#eef3f1] text-xs font-semibold text-[#123540] flex items-center gap-1.5 transition-colors border border-[#e1e7e4]"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#eb6a32]" />
                          <span>{doc.fileName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* POST-AWARD UNMASKED CONTRACTOR DETAILS (IF WON) */}
                  {selectedRfq.contractorContact && (
                    <div className="my-4 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2">
                      <div className="font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']">
                        <CheckCircle2 className="w-4 h-4 text-[#eb6a32]" />
                        Contract Award Confirmed · Client Contact Details Unmasked
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[#123540] pt-1">
                        <div>
                          <span className="text-[#63797b] block text-[10px]">Main Contractor</span>
                          <strong className="text-[#123540]">{selectedRfq.contractorCompany}</strong>
                        </div>
                        <div>
                          <span className="text-[#63797b] block text-[10px]">Project Site Address</span>
                          <span>{selectedRfq.contractorContact.address}</span>
                        </div>
                        <div>
                          <span className="text-[#63797b] block text-[10px]">Procurement Manager</span>
                          <span>{selectedRfq.contractorContact.contactPerson}</span>
                        </div>
                        <div>
                          <span className="text-[#63797b] block text-[10px]">Direct Phone</span>
                          <span className="font-mono text-[#123f47] font-bold">{selectedRfq.contractorContact.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="py-4 border-b border-[#e1e7e4]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#63797b] mb-2 font-['Manrope']">Scope Summary</h4>
                    <p className="text-xs text-[#123540] leading-relaxed">{selectedRfq.scopeDescription}</p>
                  </div>
                </div>

                {/* Quotation Submission Form */}
                <form onSubmit={handleQuotationSubmit} className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] space-y-6">
                  <label className="block text-xs font-semibold">Quotation method<select aria-label="Quotation method" value={pricingMode} onChange={e=>setPricingMode(e.target.value as typeof pricingMode)} className="block border border-[#bccbca] p-2 mt-2 rounded"><option value="itemized">Item-by-item pricing</option><option value="total">Total package amount</option><option value="file">Upload quotation file with total</option></select></label>
                  {pricingMode!=='itemized'&&<label className="block text-xs font-semibold">Total quotation amount (AED)<input aria-label="Total quotation amount (AED)" type="number" required min="0.01" step="0.01" value={packageTotal} onChange={e=>setPackageTotal(e.target.value)} className="block border border-[#bccbca] p-2 mt-2 rounded"/></label>}
                  {pricingMode==='itemized'&&<div>
                    <h3 className="text-base font-extrabold text-[#123540] font-['Manrope'] mb-1">
                      Itemized Quotation Pricing (Bill of Quantities)
                    </h3>
                    <p className="text-xs text-[#63797b] mb-4">
                      Enter your unit rate for each line item. Total bid amount calculates automatically.
                    </p>

                    <div className="overflow-x-auto border border-[#e1e7e4] rounded-[5px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#f7f6f2] text-[#63797b] border-b border-[#e1e7e4] uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-3 px-3">Item #</th>
                            <th className="py-3 px-3">Description</th>
                            <th className="py-3 px-3 text-right">Qty</th>
                            <th className="py-3 px-3">Unit</th>
                            <th className="py-3 px-3 text-right">Unit Rate (AED)</th>
                            <th className="py-3 px-3 text-right">Total (AED)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e1e7e4]">
                          {selectedRfq.items.map((item) => {
                            const rate = itemRates[item.id] || 0;
                            const lineTotal = rate * item.quantity;

                            return (
                              <tr key={item.id} className="hover:bg-[#f7f6f2]/50">
                                <td className="py-3 px-3 font-mono font-bold text-[#63797b]">{item.itemNumber}</td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-[#123540]">{item.description}</div>
                                  <div className="text-[10px] text-[#63797b] italic">{item.specifications}</div>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold">{item.quantity}</td>
                                <td className="py-3 px-3 font-mono text-[#63797b]">{item.unit}</td>
                                <td className="py-3 px-3 text-right">
                                  <input
                                    type="number"
                                    required
                                    min="0"
                                    step="any"
                                    placeholder="0.00"
                                    value={itemRates[item.id] !== undefined ? itemRates[item.id] : ''}
                                    onChange={(e) => {
                                      setItemRates({
                                        ...itemRates,
                                        [item.id]: parseFloat(e.target.value) || 0,
                                      });
                                    }}
                                    className="w-28 px-2 py-1.5 border border-[#bccbca] rounded text-right font-mono focus:border-[#eb6a32] bg-[#fdfdfd]"
                                  />
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-[#123540]">
                                  AED {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-[#f7f6f2] border-t border-[#e1e7e4]">
                          <tr>
                            <td colSpan={5} className="py-3 px-3 text-right font-bold text-[#123540] uppercase font-mono text-xs">
                              Total Bid Amount:
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-extrabold text-base text-[#eb6a32]">
                              AED {calculateTotal(selectedRfq).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>}

                  <DocumentAttachments files={quoteAttachments} onChange={setQuoteAttachments} onBusy={setFilesBusy} disabled={isSubmittingQuote||filesBusy} label={pricingMode==='file'?'Quotation file (required)':'Quotation and supporting files (optional)'}/>
                  <p className="text-xs text-[#63797b]">Quotation attachments are reviewed for identity protection before they are released to the contractor.</p>
                  {/* Commercial Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-[#123540] mb-1">
                        Execution Lead Time (Days) <span className="text-[#eb6a32]">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteLeadTime}
                        onChange={(e) => setQuoteLeadTime(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#123540] mb-1">
                        Quotation Validity (Days)
                      </label>
                      <input
                        type="number"
                        value={quoteValidity}
                        onChange={(e) => setQuoteValidity(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123540] mb-1">
                        Commercial Payment Terms
                      </label>
                      <input
                        type="text"
                        value={quotePaymentTerms}
                        onChange={(e) => setQuotePaymentTerms(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123540] mb-1">
                        Vendor Notes, Warranties & Scope Clarifications
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Material warranty duration, mockup submission schedule..."
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] leading-relaxed"
                      />
                    </div>
                  </div>

                  {quoteError && (
                    <div className="p-3.5 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{quoteError}</span>
                    </div>
                  )}

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-[#e1e7e4] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRfq(null)}
                      className="px-5 py-2.5 rounded-[5px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingQuote||filesBusy}
                      className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-6 py-2.5 rounded-[5px] text-xs shadow-sm transition-all active:translate-y-0.5"
                    >
                      {isSubmittingQuote ? 'Submitting...' : pricingMode==='itemized'?'Submit Itemized Quotation':pricingMode==='file'?'Submit Quotation File':'Submit Total Quotation'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 3: MY SUBMITTED QUOTATIONS */}
            {activeTab === 'my_quotes' && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
                  My Active Quotations & Award Status
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {myQuotations.length === 0 ? (
                    <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]">
                      You have not submitted quotations yet. Open <strong>Discover RFQ Tenders</strong> to submit competitive bids.
                    </div>
                  ) : (
                    myQuotations.map((quote) => {
                      const rfq = (quote as any).rfq as RFQ | undefined;
                      const isAwarded = quote.status === 'awarded';
                      const contractor = isAwarded ? (quote as any).contractorContact : null;

                      return (
                        <div
                          key={quote.id}
                          className={`bg-white border rounded-[6px] p-6 shadow-sm transition-all ${
                            isAwarded ? 'border-2 border-[#123f47] bg-[#f7fbfb]' : 'border-[#e1e7e4]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#e1e7e4]">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                                  {quote.referenceCode}
                                </span>
                                <span className="text-xs text-[#a8b8b8] font-mono">
                                  Submitted {new Date(quote.submittedAt).toLocaleDateString()}
                                </span>
                                {isAwarded && (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#123f47] px-2.5 py-0.5 rounded uppercase font-mono">
                                    <Award className="w-3.5 h-3.5 text-[#eb6a32]" />
                                    Awarded Tender Winner
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-[#123540] font-['Manrope']">
                                {rfq?.title || `Quotation for RFQ #${quote.rfqId}`}
                              </h3>
                            </div>

                            <div className="text-right">
                              <span className="text-xs text-[#63797b] uppercase block font-semibold">Total Amount</span>
                              <span className="text-lg font-bold text-[#123540] font-mono">
                                AED {quote.totalAmountAed.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* POST-AWARD UNMASKED CONTRACTOR CONTACT CARD */}
                          {isAwarded && contractor && (
                            <div className="my-4 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2">
                              <div className="font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']">
                                <CheckCircle2 className="w-4 h-4 text-[#eb6a32]" />
                                Award Confirmed — Main Contractor Details (Unmasked)
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[#123540] pt-1">
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Contractor Company</span>
                                  <strong className="text-[#123540] font-semibold">{contractor.companyName}</strong>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Trade License</span>
                                  <span className="font-mono">{contractor.tradeLicenseNumber} ({contractor.emirate})</span>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Procurement Lead</span>
                                  <span>{contractor.contactPerson}</span>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Direct Phone & Address</span>
                                  <span className="font-mono text-[#123f47] font-bold block">{contractor.contactPhone}</span>
                                  <span className="text-[11px] text-[#63797b] truncate block">{contractor.address}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 flex items-center justify-between text-xs text-[#63797b]">
                            <div>Lead Time: <strong className="text-[#123540]">{quote.leadTimeDays} days</strong></div>
                            <div>Validity: <strong className="text-[#123540]">{quote.validityDays} days</strong></div>
                            <div className="flex items-center gap-1 font-mono uppercase font-bold text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{quote.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {inspectDoc && (
        <DocumentViewerModal
          document={inspectDoc}
          onClose={() => setInspectDoc(null)}
          viewerRole="vendor"
        />
      )}
    </div>
  );
};
