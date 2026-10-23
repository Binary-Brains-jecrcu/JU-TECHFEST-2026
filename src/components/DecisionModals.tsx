import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Flag, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  User, 
  UserCheck, 
  Send,
  ShieldAlert
} from 'lucide-react';
import { PatientContext, PrescriptionDrug, SafetyAnalysisResult } from '../types';
import { PATIENT_PROFILES } from '../data/mockData';

/* ================= 1. OVERRIDE WITH JUSTIFICATION MODAL ================= */
interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOverride: (justification: string) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  onConfirmOverride,
}) => {
  const [selectedReason, setSelectedReason] = useState('clinical-monitoring');
  const [notes, setNotes] = useState('Preemptive 50% warfarin dose reduction coordinated with attending. Daily inpatient INR monitoring ordered on Flowsheet 4B.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-sm font-bold text-[#172B25]">
              Override Clinical Safety Warning
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#64756D] hover:text-[#172B25] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#64756D] leading-relaxed">
            Overriding a clinical contraindication creates a permanent, time-stamped entry in the hospital pharmacy audit trail with your credential signature.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
              Primary Justification Category
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-[#F7FAF8] border border-[#CBDAD4] rounded-lg p-2.5 text-xs text-[#172B25] focus:outline-none focus:border-[#087F5B]"
            >
              <option value="clinical-monitoring">Close therapeutic drug / lab monitoring established</option>
              <option value="benefit-outweighs-risk">Acute benefit outweighs theoretical risk (attending reviewed)</option>
              <option value="dose-adjusted">Dose empirically adjusted prior to administration</option>
              <option value="formulary-exception">No alternative therapeutic agent available in hospital formulary</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
              Clinical Rationale &amp; Safeguard Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document specific clinical rationale, consulting physician agreement, and lab schedules..."
              className="w-full bg-[#F7FAF8] border border-[#CBDAD4] rounded-lg p-3 text-xs text-[#172B25] focus:outline-none focus:border-[#087F5B]"
            />
          </div>

          <div className="bg-[#DDF5EA]/50 border border-[#B6E8D3] rounded-lg p-3 text-[11px] text-[#075E4B] flex items-center justify-between">
            <div>
              <span className="font-bold">Credential Sign-Off:</span> Dr. Sarah Vance, PharmD
              <div className="text-[10px] text-[#64756D]">License: PH-8831 • Inpatient Pharmacy Lead</div>
            </div>
            <UserCheck className="w-4 h-4 text-[#087F5B]" />
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmOverride(notes)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#075E4B] rounded-lg transition-colors shadow-sm"
          >
            Commit Override &amp; Dispense
          </button>
        </div>
      </div>
    </div>
  );
};


/* ================= 2. FLAG FOR PRESCRIBER MODAL ================= */
interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFlag: (note: string) => void;
}

export const FlagModal: React.FC<FlagModalProps> = ({
  isOpen,
  onClose,
  onConfirmFlag,
}) => {
  const [urgency, setUrgency] = useState<'urgent' | 'routine'>('urgent');
  const [noteText, setNoteText] = useState(
    'CLINICAL ALERT [PHARMACY REVIEW]: Order #RX-78492 holds a major Level 1 Drug-Drug Interaction between Warfarin Sodium 5mg and Fluconazole 200mg (CYP2C9 severe inhibition, rapid INR surge). In addition, Metformin 500mg BID touches allowable daily ceiling for patient eGFR 54. Recommend withholding fluconazole and substituting with non-systemic antifungal or preemptively reducing warfarin dose by 50% with daily INR protocol.'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#FECACA] flex items-center justify-between bg-[#FEF2F2]">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-[#C62828]" />
            <h2 className="text-sm font-bold text-[#C62828]">
              Flag Order for Prescriber Revision
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#64756D] hover:text-[#172B25] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#172B25] uppercase tracking-wider">
              Notification Urgency:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all ${
                  urgency === 'urgent'
                    ? 'bg-[#C62828] text-white shadow-xs'
                    : 'bg-[#F7FAF8] text-[#64756D] border border-[#CBDAD4]'
                }`}
              >
                Immediate Inpatient Stat (Page)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('routine')}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-all ${
                  urgency === 'routine'
                    ? 'bg-[#087F5B] text-white shadow-xs'
                    : 'bg-[#F7FAF8] text-[#64756D] border border-[#CBDAD4]'
                }`}
              >
                EMR InBasket Priority
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B25] uppercase tracking-wider block">
              Auto-Generated CDS Prescriber Communication
            </label>
            <textarea
              rows={5}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-[#F7FAF8] border border-[#CBDAD4] rounded-lg p-3 text-xs text-[#172B25] focus:outline-none focus:border-[#C62828] font-mono leading-relaxed"
            />
          </div>

          <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 text-xs text-[#64756D]">
            Recipient: <span className="font-semibold text-[#172B25]">Dr. N. Vance (Attending Physician - Unit 4B)</span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmFlag(noteText)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#C62828] hover:bg-[#A31F1F] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit Flag &amp; Hold Dispense</span>
          </button>
        </div>
      </div>
    </div>
  );
};


