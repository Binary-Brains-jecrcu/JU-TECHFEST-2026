# MedCheck — AI-Assisted Clinical Decision Support & Prescription Verification Platform

> **JU TECHFEST 2026**
> Award-Worthy Healthcare UX & Clinical Safety Verification Engine

MedCheck is a clinical decision-support (CDS) platform designed for inpatient hospital pharmacies, ambulatory clinics, and clinical decision teams. It screens complex drug regimens against patient-specific biological context (eGFR, CrCl, allergy history, and pharmacogenomics) using deterministic clinical safety rules combined with AI-assisted document parsing.

---

## 🌟 Key Features

1. **Deterministic Clinical Safety Engine**:
   - **Drug-Drug Interactions (DDI)**: High-precision detection of metabolic enzyme collisions (e.g. CYP2C9 inhibition by Fluconazole causing Warfarin accumulation).
   - **Renal Function Thresholds**: Evaluates eGFR and CrCl (Cockcroft-Gault / CKD-EPI) against KDIGO 2023 & ADA dosage ceiling rules (e.g. Metformin limits in mild CKD 3a).
   - **Molecular Allergy Cross-Reactivity**: Structural R1 side-chain analysis to prevent false escalations and catch true IgE-mediated beta-lactam cross-reactivity.
   - **AGS Beers Criteria® 2023**: Geriatric safety flags (e.g. DOAC + NSAID synergistic hemorrhage risk).

2. **10-Second Judge / Demonstration Experience**:
   - One-click presets to test real clinical scenarios:
     - **#RX-78492**: Warfarin + Fluconazole DDI + Metformin Renal Ceiling (Inpatient Cardiac).
     - **#RX-92015**: Apixaban + Celecoxib Elderly Gastrointestinal Bleed & Triple Whammy AKI.
     - **#RX-45129**: Cephalexin in IgE-mediated Penicillin Anaphylaxis (R1 Side-Chain conflict).
     - **#RX-32890**: Azithromycin + Pantoprazole (Clean Verified Safe dispensing pass).
   - Interactive prescription ingestion via drag-and-drop or manual regimen builder.

3. **Clinician Governance & Auditing**:
   - **Override with Justification**: Structured rationale capture, clinical safeguard notes, and electronic signature sign-off.
   - **Prescriber Notification Flag**: Auto-generates formal CDS communication with urgency levels (Stat Page vs InBasket).
   - **Cryptographic Audit Hash**: SHA-256 traceable verification records.
   - **Regulatory Compliance**: Designed under FDA Section 520(o)(1)(E) Non-Device CDS guidelines.

4. **Product Tour / Landing Page**:
   - Complete marketing & clinical systems overview matching the enterprise product specification.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Vite
- **Design System**: Restrained clinical healthcare palette (`#087F5B`, `#075E4B`, `#DDF5EA`, `#F7FAF8`, `#172B25`)
- **Backend Architecture**: Deterministic Java CDS Rule Engine + Python AI/RAG Microservice (MedGemma / Qwen for OCR & RxNorm mapping)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Binary-Brains-jecrcu/JU-TECHFEST-2026.git
cd JU-TECHFEST-2026

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚖️ Regulatory Notice
MedCheck is a prototype Clinical Decision Support (CDS) platform designed to assist qualified healthcare professionals. It does not replace autonomous clinical judgment or licensed physician review.
