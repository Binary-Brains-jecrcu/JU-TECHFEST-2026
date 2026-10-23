import { SafetyAnalysisResult, PatientContext, AnalysisHistoryItem } from '../types';

export const PATIENT_PROFILES: Record<string, PatientContext> = {
  'PT-90422': {
    id: 'PT-90422',
    name: 'Robert M. Davis',
    gender: 'Male',
    age: 68,
    dob: '12-Apr-1956',
    weightKg: 74.2,
    unit: 'Inpatient Unit: 4B-Cardiac',
    allergies: [
      { id: 'all-1', allergen: 'Penicillins', reaction: 'Anaphylaxis', severity: 'severe' },
      { id: 'all-2', allergen: 'Sulfa Drugs', reaction: 'Rash / Erythema', severity: 'moderate' }
    ],
    renalLabs: {
      eGFR: 54,
      eGFRCategory: 'Mild (CKD 3a)',
      serumCr: 1.4,
      crCl: 58,
      timestamp: '4 hrs ago'
    },
    conditions: ['Atrial Fibrillation', 'Type 2 Diabetes Mellitus', 'Onychomycosis', 'Stage 3a CKD'],
    currentMedications: ['Metformin HCl 500mg BID', 'Warfarin Sodium 5mg QD', 'Atorvastatin 20mg QHS']
  },
  'PT-81093': {
    id: 'PT-81093',
    name: 'Eleanor M. Vance',
    gender: 'Female',
    age: 79,
    dob: '03-Sep-1947',
    weightKg: 58.4,
    unit: 'Orthopedic Post-Op 2W',
    allergies: [
      { id: 'all-3', allergen: 'Aspirin', reaction: 'Bronchospasm', severity: 'severe' }
    ],
    renalLabs: {
      eGFR: 42,
      eGFRCategory: 'Moderate (CKD 3b)',
      serumCr: 1.7,
      crCl: 39,
      timestamp: '1 hr ago'
    },
    conditions: ['Osteoarthritis', 'Deep Vein Thrombosis', 'Hypertension'],
    currentMedications: ['Apixaban 5mg BID', 'Amlodipine 5mg QD']
  },
  'PT-45129': {
    id: 'PT-45129',
    name: 'Lucas K. Miller',
    gender: 'Male',
    age: 14,
    dob: '18-Jan-2012',
    weightKg: 46.0,
    unit: 'Pediatric Ambulatory',
    allergies: [
      { id: 'all-4', allergen: 'Amoxicillin / Penicillins', reaction: 'Severe Anaphylaxis / Angioedema', severity: 'severe' }
    ],
    renalLabs: {
      eGFR: 112,
      eGFRCategory: 'Normal (>90)',
      serumCr: 0.6,
      crCl: 118,
      timestamp: 'Yesterday'
    },
    conditions: ['Acute Pharyngitis / Streptococcal suspicion'],
    currentMedications: ['Albuterol Inhaler PRN']
  },
  'PT-32890': {
    id: 'PT-32890',
    name: 'Maya S. Lin',
    gender: 'Female',
    age: 42,
    dob: '29-Nov-1983',
    weightKg: 64.0,
    unit: 'Outpatient Clinic 1A',
    allergies: [],
    renalLabs: {
      eGFR: 104,
      eGFRCategory: 'Normal',
      serumCr: 0.8,
      crCl: 102,
      timestamp: '3 days ago'
    },
    conditions: ['GERD', 'Community-Acquired Bronchitis'],
    currentMedications: ['Pantoprazole 40mg QD']
  }
};

