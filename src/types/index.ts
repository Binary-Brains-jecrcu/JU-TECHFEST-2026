export interface MedGemmaTestCase {
  scenario: string;
  severity: string;
  finding: string;
  outcome: string;
}

export interface MedGemmaAllergyAnalysis {
  status: string;
  risk_level: string;
  allergen_matched?: string;
  reaction?: string;
  cross_reactivity?: string;
  clinical_action?: string;
}

export interface MedGemmaEvaluation {
  model: string;
  drug_name: string;
  generic_name: string;
  prescribed_dose: string;
  status: string;
  medical_rules: string[];
  allergy_analysis: MedGemmaAllergyAnalysis;
  clinical_test_cases: MedGemmaTestCase[];
  audit_trail: string;
  clinical_rationale: string;
  read_only_guarantee: boolean;
}

export interface LynxVerdict {
  drug_name?: string;
  verdict: string;
  hallucination_detected?: boolean;
  hallucination_score: number;
  explanation?: string;
  reasoning?: string;
  grounded_in_rules?: boolean;
  audit_trail?: string;
}

export type SeverityLevel = 'critical' | 'warning' | 'info' | 'verified' | 'unverified';

export interface DoseFlag {
  status: 'appropriate' | 'warning' | 'high' | 'low' | 'renal_adjustment' | 'schedule_warning';
  label: string; // e.g. "RxNorm Standard Dose", "High Dose Alert", "Weekly Dosing Enforced", "Renal Dose Adjustment"
  badgeColor: 'emerald' | 'amber' | 'red' | 'blue';
  explanation: string;
  standardDoseRange: string;
  maxDailyDose?: string;
  potentialDoses: string[];
  qwenEvaluation: string;
  allergicReaction?: string;
  safetyPrecaution?: string;
  audit_trail?: string;
  execution_path?: string;
  medgemmaEvaluation?: MedGemmaEvaluation;
}

export interface PrescriptionDrug {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dose: string;
  route: string;
  frequency: string;
  ndc: string;
  rxNorm?: string;
  matchScore: number;
  standardDose?: string;
  maxDailyDose?: string;
  potentialDoses?: string[];
  doseFlag?: DoseFlag;
  allergicReaction?: string;
  safetyPrecaution?: string;
  audit_trail?: string;
  execution_path?: string;
  medgemmaEvaluation?: MedGemmaEvaluation;
}

export interface AllergyItem {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface RenalLabs {
  eGFR: number;
  eGFRCategory: string; // "Normal", "Mild", "Moderate", "Severe"
  serumCr: number;
  crCl: number;
  timestamp: string;
}

export interface PatientContext {
  id: string;
  name: string;
  gender: string;
  age: number;
  dob: string;
  weightKg: number;
  unit: string;
  allergies: AllergyItem[];
  renalLabs: RenalLabs;
  conditions: string[];
  currentMedications: string[];
}

export interface EvidenceSource {
  sourceTitle: string;
  citation: string;
  levelOfEvidence: string;
  confidence: number;
  pmid?: string;
  fdaBoxedWarning?: boolean;
  summary: string;
  fullExcerpt?: string;
}

export interface SafetyFinding {
  id: string;
  severity: SeverityLevel;
  category: 'Drug-Drug Interaction' | 'Renal Function Check' | 'Allergy Cross-Reactivity' | 'Duplicate Active Ingredient' | 'Contraindication' | 'Dosage Ceiling';
  severityTag: string; // "CRITICAL ALERT", "DOSAGE NOTE", "VERIFIED SAFE"
  badgeLabel?: string; // "INR Surge", "eGFR 54", "Passed (3/3)"
  title: string;
  subtitle: string;
  drugsInvolved: string[];
  mechanism?: string;
  guidance?: string;
  recommendedAction?: string;
  prescribedValue?: string;
  referenceValue?: string;
  ruleId: string;
  evidence: EvidenceSource[];
}

export interface SafetyAnalysisResult {
  orderId: string;
  ingestedAt: string;
  ingestionFile: {
    name: string;
    size: string;
    type: string;
    status: string;
  };
  drugs: PrescriptionDrug[];
  patient: PatientContext;
  metrics: {
    analyzedCount: number;
    criticalCount: number;
    warningCount: number;
    safeCount: number;
    unverifiedCount: number;
  };
  findings: SafetyFinding[];
  auditHash: string;
  engineVersion: string;
  requiresClinicalAction: boolean;
  completedAt: string;
}

export interface AnalysisHistoryItem {
  id: string;
  orderId: string;
  patientName: string;
  patientId: string;
  drugCount: number;
  criticalAlerts: number;
  warnings: number;
  status: 'Flagged' | 'Overridden' | 'Verified Safe';
  timestamp: string;
  unit: string;
}
