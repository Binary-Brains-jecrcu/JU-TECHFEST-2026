import React from 'react';
import { 
  Printer, 
  Plus
} from 'lucide-react';

interface NavbarProps {
  currentView?: 'workspace' | 'landing' | 'history' | 'database' | 'about';
  onNavigate?: (view: 'workspace' | 'landing' | 'history' | 'database' | 'about') => void;
  onNewCheck: () => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onNewCheck,
  onPrint,
}) => {
  return (
    <header className="bg-white border-b border-[#E1EAE5] sticky top-0 z-40 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand & Clinical Indicator */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onNavigate && onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img 
                src="/logo.png" 
                alt="MedCheck" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback icon if image fails
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#172B25] text-lg tracking-tight font-sans">
                MedCheck
              </span>
              <span className="text-[11px] text-[#64756D] leading-tight hidden sm:inline">
                Prescription Safety Verification
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Clinician Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrint}
            title="Print Clinical Safety Report"
            className="flex items-center gap-1.5 text-xs font-medium text-[#172B25] bg-white hover:bg-[#F7FAF8] border border-[#E1EAE5] px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#64756D]" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={onNewCheck}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#075E4B] px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Check</span>
          </button>

          {/* Clinician Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#E1EAE5]">
            <div className="w-8 h-8 rounded-full bg-[#DDF5EA] text-[#075E4B] font-bold text-xs flex items-center justify-center border border-[#20A88A]/40">
              SV
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#172B25] leading-none">
                Dr. Sarah Vance, PharmD
              </span>
              <span className="text-[10px] text-[#64756D] mt-0.5">
                PH-8831
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