export const DEFAULT_ANALYSIS_RESULT: SafetyAnalysisResult = {
  orderId: 'RX-78492',
  ingestedAt: '2 mins ago from Inpatient Unit 4B',
  ingestionFile: {
    name: 'Rx_Order_78492_Inpatient.pdf',
    size: '1.8 MB',
    type: 'Scanned Hospital Medication Order',
    status: 'OCR Extracted'
  },
  drugs: [
    {
      id: 'rx-1',
      name: 'Warfarin Sodium',
      genericName: 'Warfarin Sodium',
      category: 'Oral Anticoagulant',
      dose: '5 mg PO QD',
      route: 'PO',
      frequency: 'QD',
      ndc: '00056-0170-70',
      rxNorm: '855332',
      matchScore: 100
    },
    {
      id: 'rx-2',
      name: 'Fluconazole',
      genericName: 'Fluconazole',
      category: 'Systemic Antifungal',
      dose: '200 mg PO QD',
      route: 'PO',
      frequency: 'QD',
      ndc: '00049-3430-66',
      rxNorm: '203155',
      matchScore: 100
    },
    {
      id: 'rx-3',
      name: 'Metformin HCl',
      genericName: 'Metformin Hydrochloride',
      category: 'Biguanide Hypoglycemic',
      dose: '500 mg PO BID',
      route: 'PO',
      frequency: 'BID',
      ndc: '00093-1048-01',
      rxNorm: '860975',
      matchScore: 100
    }
  ],
  patient: PATIENT_PROFILES['PT-90422'],
  metrics: {
    analyzedCount: 3,
    criticalCount: 1,
    warningCount: 1,
    safeCount: 1,
    unverifiedCount: 0
  },
  requiresClinicalAction: true,
  findings: [
    {
      id: 'find-1',
      severity: 'critical',
      category: 'Drug-Drug Interaction',
      severityTag: 'CRITICAL ALERT',
      badgeLabel: 'INR Surge',
      title: 'Major Drug-Drug Interaction: Warfarin Sodium + Fluconazole',
      subtitle: 'CYP2C9 Metabolic Inhibition • Life-Threatening Bleeding / Hemorrhage Risk',
      drugsInvolved: ['Warfarin Sodium', 'Fluconazole'],
      mechanism: 'Fluconazole potent CYP2C9 inhibition significantly reduces the clearance of the active (S)-warfarin enantiomer. Co-administration causes rapid accumulation, prolonging INR (> 5.0) within 48–72 hours and markedly elevating major bleed risk.',
      recommendedAction: 'Withhold fluconazole and substitute with a non-CYP-inhibiting antifungal (e.g., topical nystatin or an echinocandin). If fluconazole is strictly required, preemptively reduce warfarin dose by 50% and mandate daily INR tracking.',
      prescribedValue: 'Warfarin 5mg QD + Fluconazole 200mg QD',
      referenceValue: 'Contraindicated / Severe interaction requiring 50% dose reduction and INR ≤ 3.0 target',
      ruleId: 'DDI-CYP2C9-0881',
      evidence: [
        {
          sourceTitle: 'FDA Black Box Warning & Package Insert',
          citation: 'Coumadin (Warfarin Sodium) Prescribing Information, Section 7.1 "CYP2C9 Inhibitors" (Rev. 2023)',
          levelOfEvidence: 'Level 1A (Definitive / Regulatory Mandate)',
          confidence: 0.99,
          pmid: '25414842',
          fdaBoxedWarning: true,
          summary: 'Potent CYP2C9 inhibitors such as fluconazole, metronidazole, and sulfamethoxazole-trimethoprim significantly increase prothrombin time/INR. Major bleeding events and intracranial hemorrhage have been documented during early co-administration.',
          fullExcerpt: 'Concomitant administration of fluconazole causes an average 200% to 300% increase in the AUC of (S)-warfarin. Prothrombin time and INR should be monitored at 24-48 hour intervals until stabilization if co-prescription cannot be avoided.'
        },
        {
          sourceTitle: 'CPIC Pharmacogenomics Guideline for Warfarin',
          citation: 'Clinical Pharmacogenetics Implementation Consortium (CPIC) Guidelines for CYP2C9 and VKORC1 Genotypes, Clin Pharmacol Ther. 2021',
          levelOfEvidence: 'CPIC Level A (Strong Recommendation)',
          confidence: 0.96,
          pmid: '28198991',
          summary: 'Pharmacokinetic interaction models demonstrate that azole antifungals phenocopy CYP2C9 poor metabolizers (*2/*3 alleles), creating steep increases in steady-state warfarin concentrations.'
        }
      ]
    },
    {
      id: 'find-2',
      severity: 'warning',
      category: 'Renal Function Check',
      severityTag: 'DOSAGE NOTE',
      badgeLabel: 'eGFR 54',
      title: 'Metformin Dose Evaluation: Mild Renal Impairment',
      subtitle: 'Patient eGFR 54 mL/min • Prescribed: 500 mg BID (1,000 mg daily)',
      drugsInvolved: ['Metformin HCl'],
      guidance: 'Metformin is acceptable when eGFR is 45–59 mL/min, with a recommended maximum daily ceiling of 1,000 mg. Current regimen sits at the allowable ceiling. Safe to continue; monitor renal function every 3 months. Avoid dose escalation.',
      recommendedAction: 'Maintain current dosage at 1,000 mg/day max. Confirm patient avoids acute dehydration and schedule follow-up eGFR in 90 days. Avoid introducing nephrotoxic contrast agents without temporary cessation.',
      prescribedValue: '1,000 mg/day (500 mg BID)',
      referenceValue: 'Max 1,000 mg/day for eGFR 45–59 mL/min (Contraindicated if eGFR < 30 mL/min)',
      ruleId: 'RENAL-METF-042',
      evidence: [
        {
          sourceTitle: 'KDIGO 2023 Clinical Practice Guideline for Diabetes Management in CKD',
          citation: 'Kidney Disease: Improving Global Outcomes (KDIGO) Diabetes Work Group. Kidney Int. 2023; 104(5S):S1-S127',
          levelOfEvidence: 'Level 1B (Evidence-Based Clinical Practice)',
          confidence: 0.94,
          pmid: '37863588',
          summary: 'For patients with eGFR 45-59 mL/min/1.73 m², metformin dose should not exceed 1000 mg daily. Renal function should be reassessed at least every 3 to 6 months to monitor for progression to stage 3b CKD.'
        },
        {
          sourceTitle: 'ADA Standards of Care in Diabetes — 2024',
          citation: 'American Diabetes Association Professional Practice Committee. Diabetes Care 2024; 47(Suppl. 1):S158–S178',
          levelOfEvidence: 'Grade A Consensus Recommendation',
          confidence: 0.95,
          summary: 'FDA revised labeling requires obtaining eGFR before initiating metformin. Continue treatment with dose adjustment down to 1000 mg/day if eGFR falls between 45 and 59.'
        }
      ]
    },
    {
      id: 'find-3',
      severity: 'verified',
      category: 'Allergy Cross-Reactivity',
      severityTag: 'VERIFIED SAFE',
      badgeLabel: 'Passed (3/3)',
      title: 'Allergy Cross-Reactivity Verification',
      subtitle: 'Regimen screened against Penicillin & Sulfa allergies. Zero excipient or beta-lactam conflicts detected.',
      drugsInvolved: ['Warfarin Sodium', 'Fluconazole', 'Metformin HCl'],
      guidance: 'Patient has documented severe anaphylaxis to penicillins and moderate rash to sulfonamides. None of the prescribed agents contain beta-lactam rings, sulfonamide moities, or known shared chemical epitope structures.',
      recommendedAction: 'Allergic clearance confirmed for all 3 active compounds. Proceed without immunological restrictions.',
      ruleId: 'ALLERGY-CROSS-019',
      evidence: [
        {
          sourceTitle: 'AAAAM Drug Allergy Practice Parameter 2023 Update',
          citation: 'Joint Task Force on Practice Parameters; American Academy of Allergy, Asthma & Immunology. Ann Allergy Asthma Immunol. 2023',
          levelOfEvidence: 'Level 1A Guideline',
          confidence: 0.98,
          pmid: '36521578',
          summary: 'Comprehensive cross-reactivity structural database confirms zero shared cross-reactivity between warfarin/fluconazole/metformin and beta-lactam or aryl-sulfonamide antibodies.'
        }
      ]
    }
  ],
  auditHash: 'SHA256-4b92-80ff-e902-19c2',
  engineVersion: 'v4.2-deterministic',
  completedAt: 'Just now'
};

