import React from 'react';
import { X, Clock, CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ANALYSIS_HISTORY } from '../data/mockData';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#087F5B]" />
            <div>
              <h2 className="text-base font-bold text-[#172B25]">
                Prescription Analysis Audit Log
              </h2>
              <p className="text-xs text-[#64756D]">
                Recent clinical checks performed across inpatient and outpatient units
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
        <div className="p-6 overflow-y-auto space-y-3">
          {ANALYSIS_HISTORY.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectOrder(item.orderId);
                onClose();
              }}
              className="p-4 rounded-xl border border-[#E1EAE5] hover:border-[#087F5B] hover:shadow-xs bg-white transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#172B25] group-hover:text-[#087F5B] transition-colors">
                    Order #{item.orderId}
                  </span>
                  <span className="text-xs text-[#64756D]">•</span>
                  <span className="text-xs font-medium text-[#172B25]">
                    {item.patientName}
                  </span>
                  <span className="text-[11px] font-mono text-[#64756D]">
                    ({item.patientId})
                  </span>
                </div>

                <div className="text-xs text-[#64756D]">
                  {item.unit} • {item.drugCount} medications screened • {item.timestamp}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {item.criticalAlerts > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3 text-[#C62828]" />
                      {item.criticalAlerts} Critical Alert
                    </span>
                  )}
                  {item.warnings > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                      {item.warnings} Dosage Note
                    </span>
                  )}
                  {item.criticalAlerts === 0 && item.warnings === 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087F5B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-[#087F5B]" />
                      All Checks Passed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#075E4B] group-hover:translate-x-0.5 transition-transform">
                <span>Inspect</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
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
