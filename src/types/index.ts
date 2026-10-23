export type SeverityLevel = 'critical' | 'warning' | 'info' | 'verified' | 'unverified';

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