export const DEMO_SCENARIOS: Record<string, SafetyAnalysisResult> = {
  'RX-78492': DEFAULT_ANALYSIS_RESULT,
  'RX-92015': {
    orderId: 'RX-92015',
    ingestedAt: '12 mins ago from Ortho Post-Op 2W',
    ingestionFile: {
      name: 'Rx_Order_92015_Vance.pdf',
      size: '2.1 MB',
      type: 'Direct EMR Order Slip',
      status: 'OCR Extracted'
    },
    drugs: [
      {
        id: 'rx-201',
        name: 'Apixaban (Eliquis)',
        genericName: 'Apixaban',
        category: 'Direct Factor Xa Inhibitor',
        dose: '5 mg PO BID',
        route: 'PO',
        frequency: 'BID',
        ndc: '00003-0894-21',
        rxNorm: '1364430',
        matchScore: 100
      },
      {
        id: 'rx-202',
        name: 'Celecoxib (Celebrex)',
        genericName: 'Celecoxib',
        category: 'NSAID (COX-2 Selective)',
        dose: '200 mg PO QD',
        route: 'PO',
        frequency: 'QD',
        ndc: '00025-1525-31',
        rxNorm: '214199',
        matchScore: 100
      },
      {
        id: 'rx-203',
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        category: 'ACE Inhibitor',
        dose: '20 mg PO QD',
        route: 'PO',
        frequency: 'QD',
        ndc: '00378-0120-01',
        rxNorm: '314076',
        matchScore: 100
      }
    ],
    patient: PATIENT_PROFILES['PT-81093'],
    metrics: {
      analyzedCount: 3,
      criticalCount: 1,
      warningCount: 1,
      safeCount: 1,
      unverifiedCount: 0
    },
    requiresClinicalAction: true,
    findings: [
      {
        id: 'find-201',
        severity: 'critical',
        category: 'Drug-Drug Interaction',
        severityTag: 'CRITICAL ALERT',
        badgeLabel: 'Bleed Risk x4',
        title: 'Severe Bleeding Hazard: Apixaban + Celecoxib (DOAC + NSAID)',
        subtitle: 'Platelet Inhibition + Anticoagulation Cascade • Beers Criteria 2023 High-Risk Alert',
        drugsInvolved: ['Apixaban', 'Celecoxib'],
        mechanism: 'Co-administration of nonsteroidal anti-inflammatory agents with direct factor Xa inhibitors markedly increases major gastrointestinal bleeding by compromising mucosal gastric prostaglandin synthesis while inhibiting factor Xa.',
        recommendedAction: 'Discontinue systemic NSAID in patient age 79 receiving therapeutic DOAC. Transition pain management to scheduled acetaminophen or topical agents. If inflammatory arthritis requires COX-2 inhibitor, add high-dose PPI gastroprotection.',
        prescribedValue: 'Apixaban 5mg BID + Celecoxib 200mg QD',
        referenceValue: 'High bleeding risk (Hazard Ratio 3.82 vs DOAC monotherapy)',
        ruleId: 'DDI-DOAC-NSAID-712',
        evidence: [
          {
            sourceTitle: 'AGS Beers Criteria® for Potentially Inappropriate Medication Use in Older Adults',
            citation: '2023 American Geriatrics Society Beers Criteria® Update Expert Panel. J Am Geriatr Soc. 2023; 71(7):2052-2081',
            levelOfEvidence: 'High Quality Recommendation (Strong)',
            confidence: 0.98,
            pmid: '37139824',
            fdaBoxedWarning: true,
            summary: 'Avoid chronic or concurrent use of oral NSAIDs with oral anticoagulants unless alternative therapies are not effective and gastroprotective agent is used; significantly increases GI bleeding risk in older adults.'
          }
        ]
      },
      {
        id: 'find-202',
        severity: 'warning',
        category: 'Renal Function Check',
        severityTag: 'DOSAGE NOTE',
        badgeLabel: 'CrCl 39 mL/min',
        title: 'Triple Whammy Renal Hemodynamic Alert: NSAID + ACEi in CKD 3b',
        subtitle: 'Lisinopril + Celecoxib • eGFR 42 mL/min / CrCl 39 mL/min',
        drugsInvolved: ['Celecoxib', 'Lisinopril'],
        guidance: 'Concurrent use of NSAIDs with ACE inhibitors impairs afferent and efferent arteriolar autoregulation, precipitating acute kidney injury (AKI) in elderly patients with pre-existing stage 3b CKD.',
        recommendedAction: 'Order Serum Creatinine and Potassium within 72 hours. Strongly recommend stopping Celecoxib to prevent acute hemodynamic nephrotoxicity.',
        ruleId: 'RENAL-HEMODYNAMIC-031',
        evidence: [
          {
            sourceTitle: 'BMJ Practice Guideline: Triple Whammy Acute Kidney Injury',
            citation: 'BMJ 2013; 346:e8507 doi: 10.1136/bmj.e8507',
            levelOfEvidence: 'Level 1 Observational & Systematic Review',
            confidence: 0.93,
            summary: 'Combined use of ACE inhibitor and NSAID carries a 31% increased rate of acute kidney injury compared to monotherapy.'
          }
        ]
      },
      {
        id: 'find-203',
        severity: 'verified',
        category: 'Allergy Cross-Reactivity',
        severityTag: 'VERIFIED SAFE',
        badgeLabel: 'Passed (3/3)',
        title: 'Allergy & Excipient Check',
        subtitle: 'Screened against Aspirin sensitivity. Note: Celecoxib contains sulfonamide moiety; patient has no sulfa allergy history.',
        drugsInvolved: ['Apixaban', 'Lisinopril', 'Celecoxib'],
        recommendedAction: 'No documented aspirin cross-sensitivity flags triggered for Apixaban or Lisinopril.',
        ruleId: 'ALLERGY-SAFE-001',
        evidence: []
      }
    ],
    auditHash: 'SHA256-8a11-92cb-71d3-33a1',
    engineVersion: 'v4.2-deterministic',
    completedAt: '10 mins ago'
  },
  'RX-45129': {
    orderId: 'RX-45129',
    ingestedAt: '35 mins ago from Pediatric Ambulatory',
    ingestionFile: {
      name: 'Rx_Order_45129_Miller.pdf',
      size: '950 KB',
      type: 'Pediatric Electronic Script',
      status: 'OCR Extracted'
    },
    drugs: [
      {
        id: 'rx-301',
        name: 'Cephalexin (Keflex)',
        genericName: 'Cephalexin',
        category: 'First-Generation Cephalosporin',
        dose: '500 mg PO QID',
        route: 'PO',
        frequency: 'QID',
        ndc: '00781-2244-01',
        rxNorm: '20680',
        matchScore: 99
      }
    ],
    patient: PATIENT_PROFILES['PT-45129'],
    metrics: {
      analyzedCount: 1,
      criticalCount: 1,
      warningCount: 0,
      safeCount: 0,
      unverifiedCount: 0
    },
    requiresClinicalAction: true,
    findings: [
      {
        id: 'find-301',
        severity: 'critical',
        category: 'Allergy Cross-Reactivity',
        severityTag: 'CRITICAL ALERT',
        badgeLabel: 'Shared R1 Chain',
        title: 'Severe Allergy Cross-Reactivity: Cephalexin in Penicillin Anaphylaxis',
        subtitle: 'Identical R1 Alpha-Amino Side Chain with Ampicillin/Amoxicillin (Cross-Reactivity ~8%)',
        drugsInvolved: ['Cephalexin'],
        mechanism: 'Cephalexin shares an identical R1 chemical side-chain with amoxicillin/ampicillin. In patients with verified IgE-mediated anaphylaxis to amino-penicillins, 1st-generation cephalosporins carry an elevated cross-reactivity risk.',
        recommendedAction: 'WITHHOLD cephalexin. Substitute with a non-beta-lactam antibiotic (e.g., Azithromycin or Clindamycin) or a 3rd/4th generation cephalosporin with dissimilar side chain (e.g., Cefdinir) following allergy consultation.',
        prescribedValue: 'Cephalexin 500mg QID (Weight: 46kg)',
        referenceValue: 'Contraindicated with documented severe IgE-mediated penicillin anaphylaxis',
        ruleId: 'ALLERGY-R1-BETA-009',
        evidence: [
          {
            sourceTitle: 'Joint Task Force on Drug Allergy: Cephalosporin Cross-Reactivity Parameters',
            citation: 'Khan DA, et al. Drug Allergy: An Updated Practice Parameter. Ann Allergy Asthma Immunol. 2023; 130(4):444-508',
            levelOfEvidence: 'Level 1A Guideline',
            confidence: 0.97,
            pmid: '36521578',
            summary: 'Cross-reactivity between penicillins and cephalosporins is primarily determined by similarity in the R1 side chain, not the core beta-lactam ring. Cephalexin and cefadroxil share an identical R1 group with ampicillin and amoxicillin.'
          }
        ]
      }
    ],
    auditHash: 'SHA256-3c29-4411-9a72-ff84',
    engineVersion: 'v4.2-deterministic',
    completedAt: '32 mins ago'
  },
  'RX-32890': {
    orderId: 'RX-32890',
    ingestedAt: '1 hour ago from Outpatient Clinic 1A',
    ingestionFile: {
      name: 'Rx_Order_32890_Lin.pdf',
      size: '1.2 MB',
      type: 'Outpatient Clinic Order',
      status: 'OCR Extracted'
    },
    drugs: [
      {
        id: 'rx-401',
        name: 'Azithromycin (Zithromax)',
        genericName: 'Azithromycin',
        category: 'Macrolide Antibacterial',
        dose: '250 mg PO QD (Z-Pak)',
        route: 'PO',
        frequency: 'QD',
        ndc: '00069-3060-75',
        rxNorm: '18631',
        matchScore: 100
      },
      {
        id: 'rx-402',
        name: 'Pantoprazole Sodium',
        genericName: 'Pantoprazole Sodium',
        category: 'Proton Pump Inhibitor (PPI)',
        dose: '40 mg PO QD',
        route: 'PO',
        frequency: 'QD',
        ndc: '00008-0841-81',
        rxNorm: '40790',
        matchScore: 100
      }
    ],
    patient: PATIENT_PROFILES['PT-32890'],
    metrics: {
      analyzedCount: 2,
      criticalCount: 0,
      warningCount: 0,
      safeCount: 2,
      unverifiedCount: 0
    },
    requiresClinicalAction: false,
    findings: [
      {
        id: 'find-401',
        severity: 'verified',
        category: 'Drug-Drug Interaction',
        severityTag: 'VERIFIED SAFE',
        badgeLabel: 'Passed (2/2)',
        title: 'Drug-Drug Interaction Screening Cleared',
        subtitle: 'No clinically significant CYP450 or QT prolongation interactions detected',
        drugsInvolved: ['Azithromycin', 'Pantoprazole'],
        guidance: 'Unlike clarithromycin or erythromycin, azithromycin does not inhibit CYP3A4. Pantoprazole metabolism (CYP2C19/CYP3A4) remains uninhibited.',
        recommendedAction: 'Safe to dispense as written. Routine patient counseling on taking azithromycin with or without food.',
        ruleId: 'DDI-MACROLIDE-022',
        evidence: [
          {
            sourceTitle: 'FDA Guidance on Drug Interactions: Cytochrome P450 Enzymes',
            citation: 'Clinical Pharmacology Guidance for Industry: Drug-Drug Interactions (Rev. 2022)',
            levelOfEvidence: 'Level 1 Reference',
            confidence: 0.99,
            summary: 'Azithromycin shows negligible in vitro and in vivo inhibition of CYP isoenzymes.'
          }
        ]
      },
      {
        id: 'find-402',
        severity: 'verified',
        category: 'Renal Function Check',
        severityTag: 'VERIFIED SAFE',
        badgeLabel: 'eGFR 104',
        title: 'Renal Clearance Evaluation: Normal Function',
        subtitle: 'Patient eGFR 104 mL/min • Standard therapeutic dosing confirmed',
        drugsInvolved: ['Azithromycin', 'Pantoprazole'],
        recommendedAction: 'No renal dose titration required for either agent.',
        ruleId: 'RENAL-STD-100',
        evidence: []
      }
    ],
    auditHash: 'SHA256-11f8-9901-ab22-4411',
    engineVersion: 'v4.2-deterministic',
    completedAt: '58 mins ago'
  }
};

