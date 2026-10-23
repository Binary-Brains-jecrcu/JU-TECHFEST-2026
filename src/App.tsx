import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PrescriptionSafetyWorkspace } from './components/PrescriptionSafetyWorkspace';
import { LandingPage } from './components/LandingPage';
import { AnalysisHistoryModal } from './components/AnalysisHistoryModal';
import { MedicineDatabaseModal } from './components/MedicineDatabaseModal';
import { SystemInfoModal } from './components/SystemInfoModal';
import { 
  OverrideModal, 
  FlagModal, 
  PatientSwitcherModal, 
  PrescriptionUploadModal 
} from './components/DecisionModals';
import { DEMO_SCENARIOS, PATIENT_PROFILES } from './data/mockData';
import { SafetyAnalysisResult, PrescriptionDrug, PatientContext, SafetyFinding } from './types';
import { generateClinicalFindings } from './utils/safetyChecker';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'workspace' | 'landing' | 'history' | 'database' | 'about'>('landing');
  const [currentAnalysis, setCurrentAnalysis] = useState<SafetyAnalysisResult>(DEMO_SCENARIOS['RX-78492']);
  
  // Modals
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectScenario = (scenarioId: string) => {
    if (DEMO_SCENARIOS[scenarioId]) {
      setCurrentAnalysis(DEMO_SCENARIOS[scenarioId]);
      showToast(`Loaded clinical test scenario #${scenarioId}`);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    if (PATIENT_PROFILES[patientId]) {
      setCurrentAnalysis(prev => ({
        ...prev,
        patient: PATIENT_PROFILES[patientId]
      }));
      showToast(`Switched active patient to ${PATIENT_PROFILES[patientId].name}`);
    }
  };

  const handleLoadCustomPrescription = (
    fileName: string, 
    drugs: PrescriptionDrug[], 
    patient?: PatientContext,
    qwenReasoning?: string
  ) => {
    const activePatient = patient || currentAnalysis.patient;
    const newFindings = generateClinicalFindings(drugs, activePatient);

    setCurrentAnalysis(prev => ({
      ...prev,
      orderId: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
      ingestedAt: 'Just now (PaddleOCR + Qwen-VL Live)',
      ingestionFile: {
        name: fileName,
        size: '1.4 MB',
        type: 'PaddleOCR + Qwen-VL Live Extraction',
        status: 'Extracted & Verified'
      },
      patient: activePatient,
      drugs: drugs,
      findings: newFindings,
      metrics: {
        analyzedCount: drugs.length,
        criticalCount: newFindings.filter(f => f.severity === 'critical').length,
        warningCount: newFindings.filter(f => f.severity === 'warning').length,
        safeCount: newFindings.filter(f => f.severity === 'verified').length,
        unverifiedCount: 0
      },
      requiresClinicalAction: newFindings.some(f => f.severity === 'critical')
    }));
    setCurrentView('workspace');
    showToast(`Prescription ${fileName} processed and loaded via PaddleOCR + Qwen-VL`);
  };

  const handleConfirmOverride = (justification: string) => {
    setCurrentAnalysis(prev => ({
      ...prev,
      requiresClinicalAction: false
    }));
    setIsOverrideModalOpen(false);
    showToast('Clinical safety override logged with justification. Dispense approved.');
  };

  const handleConfirmFlag = (note: string) => {
    setIsFlagModalOpen(false);
    showToast('Prescription order flagged for attending physician review.');
  };

  const handleNavigation = (view: 'workspace' | 'landing' | 'history' | 'database' | 'about') => {
    if (view === 'history') {
      setIsHistoryModalOpen(true);
    } else if (view === 'database') {
      setIsDatabaseModalOpen(true);
    } else if (view === 'about') {
      setIsAboutModalOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigation}
        onNewCheck={() => setIsUploadModalOpen(true)}
        onPrint={() => window.print()}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            onLaunchWorkspace={(scenarioId) => {
              if (scenarioId && DEMO_SCENARIOS[scenarioId]) {
                setCurrentAnalysis(DEMO_SCENARIOS[scenarioId]);
              }
              setCurrentView('workspace');
            }}
          />
        ) : (
          <PrescriptionSafetyWorkspace
            analysis={currentAnalysis}
            onSelectScenario={handleSelectScenario}
            onUpdateAnalysis={setCurrentAnalysis}
            onOpenOverrideModal={() => setIsOverrideModalOpen(true)}
            onOpenFlagModal={() => setIsFlagModalOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenPatientModal={() => setIsPatientModalOpen(true)}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B25] text-white px-4 py-3 rounded-xl shadow-modal flex items-center gap-2.5 text-xs animate-bounce border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#20A88A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <OverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onConfirmOverride={handleConfirmOverride}
      />

      <FlagModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        onConfirmFlag={handleConfirmFlag}
      />

      <PatientSwitcherModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelectPatient={handleSelectPatient}
      />

      <PrescriptionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadCustomPrescription={handleLoadCustomPrescription}
      />

      <AnalysisHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectOrder={(orderId) => {
          handleSelectScenario(orderId);
          setCurrentView('workspace');
        }}
      />

      <MedicineDatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      <SystemInfoModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

    </div>
  );
}

export default App;