/* ================= 3. PATIENT SWITCHER MODAL ================= */
interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const PatientSwitcherModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#087F5B]" />
            <h2 className="text-sm font-bold text-[#172B25]">
              Switch Patient Clinical Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#64756D] hover:text-[#172B25] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {Object.values(PATIENT_PROFILES).map((patient) => (
            <div
              key={patient.id}
              onClick={() => {
                onSelectPatient(patient.id);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-[#E1EAE5] hover:border-[#087F5B] hover:bg-[#F7FAF8] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#172B25]">
                  {patient.name} ({patient.gender}, {patient.age} yo)
                </div>
                <div className="text-[11px] text-[#64756D] mt-0.5">
                  ID: #{patient.id} • {patient.unit} • eGFR: {patient.renalLabs.eGFR} mL/min
                </div>
                <div className="text-[11px] text-[#C62828] mt-1 font-medium">
                  Allergies: {patient.allergies.length > 0 ? patient.allergies.map(a => `${a.allergen} (${a.reaction})`).join(', ') : 'None (NKDA)'}
                </div>
              </div>

              <button className="text-xs font-semibold text-[#075E4B] bg-white border border-[#CBDAD4] px-2.5 py-1.5 rounded hover:bg-gray-50">
                Select
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


/* ================= 4. PRESCRIPTION UPLOAD & MANUAL ENTRY MODAL ================= */
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomPrescription: (fileName: string, drugs: PrescriptionDrug[]) => void;
}

export const PrescriptionUploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual drug list state
  const [manualDrugs, setManualDrugs] = useState<PrescriptionDrug[]>([
    {
      id: 'custom-1',
      name: 'Warfarin Sodium',
      genericName: 'Warfarin',
      category: 'Oral Anticoagulant',
      dose: '5 mg PO QD',
      route: 'PO',
      frequency: 'QD',
      ndc: '00056-0170-70',
      matchScore: 100
    },
    {
      id: 'custom-2',
      name: 'Fluconazole',
      genericName: 'Fluconazole',
      category: 'Systemic Antifungal',
      dose: '200 mg PO QD',
      route: 'PO',
      frequency: 'QD',
      ndc: '00049-3430-66',
      matchScore: 100
    }
  ]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        onLoadCustomPrescription(file.name, manualDrugs);
        onClose();
      }, 1500);
    }
  };

  const addManualDrug = () => {
    const newDrug: PrescriptionDrug = {
      id: `custom-${Date.now()}`,
      name: 'New Medication',
      genericName: 'Active Compound',
      category: 'General Therapeutics',
      dose: '10 mg PO QD',
      route: 'PO',
      frequency: 'QD',
      ndc: '00000-0000-00',
      matchScore: 98
    };
    setManualDrugs([...manualDrugs, newDrug]);
  };

  const removeManualDrug = (id: string) => {
    setManualDrugs(manualDrugs.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-[#E1EAE5] shadow-modal max-w-xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#087F5B]" />
            <h2 className="text-sm font-bold text-[#172B25]">
              Add or Upload Prescription Order
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#64756D] hover:text-[#172B25] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#E1EAE5]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#087F5B] text-[#075E4B]'
                : 'border-transparent text-[#64756D] hover:text-[#172B25]'
            }`}
          >
            Upload Prescription Document (PDF / Image)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-[#087F5B] text-[#075E4B]'
                : 'border-transparent text-[#64756D] hover:text-[#172B25]'
            }`}
          >
            Manual Regimen Entry
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-[#B6E8D3] hover:border-[#087F5B] bg-[#F7FAF8] rounded-xl p-8 text-center cursor-pointer block transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-[#172B25]">
                  Select or drop prescription order file
                </div>
                <div className="text-[11px] text-[#64756D] mt-1">
                  Supports PDF, JPG, PNG up to 25MB (hospital medication orders, e-scripts)
                </div>

                {isProcessing && (
                  <div className="mt-3 text-xs text-[#087F5B] font-semibold animate-pulse">
                    Running OCR &amp; RxNorm Entity Extraction...
                  </div>
                )}
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#64756D] uppercase">
                  Or pick a verified test prescription file:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onLoadCustomPrescription('Rx_Order_78492_Inpatient.pdf', manualDrugs);
                      onClose();
                    }}
                    className="p-2.5 bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg text-left hover:border-[#087F5B]"
                  >
                    <div className="font-bold text-[#172B25]">Rx_Order_78492.pdf</div>
                    <div className="text-[10px] text-[#64756D]">Warfarin + Fluconazole</div>
                  </button>

                  <button
                    onClick={() => {
                      onLoadCustomPrescription('Rx_Order_92015_Vance.pdf', manualDrugs);
                      onClose();
                    }}
                    className="p-2.5 bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg text-left hover:border-[#087F5B]"
                  >
                    <div className="font-bold text-[#172B25]">Rx_Order_92015.pdf</div>
                    <div className="text-[10px] text-[#64756D]">Apixaban + Celecoxib</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {manualDrugs.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-2 bg-[#F7FAF8] p-2.5 rounded-lg border border-[#E1EAE5]">
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => {
                        const copy = [...manualDrugs];
                        copy[i].name = e.target.value;
                        setManualDrugs(copy);
                      }}
                      className="text-xs bg-white border border-[#CBDAD4] rounded px-2 py-1 flex-1 font-bold text-[#172B25]"
                      placeholder="Drug name"
                    />
                    <input
                      type="text"
                      value={d.dose}
                      onChange={(e) => {
                        const copy = [...manualDrugs];
                        copy[i].dose = e.target.value;
                        setManualDrugs(copy);
                      }}
                      className="text-xs bg-white border border-[#CBDAD4] rounded px-2 py-1 w-28 font-mono text-[#172B25]"
                      placeholder="Dose"
                    />
                    <button
                      onClick={() => removeManualDrug(d.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addManualDrug}
                className="text-xs text-[#087F5B] hover:text-[#075E4B] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medication
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onLoadCustomPrescription('Manual_Prescription_Order.pdf', manualDrugs);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#075E4B] rounded-lg shadow-sm"
          >
            Load into Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
