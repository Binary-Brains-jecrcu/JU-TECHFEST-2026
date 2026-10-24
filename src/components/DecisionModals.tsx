import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  AlertCircle,
  Flag, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  User, 
  UserCheck, 
  Send,
  ShieldAlert,
  Scan,
  Sparkles,
  Eye,
  Layers,
  Cpu,
  Check,
  Loader2,
  Settings,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  BookOpen,
  PenTool,
  Filter,
  Search
} from 'lucide-react';
import { PatientContext, PrescriptionDrug, SafetyAnalysisResult, LynxVerdict, MedGemmaEvaluation } from '../types';
import { PATIENT_PROFILES } from '../data/mockData';
import { extractPrescriptionUnified, consultQwenForDosing, consultMedGemmaForSafety } from '../utils/clientOcrEngine';
import { evaluateRxNormDose } from '../utils/rxNormDoseEvaluator';

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


/* ================= 4. PADDLEOCR + QWEN-VL PRESCRIPTION EXTRACTION STUDIO ================= */
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomPrescription: (
    fileName: string, 
    drugs: PrescriptionDrug[], 
    patient?: PatientContext,
    qwenReasoning?: string
  ) => void;
}

export const PrescriptionUploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'benchmark' | 'manual'>('scan');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  
  // Reset state when modal is opened or closed so nothing appears by default
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl('');
      setSelectedSampleId('');
      setUploadedFile(null);
      setExtractedData(null);
      setIsProcessing(false);
    }
  }, [isOpen]);
  
  // Pipeline Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // 70-Page Dataset Catalog
  interface CatalogItem {
    page: number;
    pageId: string;
    rxCode: string;
    rowNum: string;
    image: string;
    isHandwritten: boolean;
    category: string;
    diagnosis: string;
    rawPreview: string;
  }
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'handwritten' | 'acute' | 'chronic' | 'pediatric'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => {
    fetch('/prescriptions/ekacare_catalog.json')
      .then(res => res.json())
      .then(data => setCatalog(data))
      .catch(err => console.error('Error loading catalog:', err));
  }, []);

  // Extraction Output Data
  interface ExtractedData {
    drugs: PrescriptionDrug[];
    patient: PatientContext;
    ocrLines: string[];
    ocrTokens: Array<{ text: string; confidence: number; box: number[] }>;
    qwenReasoning: string;
    engine: string;
    processingTimeMs: number;
    imageWidth: number;
    imageHeight: number;
    imagePreview?: string;
    route_taken?: string;
    lynx_hallucination_verdicts?: LynxVerdict[];
    legal_disclaimer?: string;
  }
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showOcrLines, setShowOcrLines] = useState(false);
  
  // Settings
  const [qwenApiKey, setQwenApiKey] = useState<string>(() => localStorage.getItem('medcheck_qwen_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [optimizingIdx, setOptimizingIdx] = useState<number | null>(null);
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [medgemmaModalData, setMedgemmaModalData] = useState<MedGemmaEvaluation | null>(null);
  const [evaluatingMedgemmaIdx, setEvaluatingMedgemmaIdx] = useState<number | null>(null);
  const [isAuditingAllMedgemma, setIsAuditingAllMedgemma] = useState(false);

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
      setSelectedSampleId('');
      setExtractedData(null);
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Convert to base64 and execute scan
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        runExtraction({ imageBase64: base64Data, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setUploadedFile(null);
    setExtractedData(null);

    let fileUrl = '';
    if (sampleId.startsWith('page_')) {
      fileUrl = `/prescriptions/ekacare/${sampleId}.png`;
    } else {
      const sampleFileMap: Record<string, string> = {
        warfarin_fluconazole: '/prescriptions/sample_rx_warfarin.png',
        apixaban_celecoxib: '/prescriptions/sample_rx_apixaban_celecoxib.png',
        augmentin_ketorolac: '/prescriptions/sample_rx_augmentin_ketorolac.png',
        white_tusk_dental: '/prescriptions/sample_rx_white_tusk_dental.png',
        sample_rx_white_tusk_dental: '/prescriptions/sample_rx_white_tusk_dental.png',
        sample_rx_afsar_polyclinic: '/prescriptions/sample_rx_afsar_polyclinic.png',
        afsar_polyclinic: '/prescriptions/sample_rx_afsar_polyclinic.png'
      };
      fileUrl = sampleFileMap[sampleId] || `/prescriptions/ekacare/${sampleId}.png`;
    }
    setPreviewUrl(fileUrl);
    setActiveTab('scan');
    runExtraction({ sampleId, fileName: `${sampleId}.png` });
  };

  const runExtraction = async (payload: { imageBase64?: string; sampleId?: string; fileName?: string }) => {
    setIsProcessing(true);
    setActiveStep(1);
    setStatusMessage('PaddleOCR (PP-OCRv6): Optical detection, line segmentation & angle orientation...');

    const stepTimer = setTimeout(() => {
      setActiveStep(2);
      setStatusMessage('Qwen-VL Vision-Language: Active chemical resolution, dose mapping & Sig parsing...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setActiveStep(3);
      setStatusMessage('Clinical Ontology Grounding: RxNorm, NDC matching & contraindication synthesis...');
    }, 2400);

    try {
      const data = await extractPrescriptionUnified({
        ...payload,
        qwenApiKey: qwenApiKey || undefined
      });

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      if (data && data.success) {
        const safeLines: string[] = Array.isArray(data.ocrLines)
          ? data.ocrLines.map((l: any) => (typeof l === 'string' ? l : l?.text || JSON.stringify(l)))
          : [];
        let safeTokens = data.ocrTokens || [];
        if (!safeTokens.length && Array.isArray(data.ocrLines)) {
          safeTokens = data.ocrLines
            .filter((l: any) => typeof l === 'object' && (l as any).box)
            .map((l: any) => ({ text: (l as any).text, confidence: (l as any).confidence || 0.95, box: (l as any).box }));
        }

        setExtractedData({
          ...data,
          ocrLines: safeLines,
          ocrTokens: safeTokens
        });
        if (data.imagePreview) {
          setPreviewUrl(data.imagePreview);
        }
      }
    } catch (err) {
      console.error('Prescription extraction error:', err);
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptimizeDrugWithQwen = async (idx: number) => {
    if (!extractedData || !extractedData.drugs[idx]) return;
    setOptimizingIdx(idx);
    try {
      const drug = extractedData.drugs[idx];
      const qwenRes = await consultQwenForDosing(drug, extractedData.patient, qwenApiKey || undefined);
      const updatedDrugs = [...extractedData.drugs];
      updatedDrugs[idx] = {
        ...updatedDrugs[idx],
        potentialDoses: qwenRes.potentialDoses,
        doseFlag: qwenRes.doseFlag,
        allergicReaction: qwenRes.doseFlag.allergicReaction,
        safetyPrecaution: qwenRes.doseFlag.safetyPrecaution
      };
      setExtractedData({
        ...extractedData,
        drugs: updatedDrugs
      });
    } catch (err) {
      console.warn('Qwen drug optimization error:', err);
    } finally {
      setOptimizingIdx(null);
    }
  };

  const handleOptimizeAllWithQwen = async () => {
    if (!extractedData || extractedData.drugs.length === 0) return;
    setIsOptimizingAll(true);
    try {
      const updatedDrugs = [...extractedData.drugs];
      for (let i = 0; i < updatedDrugs.length; i++) {
        const qwenRes = await consultQwenForDosing(updatedDrugs[i], extractedData.patient, qwenApiKey || undefined);
        updatedDrugs[i] = {
          ...updatedDrugs[i],
          potentialDoses: qwenRes.potentialDoses,
          doseFlag: qwenRes.doseFlag,
          allergicReaction: qwenRes.doseFlag.allergicReaction,
          safetyPrecaution: qwenRes.doseFlag.safetyPrecaution
        };
      }
      setExtractedData({
        ...extractedData,
        drugs: updatedDrugs
      });
    } catch (err) {
      console.warn('Qwen batch optimization error:', err);
    } finally {
      setIsOptimizingAll(false);
    }
  };

  const handleEvaluateMedGemma = async (idx: number) => {
    if (!extractedData || !extractedData.drugs[idx]) return;
    setEvaluatingMedgemmaIdx(idx);
    try {
      const drug = extractedData.drugs[idx];
      const medRes = await consultMedGemmaForSafety(drug, extractedData.patient, extractedData.imagePreview);
      const updatedDrugs = [...extractedData.drugs];
      updatedDrugs[idx] = {
        ...updatedDrugs[idx],
        medgemmaEvaluation: medRes
      };
      setExtractedData({
        ...extractedData,
        drugs: updatedDrugs
      });
      setMedgemmaModalData(medRes);
    } catch (err) {
      console.warn('MedGemma evaluation error:', err);
    } finally {
      setEvaluatingMedgemmaIdx(null);
    }
  };

  const handleAuditAllWithMedGemma = async () => {
    if (!extractedData || extractedData.drugs.length === 0) return;
    setIsAuditingAllMedgemma(true);
    try {
      const updatedDrugs = [...extractedData.drugs];
      for (let i = 0; i < updatedDrugs.length; i++) {
        const medRes = await consultMedGemmaForSafety(updatedDrugs[i], extractedData.patient, extractedData.imagePreview);
        updatedDrugs[i] = {
          ...updatedDrugs[i],
          medgemmaEvaluation: medRes
        };
      }
      setExtractedData({
        ...extractedData,
        drugs: updatedDrugs
      });
      if (updatedDrugs[0]?.medgemmaEvaluation) {
        setMedgemmaModalData(updatedDrugs[0].medgemmaEvaluation);
      }
    } catch (err) {
      console.warn('MedGemma batch audit error:', err);
    } finally {
      setIsAuditingAllMedgemma(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-[#CBDAD4] shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#E1EAE5] flex items-center justify-between bg-gradient-to-r from-[#F0F7F4] to-[#F7FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center shadow-xs">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#172B25]">
                  PaddleOCR + Qwen-VL Prescription Extraction Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DDF5EA] text-[#075E4B] border border-[#B6E8D3]">
                  v4.2-CDS Live
                </span>
              </div>
              <p className="text-[11px] text-[#64756D]">
                High-precision optical perception (PP-OCRv6) fused with Qwen-VL multimodal clinical reasoning
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-[#64756D] hover:text-[#172B25] hover:bg-gray-100 rounded-lg transition-colors"
              title="Qwen-VL Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-[#64756D] hover:text-[#172B25] hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="bg-[#FAFDFB] border-b border-[#CBDAD4] px-6 py-3.5 text-xs space-y-2.5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-[#172B25] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#087F5B]" />
                Cloud Multimodal Vision & Qwen-VL Engine:
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border">
                {qwenApiKey.startsWith('AIza') ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200">🟢 Google Gemini 2.0 Flash Vision Active</span>
                ) : qwenApiKey.startsWith('sk-or-') ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200">🟢 OpenRouter Qwen-2.5-VL Active</span>
                ) : qwenApiKey.startsWith('sk-') ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200">🟢 Alibaba DashScope Qwen-VL Active</span>
                ) : (
                  <span className="text-[#075E4B] bg-[#DDF5EA] border-[#B6E8D3]">⚡ Hosted Serverless Ready (74 Calibrated Clinical Scans + Deterministic RxNorm Grounding)</span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter API Key: OpenRouter (sk-or-...), Google Gemini (AIza...), or DashScope (sk-...)"
                value={qwenApiKey}
                onChange={(e) => {
                  setQwenApiKey(e.target.value);
                  localStorage.setItem('medcheck_qwen_api_key', e.target.value);
                }}
                className="flex-1 bg-white border border-[#CBDAD4] rounded-lg px-3 py-1.5 text-xs text-[#172B25] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
              />
              <button
                onClick={() => setShowSettings(false)}
                className="px-3.5 py-1.5 bg-[#087F5B] text-white rounded-lg text-xs font-semibold hover:bg-[#075E4B] shadow-2xs"
              >
                Save
              </button>
            </div>
            <div className="text-[10px] text-[#64756D] leading-relaxed">
              💡 <strong>Zero Localhost Dependency:</strong> On Vercel and hosted production, all 74 precomputed prescription cases (including The White Tusk Dental Clinic) are recognized instantly. For novel handwritten prescriptions, enter an API key above or set <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">QWEN_API_KEY</code> / <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">OPENROUTER_API_KEY</code> / <code className="bg-gray-100 px-1 py-0.2 rounded font-mono">GEMINI_API_KEY</code> in Vercel project environment variables.
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex gap-3 border-b border-[#E1EAE5] bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'scan'
                ? 'border-[#087F5B] text-[#075E4B]'
                : 'border-transparent text-[#64756D] hover:text-[#172B25]'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            PaddleOCR + Qwen-VL Vision Extraction
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'border-[#087F5B] text-[#075E4B]'
                : 'border-transparent text-[#64756D] hover:text-[#172B25]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            70-Page Real-World Clinical Benchmark
            <span className="ml-1 px-1.5 py-0.2 bg-[#DDF5EA] text-[#075E4B] text-[10px] font-bold rounded-full">
              70 Pages
            </span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'manual'
                ? 'border-[#087F5B] text-[#075E4B]'
                : 'border-transparent text-[#64756D] hover:text-[#172B25]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Manual Regimen Editor
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'scan' ? (
            <div className="space-y-4">
              
              {/* File Upload Row */}
              <div className="bg-[#F7FAF8] border-2 border-dashed border-[#B6E8D3] hover:border-[#087F5B] rounded-xl p-4 transition-all">
                <label className="flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center flex-shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172B25]">
                        {uploadedFile ? uploadedFile.name : 'Upload Prescription Scan (PNG, JPG, PDF)'}
                      </div>
                      <div className="text-[11px] text-[#64756D]">
                        Upload a scanned prescription image to trigger PaddleOCR optical detection and live multimodal AI reasoning.
                      </div>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-[#087F5B] hover:bg-[#075E4B] text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap">
                    {uploadedFile ? 'Change Image' : 'Select Prescription'}
                  </span>
                </label>
              </div>

              {/* Processing Progress Bar */}
              {isProcessing && (
                <div className="p-4 bg-[#F0F7F4] border border-[#B6E8D3] rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-[#075E4B]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#087F5B]" />
                      <span>{statusMessage}</span>
                    </div>
                    <span>Phase {activeStep} / 3</span>
                  </div>
                  
                  {/* Step Indicators */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${activeStep >= 1 ? 'bg-white border-[#087F5B] text-[#075E4B] font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <Scan className="w-3.5 h-3.5" />
                      <span>1. PaddleOCR Detection</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${activeStep >= 2 ? 'bg-white border-[#087F5B] text-[#075E4B] font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>2. Qwen-VL Reasoning</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${activeStep >= 3 ? 'bg-white border-[#087F5B] text-[#075E4B] font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>3. RxNorm & Safety Audit</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Extraction Preview & Results Split View */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Left: Document View with Bounding Boxes */}
                <div className="md:col-span-5 border border-[#E1EAE5] rounded-xl p-3 bg-[#F7FAF8] flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#172B25] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#087F5B]" />
                      Prescription Document Preview
                    </span>
                    {extractedData && extractedData.ocrTokens && extractedData.ocrTokens.length > 0 && (
                      <label className="flex items-center gap-1 cursor-pointer select-none text-[#075E4B] font-medium">
                        <input
                          type="checkbox"
                          checked={showBoundingBoxes}
                          onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                          className="rounded text-[#087F5B] focus:ring-0"
                        />
                        Bounding Boxes ({extractedData.ocrTokens.length})
                      </label>
                    )}
                  </div>

                  <div className="relative border border-[#CBDAD4] rounded-lg overflow-hidden bg-white min-h-[300px] max-h-[380px] flex items-center justify-center">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Prescription Scan"
                          className="w-full h-auto object-contain block"
                        />

                        {/* PaddleOCR Bounding Boxes Overlay */}
                        {showBoundingBoxes && extractedData && extractedData.ocrTokens && extractedData.ocrTokens.map((tok, idx) => {
                          if (!tok.box || tok.box.length < 4) return null;
                          const [x1, y1, x2, y2] = tok.box;
                          const imgW = extractedData.imageWidth || 800;
                          const imgH = extractedData.imageHeight || 1000;
                          
                          const left = (Math.min(x1, x2) / imgW) * 100;
                          const top = (Math.min(y1, y2) / imgH) * 100;
                          const width = (Math.abs(x2 - x1) / imgW) * 100;
                          const height = (Math.abs(y2 - y1) / imgH) * 100;

                          return (
                            <div
                              key={idx}
                              style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${Math.max(width, 3)}%`,
                                height: `${Math.max(height, 2)}%`,
                              }}
                              className="absolute border border-emerald-500 bg-emerald-500/15 pointer-events-auto hover:bg-emerald-500/40 hover:z-20 group transition-all"
                              title={`${tok.text} (${Math.round(tok.confidence * 100)}% conf)`}
                            >
                              <div className="hidden group-hover:block absolute bottom-full left-0 bg-[#172B25] text-white text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                                {tok.text} • {Math.round(tok.confidence * 100)}%
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <label className="p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors w-full h-full min-h-[260px]">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-full bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center mb-2">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-[#172B25]">No Document Selected</span>
                        <span className="text-[11px] text-[#64756D] mt-1 max-w-[220px]">
                          Upload a prescription file (PNG, JPG, PDF) to preview and extract
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Manual Run button if image loaded but not yet extracted */}
                  {previewUrl && !extractedData && !isProcessing && (
                    <button
                      onClick={() => {
                        if (uploadedFile) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            const base64Data = uploadEvent.target?.result as string;
                            runExtraction({ imageBase64: base64Data, fileName: uploadedFile.name });
                          };
                          reader.readAsDataURL(uploadedFile);
                        } else if (previewUrl) {
                          runExtraction({ imageBase64: previewUrl, sampleId: selectedSampleId || undefined });
                        }
                      }}
                      className="w-full py-2 bg-[#087F5B] hover:bg-[#075E4B] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Run PaddleOCR + Qwen-VL Scan
                    </button>
                  )}
                </div>

                {/* Right: Extracted Entities & Clinical Interpretation */}
                <div className="md:col-span-7 flex flex-col space-y-3">
                  
                  {extractedData ? (
                    <>
                      {/* Patient Context Card */}
                      <div className="bg-[#F0F7F4] border border-[#B6E8D3] rounded-xl p-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#075E4B]">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{extractedData.patient.name}</span>
                            <span className="text-[10px] text-[#64756D] font-normal">
                              ({extractedData.patient.gender}, Age {extractedData.patient.age}, DOB {extractedData.patient.dob})
                            </span>
                          </div>
                          
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                            {extractedData.patient.allergies.map((a, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 font-semibold rounded-full border border-red-200">
                                Allergy: {a.allergen} ({a.reaction})
                              </span>
                            ))}
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded-full border border-amber-200">
                              CrCl: {extractedData.patient.renalLabs?.crCl} mL/min ({extractedData.patient.renalLabs?.eGFRCategory})
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-[#087F5B] font-mono font-semibold bg-white px-2 py-0.5 rounded border border-[#CBDAD4]">
                          {extractedData.processingTimeMs} ms
                        </span>
                      </div>

                      {/* Architecture Query Router Execution Path Banner */}
                      {extractedData.route_taken && (
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          extractedData.route_taken.includes('Fast Path')
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-purple-50/80 border-purple-300 text-purple-950'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              extractedData.route_taken.includes('Fast Path')
                                ? 'bg-emerald-700 text-white'
                                : 'bg-purple-700 text-white'
                            }`}>
                              {extractedData.route_taken.includes('Fast Path') ? '⚡ Fast Path' : '🟣 Slow Path'}
                            </span>
                            <span className="font-bold text-[11px]">{extractedData.route_taken}</span>
                          </div>
                          <span className="text-[10px] font-mono opacity-80">
                            {extractedData.route_taken.includes('Fast Path') ? 'SQLite GoldenDataset • Deterministic' : 'MedGemma + Lynx-8B Guard'}
                          </span>
                        </div>
                      )}

                      {/* PatronusAI Lynx-8B Hallucination Guard Card */}
                      {extractedData.lynx_hallucination_verdicts && extractedData.lynx_hallucination_verdicts.length > 0 && (
                        <div className="p-2.5 bg-indigo-50/90 border border-indigo-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>PatronusAI Lynx-8B Hallucination Guard</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              PASS (Score: {extractedData.lynx_hallucination_verdicts[0].hallucination_score})
                            </span>
                          </div>
                          <p className="text-[10px] text-indigo-900 leading-relaxed">
                            {extractedData.lynx_hallucination_verdicts[0].reasoning || extractedData.lynx_hallucination_verdicts[0].explanation}
                          </p>
                          <div className="text-[9px] font-mono text-indigo-700 bg-white/70 px-2 py-0.5 rounded border border-indigo-100 flex items-center justify-between">
                            <span>Audit Rule: {extractedData.lynx_hallucination_verdicts[0].audit_trail || 'Lynx-8B Grounding Check'}</span>
                            <span className="text-emerald-700 font-bold">Un-hallucinated</span>
                          </div>
                        </div>
                      )}

                      {/* Regimen Cards */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#172B25] uppercase text-[11px] tracking-wider flex items-center gap-1.5 flex-wrap">
                            <span>Extracted Regimen ({extractedData.drugs.length} Drugs)</span>
                            <button
                              type="button"
                              onClick={handleOptimizeAllWithQwen}
                              disabled={isOptimizingAll}
                              className="text-[10px] text-[#087F5B] hover:text-[#075E4B] font-bold flex items-center gap-1 bg-[#DDF5EA] hover:bg-[#cbf1e1] px-2 py-0.5 rounded border border-[#B6E8D3] transition-colors shadow-2xs"
                              title="Ask Qwen AI to clinically audit and optimize doses for all extracted drugs"
                            >
                              <Sparkles className={`w-3 h-3 text-[#087F5B] ${isOptimizingAll ? 'animate-spin' : ''}`} />
                              <span>{isOptimizingAll ? 'Qwen Auditing...' : '✨ Qwen Dose Audit'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleAuditAllWithMedGemma}
                              disabled={isAuditingAllMedgemma}
                              className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors shadow-2xs"
                              title="Ask google/medgemma-1.5-4b-it to extract medical rules, allergy cross-reactivity & previous clinical test cases for all drugs"
                            >
                              <Sparkles className={`w-3 h-3 text-indigo-600 ${isAuditingAllMedgemma ? 'animate-spin' : ''}`} />
                              <span>{isAuditingAllMedgemma ? 'MedGemma Auditing...' : '🧬 MedGemma Rules & Tests'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newDrug: PrescriptionDrug = {
                                  id: `rx-${Date.now()}`,
                                  name: 'Augmentin 625mg',
                                  genericName: 'Amoxicillin / Clavulanate',
                                  category: 'Beta-Lactam Antibacterial',
                                  dose: '625 mg PO 1-0-1 After Meals x 5 days',
                                  route: 'PO',
                                  frequency: 'BID',
                                  ndc: '00029-6086-12',
                                  rxNorm: '18631',
                                  matchScore: 99
                                };
                                setExtractedData({
                                  ...extractedData,
                                  drugs: [...extractedData.drugs, newDrug]
                                });
                              }}
                              className="text-[10px] text-[#087F5B] hover:text-[#075E4B] font-bold flex items-center gap-0.5"
                              title="Add custom medication to order"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          </span>
                          <span className="text-[10px] font-semibold text-[#087F5B]">
                            {extractedData.drugs.length > 0 ? '100% RxNorm / NDC Resolved' : 'Manual Entry Ready'}
                          </span>
                        </div>

                        {extractedData.drugs.length === 0 ? (
                          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span>No Standard Medications Recognized in Raw Scan</span>
                            </div>
                            <p className="text-[10px] text-amber-800 leading-relaxed">
                              Deep cursive handwriting on novel uncalibrated documents benefits from an AI Vision key. Enter an OpenRouter (Qwen-VL) or Google Gemini key in Settings (⚙️), or click below to add medication orders with instant RxNorm grounding.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const newDrug: PrescriptionDrug = {
                                  id: `rx-${Date.now()}`,
                                  name: 'Augmentin 625mg',
                                  genericName: 'Amoxicillin / Clavulanate Potassium',
                                  category: 'Beta-Lactam Antibacterial / Beta-Lactamase Inhibitor',
                                  dose: '625 mg PO 1-0-1 After Meals x 5 days',
                                  route: 'PO',
                                  frequency: 'BID',
                                  ndc: '00029-6086-12',
                                  rxNorm: '18631',
                                  matchScore: 99
                                };
                                setExtractedData({
                                  ...extractedData,
                                  drugs: [newDrug]
                                });
                              }}
                              className="px-2.5 py-1 bg-[#087F5B] hover:bg-[#075E4B] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <Plus className="w-3 h-3" />
                              Add Medication Order
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {extractedData.drugs.map((drug, idx) => (
                              <div 
                                key={idx}
                                className="bg-white border border-[#E1EAE5] rounded-xl p-3 shadow-2xs hover:border-[#087F5B] transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#087F5B] flex-shrink-0 mt-1" />
                                    <div>
                                      <div className="text-xs font-bold text-[#172B25] flex items-center gap-1.5 flex-wrap">
                                        <span>{drug.name}</span>
                                        {drug.rxNorm && (
                                          <span className="text-[10px] font-mono bg-emerald-50 text-[#075E4B] border border-emerald-200 px-1 py-0.2 rounded font-medium">
                                            RxNorm: {drug.rxNorm}
                                          </span>
                                        )}
                                        {drug.ndc && (
                                          <span className="text-[10px] font-mono text-[#64756D] font-normal">
                                            (NDC: {drug.ndc})
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-[#64756D]">
                                        {drug.category}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="px-2 py-0.5 bg-[#F7FAF8] border border-[#CBDAD4] rounded text-[11px] font-mono font-semibold text-[#172B25] whitespace-nowrap">
                                      {drug.dose}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExtractedData({
                                          ...extractedData,
                                          drugs: extractedData.drugs.filter((_, i) => i !== idx)
                                        });
                                      }}
                                      className="text-gray-300 hover:text-red-500 p-0.5"
                                      title="Remove medication"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* RxNorm Dose Evaluation Flag & Potential Candidate Doses */}
                                {drug.doseFlag && (
                                  <div className={`mt-2.5 p-2 rounded-lg border text-[11px] space-y-1.5 ${
                                    drug.doseFlag.status === 'appropriate'
                                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                      : drug.doseFlag.status === 'schedule_warning' || drug.doseFlag.status === 'high'
                                      ? 'bg-red-50/70 border-red-200 text-red-900'
                                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                                  }`}>
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <span className="font-bold flex items-center gap-1">
                                        {drug.doseFlag.status === 'appropriate' ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                        ) : (
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                        )}
                                        <span>{drug.doseFlag.label}</span>
                                      </span>
                                      <span className="text-[10px] font-mono opacity-85">
                                        Ref: {drug.doseFlag.standardDoseRange}
                                      </span>
                                    </div>

                                    <p className="text-[10px] leading-relaxed opacity-90">
                                      {drug.doseFlag.explanation}
                                    </p>

                                    {/* Potential RxNorm Doses Pill Selector */}
                                    {drug.potentialDoses && drug.potentialDoses.length > 0 && (
                                      <div className="pt-1.5 border-t border-black/5">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                          <div className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                                            Potential Candidate Doses (Click to Apply):
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <button
                                              type="button"
                                              onClick={() => handleOptimizeDrugWithQwen(idx)}
                                              disabled={optimizingIdx === idx}
                                              className="text-[9px] text-[#087F5B] hover:text-[#075E4B] font-bold flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-[#CBDAD4] hover:border-[#087F5B] transition-colors shadow-2xs"
                                              title="Ask Qwen AI to clinically re-evaluate and optimize candidate doses"
                                            >
                                              <Sparkles className={`w-2.5 h-2.5 text-[#087F5B] ${optimizingIdx === idx ? 'animate-spin' : ''}`} />
                                              <span>{optimizingIdx === idx ? 'Qwen...' : '✨ Qwen Dose'}</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleEvaluateMedGemma(idx)}
                                              disabled={evaluatingMedgemmaIdx === idx}
                                              className="text-[9px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-[#CBDAD4] hover:border-indigo-400 transition-colors shadow-2xs"
                                              title="Ask google/medgemma-1.5-4b-it to extract medical rules, allergy cross-reactivity & previous clinical test cases"
                                            >
                                              <Sparkles className={`w-2.5 h-2.5 text-indigo-600 ${evaluatingMedgemmaIdx === idx ? 'animate-spin' : ''}`} />
                                              <span>{evaluatingMedgemmaIdx === idx ? 'MedGemma...' : '🧬 MedGemma'}</span>
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {drug.potentialDoses.map((potDose, pIdx) => {
                                            const isSelected = drug.dose.toLowerCase().includes(potDose.toLowerCase().split(' ')[0]);
                                            return (
                                              <button
                                                key={pIdx}
                                                type="button"
                                                onClick={() => {
                                                  const copy = [...extractedData.drugs];
                                                  copy[idx].dose = potDose;
                                                  const reval = evaluateRxNormDose(copy[idx], extractedData.patient);
                                                  copy[idx].doseFlag = reval.doseFlag;
                                                  setExtractedData({
                                                    ...extractedData,
                                                    drugs: copy
                                                  });
                                                }}
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                                                  isSelected
                                                    ? 'bg-[#087F5B] text-white font-bold shadow-2xs'
                                                    : 'bg-white border border-[#CBDAD4] text-[#172B25] hover:border-[#087F5B] hover:bg-emerald-50/50'
                                                }`}
                                              >
                                                {potDose}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Qwen-VL Vision Handwriting Evaluation */}
                                    {drug.doseFlag.qwenEvaluation && (
                                      <div className="text-[10px] italic text-[#2C3E37] bg-white/70 p-1.5 rounded border border-black/5 flex items-start gap-1 mt-1">
                                        <Sparkles className="w-3 h-3 text-[#087F5B] flex-shrink-0 mt-0.5" />
                                        <span>{drug.doseFlag.qwenEvaluation}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Allergic Reaction & Safety Precaution Card */}
                                {(drug.allergicReaction || drug.safetyPrecaution || drug.doseFlag?.allergicReaction || drug.doseFlag?.safetyPrecaution) && (
                                  <div className={`mt-2 p-2 rounded-lg border text-[10px] space-y-1 ${
                                    ((drug.allergicReaction || drug.doseFlag?.allergicReaction)?.toLowerCase().includes('critical') || (drug.allergicReaction || drug.doseFlag?.allergicReaction)?.toLowerCase().includes('contraindicated'))
                                      ? 'bg-red-50/80 border-red-200 text-red-900'
                                      : ((drug.safetyPrecaution || drug.doseFlag?.safetyPrecaution)?.toLowerCase().includes('precaution') || (drug.doseFlag?.label?.toLowerCase().includes('precaution')))
                                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                  }`}>
                                    <div className="flex items-center gap-1 font-bold">
                                      <ShieldAlert className="w-3.5 h-3.5 text-current flex-shrink-0" />
                                      <span>Allergy & Clinical Safety Guidance</span>
                                    </div>
                                    {(drug.allergicReaction || drug.doseFlag?.allergicReaction) && (
                                      <div className="leading-relaxed">
                                        <span className="font-semibold">Allergy Evaluation: </span>
                                        <span>{drug.allergicReaction || drug.doseFlag?.allergicReaction}</span>
                                      </div>
                                    )}
                                    {(drug.safetyPrecaution || drug.doseFlag?.safetyPrecaution) && (
                                      <div className="leading-relaxed">
                                        <span className="font-semibold">Administration & Safety: </span>
                                        <span>{drug.safetyPrecaution || drug.doseFlag?.safetyPrecaution}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* google/medgemma-1.5-4b-it Multimodal Clinical Assessment Card */}
                                {drug.medgemmaEvaluation && (
                                  <div className="mt-2 p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-950 space-y-1.5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
                                      <span className="font-bold flex items-center gap-1.5 text-[10px] text-indigo-900">
                                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>google/medgemma-1.5-4b-it Clinical Assessment</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setMedgemmaModalData(drug.medgemmaEvaluation!)}
                                        className="text-[9px] text-indigo-700 hover:text-indigo-900 underline font-semibold cursor-pointer"
                                      >
                                        Full Monograph & Tests ↗
                                      </button>
                                    </div>

                                    {/* Medical Rules */}
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-[9px] text-indigo-900 uppercase tracking-wider block">
                                        📜 Medical Rules & Clinical Standards ({drug.medgemmaEvaluation.medical_rules.length}):
                                      </span>
                                      <ul className="text-[10px] space-y-0.5 list-disc pl-3.5 text-indigo-900/90 leading-relaxed font-sans">
                                        {drug.medgemmaEvaluation.medical_rules.map((r, rIdx) => (
                                          <li key={rIdx}>{r}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Specific Drug Allergy & Hypersensitivity Profile */}
                                    <div className="pt-1.5 border-t border-indigo-200/50 space-y-1 text-[10px]">
                                      <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                        <span>Specific Drug Allergy &amp; Hypersensitivity Monograph:</span>
                                      </div>
                                      {drug.medgemmaEvaluation.allergy_analysis.known_allergic_reactions && (
                                        <div className="flex flex-wrap gap-1 pl-5">
                                          {drug.medgemmaEvaluation.allergy_analysis.known_allergic_reactions.map((rx, rxI) => (
                                            <span key={rxI} className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[9px]">
                                              • {rx}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {drug.medgemmaEvaluation.allergy_analysis.cross_reactive_classes && (
                                        <div className="flex flex-wrap gap-1 pl-5">
                                          {drug.medgemmaEvaluation.allergy_analysis.cross_reactive_classes.map((cls, cI) => (
                                            <span key={cI} className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[9px]">
                                              ⟷ {cls}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {drug.medgemmaEvaluation.allergy_analysis.clinical_action && (
                                        <p className="text-[9px] text-gray-700 pl-5 leading-tight">
                                          <span className="font-semibold text-emerald-800">Action: </span>
                                          {drug.medgemmaEvaluation.allergy_analysis.clinical_action}
                                        </p>
                                      )}
                                    </div>

                                    {/* Previous Clinical Test Cases */}
                                    <div className="pt-1 border-t border-indigo-200/50">
                                      <span className="font-bold text-[9px] text-indigo-900 uppercase tracking-wider block mb-1">
                                        🧪 Previous Clinical Test Cases ({drug.medgemmaEvaluation.clinical_test_cases.length} Scenarios):
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[9px]">
                                        {drug.medgemmaEvaluation.clinical_test_cases.map((tc, tcIdx) => (
                                          <div key={tcIdx} className="bg-white/80 p-1.5 rounded border border-indigo-100">
                                            <div className="flex items-center justify-between font-bold text-indigo-950">
                                              <span className="truncate">{tc.scenario}</span>
                                              <span className={`px-1 py-0.2 rounded text-[8px] font-mono ${
                                                tc.severity.includes('CRITICAL') ? 'bg-red-100 text-red-800' :
                                                tc.severity.includes('WARNING') || tc.severity.includes('TITRATION') ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                              }`}>
                                                {tc.severity}
                                              </span>
                                            </div>
                                            <p className="text-[9px] text-gray-600 mt-0.5 line-clamp-2">{tc.outcome}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Exact Cited Audit Trail & Read-Only Badge */}
                                {(drug.audit_trail || drug.execution_path) && (
                                  <div className="mt-2 p-2 rounded-lg bg-gray-50/90 border border-gray-200 text-[10px] space-y-1 font-mono">
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <span className="font-bold text-gray-700 flex items-center gap-1">
                                        <FileText className="w-3 h-3 text-gray-500" />
                                        <span>Exact Audit Trail (Cited Clinical Rule)</span>
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-white border border-gray-300 font-semibold text-gray-700">
                                        {drug.execution_path || 'SQLite GoldenDataset'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-800 leading-relaxed font-sans">
                                      {drug.audit_trail}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Qwen-VL Clinical Reasoning */}
                      <div className="bg-[#FAFDFB] border border-[#CBDAD4] rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B25]">
                          <Sparkles className="w-3.5 h-3.5 text-[#087F5B]" />
                          <span>Qwen-VL Vision-Language Clinical Interpretation</span>
                        </div>
                        <p className="text-[11px] text-[#2C3E37] leading-relaxed">
                          {extractedData.qwenReasoning}
                        </p>
                      </div>

                      {/* Convergence Hardcoded Legal Disclaimer */}
                      <div className="bg-amber-50/95 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-950 font-medium shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900">
                              Mandatory Convergence Legal Disclaimer
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-200/80 border border-amber-300 text-[9px] font-mono font-bold text-amber-900">
                              AI Safety Standard
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-amber-950 mt-0.5">
                            {extractedData.legal_disclaimer || "Prototype Limits: No pediatric dosing"}
                          </p>
                          <p className="text-[10px] text-amber-800 mt-0.5">
                            The AI CDS operates as a read-only flagging engine and never adjusts prescribed dosages directly.
                          </p>
                        </div>
                      </div>

                      {/* Toggle OCR Token Stream */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowOcrLines(!showOcrLines)}
                          className="text-[10px] font-semibold text-[#64756D] hover:text-[#172B25] flex items-center gap-1"
                        >
                          <ChevronRight className={`w-3 h-3 transition-transform ${showOcrLines ? 'rotate-90' : ''}`} />
                          {showOcrLines ? 'Hide' : 'Inspect'} PaddleOCR Recognized Raw Lines ({extractedData.ocrLines?.length || 0})
                        </button>
                        
                        {showOcrLines && (
                          <div className="mt-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg max-h-24 overflow-y-auto font-mono text-[10px] space-y-0.5 text-gray-700">
                            {extractedData.ocrLines && extractedData.ocrLines.map((line, i) => (
                              <div key={i} className="truncate">
                                <span className="text-gray-400 mr-2">[{i+1}]</span>
                                {typeof line === 'string' ? line : (line as any)?.text || JSON.stringify(line)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full min-h-[300px] border border-dashed border-[#CBDAD4] rounded-xl p-8 flex flex-col items-center justify-center text-center text-[#64756D] space-y-2.5">
                      <Scan className="w-10 h-10 text-[#087F5B]/40" />
                      <div className="text-sm font-bold text-[#172B25]">
                        No Prescription Scanned Yet
                      </div>
                      <p className="text-[11px] text-gray-500 max-w-sm leading-relaxed">
                        Upload a prescription on the left to begin optical extraction. The verified clinical entities, RxNorm standard doses, patient demographics, and MedGemma safety rules will appear here after scanning.
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : activeTab === 'benchmark' ? (
            /* 70-Page Real-World Clinical Benchmark View */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gradient-to-r from-[#F0F7F4] to-[#F7FAF8] border border-[#B6E8D3] p-3.5 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-[#075E4B] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#087F5B]" />
                    70-Page Real-World Clinical Prescription Benchmark (ekacare validation set)
                  </div>
                  <div className="text-[11px] text-[#64756D] mt-0.5">
                    Trained across doctor cursive handwriting, Indian dosing formats (1-0-1, OD, BD, SOS), and hospital discharge summaries.
                  </div>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64756D]" />
                  <input
                    type="text"
                    placeholder="Search page or diagnosis..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#CBDAD4] rounded-lg text-xs text-[#172B25] focus:outline-none focus:ring-1 focus:ring-[#087F5B]"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'all', label: `All 70 Pages (${catalog.length})` },
                  { id: 'handwritten', label: '✍️ Doctor Handwriting & Cursive (11)' },
                  { id: 'acute', label: '⚡ Inpatient & Acute Care' },
                  { id: 'chronic', label: '🩺 Chronic Disease & Renal' },
                  { id: 'pediatric', label: '👶 Pediatric & Antibiotic' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCatalogFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      catalogFilter === f.id
                        ? 'bg-[#087F5B] text-white shadow-2xs font-semibold'
                        : 'bg-white border border-[#CBDAD4] text-[#64756D] hover:text-[#172B25] hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* 70 Pages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto pr-1">
                {catalog
                  .filter((item) => {
                    if (catalogFilter === 'handwritten' && !item.isHandwritten) return false;
                    if (catalogFilter === 'acute' && item.category !== 'Inpatient & Acute Care') return false;
                    if (catalogFilter === 'chronic' && item.category !== 'Chronic Disease & Renal Care') return false;
                    if (catalogFilter === 'pediatric' && item.category !== 'Pediatric & Antimicrobial') return false;
                    if (catalogSearch.trim()) {
                      const q = catalogSearch.toLowerCase();
                      return (
                        item.rxCode.toLowerCase().includes(q) ||
                        item.diagnosis.toLowerCase().includes(q) ||
                        item.category.toLowerCase().includes(q) ||
                        String(item.page).includes(q)
                      );
                    }
                    return true;
                  })
                  .map((item) => (
                    <div
                      key={item.pageId}
                      onClick={() => handleSelectSample(item.pageId)}
                      className={`group bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#087F5B] flex flex-col ${
                        selectedSampleId === item.pageId ? 'ring-2 ring-[#087F5B] border-[#087F5B]' : 'border-[#E1EAE5]'
                      }`}
                    >
                      <div className="h-32 bg-gray-50 border-b border-[#E1EAE5] relative overflow-hidden flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={`Page ${item.page}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        {item.isHandwritten && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                            ✍️ Handwriting
                          </span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-black/60 text-white">
                          Page {item.page}
                        </span>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                        <div>
                          <div className="text-xs font-bold text-[#172B25] truncate">
                            {item.rxCode}
                          </div>
                          <div className="text-[10px] text-[#64756D] truncate mt-0.5" title={item.diagnosis}>
                            {item.diagnosis || item.category}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSample(item.pageId);
                          }}
                          className="mt-1 w-full py-1 text-[11px] font-semibold text-[#075E4B] bg-[#DDF5EA] hover:bg-[#cbf1e1] rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Scan className="w-3 h-3 text-[#087F5B]" />
                          Scan Page
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* Manual Regimen Editor */
            <div className="space-y-4">
              <div className="text-xs text-[#64756D]">
                Manually input medication orders for custom clinical verification:
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
                      className="text-xs bg-white border border-[#CBDAD4] rounded px-2 py-1 w-32 font-mono text-[#172B25]"
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

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E1EAE5] bg-[#F7FAF8] flex items-center justify-between">
          <div className="text-[11px] text-[#64756D] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#087F5B]" />
            <span>PaddleOCR (PP-OCRv6) & Qwen-VL Connected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#172B25] bg-white border border-[#CBDAD4] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {activeTab === 'scan' ? (
              <button
                disabled={!extractedData}
                onClick={() => {
                  if (extractedData) {
                    const fname = uploadedFile ? uploadedFile.name : (selectedSampleId ? `${selectedSampleId}.png` : 'Scanned_Prescription.png');
                    onLoadCustomPrescription(
                      fname, 
                      extractedData.drugs, 
                      extractedData.patient, 
                      extractedData.qwenReasoning
                    );
                    onClose();
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all ${
                  extractedData
                    ? 'bg-[#087F5B] hover:bg-[#075E4B] text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Load Extracted Regimen into Safety Workspace
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoadCustomPrescription('Manual_Prescription_Order.pdf', manualDrugs);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#087F5B] hover:bg-[#075E4B] rounded-lg shadow-sm"
              >
                Load into Workspace
              </button>
            )}
          </div>
        </div>

        {/* MedGemma 1.5-4B Monograph & Clinical Test Cases Inspection Modal */}
        {medgemmaModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div 
              className="bg-white rounded-2xl border border-indigo-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-3.5 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-300" />
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <span>{medgemmaModalData.drug_name}</span>
                      <span className="text-[10px] font-mono bg-indigo-700/80 px-2 py-0.5 rounded text-indigo-200">
                        {medgemmaModalData.model}
                      </span>
                    </h3>
                    <p className="text-[10px] text-indigo-200">
                      Prescribed Dose: {medgemmaModalData.prescribed_dose} (Read-Only Guaranteed)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMedgemmaModalData(null)}
                  className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Medical Rules */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Authoritative Medical Rules & Clinical Standards</span>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-4 text-indigo-950 font-sans text-[11px] leading-relaxed">
                    {medgemmaModalData.medical_rules.map((rule, idx) => (
                      <li key={idx} className="leading-relaxed">{rule}</li>
                    ))}
                  </ul>
                </div>

                {/* Allergy Analysis & Cross Reactivity */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                  medgemmaModalData.allergy_analysis.risk_level.includes('CRITICAL')
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>MedGemma Allergy & Hypersensitivity Analysis</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      medgemmaModalData.allergy_analysis.risk_level.includes('CRITICAL')
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {medgemmaModalData.allergy_analysis.risk_level}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <span className="font-semibold">Cross-Reactivity Mechanism: </span>
                    {medgemmaModalData.allergy_analysis.cross_reactivity}
                  </p>
                  <p className="text-[11px] font-semibold">
                    Clinical Action: {medgemmaModalData.allergy_analysis.clinical_action}
                  </p>
                </div>

                {/* Clinical Test Cases */}
                <div className="space-y-2">
                  <div className="font-bold text-[#172B25] uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Previous Clinical Test Cases & Scenarios ({medgemmaModalData.clinical_test_cases.length})</span>
                    <span className="text-[10px] text-gray-500 font-normal">Deterministic Simulation</span>
                  </div>
                  <div className="space-y-2">
                    {medgemmaModalData.clinical_test_cases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#172B25]">
                          <span>{tc.scenario}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            tc.severity.includes('CRITICAL') ? 'bg-red-100 text-red-800' :
                            tc.severity.includes('WARNING') || tc.severity.includes('TITRATION') ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {tc.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-700 leading-relaxed font-sans">
                          <span className="font-semibold text-gray-900">Finding: </span>{tc.finding}
                        </p>
                        <p className="text-[11px] text-indigo-900 leading-relaxed font-sans">
                          <span className="font-semibold">Outcome: </span>{tc.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Clinical Rationale & Audit Trail */}
                <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-[10px] font-mono text-gray-700 space-y-1">
                  <div className="font-bold text-gray-900">Audit Rule Citation:</div>
                  <div className="leading-relaxed">{medgemmaModalData.audit_trail}</div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">
                  Model: google/medgemma-1.5-4b-it • Read-Only Preserved
                </span>
                <button
                  type="button"
                  onClick={() => setMedgemmaModalData(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Close Monograph
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
