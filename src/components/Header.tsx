import React, { useState } from 'react';
import { UserRole } from '../types/index.ts';
import { mockStore } from '../data/mockStore.ts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, activeRole, onRoleChange }) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <>
      {/* Top subtle utility strip */}
      <div className="bg-[#0e3037] text-[#c8d8d7] px-4 sm:px-8 py-1.5 text-xs border-b border-[#194048] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#eb6a32]"></span>
          <span className="text-[11px] font-medium tracking-wide">Urban Procures · UAE Construction & Property Procurement</span>
        </div>

        {/* Perspective toggle for review & verification */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 text-[11px] text-[#e3edeb] hover:text-white px-2 py-0.5 rounded transition-colors"
          >
            <span>Role:</span>
            <span className="font-bold text-[#eb6a32] capitalize">{activeRole}</span>
            <ChevronDown className="w-3 h-3 text-[#b6c7c9]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e1e7e4] rounded shadow-lg py-1 z-50 text-[#123540]">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#63797b] border-b border-[#e1e7e4]">
                Switch View
              </div>
              <button
                onClick={() => {
                  onRoleChange('public');
                  mockStore.setActiveUser('public');
                  setRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]"
              >
                Public (Get a Quote)
              </button>
              <button
                onClick={() => {
                  onRoleChange('contractor');
                  mockStore.setActiveUser('contractor');
                  setRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]"
              >
                Contractor
              </button>
              <button
                onClick={() => {
                  onRoleChange('vendor');
                  mockStore.setActiveUser('vendor');
                  setRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]"
              >
                Vendor
              </button>
              <button
                onClick={() => {
                  onRoleChange('admin');
                  mockStore.setActiveUser('admin');
                  setRoleMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]"
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Official Header (Matching live site www.urbanprocures.com) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e1e7e4] shadow-[0_2px_10px_rgba(18,53,64,0.03)]">
        <div className="max-w-[1240px] mx-auto min-h-[76px] px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Official Urban Procures Logo on the Left */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/assets/urbanprocures-logo.png"
              width="36"
              height="40"
              alt="Urban Procures Logo"
              className="object-contain"
            />
            <span className="font-['Manrope'] font-extrabold text-[21px] tracking-[-0.04em] text-[#123540] group-hover:text-[#eb6a32] transition-colors whitespace-nowrap">
              Urban Procures
            </span>
          </div>

          {/* Simple Navigation on the Right */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-[#123540]">
            <button
              onClick={() => onNavigate('/get-a-quote')}
              className={`hover:text-[#eb6a32] transition-colors ${
                currentPath === '/get-a-quote' ? 'text-[#eb6a32] font-bold' : ''
              }`}
            >
              Get a Quote
            </button>
            <button
              onClick={() => onNavigate('/contractor')}
              className={`hover:text-[#eb6a32] transition-colors ${
                currentPath.startsWith('/contractor') ? 'text-[#eb6a32] font-bold' : ''
              }`}
            >
              Contractor
            </button>
            <button
              onClick={() => onNavigate('/vendor')}
              className={`hover:text-[#eb6a32] transition-colors ${
                currentPath.startsWith('/vendor') ? 'text-[#eb6a32] font-bold' : ''
              }`}
            >
              Vendor
            </button>
            <button
              onClick={() => onNavigate('/admin')}
              className="text-[#63797b] hover:text-[#123540] text-xs transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => onNavigate('/test-suite')}
              className="text-[#63797b] hover:text-[#123540] text-xs transition-colors"
            >
              Test Suite
            </button>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/get-a-quote')}
              className="bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm px-5 py-2.5 rounded-[5px] inline-flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5"
            >
              <span>Get quotes</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
