import React, { useState } from 'react';
import { TermsClickwrap, type TermsDocument } from '../components/TermsClickwrap.tsx';
import { api } from '../services/api.ts';
import { PropertyType, PublicQuoteRequest } from '../types/index.ts';
import { useToast } from '../components/ToastContext.tsx';
import { ArrowUpRight, CheckCircle2, Upload, User, Home, FileText, Sparkles, ShieldCheck, AlertCircle, X } from 'lucide-react';

interface GetAQuotePageProps {
  onNavigate: (path: string) => void;
}

export const GetAQuotePage: React.FC<GetAQuotePageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+971 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('villa');
  const [locationEmirate, setLocationEmirate] = useState('Dubai');
  const [locationCommunity, setLocationCommunity] = useState('');
  const [workCategory, setWorkCategory] = useState('Interior Fit-Out & Renovation');
  const [description, setDescription] = useState('');
  const [budgetBracket, setBudgetBracket] = useState('AED 20,000 - 50,000');
  const [siteVisitRequested, setSiteVisitRequested] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; dataUrl?: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [consent,setConsent]=useState(false);
  const [consentTerms,setConsentTerms]=useState<TermsDocument|null>(null);

  // Submission State
  const [submittedRequest, setSubmittedRequest] = useState<PublicQuoteRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          file,
          dataUrl: reader.result as string,
        });
        showToast(`Document "${file.name}" attached successfully`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if(!consent || !consentTerms){setFormError('Please affirmatively accept the Get a Quote Terms and Privacy Notice.');return;}

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !description.trim()) {
      setFormError('Please fill in your name, contact phone, email, and work description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const attachments = selectedFile
        ? [
            {
              fileName: selectedFile.file.name,
              fileType: selectedFile.file.type || 'application/pdf',
              fileSizeBytes: selectedFile.file.size,
              documentPurpose: 'drawing' as const,
              dataUrl: selectedFile.dataUrl,
            },
          ]
        : [];

      const res = await api.quotes.createPublic({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        propertyType,
        locationEmirate,
        locationCommunity: locationCommunity.trim() || `${locationEmirate} Area`,
        workCategory,
        description: description.trim(),
        budgetBracket,
        siteVisitRequested,
        attachments,
        acceptTerms:consent,termsVersionId:consentTerms.id,
      });

      setSubmittedRequest(res.data);
      setConsent(false);
      showToast(`Quotation request ${res.data.referenceCode || res.data.reference_code} created successfully!`, 'success', 'Request Submitted');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit quote request. Please try again.');
      showToast(err.message || 'Failed to submit quote request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="bg-[#f7f6f2] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.06)] p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#eef6f5] text-[#123f47] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#eb6a32]" />
          </div>

          <span className="text-xs uppercase font-mono tracking-widest text-[#eb6a32] bg-[#eb6a32]/10 px-3 py-1 rounded font-bold">
            Request Received
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123540] mt-3 font-['Manrope']">
            Thank you, {submittedRequest.customerName || (submittedRequest as any).customer_name}!
          </h2>

          <p className="text-[#63797b] text-sm mt-3 leading-relaxed">
            Your quotation request has been received.
            {submittedRequest.siteVisitRequested || (submittedRequest as any).site_visit_requested ? (
              <span className="block mt-2 font-semibold text-[#123540] bg-[#f7f6f2] p-3 rounded border border-[#e1e7e4]">
                ★ AED 100 Site Visit Selected: An Urban Procures representative will contact you to arrange an on-site dimension inspection.
              </span>
            ) : (
              <span className="block mt-2 text-[#63797b]">
                Verified UAE contractors and vendors will review your requirement and prepare competitive quotations.
              </span>
            )}
          </p>

          {/* Reference Card */}
          <div className="my-8 p-6 bg-[#f7f6f2] border border-[#e1e7e4] rounded-[6px] text-left space-y-2.5 text-xs text-[#123540]">
            <div className="flex justify-between items-center pb-2 border-b border-[#e1e7e4]">
              <span className="text-[#63797b]">Reference Tracking Code</span>
              <span className="font-mono font-bold text-sm text-[#123540]">
                {submittedRequest.referenceCode || (submittedRequest as any).reference_code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#63797b]">Property Type</span>
              <span className="font-semibold capitalize">
                {submittedRequest.propertyType || (submittedRequest as any).property_type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#63797b]">Location</span>
              <span className="font-semibold">
                {submittedRequest.locationCommunity || (submittedRequest as any).location_community},{' '}
                {submittedRequest.locationEmirate || (submittedRequest as any).location_emirate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#63797b]">Work Scope</span>
              <span className="font-semibold">
                {submittedRequest.workCategory || (submittedRequest as any).work_category}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#e1e7e4]">
              <span className="text-[#63797b]">Site Visit Option</span>
              <span className="font-bold text-[#eb6a32]">
                {submittedRequest.siteVisitRequested || (submittedRequest as any).site_visit_requested
                  ? 'AED 100 Site Visit Included'
                  : 'Direct Submission (AED 0)'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmittedRequest(null);
                setDescription('');
                setSelectedFile(null);
              }}
              className="bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-6 rounded-[5px] text-xs transition-colors"
            >
              Submit Another Request
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="border border-[#bccbca] hover:bg-[#f7f6f2] text-[#123540] font-bold py-3 px-6 rounded-[5px] text-xs transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f6f2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-[#123540]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1">
            Get a Quote · No Account Needed
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight">
            Get quotes for your villa, apartment or personal property work
          </h1>
          <p className="text-sm text-[#63797b] mt-2 leading-relaxed">
            No account or registration required. Provide your details and work requirement to receive quotations from verified UAE vendors.
          </p>
        </div>

        {/* The Clean Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.05)] p-6 sm:p-10 space-y-8">
          {/* Section 1: Contact Details */}
          <div>
            <h3 className="text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']">
              <User className="w-4 h-4 text-[#eb6a32]" />
              1. Your Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Full Name <span className="text-[#eb6a32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Al-Zahra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Phone Number <span className="text-[#eb6a32]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Email Address <span className="text-[#eb6a32]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.ae"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Property & Location */}
          <div>
            <h3 className="text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']">
              <Home className="w-4 h-4 text-[#eb6a32]" />
              2. Property & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]"
                >
                  <option value="villa">Private Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial_personal">Personal Office / Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Emirate
                </label>
                <select
                  value={locationEmirate}
                  onChange={(e) => setLocationEmirate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                  <option value="Fujairah">Fujairah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Community / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Palm Jumeirah, Dubai Hills"
                  value={locationCommunity}
                  onChange={(e) => setLocationCommunity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Scope of Work */}
          <div>
            <h3 className="text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']">
              <FileText className="w-4 h-4 text-[#eb6a32]" />
              3. Work Requirement
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123540] mb-1">
                    Trade / Category
                  </label>
                  <select
                    value={workCategory}
                    onChange={(e) => setWorkCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]"
                  >
                    <option value="Interior Fit-Out & Renovation">Interior Fit-Out & Full Renovation</option>
                    <option value="Joinery & Custom Cabinetry">Custom Joinery, Wardrobes & Kitchens</option>
                    <option value="Pergola, Decking & Exterior Joinery">Pergola, Decking & Garden Carpentry</option>
                    <option value="Painting & Decorative Wall Finishes">Painting & Wall Finishes</option>
                    <option value="Flooring, Marble & Tiling">Flooring, Natural Marble & Tiles</option>
                    <option value="Plumbing, Sanitary & Bathrooms">Bathroom Remodeling & Sanitary</option>
                    <option value="Electrical & Architectural Lighting">Electrical & Lighting</option>
                    <option value="Acoustic Ceilings & Partitions">Acoustic Ceilings & Partitions</option>
                    <option value="Landscaping & Swimming Pools">Landscaping & Pool Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123540] mb-1">
                    Estimated Budget Bracket
                  </label>
                  <select
                    value={budgetBracket}
                    onChange={(e) => setBudgetBracket(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]"
                  >
                    <option value="Under AED 15,000">Under AED 15,000</option>
                    <option value="AED 15,000 - 30,000">AED 15,000 - 30,000</option>
                    <option value="AED 30,000 - 60,000">AED 30,000 - 60,000</option>
                    <option value="AED 60,000 - 120,000">AED 60,000 - 120,000</option>
                    <option value="AED 120,000+">AED 120,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Describe the Work Required <span className="text-[#eb6a32]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you need in simple words (dimensions, what needs fixing or building, timeline, specific materials if known)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] leading-relaxed bg-[#fdfdfd]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123540] mb-1">
                  Upload Photos or Layout Drawings (Optional)
                </label>
                <div className="border border-dashed border-[#bccbca] hover:border-[#eb6a32] rounded-[5px] p-4 text-center cursor-pointer transition-colors bg-[#f7f6f2]">
                  <input
                    type="file"
                    id="quote-file"
                    className="hidden"
                    accept="image/png,image/jpeg,.pdf"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-[#e1e7e4]">
                      <div className="flex items-center gap-2 text-left truncate">
                        <Upload className="w-4 h-4 text-[#eb6a32] shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-bold text-[#123540] block truncate">
                            {selectedFile.file.name}
                          </span>
                          <span className="text-[11px] text-[#63797b]">
                            {(selectedFile.file.size / 1024).toFixed(1)} KB · Ready to upload
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 text-[#63797b] hover:text-[#b91c1c] hover:bg-[#f7f6f2] rounded transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="quote-file" className="cursor-pointer block">
                      <Upload className="w-5 h-5 text-[#63797b] mx-auto mb-1" />
                      <span className="text-xs text-[#63797b] block font-medium">
                        Click to upload photos, architectural sketches or drawings (Max 25MB)
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: CLEAR DISTINCTION: Direct vs AED 100 Site Visit */}
          <div className="border-t border-[#e1e7e4] pt-6">
            <h3 className="text-base font-bold text-[#123540] mb-2 font-['Manrope']">
              4. Choose Your Service Option
            </h3>
            <p className="text-xs text-[#63797b] mb-4">
              Select whether to submit directly or request an in-person site measurement visit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Direct Submission */}
              <div
                onClick={() => setSiteVisitRequested(false)}
                className={`p-5 rounded-[6px] border-2 cursor-pointer transition-all ${
                  !siteVisitRequested
                    ? 'border-[#eb6a32] bg-[#eb6a32]/5 ring-1 ring-[#eb6a32]'
                    : 'border-[#e1e7e4] hover:border-[#bccbca] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#123540] text-sm font-['Manrope']">
                    Submit requirement directly
                  </span>
                  <span className="text-xs font-bold text-[#123f47] font-mono">
                    FREE (AED 0)
                  </span>
                </div>
                <p className="text-xs text-[#63797b] leading-relaxed">
                  Submit your details directly. Urban Procures will review your requirement and share it with suitable verified vendors.
                </p>
              </div>

              {/* Option B: AED 100 Site Visit */}
              <div
                onClick={() => setSiteVisitRequested(true)}
                className={`p-5 rounded-[6px] border-2 cursor-pointer transition-all relative ${
                  siteVisitRequested
                    ? 'border-[#eb6a32] bg-[#eb6a32]/10 ring-1 ring-[#eb6a32]'
                    : 'border-[#e1e7e4] hover:border-[#bccbca] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#eb6a32]" />
                    <span className="font-bold text-[#123540] text-sm font-['Manrope']">
                      Request AED 100 site visit
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#eb6a32] bg-[#eb6a32]/15 px-2 py-0.5 rounded font-mono">
                    AED 100
                  </span>
                </div>
                <p className="text-xs text-[#63797b] leading-relaxed">
                  An Urban Procures representative will visit your property to inspect site dimensions, assess requirements, and assist in preparing your RFQ.
                </p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
              <span>{formError}</span>
            </div>
          )}

          <TermsClickwrap role="get_a_quote" checked={consent} onChange={setConsent} onDocument={setConsentTerms}/>
          {/* Submit Action */}
          <div className="pt-4 border-t border-[#e1e7e4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#63797b]">
              <ShieldCheck className="w-4 h-4 text-[#123f47]" />
              <span>No account needed. Your privacy is safeguarded.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !consent || !consentTerms}
              className="w-full sm:w-auto bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3.5 px-8 rounded-[5px] text-sm transition-all inline-flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Quotation Request'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
