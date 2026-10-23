import React, { useState } from 'react';
import { X, Search, Database, AlertOctagon, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { MEDICINE_DATABASE } from '../data/mockData';

interface MedicineDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicineDatabaseModal: React.FC<MedicineDatabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(MEDICINE_DATABASE[0]);

  if (!isOpen) return null;

  const filteredDrugs = MEDICINE_DATABASE.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#087F5B]" />
            <div>
              <h2 className="text-base font-bold text-[#172B25]">
                Clinical Medicine &amp; Safety Rule Database
              </h2>
              <p className="text-xs text-[#64756D]">
                Pre-indexed pharmacological metadata, CYP450 metabolism, and renal dosing ceilings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64756D] hover:text-[#172B25] hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Split Search / Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left List (5 cols) */}
          <div className="md:col-span-5 border-r border-[#E1EAE5] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-[#E1EAE5] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-[#64756D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search drug, brand, or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F7FAF8] border border-[#CBDAD4] rounded-lg pl-9 pr-3 py-2 text-xs text-[#172B25] focus:outline-none focus:border-[#087F5B]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E1EAE5]">
              {filteredDrugs.map((drug) => {
                const isSelected = selectedDrug.name === drug.name;
                return (
                  <button
                    key={drug.name}
                    onClick={() => setSelectedDrug(drug)}
                    className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-[#DDF5EA]/60 border-l-4 border-l-[#087F5B]' : 'hover:bg-[#F7FAF8]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#172B25]">
                        {drug.name}
                      </div>
                      <div className="text-[11px] text-[#64756D] mt-0.5">
                        {drug.brandName} • {drug.class}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#075E4B]' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Details (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-white">
            
            {/* Drug Header */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#172B25]">
                  {selectedDrug.name}
                </h3>
                {selectedDrug.highAlert && (
                  <span className="text-[10px] font-bold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded uppercase">
                    High-Alert Agent
                  </span>
                )}
              </div>
              <div className="text-xs text-[#64756D] mt-1">
                {selectedDrug.brandName} • <span className="font-semibold text-[#075E4B]">{selectedDrug.class}</span>
              </div>
            </div>

            {/* Identifiers */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7FAF8] p-3 rounded-lg border border-[#E1EAE5]">
              <div>
                <span className="text-[#64756D] block text-[10px] uppercase font-bold">NDC Identifier:</span>
                <span className="font-mono font-semibold text-[#172B25]">{selectedDrug.ndc}</span>
              </div>
              <div>
                <span className="text-[#64756D] block text-[10px] uppercase font-bold">RxNorm CUI:</span>
                <span className="font-mono font-semibold text-[#172B25]">{selectedDrug.rxNorm}</span>
              </div>
            </div>

            {/* Boxed Warning */}
            {selectedDrug.boxedWarning !== 'None' && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C62828] uppercase tracking-wider">
                  <AlertOctagon className="w-3.5 h-3.5 text-[#C62828]" />
                  Black Box / Critical Risk Summary
                </div>
                <p className="text-xs text-[#C62828] leading-relaxed">
                  {selectedDrug.boxedWarning}
                </p>
              </div>
            )}

            {/* Metabolic Pathways */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
                CYP450 &amp; Transporter Metabolism
              </span>
              <p className="text-xs text-[#172B25] bg-[#F7FAF8] p-3 rounded-lg border border-[#E1EAE5] leading-relaxed font-mono">
                {selectedDrug.metabolism}
              </p>
            </div>

            {/* Renal Clearance Thresholds */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
                Renal Dose Titration Thresholds
              </span>
              <p className="text-xs text-[#172B25] bg-[#F7FAF8] p-3 rounded-lg border border-[#E1EAE5] leading-relaxed">
                {selectedDrug.renalGuidance}
              </p>
            </div>

            {/* Major Interacting Agents */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
                Deterministic High-Severity DDI Pairings
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDrug.majorInteractions.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] px-2.5 py-1 rounded-md font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close Database
          </button>
        </div>
      </div>
    </div>
  );
};
