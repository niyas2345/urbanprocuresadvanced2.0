import {AccountDocuments} from '../components/AccountDocuments.tsx';
import {PasswordRecovery} from '../components/PasswordRecovery.tsx';
import React, { useState, useEffect, useCallback } from 'react';
import { TermsClickwrap, TermsReacceptance, type TermsDocument } from '../components/TermsClickwrap.tsx';
import { api } from '../services/api.ts';
import { RFQ, Quotation, ContractorProfile, User } from '../types/index.ts';
import { useToast } from '../components/ToastContext.tsx';
import { Building2, Plus, FileText, CheckCircle2, ArrowRight, Eye, ShieldCheck, Download, Award, ChevronRight, Lock, Unlock, Phone, Mail, LogOut, Trash2, ArrowUpRight, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { DocumentViewerModal } from '../components/DocumentViewerModal.tsx';
import { ServiceChargeEngine } from '../../urbanprocures advanced/workers/serviceChargeEngine.ts';

interface ContractorPageProps {
  onNavigate: (path: string) => void;
}

export const ContractorPage: React.FC<ContractorPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create_rfq' | 'rfq_detail'>('dashboard');
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_evaluation' | 'draft' | 'awarded'>('all');
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  // Award Modal State
  const [awardModalQuote, setAwardModalQuote] = useState<Quotation | null>(null);
  const [isSubmittingAward, setIsSubmittingAward] = useState(false);

  // Auth & Session State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [rfqError, setRfqError] = useState<string | null>(null);

  // Live Backend Data States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotesForRfq, setQuotesForRfq] = useState<Quotation[]>([]);
  const [awardRecord, setAwardRecord] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [regAccepted,setRegAccepted]=useState(false);
  const [regTerms,setRegTerms]=useState<TermsDocument|null>(null);
  const [sessionTerms,setSessionTerms]=useState(false);
  useEffect(()=>{const blocked=()=>setSessionTerms(false);window.addEventListener('urbanprocures:terms-required',blocked);return()=>window.removeEventListener('urbanprocures:terms-required',blocked);},[]);

  // Registration Form State
  const [regCompany, setRegCompany] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regEmirate, setRegEmirate] = useState('Dubai');
  const [regAddress, setRegAddress] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regPhone, setRegPhone] = useState('+971 ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [editingRfqId,setEditingRfqId]=useState<string|null>(null);
  // Create RFQ Wizard State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Joinery & Carpentry');
  const [newProject, setNewProject] = useState('');
  const [newEmirate, setNewEmirate] = useState('Dubai');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTargetCompletion, setNewTargetCompletion] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newScope, setNewScope] = useState('');
  const [boqItems, setBoqItems] = useState([{description:'',quantity:1,unit:'nos',specifications:''}]);
  const [manpowerPersons,setManpowerPersons]=useState(''),[manpowerHours,setManpowerHours]=useState(''),[manpowerDays,setManpowerDays]=useState('1');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; size: number; dataUrl?: string }[]>([]);

  // Load RFQs from Real D1 Backend
  const loadRfqs = useCallback(async () => {
    try {
      const data = await api.contractor.getRfqs();
      setRfqs(data || []);
      if (data && data.length > 0 && !selectedRfqId) {
        setSelectedRfqId(data[0].id);
      }
    } catch {
      // Not logged in or error
    }
  }, [selectedRfqId]);

  // Load Quotes for Selected RFQ
  const loadQuotations = useCallback(async (rfqId: string) => {
    if (!rfqId) return;
    try {
      const res = await api.contractor.getQuotations(rfqId);
      setQuotesForRfq(res || []);
      const winner=(res||[]).find((q:any)=>q.status==='awarded');setAwardRecord(winner?{quotationId:winner.id}:null);
    } catch {
      setQuotesForRfq([]);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await api.auth.me();
        if (session && session.authenticated && session.user && session.user.role === 'contractor') {
          setCurrentUser(session.user);
          setContractor(session.contractor);
          setSessionTerms(session.termsAccepted===true);
          await loadRfqs();
        }
      } catch {
        // Not authenticated
      }
    }
    checkAuth();
  }, [loadRfqs]);

  // When selected RFQ changes, reload quotations
  useEffect(() => {
    if (currentUser && selectedRfqId) {
      loadQuotations(selectedRfqId);
    }
  }, [currentUser, selectedRfqId, loadQuotations]);

  const isContractorLoggedIn = !!currentUser && currentUser.role === 'contractor';

  const filteredRfqs = rfqs.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'under_evaluation') return r.status === 'under_evaluation' || r.status === 'receiving_quotations';
    if (statusFilter === 'draft') return r.status === 'draft' || r.status === 'submitted';
    if (statusFilter === 'awarded') return r.status === 'awarded';
    return true;
  });

  const currentRfq = rfqs.find((r) => r.id === selectedRfqId) || rfqs[0];

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      if (res.user.role !== 'contractor') {
        setLoginError('Account is not registered as a contractor.');
        showToast('This account is not a contractor organization.', 'error');
        return;
      }
      setCurrentUser(res.user);
      const session=await api.auth.me();
      setContractor(session.contractor);
      setSessionTerms(session.termsAccepted===true);
      setActiveTab('dashboard');
      showToast(`Welcome back, ${res.user.email}`, 'success');
      await loadRfqs();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if(!regAccepted || !regTerms){setRegError('Explicit acceptance of current Contractor Terms is required.');return;}
    if (!regCompany.trim() || !regLicense.trim() || !regEmail.trim() || !regPhone.trim() || !regContact.trim()) {
      setRegError('Please fill in all required company registration details.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.registerContractor({
        companyName: regCompany.trim(),
        tradeLicenseNumber: regLicense.trim(),
        emirate: regEmirate,
        address: regAddress.trim() || `${regEmirate}, UAE`,
        contactPerson: regContact.trim(),
        contactPhone: regPhone.trim(),
        email: regEmail.trim(),
        password: regPassword,
        acceptTerms:regAccepted,termsVersionId:regTerms.id,
      });

      setCurrentUser(res.user);
      const session=await api.auth.me();
      setContractor(session.contractor);
      setSessionTerms(session.termsAccepted===true);
      setActiveTab('dashboard');
      showToast(`Contractor organization "${regCompany}" successfully registered in D1!`, 'success', 'Account Created');
      await loadRfqs();
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add / Remove BoQ Item
  const handleAddBoqItem = () => {
    setBoqItems([...boqItems, { description: '', quantity: 1, unit: 'sqm', specifications: '' }]);
  };

  const handleRemoveBoqItem = (index: number) => {
    if (boqItems.length <= 1) return;
    setBoqItems(boqItems.filter((_, idx) => idx !== index));
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles([
          ...attachedFiles,
          {
            name: file.name,
            type: file.type || 'application/pdf',
            size: file.size,
            dataUrl: reader.result as string,
          },
        ]);
        showToast(`Document "${file.name}" attached successfully`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit RFQ
  const handleCreateRfqSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setRfqError(null);
    if (!newTitle.trim() || !newProject.trim() || !newScope.trim()) {
      setRfqError('Please fill in title, project name, and scope description.');
      return;
    }

    try {
      const data = {
        title: newTitle.trim(),
        category: newCategory,
        projectName: newProject.trim(),
        locationEmirate: newEmirate,
        submissionDeadline: newDeadline,
        targetCompletionDate: newTargetCompletion,
        estimatedBudgetAed: newBudget ? Number(newBudget) : undefined,
        procurementType: /manpower|labou?r/i.test(newCategory)?'manpower':'standard',
        manpowerPersons:Number(manpowerPersons),manpowerHoursPerPersonPerDay:Number(manpowerHours),manpowerDays:Number(manpowerDays),
        scopeDescription: newScope.trim(),
        status: isDraft ? 'draft' : 'submitted',
        items: boqItems.map((item, idx) => ({
          itemNumber: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          specifications: item.specifications,
        })),
        documents: attachedFiles.map((f) => ({
          fileName: f.name,
          fileType: f.type,
          fileSizeBytes: f.size,
          documentPurpose: 'drawing' as const,
          dataUrl: f.dataUrl,
        })),
      };
      const created=editingRfqId?await api.contractor.updateRfq(editingRfqId,{...data,documents:[]}):await api.contractor.createRfq(data);setEditingRfqId(null);

      await loadRfqs();
      setSelectedRfqId(created.id);
      setActiveTab('rfq_detail');
      showToast(
        isDraft ? 'RFQ draft saved.' : `RFQ "${created.title}" submitted for review.`,
        'success',
        isDraft ? 'Draft Saved' : 'RFQ Submitted'
      );
    } catch (err: any) {
      setRfqError(err.message || 'Failed to create RFQ');
      showToast(err.message || 'Failed to create RFQ', 'error');
    }
  };

  // Confirm Award
  const handleConfirmAward = async () => {
    if (!awardModalQuote || !currentRfq) return;
    setIsSubmittingAward(true);

    try {
      const res = await api.contractor.confirmAward(currentRfq.id, awardModalQuote.id);
      setIsSubmittingAward(false);
      setAwardModalQuote(null);
      setAwardRecord({...res.data,quotationId:awardModalQuote.id});
      showToast('Contract Award Confirmed! Identity and contact details have been mutually released.', 'success', 'Award Finalized');
      await loadRfqs();
      await loadQuotations(currentRfq.id);
    } catch (err: any) {
      setIsSubmittingAward(false);
      showToast(err.message || 'Failed to confirm award', 'error');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setContractor(null);
    setRfqs([]);
    showToast('You have been signed out successfully.', 'info');
  };

  if(isContractorLoggedIn && !sessionTerms)return <TermsReacceptance role="contractor" onAccepted={()=>{api.auth.me().then(session=>{setSessionTerms(session.termsAccepted===true);loadRfqs();});}}/>;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']">
      {currentUser?<AccountDocuments/>:<PasswordRecovery/>}
      {/* Top Banner (Approved Design) */}
      <div className="bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']">
              <span>Contractor Portal</span>
              <span aria-hidden="true">·</span>
              <span>Professional Procurement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#eb6a32]" />
              Contractor RFQ Management
            </h1>
            {isContractorLoggedIn && contractor ? (
              <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
                Organization: <strong className="text-white">{contractor.companyName}</strong> (License: {contractor.tradeLicenseNumber} · {contractor.emirate})
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#c3d9d8] mt-1">
                For main contractors, fit-out companies, interior design studios, and construction firms.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isContractorLoggedIn ? (
              <>
                <button
                  onClick={() => {setEditingRfqId(null);setActiveTab('create_rfq');}}
                  className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2.5 rounded-[5px] text-xs flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New RFQ</span>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2.5 rounded-[5px] text-xs font-bold transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-[#082631] text-[#f6a47f] border border-[#194048]'
                      : 'text-[#e3edeb] hover:bg-white/10'
                  }`}
                >
                  Dashboard ({rfqs.length})
                </button>
                <button
                  onClick={async () => {
                    await api.auth.logout();
                    setCurrentUser(null);
                    setContractor(null);
                    showToast('You have been signed out successfully.', 'info');
                  }}
                  className="text-xs text-[#c3d9d8] hover:text-white flex items-center gap-1 px-2 py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-[#c3d9d8]">
                Please sign in or register to access your procurement dashboard.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* VIEW 0: IF NOT LOGGED IN -> AUTH SCREEN */}
        {!isContractorLoggedIn ? (
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
                Contractor Login
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
                Register Organization
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
                  <label className="block font-semibold text-[#123540] mb-1">Company Email Address</label>
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
                  Sign In to Contractor Dashboard
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
                  <label className="block font-semibold text-[#123540] mb-1">Company Name <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Naboodah Fit-Out LLC"
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
                      placeholder="e.g. CN-109281"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Emirate</label>
                    <select
                      value={regEmirate}
                      onChange={(e) => setRegEmirate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white"
                    >
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Key Contact Person <span className="text-[#eb6a32]">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mansoor"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#123540] mb-1">Contact Phone <span className="text-[#eb6a32]">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Official Company Email <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.ae"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123540] mb-1">Account Password <span className="text-[#eb6a32]">*</span></label>
                  <input
                    type="password"
                    required
                    placeholder="Set a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bccbca] rounded-[5px]"
                  />
                </div>

                <TermsClickwrap role="contractor" checked={regAccepted} onChange={setRegAccepted} onDocument={setRegTerms}/>
                <button
                  type="submit"
                  disabled={!regAccepted || !regTerms || isLoading}
                  className="w-full disabled:opacity-50 bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5"
                >
                  ACCEPT TERMS & COMPLETE REGISTRATION
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* VIEW 1: DASHBOARD LIST OF RFQs */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']">
                      Procurement Packages & RFQs
                    </h2>
                    <p className="text-xs text-[#63797b] mt-0.5">
                      Manage your project requirements, BoQs, and evaluate competitive quotations from verified vendors.
                    </p>
                  </div>

                  {/* Filter segmented buttons */}
                  <div className="flex items-center gap-1 p-1 bg-white border border-[#e1e7e4] rounded-[5px] text-xs">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
                        statusFilter === 'all' ? 'bg-[#123540] text-white' : 'text-[#63797b] hover:text-[#123540]'
                      }`}
                    >
                      All ({rfqs.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('under_evaluation')}
                      className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
                        statusFilter === 'under_evaluation' ? 'bg-[#123540] text-white' : 'text-[#63797b] hover:text-[#123540]'
                      }`}
                    >
                      Receiving Bids
                    </button>
                    <button
                      onClick={() => setStatusFilter('awarded')}
                      className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
                        statusFilter === 'awarded' ? 'bg-[#123540] text-white' : 'text-[#63797b] hover:text-[#123540]'
                      }`}
                    >
                      Awarded
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredRfqs.length === 0 ? (
                    <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]">
                      No RFQ packages matching this status. Click <strong>Create New RFQ</strong> above to publish your first tender.
                    </div>
                  ) : (
                    filteredRfqs.map((rfq) => {
                      const quotesCount = (rfq as any).quotesCount ?? 0;
                      const isAwarded = rfq.status === 'awarded';

                      return (
                        <div
                          key={rfq.id}
                          className="bg-white border border-[#e1e7e4] hover:border-[#bccbca] rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.04)] transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e7e4]">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                                  {rfq.referenceCode}
                                </span>
                                <span className="text-xs font-bold text-[#eb6a32]">{rfq.category}</span>
                                <span className="text-[#bccbca]">·</span>
                                <span className="text-xs text-[#63797b]">{rfq.projectName} ({rfq.locationEmirate})</span>
                              </div>
                              <h3 className="text-lg font-extrabold text-[#123540] font-['Manrope']">
                                {rfq.title}
                              </h3>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-mono font-bold px-3 py-1 rounded-[4px] uppercase ${
                                  isAwarded
                                    ? 'bg-[#123f47] text-white'
                                    : rfq.status === 'receiving_quotations' || rfq.status === 'under_evaluation'
                                    ? 'bg-[#eb6a32]/10 text-[#eb6a32] border border-[#eb6a32]/30'
                                    : 'bg-[#f7f6f2] text-[#63797b] border border-[#e1e7e4]'
                                }`}
                              >
                                {rfq.status.replace('_', ' ')}
                              </span>

                              {rfq.status==='draft'&&<button className="text-xs underline" onClick={()=>{setEditingRfqId(rfq.id);setNewTitle(rfq.title);setNewCategory(rfq.category);setNewProject(rfq.projectName);setNewEmirate(rfq.locationEmirate);setNewDeadline(rfq.submissionDeadline.slice(0,10));setNewScope(rfq.scopeDescription);setNewBudget(String(rfq.estimatedBudgetAed??''));setBoqItems(rfq.items.map(i=>({description:i.description,quantity:i.quantity,unit:i.unit,specifications:i.specifications??''})));setAttachedFiles([]);setActiveTab('create_rfq');}}>Edit Draft</button>}
                              <button
                                onClick={() => {
                                  setSelectedRfqId(rfq.id);
                                  setActiveTab('rfq_detail');
                                }}
                                className="bg-[#123540] hover:bg-[#082631] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                              >
                                <span>Review & Compare Bids</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#63797b]">
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Estimated Budget</span>
                              <span className="font-bold text-[#123540] font-mono">
                                AED {rfq.estimatedBudgetAed?.toLocaleString() || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Submission Deadline</span>
                              <span className="font-semibold text-[#123540]">{rfq.submissionDeadline}</span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">BoQ Line Items</span>
                              <span className="font-semibold text-[#123540]">{rfq.items.length} items</span>
                            </div>
                            <div>
                              <span className="text-[#a8b8b8] block mb-0.5 text-[11px]">Quotations Received</span>
                              <span className="font-bold text-[#eb6a32] font-mono">
                                {quotesCount} Verified Quotations
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: RFQ DETAIL & QUOTATION COMPARISON */}
            {activeTab === 'rfq_detail' && currentRfq && (
              <div className="space-y-8">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-bold text-[#123540] hover:text-[#eb6a32] flex items-center gap-1"
                  >
                    &larr; Back to all RFQs
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#63797b]">Procurement Status:</span>
                    <span className="font-mono text-xs uppercase font-bold text-[#eb6a32] bg-[#eb6a32]/10 border border-[#eb6a32]/30 px-2.5 py-1 rounded">
                      {currentRfq.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* RFQ Summary Card */}
                <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)]">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-[#e1e7e4]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#63797b] mb-1">
                        <span>{currentRfq.referenceCode}</span>
                        <span>·</span>
                        <span className="text-[#eb6a32] font-bold">{currentRfq.category}</span>
                        <span>·</span>
                        <span>{currentRfq.locationEmirate}</span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#123540] font-['Manrope']">
                        {currentRfq.title}
                      </h2>
                      <p className="text-xs text-[#63797b] mt-1">
                        Project Site: <strong className="text-[#123540]">{currentRfq.projectName}</strong> · Target Delivery: {currentRfq.targetCompletionDate || 'Q4 2026'}
                      </p>
                    </div>

                    <div className="p-4 bg-[#f7f6f2] rounded-[6px] border border-[#e1e7e4] text-right min-w-[200px]">
                      <span className="text-[11px] text-[#63797b] uppercase tracking-wider block">Estimated Budget</span>
                      <span className="text-xl font-bold text-[#123540] font-mono">
                        AED {currentRfq.estimatedBudgetAed?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Scope */}
                  <div className="py-4 border-b border-[#e1e7e4]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#63797b] mb-2 font-['Manrope']">
                      Detailed Scope Description
                    </h4>
                    <p className="text-sm text-[#123540] leading-relaxed">
                      {currentRfq.scopeDescription}
                    </p>
                  </div>

                  {/* Bill of Quantities Items */}
                  <div className="py-4 border-b border-[#e1e7e4]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#63797b] mb-3 font-['Manrope']">
                      Bill of Quantities (BoQ Line Items)
                    </h4>
                    <div className="overflow-x-auto border border-[#e1e7e4] rounded-[5px]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#f7f6f2] text-[#63797b] border-b border-[#e1e7e4] uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Item #</th>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3 text-right">Quantity</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3">Specification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e1e7e4]">
                          {currentRfq.items.map((item) => (
                            <tr key={item.id} className="hover:bg-[#f7f6f2]/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#63797b]">{item.itemNumber}</td>
                              <td className="py-2.5 px-3 font-medium text-[#123540]">{item.description}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold">{item.quantity}</td>
                              <td className="py-2.5 px-3 font-mono text-[#63797b]">{item.unit}</td>
                              <td className="py-2.5 px-3 text-[#63797b] italic">{item.specifications || 'Standard specifications'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Documents & Drawings (Clickable to open DocumentViewerModal) */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#123540]">Specifications & Drawings:</span>
                      <div className="flex flex-wrap gap-2">
                        {currentRfq.documents.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => setInspectDoc(doc)}
                            className="px-3 py-1.5 rounded-[4px] bg-[#f7f6f2] hover:bg-[#eef3f1] border border-[#e1e7e4] text-xs font-semibold text-[#123540] flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#eb6a32]" />
                            <span>{doc.fileName}</span>
                            <Eye className="w-3 h-3 text-[#63797b]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MANDATORY IDENTITY MASKING SECTION: Quotations Received */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#123540] font-['Manrope'] flex items-center gap-2">
                        <span>Received Vendor Quotations</span>
                        <span className="text-xs bg-[#eb6a32]/10 text-[#eb6a32] font-mono px-2 py-0.5 rounded font-bold">
                          {quotesForRfq.length} Verified Bids
                        </span>
                      </h3>
                      <p className="text-xs text-[#63797b] mt-0.5">
                        {awardRecord ? (
                          <span className="text-[#123f47] font-bold flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5 text-[#eb6a32]" />
                            Contract Award Confirmed! Winning vendor contact information released.
                          </span>
                        ) : (
                          <span className="text-[#63797b] font-medium flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-[#eb6a32]" />
                            Pre-Award Identity Masking Active: Vendor company names & contact info are strictly anonymized prior to award.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quotations Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quotesForRfq.map((quote) => {
                      const isWinner = awardRecord && awardRecord.quotationId === quote.id;

                      return (
                        <div
                          key={quote.id}
                          className={`bg-white border rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.05)] transition-all relative overflow-hidden ${
                            isWinner
                              ? 'border-2 border-[#123f47] bg-[#f7fbfb]'
                              : 'border-[#e1e7e4] hover:border-[#bccbca]'
                          }`}
                        >
                          {/* Top Badge */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e1e7e4]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]">
                                {quote.referenceCode}
                              </span>
                              {/* MASKED OR UNMASKED VENDOR NAME */}
                              <span className={`text-sm font-extrabold font-['Manrope'] ${isWinner ? 'text-[#123f47]' : 'text-[#123540]'}`}>
                                {quote.vendorDisplayName || 'Vendor #VND-MASKED'}
                              </span>
                            </div>

                            {isWinner ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#123f47] px-2.5 py-1 rounded-[4px] uppercase font-mono">
                                <Award className="w-3.5 h-3.5 text-[#eb6a32]" />
                                Awarded Winner
                              </span>
                            ) : (
                              <span className="text-xs text-[#a8b8b8] font-mono">
                                Submitted {new Date(quote.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Pricing & Terms */}
                          <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                            <div className="p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4]">
                              <span className="text-[#a8b8b8] block text-[10px] uppercase font-bold">Total Bid Amount</span>
                              <span className="text-lg font-bold text-[#123540] font-mono">
                                AED {quote.totalAmountAed.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4]">
                              <span className="text-[#a8b8b8] block text-[10px] uppercase font-bold">Execution Lead Time</span>
                              <span className="text-lg font-bold text-[#123540] font-mono">
                                {quote.leadTimeDays} Days
                              </span>
                            </div>
                          </div>

                          {/* Line items pricing breakdown */}
                          <div className="mb-4 p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4] text-xs">
                            <span className="font-bold text-[#123540] block mb-2 font-['Manrope']">Itemized Unit Rates:</span>
                            <div className="space-y-1 text-[11px]">
                              {quote.items.map((item, idx) => (
                                <div key={item.id} className="flex justify-between text-[#63797b]">
                                  <span>Line Item #{idx + 1}</span>
                                  <span className="font-mono font-semibold text-[#123540]">
                                    AED {item.unitRateAed.toLocaleString()} / unit (Total: AED {item.totalPriceAed.toLocaleString()})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Terms & Notes */}
                          <div className="space-y-2 text-xs text-[#63797b] mb-6">
                            <div>
                              <strong className="text-[#123540]">Payment Terms:</strong> {quote.paymentTerms}
                            </div>
                            <div>
                              <strong className="text-[#123540]">Vendor Notes:</strong> {quote.notes || 'No remarks added'}
                            </div>
                          </div>

                          {/* POST-AWARD UNMASKED CONTACT DETAILS CARD */}
                          {isWinner && quote.vendorContact && (
                            <div className="mb-6 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2">
                              <div className="font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']">
                                <CheckCircle2 className="w-4 h-4 text-[#eb6a32]" />
                                Official Vendor Contact Details (Unmasked)
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[#123540] pt-1">
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Company Name</span>
                                  <strong className="text-[#123540]">{(quote.vendorContact as any)?.companyName}</strong>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Trade License</span>
                                  <span className="font-mono">{quote.vendorContact.tradeLicenseNumber}</span>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Account Representative</span>
                                  <span>{quote.vendorContact.contactPerson}</span>
                                </div>
                                <div>
                                  <span className="text-[#63797b] block text-[10px]">Direct Phone</span>
                                  <span className="font-mono text-[#123f47] font-bold">{quote.vendorContact.contactPhone}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action */}
                          {!awardRecord && (
                            <button
                              onClick={() => setAwardModalQuote(quote)}
                              className="w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-2.5 px-4 rounded-[5px] text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Award className="w-4 h-4" />
                              <span>Select Vendor & Confirm Award</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: CREATE RFQ WIZARD */}
            {activeTab === 'create_rfq' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-bold text-[#123540] hover:text-[#eb6a32] mb-2 block"
                  >
                    &larr; Back to Dashboard
                  </button>
                  <h2 className="text-2xl font-extrabold text-[#123540] font-['Manrope']">
                    Create New RFQ Procurement Package
                  </h2>
                  <p className="text-xs text-[#63797b] mt-1">
                    Define project requirements, construct itemized Bill of Quantities (BoQ) items, attach technical drawings, and publish for vendor quotations.
                  </p>
                </div>

                <form onSubmit={(e) => handleCreateRfqSubmit(e, false)} className="bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-[#123540] uppercase tracking-wider pb-2 border-b border-[#e1e7e4] mb-4 font-['Manrope']">
                      1. Project & Scope Details
                    </h3>
                    {/manpower|labou?r/i.test(newCategory)&&<div className="grid grid-cols-3 gap-4 mb-4">{[['Persons',manpowerPersons,setManpowerPersons],['Hours per person per day',manpowerHours,setManpowerHours],['Days / shifts',manpowerDays,setManpowerDays]].map(([label,value,setter])=><label key={label as string} className="text-xs">{label as string}<input type="number" min="0.01" step="any" required value={value as string} onChange={e=>(setter as (value:string)=>void)(e.target.value)} className="border rounded p-2 w-full"/></label>)}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          RFQ Package Title <span className="text-[#eb6a32]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Luxury Penthouse Custom Joinery & Acoustic Paneling"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:border-[#eb6a32]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Procurement Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white"
                        >
                          <option value="Manpower & Labour">Manpower & Labour</option>
                          <option value="Joinery & Carpentry">Joinery & Carpentry</option>
                          <option value="Gypsum & Drywall">Gypsum & Drywall / Acoustic Ceilings</option>
                          <option value="MEP & HVAC">MEP, Electrical & HVAC</option>
                          <option value="Glazing & Facades">Glazing, Aluminum & Facades</option>
                          <option value="Flooring & Tiling">Flooring, Marble & Stone</option>
                          <option value="Painting & Wall Finishes">Painting & Wall Coverings</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Project Name / Location
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DIFC Gate Village Level 14"
                          value={newProject}
                          onChange={(e) => setNewProject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Emirate
                        </label>
                        <select
                          value={newEmirate}
                          onChange={(e) => setNewEmirate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white"
                        >
                          <option value="Dubai">Dubai</option>
                          <option value="Abu Dhabi">Abu Dhabi</option>
                          <option value="Sharjah">Sharjah</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Estimated Budget (AED)
                        </label>
                        <input
                          type="number"
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Submission Deadline
                        </label>
                        <input
                          type="date"
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Target Completion Date
                        </label>
                        <input
                          type="date"
                          value={newTargetCompletion}
                          onChange={(e) => setNewTargetCompletion(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123540] mb-1">
                          Detailed Scope Description <span className="text-[#eb6a32]">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Describe technical requirements, material specifications, site access hours, acoustic performance standards..."
                          value={newScope}
                          onChange={(e) => setNewScope(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bill of Quantities Items Builder */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#e1e7e4] mb-4">
                      <h3 className="text-sm font-bold text-[#123540] uppercase tracking-wider font-['Manrope']">
                        2. Bill of Quantities (BoQ Line Items)
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddBoqItem}
                        className="text-xs font-bold text-[#eb6a32] hover:text-[#bd4b1c] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Line Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {boqItems.map((item, idx) => (
                        <div key={idx} className="p-4 bg-[#f7f6f2] border border-[#e1e7e4] rounded-[5px] grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] uppercase font-bold text-[#63797b] mb-1">Item #{idx + 1} Description</label>
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...boqItems];
                                updated[idx].description = e.target.value;
                                setBoqItems(updated);
                              }}
                              placeholder="e.g. Supply & install fluted acoustic paneling"
                              className="w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-[#63797b] mb-1">Quantity</label>
                            <input
                              type="number"
                              required
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...boqItems];
                                updated[idx].quantity = parseFloat(e.target.value) || 1;
                                setBoqItems(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white font-mono text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-[#63797b] mb-1">Unit</label>
                            <select
                              value={item.unit}
                              onChange={(e) => {
                                const updated = [...boqItems];
                                updated[idx].unit = e.target.value;
                                setBoqItems(updated);
                              }}
                              className="w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white font-mono text-xs"
                            >
                              <option value="sqm">sqm</option>
                              <option value="lm">lm</option>
                              <option value="nos">nos</option>
                              <option value="lump_sum">lump sum</option>
                              <option value="kg">kg</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-[#63797b] mb-1">Specification</label>
                            <input
                              type="text"
                              value={item.specifications}
                              onChange={(e) => {
                                const updated = [...boqItems];
                                updated[idx].specifications = e.target.value;
                                setBoqItems(updated);
                              }}
                              placeholder="STC 45, Oak finish"
                              className="w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white text-xs"
                            />
                          </div>
                          <div className="sm:col-span-1 text-right">
                            {boqItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBoqItem(idx)}
                                className="p-1.5 text-[#63797b] hover:text-rose-600 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drawings & Document Attachments */}
                  <div>
                    <h3 className="text-sm font-bold text-[#123540] uppercase tracking-wider pb-2 border-b border-[#e1e7e4] mb-3 font-['Manrope']">
                      3. Technical Drawings & Specification Files
                    </h3>
                    <div className="border border-dashed border-[#bccbca] hover:border-[#eb6a32] rounded-[5px] p-6 text-center cursor-pointer transition-colors bg-[#f7f6f2]">
                      <input
                        type="file"
                        id="rfq-files"
                        accept="application/pdf,image/png,image/jpeg"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="rfq-files" className="cursor-pointer block">
                        <FileText className="w-6 h-6 text-[#63797b] mx-auto mb-2" />
                        <span className="text-xs font-bold text-[#123540] block">
                          Click to attach architectural drawings, BoQ sheets, or specifications
                        </span>
                        <span className="text-[11px] text-[#63797b] block mt-0.5">
                          Supported formats: PDF, PNG, JPEG (Max 3MB each, 3 files)
                        </span>
                      </label>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {attachedFiles.map((f, i) => (
                          <span key={i} className="bg-white border border-[#e1e7e4] px-3 py-1 rounded-[4px] font-semibold text-[#123540] flex items-center gap-1.5 shadow-sm">
                            <FileText className="w-3.5 h-3.5 text-[#eb6a32]" />
                            {f.name} ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {rfqError && (
                    <div className="p-3.5 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{rfqError}</span>
                    </div>
                  )}

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-[#e1e7e4] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="px-5 py-2.5 rounded-[5px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCreateRfqSubmit(e, true)}
                      className="px-5 py-2.5 rounded-[5px] border border-[#123540] text-xs font-bold text-[#123540] hover:bg-white"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-6 py-2.5 rounded-[5px] text-xs shadow-sm transition-all"
                    >
                      Submit RFQ for Review
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* CONFIRM AWARD MODAL WITH AUDITED SERVICE CHARGE BREAKDOWN */}
      {awardModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#e1e7e4] w-full max-w-lg rounded-[6px] shadow-[0_20px_50px_rgba(18,53,64,0.25)] overflow-hidden">
            <div className="px-6 py-4 bg-[#123f47] text-white flex items-center justify-between">
              <h3 className="text-base font-extrabold font-['Manrope'] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#eb6a32]" />
                Confirm Contract Award
              </h3>
              <button
                onClick={() => setAwardModalQuote(null)}
                className="text-[#c3d9d8] hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#63797b] leading-relaxed">
                You are designating <strong className="text-[#123540] font-mono">{awardModalQuote.vendorDisplayName}</strong> as the winner of this procurement package.
              </p>

              <p className="font-bold text-[#123540]">Your Contractor / Client Service Charge: AED 0. Vendor charges are payable by the awarded Vendor.</p>
              {/* Financial Calculation Breakdown */}
              {(() => {
                if((currentRfq as any)?.procurementType==='manpower' || /manpower|labou?r/i.test(currentRfq?.category||''))return <p>Vendor manpower Service Charge is AED 1 per person per hour. Your Contractor / Client Service Charge remains AED 0.</p>;
                const calc = ServiceChargeEngine.calculate({ contractAmountAed: awardModalQuote.totalAmountAed });
                return (
                  <div className="p-4 bg-[#f7f6f2] rounded-[6px] border border-[#e1e7e4] space-y-2.5 text-[#123540]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#63797b]">Contract Award Amount</span>
                      <span className="font-mono font-bold text-sm">
                        AED {calc.contractAmountAed.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#63797b]">
                      <span>Vendor Service Charge ({calc.appliedPercentage * 100}%)</span>
                      <span className="font-mono font-semibold text-[#123540]">
                        AED {calc.totalServiceChargeAed.toLocaleString()}
                      </span>
                    </div>

                    {calc.minimumChargeEnforced && (
                      <div className="text-[11px] text-[#123540] bg-white p-2 rounded border border-[#e1e7e4]">
                        * Minimum threshold of AED 500.00 applied as per Urban Procures service charge rules.
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="p-3 bg-[#eef6f5] border border-[#123f47]/30 rounded text-[#123f47] space-y-1">
                <div className="font-bold flex items-center gap-1.5 font-['Manrope']">
                  <ShieldCheck className="w-4 h-4 text-[#eb6a32]" />
                  Post-Award Identity Release Rule
                </div>
                <p className="text-[11px] text-[#63797b]">
                  Upon confirming this award, the system will execute an audited transaction unmasking contractor and vendor contact details to each other.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f7f6f2] border-t border-[#e1e7e4] flex justify-end gap-3">
              <button
                onClick={() => setAwardModalQuote(null)}
                className="px-4 py-2 rounded-[4px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAward}
                disabled={isSubmittingAward}
                className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-5 py-2 rounded-[4px] text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isSubmittingAward ? 'Awarding...' : 'Confirm & Release Contact Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {inspectDoc && (
        <DocumentViewerModal
          document={inspectDoc}
          onClose={() => setInspectDoc(null)}
          viewerRole="contractor"
        />
      )}
    </div>
  );
};
