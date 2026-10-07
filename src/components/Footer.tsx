import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0e3037] text-[#c8d8d7] border-t border-[#1a444c] py-10 px-4 sm:px-6 lg:px-8 text-xs font-['DM_Sans']">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/urbanprocures-logo.png"
            width="28"
            height="32"
            alt="Urban Procures"
            className="opacity-90"
          />
          <div>
            <span className="font-extrabold text-white text-sm font-['Manrope']">
              Urban Procures
            </span>
            <span className="text-[#a1b7b6] ml-2 text-[11px]">· Dubai, United Arab Emirates</span>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-[#c8d8d7]">
          <button
            onClick={() => onNavigate('/get-a-quote')}
            className="hover:text-[#eb6a32] transition-colors"
          >
            Get a Quote
          </button>
          <button
            onClick={() => onNavigate('/contractor')}
            className="hover:text-[#eb6a32] transition-colors"
          >
            Contractor Portal
          </button>
          <button
            onClick={() => onNavigate('/vendor')}
            className="hover:text-[#eb6a32] transition-colors"
          >
            Vendor Portal
          </button>
          <button
            onClick={() => onNavigate('/admin')}
            className="hover:text-[#eb6a32] transition-colors text-[#a1b7b6]"
          >
            Admin
          </button>
        </nav>
      </div>

      <div className="max-w-[1240px] mx-auto mt-6 pt-6 border-t border-[#1a444c] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#86a1a0] gap-2">
        <p>© {new Date().getFullYear()} Urban Procures Advanced. All rights reserved.</p>
        <p>Regulated Service Charge model (2.5% standard / AED 500 minimum threshold).</p>
      </div>
    </footer>
  );
};