export const ANALYSIS_HISTORY: AnalysisHistoryItem[] = [
  {
    id: 'hist-1',
    orderId: 'RX-78492',
    patientName: 'Robert M. Davis',
    patientId: 'PT-90422',
    drugCount: 3,
    criticalAlerts: 1,
    warnings: 1,
    status: 'Flagged',
    timestamp: '2 mins ago',
    unit: 'Inpatient Unit: 4B-Cardiac'
  },
  {
    id: 'hist-2',
    orderId: 'RX-92015',
    patientName: 'Eleanor M. Vance',
    patientId: 'PT-81093',
    drugCount: 3,
    criticalAlerts: 1,
    warnings: 1,
    status: 'Flagged',
    timestamp: '12 mins ago',
    unit: 'Ortho Post-Op 2W'
  },
  {
    id: 'hist-3',
    orderId: 'RX-45129',
    patientName: 'Lucas K. Miller',
    patientId: 'PT-45129',
    drugCount: 1,
    criticalAlerts: 1,
    warnings: 0,
    status: 'Flagged',
    timestamp: '35 mins ago',
    unit: 'Pediatric Ambulatory'
  },
  {
    id: 'hist-4',
    orderId: 'RX-32890',
    patientName: 'Maya S. Lin',
    patientId: 'PT-32890',
    drugCount: 2,
    criticalAlerts: 0,
    warnings: 0,
    status: 'Verified Safe',
    timestamp: '1 hour ago',
    unit: 'Outpatient Clinic 1A'
  }
];

