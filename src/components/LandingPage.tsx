import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Check, 
  Activity, 
  Lock, 
  Layers, 
  Cpu, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onLaunchWorkspace: (scenarioId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchWorkspace }) => {
  const [selectedDemoTab, setSelectedDemoTab] = useState<'warfarin' | 'renal' | 'safe'>('warfarin');

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#172B25] font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 border-b border-[#E1EAE5] bg-gradient-to-b from-white to-[#F7FAF8]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Engine Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDF5EA] border border-[#20A88A]/40 text-[#075E4B] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse" />
              CDS ENGINE v4.2 • DETERMINISTIC VERIFICATION
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#172B25] tracking-tight leading-[1.12]">
              Instant Prescription Safety &amp; Multi-Factor Clinical Verification
            </h1>

            <p className="text-base sm:text-lg text-[#64756D] max-w-2xl leading-relaxed">
              Screen active regimens against patient renal function, allergy cross-reactivities, and severe drug–drug protocols in under seconds using deterministic safety rules and clinical AI.
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white border border-[#E1EAE5] px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#172B25] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>AI-Assisted Extracted</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#E1EAE5] px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#172B25] shadow-sm">
                <Lock className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>HIPAA &amp; GDPR Certified</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#E1EAE5] px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#172B25] shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>100% Deterministic Safety Rules</span>
              </div>
            </div>

            {/* Hero CTA Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onLaunchWorkspace('RX-78492')}
                className="bg-[#087F5B] hover:bg-[#075E4B] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
              >
                <span>Launch Clinical Safety Check</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('pipeline');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-gray-50 text-[#172B25] border border-[#CBDAD4] font-semibold text-sm px-5 py-3.5 rounded-xl transition-all shadow-sm"
              >
                See Verification Engine
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Live Simulation Box (Exact match to Screenshot 1) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#E1EAE5] p-5 shadow-elevated space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E1EAE5]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#172B25] uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#087F5B]" />
                  <span>Prescription Order Ingestion</span>
                </div>
                <span className="text-[11px] font-semibold text-[#075E4B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2 py-0.5 rounded">
                  OCR IS READY
                </span>
              </div>

              {/* Drag & Drop Visual Area */}
              <div 
                onClick={() => onLaunchWorkspace('RX-78492')}
                className="border-2 border-dashed border-[#B6E8D3] hover:border-[#087F5B] bg-[#F7FAF8] rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-[#172B25]">
                  Drag &amp; drop prescription order
                </div>
                <div className="text-[11px] text-[#64756D] mt-1">
                  Structured or chaotic scanned PDF or handwritten order
                </div>
                
                <button className="mt-3 bg-[#087F5B] hover:bg-[#075E4B] text-white text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                  Upload Prescription PDF
                </button>
              </div>

              {/* Sample Ingestion Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64756D]">Test with simulated patient:</span>
                  <span className="font-mono text-[#087F5B] font-semibold">Rx_Order_78492.pdf</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-1 rounded text-[#172B25] font-medium">
                    Warfarin 5mg
                  </span>
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-1 rounded text-[#172B25] font-medium">
                    Fluconazole 200mg
                  </span>
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-1 rounded text-[#172B25] font-medium">
                    Metformin 500mg
                  </span>
                  <span className="text-[11px] text-[#64756D] self-center ml-auto font-mono">
                    eGFR: 54 mL • Cr: 1.4
                  </span>
                </div>
              </div>

              {/* Automated Safety Evaluation Runs */}
              <div className="pt-2 border-t border-[#E1EAE5] space-y-2">
                <div className="text-[11px] font-bold text-[#64756D] uppercase tracking-wider flex items-center justify-between">
                  <span>Automated Safety Evaluation Runs</span>
                  <span className="text-[#087F5B]">3 Checks</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-2 text-center">
                    <div className="text-[10px] font-bold text-[#C62828]">DD-I</div>
                    <div className="text-[11px] text-[#C62828] font-medium truncate">Warfarin + Flucon</div>
                  </div>

                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-2 text-center">
                    <div className="text-[10px] font-bold text-[#D97706]">eGFR</div>
                    <div className="text-[11px] text-[#D97706] font-medium truncate">Metformin 1g Ceiling</div>
                  </div>

                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-2 text-center">
                    <div className="text-[10px] font-bold text-[#087F5B]">Allergy</div>
                    <div className="text-[11px] text-[#087F5B] font-medium truncate">Penicillin Cleared</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Trust & Metrics Banner */}
      <section className="py-12 px-4 lg:px-8 bg-white border-b border-[#E1EAE5]">
        <div className="max-w-[1440px] mx-auto space-y-8">
          <div className="text-center text-xs font-bold tracking-widest text-[#64756D] uppercase">
            TRUSTED BY HEALTH SYSTEMS, INPATIENT HOSPITALS, PHARMACIES, AND CLINICAL DECISION-SUPPORT TEAMS
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-[#075E4B]">0.4s</div>
              <div className="text-xs text-[#64756D] mt-1 font-medium">Verification Latency</div>
            </div>

            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-[#075E4B]">100%</div>
              <div className="text-xs text-[#64756D] mt-1 font-medium">Deterministic Rule Safety</div>
            </div>

            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-[#075E4B]">500k+</div>
              <div className="text-xs text-[#64756D] mt-1 font-medium">Screened Regimens</div>
            </div>

            <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-5 text-center">
              <div className="text-3xl font-extrabold text-[#075E4B]">Zero</div>
              <div className="text-xs text-[#64756D] mt-1 font-medium">Black-Box Guarantees</div>
            </div>

          </div>
        </div>
      </section>

      {/* How MedCheck Validates Medication Orders Pipeline */}
      <section id="pipeline" className="py-20 px-4 lg:px-8 border-b border-[#E1EAE5]">
        <div className="max-w-[1440px] mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-[#DDF5EA] text-[#075E4B] text-xs font-semibold uppercase tracking-wider">
              10-SECOND CLINICAL PIPELINE
            </div>
            <h2 className="text-3xl font-bold text-[#172B25] tracking-tight">
              How MedCheck Validates Medication Orders
            </h2>
            <p className="text-sm text-[#64756D]">
              A seamless transition from chaotic unstructured prescription orders to structured clinical validation with deterministic audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-4 shadow-sm hover:border-[#CBDAD4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#DDF5EA] text-[#075E4B] font-bold text-xs flex items-center justify-center border border-[#20A88A]/30">
                  01
                </span>
                <span className="text-xs font-mono text-[#64756D]">Ingestion</span>
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                Ingest &amp; Extract
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Multi-format parsing from pending rx orders (scans, PDFs, images). RxNorm tokenization maps brand names to active drug chemical entities, strength, route, and frequency.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">FastOCR</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">MedGemma LLM</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">RxNorm Ontologies</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-4 shadow-sm hover:border-[#CBDAD4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#DDF5EA] text-[#075E4B] font-bold text-xs flex items-center justify-center border border-[#20A88A]/30">
                  02
                </span>
                <span className="text-xs font-mono text-[#64756D]">Synthesis</span>
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                Synthesize Patient Context
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Instantly retrieve patient bio-records: evaluates CrCl / eGFR via Cockcroft-Gault, checks allergy histories for beta-lactams, and identifies active hepatic impairment.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">eGFR / CrCl Calculators</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">Beta-Lactam Ring</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">EMR Interop / FHIR</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-4 shadow-sm hover:border-[#CBDAD4] transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#DDF5EA] text-[#075E4B] font-bold text-xs flex items-center justify-center border border-[#20A88A]/30">
                  03
                </span>
                <span className="text-xs font-mono text-[#64756D]">Verification</span>
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                Evidence-Backed Verification
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Deterministic engine flags severe contraindications, dosing errors, and therapeutic duplications, anchoring every alert to peer-reviewed guidelines and FDA labels.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">CPIC Guidelines</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">FDA Package Inserts</span>
                <span className="text-[10px] bg-[#F7FAF8] border border-[#E1EAE5] px-2 py-0.5 rounded font-mono text-[#172B25]">KDIGO 2023</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Showcase: Clinical Safety Findings in Action */}
      <section className="py-20 px-4 lg:px-8 bg-white border-b border-[#E1EAE5]">
        <div className="max-w-[1440px] mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#DDF5EA] text-[#075E4B] text-xs font-semibold uppercase tracking-wider mb-2">
                LIVE EVIDENCE INSPECTOR
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#172B25]">
                Clinical Safety Findings in Action
              </h2>
              <p className="text-sm text-[#64756D] mt-1">
                Zero vague alerts. Every warning demonstrates causality, patient-specific context, and actionable clinical recommendations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-[#075E4B] text-white px-3 py-1.5 rounded-lg font-bold">
                Patient Case #1202
              </span>
              <span className="text-xs text-[#64756D]">Full Demonstration Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Patient Snapshot Card */}
            <div className="lg:col-span-4 bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#172B25]">John Doe, 68M</div>
                  <div className="text-xs text-[#64756D]">MRN: #90422-3B</div>
                </div>
                <span className="text-[11px] bg-[#DDF5EA] text-[#075E4B] px-2 py-0.5 rounded font-medium">
                  Inpatient Cardiology
                </span>
              </div>

              <div className="space-y-2 text-xs border-y border-[#E1EAE5] py-3">
                <div className="flex justify-between">
                  <span className="text-[#64756D]">eGFR (CKD-EPI):</span>
                  <span className="font-bold text-[#D97706] bg-[#FFFBEB] px-1.5 rounded">36 mL/min/1.73m² (Stage 3b)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64756D]">Serum Creatinine:</span>
                  <span className="font-bold text-[#172B25]">2.4 mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64756D]">Bio-weight:</span>
                  <span className="font-bold text-[#172B25]">71.2 kg (BMI: 24.8)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64756D]">Allergies:</span>
                  <span className="font-bold text-[#C62828] bg-[#FEF2F2] px-1.5 rounded">PENICILLIN (Anaphylaxis)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#64756D] uppercase">Active Regimen Review:</div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-0.5 rounded text-[#172B25]">Warfarin 5mg daily</span>
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-0.5 rounded text-[#172B25]">Lisinopril 10mg daily</span>
                  <span className="text-[11px] bg-white border border-[#E1EAE5] px-2 py-0.5 rounded text-[#172B25]">Aspirin 81mg</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onLaunchWorkspace('RX-78492')}
                  className="w-full text-xs font-semibold text-[#075E4B] bg-white border border-[#CBDAD4] hover:bg-gray-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open Full Order in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Stack of Interactive Finding Cards */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Finding 1: Critical */}
              <div className="bg-white border-2 border-[#C62828] rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" />
                    <h3 className="text-sm font-bold text-[#172B25]">
                      Fluconazole 200mg Oral Tablet
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded uppercase tracking-wider">
                    CRITICAL CONTRAINDICATION - DDI
                  </span>
                </div>

                <div className="text-xs text-[#64756D]">
                  Rx Order: 200mg PO daily • Prescriber: Dr. N. Vance, Internal Medicine
                </div>

                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 text-xs text-[#C62828] leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-[#C62828]" />
                    Severe Drug-Drug Interaction with Warfarin
                  </div>
                  Fluconazole causes potent hepatic inhibition of the microsomal 2C9 isoenzyme (CYP2C9), resulting in acute INR prolongation and severe life-threatening gastrointestinal or intracranial hemorrhage.
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[#64756D]">
                    Recommendation: Substitute with non-systemic antifungal or preemptively reduce warfarin dose.
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLaunchWorkspace('RX-78492')}
                      className="px-3 py-1.5 bg-[#C62828] text-white rounded font-medium text-xs hover:bg-[#A31F1F]"
                    >
                      Withhold
                    </button>
                    <button 
                      onClick={() => onLaunchWorkspace('RX-78492')}
                      className="px-3 py-1.5 bg-white border border-[#CBDAD4] text-[#172B25] rounded font-medium text-xs hover:bg-gray-50"
                    >
                      Propose Alternative
                    </button>
                  </div>
                </div>
              </div>

              {/* Finding 2: Warning */}
              <div className="bg-white border border-[#D97706] rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    <h3 className="text-sm font-bold text-[#172B25]">
                      Metformin HCl 500mg Oral Tablet
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded uppercase tracking-wider">
                    MODERATE WARNING - RENAL THRESHOLD
                  </span>
                </div>

                <div className="text-xs text-[#64756D]">
                  Rx Order: 500mg PO BID • Prescriber: Dr. K. Patel, Internal Medicine
                </div>

                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 text-xs text-[#172B25] leading-relaxed">
                  <div className="font-bold text-[#D97706] mb-1">
                    Dose Ceiling Exceeded (eGFR 36 mL/min/1.73m²)
                  </div>
                  Metformin is excreted renally; with eGFR 30-44, total daily dose must not exceed 500mg daily due to elevated risk of lactic acidosis. Current order (1,000mg total) violates therapeutic threshold.
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[#64756D]">
                    Recommendation: Titrate to Metformin 500mg once daily or switch to Linagliptin (no renal dose adjustment required).
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLaunchWorkspace('RX-78492')}
                      className="px-3 py-1.5 bg-[#D97706] text-white rounded font-medium text-xs hover:bg-[#B45309]"
                    >
                      Titrate Dose
                    </button>
                    <button 
                      onClick={() => onLaunchWorkspace('RX-78492')}
                      className="px-3 py-1.5 bg-white border border-[#CBDAD4] text-[#172B25] rounded font-medium text-xs hover:bg-gray-50"
                    >
                      Request Renal Consult
                    </button>
                  </div>
                </div>
              </div>

              {/* Finding 3: Clean */}
              <div className="bg-white border border-[#BBF7D0] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#087F5B]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#172B25]">
                      Azithromycin 250mg Oral Capsule
                    </h3>
                    <p className="text-xs text-[#64756D]">
                      500mg Day 1, followed by 250mg daily on Days 2-5 • No active CYP or allergy conflict
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#087F5B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2 py-0.5 rounded font-mono">
                  CLEARED AS SAFE
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Zero Decision Fatigue Feature Section */}
      <section className="py-20 px-4 lg:px-8 border-b border-[#E1EAE5]">
        <div className="max-w-[1440px] mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 rounded-full bg-[#DDF5EA] text-[#075E4B] text-xs font-semibold uppercase tracking-wider">
              EVIDENCE SAFETY PLATFORM
            </div>
            <h2 className="text-3xl font-bold text-[#172B25] tracking-tight">
              Engineered for Zero Decision Fatigue
            </h2>
            <p className="text-sm text-[#64756D]">
              Clinical systems frequently drown providers in useless low-severity alerts. MedCheck recalibrates precision with tiered clinical evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#DDF5EA] text-[#075E4B] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                Molecular Allergy Cross-Checks
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Screens not just exact drug names, also molecular chain homology between cephalosporins, penicillins, and carbapenems to prevent unnecessary broad-spectrum escalations.
              </p>
              <div className="text-[11px] font-mono text-[#087F5B] pt-2">
                R1 Side-Chain Calculation • AAAAI Taxonomy
              </div>
            </div>

            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#DDF5EA] text-[#075E4B] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                Automated Organ Clearance Titration
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Dynamic dose ceilings and hemodialysis/filtration awareness: checks real-time serum Cr and eGFR, calculating CrCl via Cockcroft-Gault before flag generation.
              </p>
              <div className="text-[11px] font-mono text-[#087F5B] pt-2">
                Cockcroft-Gault • CKD-EPI 2021 • KDIGO Guidelines
              </div>
            </div>

            <div className="bg-white border border-[#E1EAE5] rounded-xl p-6 space-y-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#DDF5EA] text-[#075E4B] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#172B25]">
                PGx Deterministic Rules
              </h3>
              <p className="text-xs text-[#64756D] leading-relaxed">
                Incorporates CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines to factor in known patient genotype findings directly into acute verification workflows.
              </p>
              <div className="text-[11px] font-mono text-[#087F5B] pt-2">
                CPIC Levels A/B • FDA Biomarker Substrates
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Enterprise Infrastructure & CDS Regulatory Statement */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-br from-[#DDF5EA]/30 via-white to-white border-b border-[#E1EAE5]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#075E4B] uppercase tracking-wider">
              CDS INTEGRITY &amp; REGULATORY COMPLIANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B25]">
              Enterprise Clinical Infrastructure with Zero Compromises
            </h2>
            <p className="text-xs sm:text-sm text-[#64756D] leading-relaxed">
              MedCheck operates as a high-reliability clinical decision support tool. All data is processed in ephemeral, isolated enclaves with zero training retention on live patient records.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#172B25]">
                <Check className="w-4 h-4 text-[#087F5B]" />
                <span>HIPAA/HITECH</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172B25]">
                <Check className="w-4 h-4 text-[#087F5B]" />
                <span>AES-256 GCM</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172B25]">
                <Check className="w-4 h-4 text-[#087F5B]" />
                <span>TLS 1.3 Strict</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172B25]">
                <Check className="w-4 h-4 text-[#087F5B]" />
                <span>Audit Logging</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#CBDAD4] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172B25]">
              <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
              <span>CDS Regulatory Statement</span>
            </div>
            <p className="text-xs text-[#64756D] leading-relaxed">
              MedCheck is an assistive Non-Device Clinical Decision Support (CDS) tool under Section 520(o)(1)(E) of the FD&amp;C Act. It provides transparent, explainable recommendations backed by referenced medical literature and does not replace the autonomous clinical judgment of licensed medical professionals.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 lg:px-8 text-center bg-white border-b border-[#E1EAE5]">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#DDF5EA] text-[#087F5B] flex items-center justify-center mx-auto border border-[#20A88A]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-[#172B25]">
            Protect Every Prescribing Decision Today
          </h2>
          <p className="text-sm text-[#64756D]">
            Join leading clinicians in accelerating real-time deterministic verification across acute hospital pharmacies and ambulatory EHRs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onLaunchWorkspace('RX-78492')}
              className="bg-[#087F5B] hover:bg-[#075E4B] text-white text-sm font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
            >
              Verify Your First Regimen
            </button>
            <button
              onClick={() => onLaunchWorkspace('RX-78492')}
              className="bg-white border border-[#CBDAD4] hover:bg-gray-50 text-[#172B25] text-sm font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
            >
              Book Enterprise Demonstration
            </button>
          </div>
        </div>
      </section>

      {/* Global Comprehensive Footer */}
      <footer className="py-12 px-4 lg:px-8 bg-[#F7FAF8] text-xs text-[#64756D] space-y-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1">
                <img src="/logo.png" alt="MedCheck" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-[#172B25] text-base">MedCheck</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Deterministic Clinical Decision Support (CDS) platform for hospital pharmacies and EHR integrations to eliminate preventable dispensing errors with explainable audit trails.
            </p>
            <div className="text-[10px] font-mono text-[#075E4B]">
              CDS Engine Version: 4.2.0-STABLE • FHIR R4 Compliant
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#172B25] uppercase tracking-wider text-[11px]">
              Clinical Engine
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>Drug-Drug Interactions (DDI)</li>
              <li>eGFR Renal Dose Adjustment</li>
              <li>Allergy Cross-Reactivity Screening</li>
              <li>CPIC Pharmacogenomics</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#172B25] uppercase tracking-wider text-[11px]">
              Integrations
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>SMART on FHIR API</li>
              <li>Epic Systems App Orchard</li>
              <li>Cerner Millennium CDS</li>
              <li>Inpatient CDS Workstations</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-[#172B25] uppercase tracking-wider text-[11px]">
              Security &amp; Legal
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>HIPAA Compliance Portal</li>
              <li>SOC 2 Type II Reports</li>
              <li>Non-Device CDS Guidance</li>
              <li>Provider System Sandbox</li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1440px] mx-auto pt-6 border-t border-[#E1EAE5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 MedCheck Clinical Systems Inc. All rights reserved. Designed for authorized medical professionals.
          </div>
          <div className="font-mono text-[10px]">
            ISO 27001 • HL7 FHIR 4.0.1 (US Core) • 42 CFR 494 Adopted
          </div>
        </div>
      </footer>

    </div>
  );
};
