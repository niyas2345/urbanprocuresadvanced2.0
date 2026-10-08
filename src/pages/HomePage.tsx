import React,{useState} from 'react';
import {api} from '../services/api.ts';
import {useDashboardRefresh} from '../hooks/useDashboardRefresh.ts';
import { ArrowUpRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [discovery,setDiscovery]=useState<any>(null),[discoveryError,setDiscoveryError]=useState('');
  const refresh=async()=>{try{setDiscovery(await api.discovery());setDiscoveryError('');}catch{setDiscoveryError('Listings are temporarily unavailable. Please try again shortly.');}};
  React.useEffect(()=>{refresh();},[]);useDashboardRefresh(refresh,true);
  return (
    <div className="bg-[#f7f6f2] text-[#123540] min-h-screen">
      {/* HERO SECTION — Matching live Urban Procures website */}
      <section
        className="relative bg-cover bg-center text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#e1e7e4]"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8,38,49,0.96) 0%, rgba(8,38,49,0.85) 45%, rgba(8,38,49,0.3) 100%), url(/assets/homepage-hero.png)`,
        }}
      >
        <div className="max-w-[1240px] mx-auto">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f6a47f] mb-3 font-['Manrope']">
            Built for UAE construction & property
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-['Manrope'] tracking-tight max-w-xl leading-[1.1] mb-5">
            Your project.<br />The right people.
          </h1>

          <p className="text-base sm:text-lg text-[#e3edeb] max-w-lg leading-relaxed mb-8">
            Tell us what you need. We help connect your project with verified construction, fit-out, and specialist trade companies across the UAE.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/get-a-quote')}
              className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-all shadow-sm active:translate-y-0.5"
            >
              <span>Get quotes</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/contractor')}
              className="border border-[#b6c7c9] hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-5 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-colors"
            >
              <span>For contractors</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/vendor')}
              className="border border-[#b6c7c9] hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-5 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-colors"
            >
              <span>For vendors</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#b6c7c9] mt-8 uppercase tracking-widest font-mono">
            Villas & Apartments · Fit-out · MEP · Construction · Technical Services
          </p>
        </div>
      </section>

      {/* THE THREE PRIMARY CHOICES — THE MAIN FOCUS OF THE HOMEPAGE */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="mb-10 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1">
            A simpler way to get started
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight">
            What brings you here?
          </h2>
          <p className="text-sm sm:text-base text-[#63797b] mt-2 max-w-xl">
            Choose the option that fits. You can explore without complicated steps.
          </p>
        </div>

        {/* 3 Dedicated Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CHOICE 1: GET A QUOTE */}
          <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']">
                  I need work done
                </span>
                <span className="text-xs font-bold text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded font-mono">
                  No account needed
                </span>
              </div>

              <div className="text-2xl text-[#eb6a32] mb-3">⌂</div>

              <h3 className="text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight">
                Get a Quote
              </h3>

              <p className="text-sm text-[#63797b] leading-relaxed mb-4">
                Get quotes for your villa, apartment or personal property work. No account needed — just provide your details and work requirement to receive quotes from verified vendors.
              </p>

              <div className="p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4] text-xs text-[#123540] mb-6">
                <strong className="block text-[#123540] font-bold mb-0.5">Optional AED 100 Site Visit</strong>
                <span className="text-[#63797b]">
                  Have an Urban Procures representative visit your property to take measurements and assist with your requirement.
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/get-a-quote')}
              className="w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
            >
              <span>Get a Quote — no account needed</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* CHOICE 2: CONTRACTOR */}
          <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']">
                  I run procurement
                </span>
                <span className="text-xs font-semibold text-[#63797b] font-mono">
                  Account required
                </span>
              </div>

              <div className="text-2xl text-[#123f47] mb-3">🏢</div>

              <h3 className="text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight">
                Contractor
              </h3>

              <p className="text-sm text-[#63797b] leading-relaxed mb-4">
                For main contractors, fit-out companies, interior design studios, and construction businesses. Manage your RFQ packages, Bill of Quantities, and compare quotations.
              </p>

              <ul className="space-y-1.5 text-xs text-[#63797b] mb-6">
                <li>• Create and publish RFQs with BoQ line items</li>
                <li>• Receive itemized quotations from verified vendors</li>
                <li>• Compare vendor rates with pre-award identity masking</li>
                <li>• Confirm awards with transparent service charge</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/contractor')}
              className="w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
            >
              <span>Contractor Login / Register</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* CHOICE 3: VENDOR */}
          <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']">
                  I supply products / services
                </span>
                <span className="text-xs font-semibold text-[#63797b] font-mono">
                  Account required
                </span>
              </div>

              <div className="text-2xl text-[#123f47] mb-3">◇</div>

              <h3 className="text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight">
                Vendor
              </h3>

              <p className="text-sm text-[#63797b] leading-relaxed mb-4">
                For suppliers, vendors, subcontractors, and specialist service providers. Discover qualified project RFQs matching your trade categories and submit competitive quotations.
              </p>

              <ul className="space-y-1.5 text-xs text-[#63797b] mb-6">
                <li>• Receive RFQs relevant to your trade specialization</li>
                <li>• Review drawings and BoQ specifications securely</li>
                <li>• Submit itemized unit rates and commercial terms</li>
                <li>• Win contracts with post-award contact release</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/vendor')}
              className="w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5"
            >
              <span>Vendor Login / Register</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS, SIMPLY (From live site) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#e1e7e4] bg-[#eef3f1]/40">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-10 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight">
              How it works, simply.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm">
              <span className="font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2">01</span>
              <h4 className="font-extrabold text-base text-[#123540] font-['Manrope'] mb-1">
                Tell us what you need
              </h4>
              <p className="text-xs text-[#63797b] leading-relaxed">
                Add a short description of the work and upload photos or layout drawings if you have them.
              </p>
            </div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm">
              <span className="font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2">02</span>
              <h4 className="font-extrabold text-base text-[#123540] font-['Manrope'] mb-1">
                We review your request
              </h4>
              <p className="text-xs text-[#63797b] leading-relaxed">
                Our team checks the details and shares the requirement with suitable, verified UAE businesses.
              </p>
            </div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm">
              <span className="font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2">03</span>
              <h4 className="font-extrabold text-base text-[#123540] font-['Manrope'] mb-1">
                Receive quotations
              </h4>
              <p className="text-xs text-[#63797b] leading-relaxed">
                Look through the competitive offers and ask for clarification directly.
              </p>
            </div>

            <div className="bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm">
              <span className="font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2">04</span>
              <h4 className="font-extrabold text-base text-[#123540] font-['Manrope'] mb-1">
                Choose what works
              </h4>
              <p className="text-xs text-[#63797b] leading-relaxed">
                Pick the right offer for your needs and budget. Contact details are securely released.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE CLOSING CALL TO ACTION (Matching live site) */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#123f47] text-white">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight mb-2">
              Have a project in mind?
            </h2>
            <p className="text-sm sm:text-base text-[#c3d9d8]">
              It takes just a few minutes to tell us what you need.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/get-a-quote')}
            className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm px-6 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-all shadow-md active:translate-y-0.5 whitespace-nowrap"
          >
            <span>Get quotes</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div><h2 className="text-2xl font-extrabold font-['Manrope']">Published RFQ opportunities</h2><p className="text-sm text-[#63797b]">Admin-approved opportunities. Sign in as a verified Vendor to review details and quote within your trade categories.</p>{discoveryError&&<p role="status">{discoveryError}</p>}<div className="grid md:grid-cols-3 gap-4 mt-4">{discovery?.rfqs.map((rfq:any)=><article key={rfq.referenceCode} className="bg-white border rounded p-5"><small>{rfq.referenceCode} · {rfq.category} · {rfq.emirate}</small><h3 className="font-bold mt-2">{rfq.title}</h3><p className="text-sm">Deadline: {new Date(rfq.submissionDeadline).toLocaleDateString()}</p><button className="text-[#eb6a32] underline mt-3" onClick={()=>onNavigate('/vendor')}>Sign in to view and quote</button></article>)}</div>{discovery&&discovery.rfqs.length===0&&<p className="mt-4">No open approved RFQs currently. New opportunities will appear here after Admin review.</p>}</div>
        <div><h2 className="text-2xl font-extrabold font-['Manrope']">Verified business community</h2><p className="text-sm text-[#63797b]">Businesses verified by Admin that have chosen a public listing.</p><div className="grid md:grid-cols-2 gap-6 mt-4">{(['contractors','vendors'] as const).map(role=><div key={role}><h3 className="font-bold text-lg capitalize">{role}</h3>{discovery?.[role].map((business:any,i:number)=><article key={i} className="bg-white border rounded p-4 mt-3"><strong>{business.companyName}</strong><p className="text-sm">{business.emirate??business.emirates.join(', ')}{business.categories&&' · '+business.categories.join(', ')}</p><small>Admin verified</small></article>)}{discovery&&discovery[role].length===0&&<p className="mt-3 text-sm">Public listings will appear as verified businesses opt in.</p>}<button className="text-[#eb6a32] underline mt-4" onClick={()=>onNavigate('/'+(role==='vendors'?'vendor':'contractor'))}>Join as a {role==='vendors'?'Vendor':'Contractor'}</button></div>)}</div></div>
      </section>
    </div>
  );
};
