import React from 'react';
import { X, Server, Cpu, ShieldCheck, CheckCircle2, Lock, GitBranch, Terminal } from 'lucide-react';

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#087F5B]" />
            <div>
              <h2 className="text-base font-bold text-[#172B25]">
                MedCheck Architecture &amp; Clinical Safety Engine
              </h2>
              <p className="text-xs text-[#64756D]">
                Multi-layer verification stack: Deterministic Java Rules + Python AI/RAG + Auditable Evidence
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Java Deterministic Engine */}
            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#075E4B] uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-[#087F5B]" />
                <span>Deterministic Java CDS Engine</span>
              </div>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Executes strict mathematical &amp; clinical logic trees for dosage ceilings (Cockcroft-Gault, CKD-EPI), drug-drug CYP metabolic pathway collisions, and beta-lactam R1 side chain cross-sensitivities with zero stochastic hallucination risk.
              </p>
              <div className="text-[11px] font-mono text-[#172B25] bg-white border border-[#E1EAE5] p-2 rounded">
                Rule Precision: 100% Deterministic • Latency: &lt;50ms
              </div>
            </div>

            {/* Python AI/RAG Service */}
            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#075E4B] uppercase tracking-wider">
                <GitBranch className="w-4 h-4 text-[#087F5B]" />
                <span>Python AI / RAG Microservice</span>
              </div>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Utilizes specialized clinical models (MedGemma &amp; Qwen) for multi-modal prescription order ingestion, OCR tokenization, RxNorm ontology normalization, and contextual evidence retrieval from package inserts.
              </p>
              <div className="text-[11px] font-mono text-[#172B25] bg-white border border-[#E1EAE5] p-2 rounded">
                Models: MedGemma / Qwen • RxNorm CUI mapping
              </div>
            </div>

          </div>

          {/* Clinical Evidence Knowledge Base */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#172B25] uppercase tracking-wider">
              Referenced Clinical Evidence Sources
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white border border-[#E1EAE5] p-2.5 rounded-lg text-center">
                <div className="font-bold text-[#172B25]">FDA Labels</div>
                <div className="text-[11px] text-[#64756D]">Boxed Warnings</div>
              </div>
              <div className="bg-white border border-[#E1EAE5] p-2.5 rounded-lg text-center">
                <div className="font-bold text-[#172B25]">CPIC PGx</div>
                <div className="text-[11px] text-[#64756D]">CYP2C9 / VKORC1</div>
              </div>
              <div className="bg-white border border-[#E1EAE5] p-2.5 rounded-lg text-center">
                <div className="font-bold text-[#172B25]">KDIGO 2023</div>
                <div className="text-[11px] text-[#64756D]">Renal Adjustments</div>
              </div>
              <div className="bg-white border border-[#E1EAE5] p-2.5 rounded-lg text-center">
                <div className="font-bold text-[#172B25]">Beers Criteria</div>
                <div className="text-[11px] text-[#64756D]">Geriatric High-Risk</div>
              </div>
            </div>
          </div>

          {/* Auditability & Zero Black Box */}
          <div className="bg-[#DDF5EA]/40 border border-[#B6E8D3] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#075E4B]">
              <Lock className="w-4 h-4 text-[#087F5B]" />
              <span>Traceable Audit Hash &amp; Decision Logging</span>
            </div>
            <p className="text-xs text-[#172B25] leading-relaxed">
              Every verification execution generates a cryptographically hashed execution record (SHA-256). Clinician overrides and prescriber notifications are logged into hospital audit trails for complete medicolegal accountability.
            </p>
          </div>

          {/* CDS Non-Device Regulatory Statement */}
          <div className="bg-[#F7FAF8] border border-[#CBDAD4] rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-bold text-[#172B25]">
              Regulatory Intended Use Statement (FDA Non-Device CDS)
            </div>
            <p className="text-[11px] text-[#64756D] leading-relaxed">
              MedCheck is a prototype Clinical Decision Support software system intended solely to assist healthcare professionals in reviewing medication safety. The system does not guarantee that a prescription is safe, does not substitute for clinical review by a licensed practitioner, and does not initiate automated medication administration without human clinician authorization.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
