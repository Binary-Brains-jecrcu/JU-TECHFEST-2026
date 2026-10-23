import React, { useState } from 'react';
import { 
  FileText, 
  RotateCw, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Flag, 
  FileCheck2, 
  UploadCloud, 
  PlusCircle, 
  UserCheck, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  Scan
} from 'lucide-react';
import { SafetyAnalysisResult, SafetyFinding } from '../types';
import { PATIENT_PROFILES, DEMO_SCENARIOS } from '../data/mockData';

interface WorkspaceProps {
  analysis: SafetyAnalysisResult;
  onSelectScenario: (scenarioId: string) => void;
  onUpdateAnalysis: (updated: SafetyAnalysisResult) => void;
  onOpenOverrideModal: () => void;
  onOpenFlagModal: () => void;
  onOpenUploadModal: () => void;
  onOpenPatientModal: () => void;
}

export const PrescriptionSafetyWorkspace: React.FC<WorkspaceProps> = ({
  analysis,
  onSelectScenario,
  onUpdateAnalysis,
  onOpenOverrideModal,
  onOpenFlagModal,
  onOpenUploadModal,
  onOpenPatientModal,
}) => {
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({
    'find-1': true,
    'find-2': false,
    'find-3': false
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);

  const toggleFindingExpand = (id: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStage(1);

    const stages = [
      { stage: 1, delay: 500 }, // Ingesting & OCR
      { stage: 2, delay: 1100 }, // RxNorm & NDC Ontology
      { stage: 3, delay: 1700 }, // EMR Context Synthesis
      { stage: 4, delay: 2300 }, // Java Deterministic Rules
      { stage: 5, delay: 2800 }, // Audit Trail Assembled
    ];

    stages.forEach(({ stage, delay }) => {
      setTimeout(() => {
        setAnalysisStage(stage);
      }, delay);
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStage(0);
    }, 3200);
  };

  const getSeverityBadgeClass = (finding: SafetyFinding) => {
    switch (finding.severity) {
      case 'critical':
        return 'bg-[#C62828] text-white';
      case 'warning':
        return 'bg-[#D97706] text-white';
      case 'verified':
        return 'bg-[#087F5B] text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Scenario Quick-Switcher for Demo Speed */}
      <div className="bg-white border border-[#E1EAE5] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm no-print">
        <div className="flex items-center gap-2 text-xs text-[#172B25] font-medium">
          <Sparkles className="w-4 h-4 text-[#087F5B]" />
          <span>Demo Presets (1-Click Judge Scenarios):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectScenario('RX-78492')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              analysis.orderId === 'RX-78492'
                ? 'bg-[#DDF5EA] text-[#075E4B] border-[#20A88A] font-semibold shadow-xs'
                : 'bg-[#F7FAF8] text-[#64756D] border-[#E1EAE5] hover:text-[#172B25]'
            }`}
          >
            #RX-78492 (Warfarin + Fluconazole DDI)
          </button>

          <button
            onClick={() => onSelectScenario('RX-92015')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              analysis.orderId === 'RX-92015'
                ? 'bg-[#DDF5EA] text-[#075E4B] border-[#20A88A] font-semibold shadow-xs'
                : 'bg-[#F7FAF8] text-[#64756D] border-[#E1EAE5] hover:text-[#172B25]'
            }`}
          >
            #RX-92015 (DOAC + NSAID Elderly Bleed)
          </button>

          <button
            onClick={() => onSelectScenario('RX-45129')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              analysis.orderId === 'RX-45129'
                ? 'bg-[#DDF5EA] text-[#075E4B] border-[#20A88A] font-semibold shadow-xs'
                : 'bg-[#F7FAF8] text-[#64756D] border-[#E1EAE5] hover:text-[#172B25]'
            }`}
          >
            #RX-45129 (Penicillin Allergy Cross-React)
          </button>

          <button
            onClick={() => onSelectScenario('RX-32890')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              analysis.orderId === 'RX-32890'
                ? 'bg-[#DDF5EA] text-[#075E4B] border-[#20A88A] font-semibold shadow-xs'
                : 'bg-[#F7FAF8] text-[#64756D] border-[#E1EAE5] hover:text-[#172B25]'
            }`}
          >
            #RX-32890 (Verified Clean Pass)
          </button>
        </div>
      </div>

      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E1EAE5]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172B25] tracking-tight font-sans">
              Prescription Safety &amp; Verification
            </h1>
            <span className="bg-[#DDF5EA] text-[#075E4B] border border-[#20A88A]/40 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Order #{analysis.orderId}
            </span>
          </div>
          <p className="text-sm text-[#64756D] mt-1 max-w-3xl">
            Automated multi-factor screening of active drug regimens against patient health profiles, renal clearance thresholds, and cross-sensitivities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64756D]">
          <RotateCw className="w-3.5 h-3.5 text-[#087F5B]" />
          <span>Ingested {analysis.ingestedAt}</span>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: INPUT & CONTEXT (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-6">

          {/* 1. PRESCRIPTION INGESTION CARD */}
          <div className="bg-white rounded-xl border border-[#E1EAE5] shadow-card overflow-hidden">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-[#E1EAE5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#087F5B] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-xs font-bold text-[#172B25] tracking-wider uppercase">
                  Prescription Ingestion
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#075E4B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-[#087F5B]" />
                {analysis.ingestionFile.status}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4">
              
              {/* File Pill / Card */}
              <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded bg-white border border-[#E1EAE5] flex items-center justify-center text-[#087F5B] flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#172B25] truncate">
                      {analysis.ingestionFile.name}
                      <span className="ml-2 font-normal text-[11px] text-[#64756D]">
                        {analysis.ingestionFile.size}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64756D]">
                      {analysis.ingestionFile.type}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenUploadModal}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#075E4B] bg-[#DDF5EA] border border-[#B6E8D3] hover:bg-[#c9efdf] px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 shadow-2xs group"
                  title="Scan prescription with PaddleOCR & Qwen-VL"
                >
                  <Scan className="w-3.5 h-3.5 text-[#087F5B] group-hover:scale-110 transition-transform" />
                  <span>Scan (PaddleOCR + Qwen-VL)</span>
                </button>
              </div>

              {/* Identified Regimen Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#172B25] tracking-wider uppercase text-[11px]">
                    Identified Regimen ({analysis.drugs.length} Drugs)
                  </span>
                  <span className="text-[11px] font-semibold text-[#087F5B]">
                    100% NDC Matched
                  </span>
                </div>

                {/* Drugs List */}
                <div className="space-y-2">
                  {analysis.drugs.map((drug) => (
                    <div
                      key={drug.id}
                      className="bg-white border border-[#E1EAE5] rounded-lg p-3 flex items-center justify-between gap-3 hover:border-[#CBDAD4] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#087F5B]" />
                        <div>
                          <div className="text-xs font-bold text-[#172B25]">
                            {drug.name}
                          </div>
                          <div className="text-[11px] text-[#64756D]">
                            {drug.category}
                          </div>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 bg-[#F7FAF8] border border-[#E1EAE5] rounded text-xs font-mono font-semibold text-[#172B25] whitespace-nowrap">
                        {drug.dose}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary Ingest Action */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={onOpenUploadModal}
                    className="text-xs text-[#087F5B] hover:text-[#075E4B] font-medium flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload another prescription / slip
                  </button>
                  <button
                    onClick={onOpenUploadModal}
                    className="text-xs text-[#64756D] hover:text-[#172B25] flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Manual Edit
                  </button>
                </div>
              </div>

            </div>
          </div>


          {/* 2. PATIENT CLINICAL CONTEXT CARD */}
          <div className="bg-white rounded-xl border border-[#E1EAE5] shadow-card overflow-hidden">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-[#E1EAE5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#087F5B] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-xs font-bold text-[#172B25] tracking-wider uppercase">
                  Patient Clinical Context
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#64756D]">
                EMR Linked #{analysis.patient.id}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4">
              
              {/* Patient Bio Box */}
              <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#172B25]">
                      {analysis.patient.name}
                    </span>
                    <span className="text-[11px] text-[#64756D] bg-white border border-[#E1EAE5] px-1.5 py-0.5 rounded">
                      {analysis.patient.gender}, {analysis.patient.age} yo
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64756D] mt-0.5">
                    DOB: {analysis.patient.dob} • {analysis.patient.weightKg} kg • {analysis.patient.unit}
                  </div>
                </div>

                <button
                  onClick={onOpenPatientModal}
                  className="text-xs font-semibold text-[#172B25] bg-white border border-[#CBDAD4] hover:bg-gray-50 px-2.5 py-1.5 rounded transition-colors"
                >
                  Switch
                </button>
              </div>

              {/* Known Allergies */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#172B25] uppercase tracking-wider">
                  Known Allergies
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.patient.allergies.length > 0 ? (
                    analysis.patient.allergies.map((allergy) => (
                      <span
                        key={allergy.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          allergy.severity === 'severe'
                            ? 'bg-[#FEF2F2] text-[#C62828] border-[#FECACA]'
                            : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            allergy.severity === 'severe' ? 'bg-[#C62828]' : 'bg-[#D97706]'
                          }`}
                        />
                        {allergy.allergen} ({allergy.reaction})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#087F5B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2.5 py-1 rounded-full">
                      No known drug allergies recorded (NKDA)
                    </span>
                  )}
                </div>
              </div>

              {/* Renal Function Lab */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#172B25] uppercase tracking-wider">
                    Renal Function Lab
                  </span>
                  <span className="text-[#64756D]">{analysis.patient.renalLabs.timestamp}</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-2.5 text-center">
                    <div className="text-[10px] text-[#64756D] font-medium uppercase tracking-wider">
                      eGFR
                    </div>
                    <div className="text-lg font-bold text-[#172B25] leading-tight">
                      {analysis.patient.renalLabs.eGFR}
                    </div>
                    <div className="text-[10px] text-[#64756D] truncate">
                      mL/min ({analysis.patient.renalLabs.eGFRCategory})
                    </div>
                  </div>

                  <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-2.5 text-center">
                    <div className="text-[10px] text-[#64756D] font-medium uppercase tracking-wider">
                      Serum Cr
                    </div>
                    <div className="text-lg font-bold text-[#172B25] leading-tight">
                      {analysis.patient.renalLabs.serumCr}
                    </div>
                    <div className="text-[10px] text-[#64756D]">
                      mg/dL (Baseline)
                    </div>
                  </div>

                  <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-2.5 text-center">
                    <div className="text-[10px] text-[#64756D] font-medium uppercase tracking-wider">
                      CrCl
                    </div>
                    <div className="text-lg font-bold text-[#172B25] leading-tight">
                      {analysis.patient.renalLabs.crCl}
                    </div>
                    <div className="text-[10px] text-[#64756D]">
                      mL/min
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Analyze / Re-Analyze Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-[#087F5B] hover:bg-[#075E4B] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-75"
              >
                <RotateCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing ? 'Evaluating Deterministic Rules...' : 'Re-Analyze Prescription'}
                </span>
              </button>

            </div>
          </div>

        </div>


        {/* ================= RIGHT COLUMN: SAFETY RESULTS (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 3. SAFETY REVIEW RESULTS CARD */}
          <div className="bg-white rounded-xl border border-[#E1EAE5] shadow-card overflow-hidden">
            
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-[#E1EAE5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#087F5B] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-xs font-bold text-[#172B25] tracking-wider uppercase">
                  Safety Review Results
                </h2>
              </div>

              {analysis.requiresClinicalAction ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#C62828] animate-pulse" />
                  Requires Clinical Action
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087F5B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                  Verified Safe to Dispense
                </span>
              )}
            </div>

            {/* Results Body */}
            <div className="p-6 space-y-6">

              {/* Progress Bar when analyzing */}
              {isAnalyzing && (
                <div className="bg-[#F7FAF8] border border-[#B6E8D3] rounded-lg p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#075E4B] flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-[#087F5B]" />
                      Clinical Safety Verification in Progress...
                    </span>
                    <span className="font-mono text-[11px] text-[#64756D]">
                      Stage {analysisStage} of 5
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#087F5B] h-full transition-all duration-300"
                      style={{ width: `${(analysisStage / 5) * 100}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-[#64756D] font-mono">
                    {analysisStage === 1 && 'Extracting dosage units & OCR tokens via MedGemma parser...'}
                    {analysisStage === 2 && 'Ontology normalization against RxNorm & NDC code sets...'}
                    {analysisStage === 3 && 'Synthesizing patient renal clearance (eGFR/CrCl) & allergy profile...'}
                    {analysisStage === 4 && 'Executing Java deterministic safety engine against CPIC & FDA Black Box...'}
                    {analysisStage === 5 && 'Assembling traceable clinical evidence and audit trail...'}
                  </div>
                </div>
              )}

              {/* Metric Summary Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Analyzed */}
                <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3">
                  <div className="text-[10px] text-[#64756D] font-bold uppercase tracking-wider">
                    Analyzed
                  </div>
                  <div className="text-xl font-bold text-[#172B25] mt-0.5">
                    {analysis.metrics.analyzedCount}
                  </div>
                  <div className="text-[11px] text-[#64756D] mt-0.5">
                    Prescribed drugs
                  </div>
                </div>

                {/* Critical Alert */}
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                  <div className="text-[10px] text-[#C62828] font-bold uppercase tracking-wider">
                    Critical Alert
                  </div>
                  <div className="text-xl font-bold text-[#C62828] mt-0.5">
                    {analysis.metrics.criticalCount}
                  </div>
                  <div className="text-[11px] text-[#C62828] mt-0.5">
                    Contraindication
                  </div>
                </div>

                {/* Dosage Note */}
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3">
                  <div className="text-[10px] text-[#D97706] font-bold uppercase tracking-wider">
                    Dosage Note
                  </div>
                  <div className="text-xl font-bold text-[#D97706] mt-0.5">
                    {analysis.metrics.warningCount}
                  </div>
                  <div className="text-[11px] text-[#D97706] mt-0.5">
                    Renal threshold
                  </div>
                </div>

                {/* Verified Safe */}
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3">
                  <div className="text-[10px] text-[#087F5B] font-bold uppercase tracking-wider">
                    Verified Safe
                  </div>
                  <div className="text-xl font-bold text-[#087F5B] mt-0.5">
                    {analysis.metrics.safeCount}
                  </div>
                  <div className="text-[11px] text-[#087F5B] mt-0.5">
                    Allergy clean
                  </div>
                </div>

              </div>

              {/* Findings Stack */}
              <div className="space-y-4">
                {analysis.findings.map((finding) => {
                  const isExpanded = !!expandedFindings[finding.id];

                  // Critical Alert Card
                  if (finding.severity === 'critical') {
                    return (
                      <div
                        key={finding.id}
                        className="bg-white border-2 border-[#C62828] rounded-xl overflow-hidden shadow-sm"
                      >
                        {/* Top Banner */}
                        <div className="p-4 bg-white border-b border-[#FECACA] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#FEF2F2] text-[#C62828] flex items-center justify-center">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="bg-[#C62828] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
                              {finding.severityTag}
                            </span>
                            <span className="text-xs text-[#172B25] font-medium">
                              Severity: Severe (Level 1)
                            </span>
                          </div>

                          {finding.badgeLabel && (
                            <span className="text-xs font-bold text-[#C62828] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-0.5 rounded font-mono">
                              {finding.badgeLabel}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-base font-bold text-[#172B25]">
                              {finding.title}
                            </h3>
                            <div className="text-xs font-semibold text-[#C62828] mt-0.5">
                              {finding.subtitle}
                            </div>
                          </div>

                          {finding.mechanism && (
                            <div className="text-xs text-[#172B25] bg-[#F7FAF8] p-3 rounded-lg border border-[#E1EAE5] leading-relaxed">
                              <span className="font-bold text-[#172B25]">Mechanism: </span>
                              {finding.mechanism}
                            </div>
                          )}

                          {finding.recommendedAction && (
                            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C62828] uppercase tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#C62828]" />
                                Recommended Clinical Action:
                              </div>
                              <p className="text-xs text-[#C62828] leading-relaxed font-medium">
                                {finding.recommendedAction}
                              </p>
                            </div>
                          )}

                          {/* Expandable Clinical Evidence Accordion */}
                          {finding.evidence.length > 0 && (
                            <div className="pt-1">
                              <button
                                onClick={() => toggleFindingExpand(finding.id)}
                                className="w-full flex items-center justify-between text-xs font-medium text-[#075E4B] hover:text-[#087F5B] py-1 transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-[#087F5B]" />
                                  Clinical Sources: FDA Black Box &amp; CPIC Guidelines ({finding.evidence.length} sources)
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-[#64756D]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#64756D]" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2.5 space-y-2.5 pt-2 border-t border-[#E1EAE5]">
                                  {finding.evidence.map((ev, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 text-xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#172B25]">
                                          {ev.sourceTitle}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#075E4B] bg-[#DDF5EA] px-1.5 py-0.5 rounded">
                                          {ev.levelOfEvidence}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-[#64756D] italic">
                                        {ev.citation}
                                      </div>
                                      <p className="text-xs text-[#172B25] leading-relaxed">
                                        {ev.summary}
                                      </p>
                                      {ev.fullExcerpt && (
                                        <div className="bg-white border-l-2 border-[#087F5B] p-2 text-[11px] text-[#64756D] font-mono mt-1">
                                          "{ev.fullExcerpt}"
                                        </div>
                                      )}
                                      {ev.pmid && (
                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#087F5B]">
                                          <span>PubMed ID: {ev.pmid}</span>
                                          <span>• Confidence: {Math.round(ev.confidence * 100)}%</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  }

                  // Dosage Note / Warning Card
                  if (finding.severity === 'warning') {
                    return (
                      <div
                        key={finding.id}
                        className="bg-white border border-[#D97706] rounded-xl overflow-hidden shadow-sm"
                      >
                        {/* Top Banner */}
                        <div className="p-4 bg-white border-b border-[#FDE68A] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <span className="bg-[#D97706] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
                              {finding.severityTag}
                            </span>
                            <span className="text-xs text-[#172B25] font-medium">
                              Renal Function Check
                            </span>
                          </div>

                          {finding.badgeLabel && (
                            <span className="text-xs font-bold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-0.5 rounded font-mono">
                              {finding.badgeLabel}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-base font-bold text-[#172B25]">
                              {finding.title}
                            </h3>
                            <div className="text-xs text-[#64756D] mt-0.5">
                              {finding.subtitle}
                            </div>
                          </div>

                          {finding.guidance && (
                            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 space-y-1">
                              <div className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                                KDIGO / ADA Guidance:
                              </div>
                              <p className="text-xs text-[#172B25] leading-relaxed">
                                {finding.guidance}
                              </p>
                            </div>
                          )}

                          {finding.recommendedAction && (
                            <div className="text-xs text-[#64756D]">
                              <span className="font-semibold text-[#172B25]">Action: </span>
                              {finding.recommendedAction}
                            </div>
                          )}

                          {/* Accordion */}
                          {finding.evidence.length > 0 && (
                            <div className="pt-1">
                              <button
                                onClick={() => toggleFindingExpand(finding.id)}
                                className="w-full flex items-center justify-between text-xs font-medium text-[#075E4B] hover:text-[#087F5B] py-1 transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-[#087F5B]" />
                                  Clinical Sources: KDIGO 2023 &amp; ADA Standards ({finding.evidence.length} sources)
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-[#64756D]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#64756D]" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2.5 space-y-2 pt-2 border-t border-[#E1EAE5]">
                                  {finding.evidence.map((ev, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 text-xs space-y-1"
                                    >
                                      <div className="font-bold text-[#172B25]">
                                        {ev.sourceTitle}
                                      </div>
                                      <div className="text-[11px] text-[#64756D] italic">
                                        {ev.citation}
                                      </div>
                                      <p className="text-xs text-[#172B25]">
                                        {ev.summary}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  }

                  // Verified Safe Card
                  return (
                    <div
                      key={finding.id}
                      className="bg-white border border-[#BBF7D0] rounded-xl overflow-hidden shadow-sm"
                    >
                      <div className="p-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#F0FDF4] text-[#087F5B] flex items-center justify-center border border-[#BBF7D0]">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-[#087F5B] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
                                {finding.severityTag}
                              </span>
                              <span className="text-xs font-semibold text-[#075E4B]">
                                No Conflicts Detected
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#172B25] mt-1">
                              {finding.title}
                            </h3>
                            <p className="text-xs text-[#64756D] mt-0.5">
                              {finding.subtitle}
                            </p>
                          </div>
                        </div>

                        {finding.badgeLabel && (
                          <span className="text-xs font-bold text-[#087F5B] bg-[#DDF5EA] border border-[#20A88A]/30 px-2.5 py-1 rounded font-mono">
                            {finding.badgeLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Section: Clinical Dispense Decision */}
              <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-[#172B25]">
                    Clinical Dispense Decision:
                  </div>
                  <div className="text-xs text-[#64756D] mt-0.5">
                    Choose action to complete verification record.
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onOpenOverrideModal}
                    className="px-3.5 py-2 text-xs font-semibold text-[#172B25] bg-white border border-[#CBDAD4] hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                  >
                    Override with Justification
                  </button>

                  <button
                    onClick={onOpenFlagModal}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#C62828] hover:bg-[#A31F1F] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Acknowledge &amp; Flag for Prescriber</span>
                  </button>
                </div>
              </div>

              {/* Audit Hash & Regulatory Disclaimer */}
              <div className="bg-[#F7FAF8] border border-[#E1EAE5] rounded-lg p-3 text-[11px] text-[#64756D] font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#087F5B]" />
                  <span>MedCheck Decision Support Prototype v4.2 • Results must be confirmed by a licensed clinician</span>
                </div>
                <div>
                  Audit Hash: <span className="text-[#172B25] font-semibold">{analysis.auditHash}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Page Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-[#64756D] border-t border-[#E1EAE5]">
        MedCheck Clinical Decision Support Platform • Designed for safe pharmaceutical validation &amp; inpatient care.
      </footer>

    </div>
  );
};