export const MEDICINE_DATABASE = [
  {
    name: 'Warfarin Sodium',
    brandName: 'Coumadin / Jantoven',
    class: 'Vitamin K Antagonist (Anticoagulant)',
    ndc: '00056-0170-70',
    rxNorm: '855332',
    metabolism: 'CYP2C9 (S-enantiomer, major active), CYP3A4, CYP1A2',
    highAlert: true,
    boxedWarning: 'Major / Fatal Bleeding Risk (FDA Boxed Warning)',
    renalGuidance: 'No dose adjustment for mild/moderate renal impairment; monitor INR frequently.',
    majorInteractions: ['Fluconazole (CYP2C9)', 'Amiodarone', 'Metronidazole', 'NSAIDs', 'Bactrim']
  },
  {
    name: 'Fluconazole',
    brandName: 'Diflucan',
    class: 'Triazole Antifungal',
    ndc: '00049-3430-66',
    rxNorm: '203155',
    metabolism: 'Potent CYP2C9 inhibitor, moderate CYP3A4 & CYP2C19 inhibitor',
    highAlert: false,
    boxedWarning: 'Teratogenicity with high-dose; QT prolongation risk',
    renalGuidance: 'eGFR 21-50 mL/min: reduce dose by 50% after initial loading dose. CrCl < 20: reduce dose by 75%.',
    majorInteractions: ['Warfarin (causes INR surge)', 'Statins (Simvastatin/Atorvastatin)', 'Phenytoin', 'Sulfonylureas']
  },
  {
    name: 'Metformin HCl',
    brandName: 'Glucophage',
    class: 'Biguanide Antihyperglycemic',
    ndc: '00093-1048-01',
    rxNorm: '860975',
    metabolism: 'Renally excreted unchanged (OCT2/MATE transporter pathway)',
    highAlert: false,
    boxedWarning: 'Lactic Acidosis Risk in renal impairment',
    renalGuidance: 'eGFR 45-59: max 1000 mg/day. eGFR 30-44: max 500 mg/day. eGFR < 30: Strictly Contraindicated.',
    majorInteractions: ['Iodinated Radiocontrast agents', 'Carbonic anhydrase inhibitors', 'Alcohol']
  },
  {
    name: 'Apixaban',
    brandName: 'Eliquis',
    class: 'Direct Factor Xa Inhibitor (DOAC)',
    ndc: '00003-0894-21',
    rxNorm: '1364430',
    metabolism: 'CYP3A4/5, P-glycoprotein substrate',
    highAlert: true,
    boxedWarning: 'Premature discontinuation increases thrombotic events; Spinal/epidural hematoma risk',
    renalGuidance: 'Reduce dose to 2.5mg BID if at least 2 of: Age >=80, Weight <=60kg, Serum Cr >=1.5 mg/dL.',
    majorInteractions: ['NSAIDs (Severe GI bleeding)', 'Ketoconazole', 'Rifampin', 'Phenytoin']
  },
  {
    name: 'Cephalexin',
    brandName: 'Keflex',
    class: 'First-Generation Cephalosporin',
    ndc: '00781-2244-01',
    rxNorm: '20680',
    metabolism: 'Renal excretion (90% within 8 hours)',
    highAlert: false,
    boxedWarning: 'None',
    renalGuidance: 'CrCl < 50 mL/min: adjust dose intervals according to creatinine clearance.',
    majorInteractions: ['Metformin (increases metformin levels via renal organic cation transporter)']
  },
  {
    name: 'Azithromycin',
    brandName: 'Zithromax / Z-Pak',
    class: 'Macrolide Antibiotic',
    ndc: '00069-3060-75',
    rxNorm: '18631',
    metabolism: 'Hepatic biliary excretion (minimal CYP metabolism)',
    highAlert: false,
    boxedWarning: 'QT prolongation / torsades de pointes in susceptible patients',
    renalGuidance: 'No adjustment needed in GFR > 10 mL/min; caution in severe renal impairment.',
    majorInteractions: ['Antacids (separate by 2 hrs)', 'QT-prolonging antiarrhythmics', 'Digoxin']
  }
];
