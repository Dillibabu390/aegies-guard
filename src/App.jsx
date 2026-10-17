import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScenarioPicker from './components/ScenarioPicker';
import OrchestrationFlow from './components/OrchestrationFlow';
import RiskGauge from './components/RiskGauge';
import DecisionSummary from './components/DecisionSummary';
import AgentScoreCards from './components/AgentScoreCards';
import NetworkGraphViewer from './components/NetworkGraphViewer';
import AuditLogTable from './components/AuditLogTable';
import StepUpChallengeModal from './components/StepUpChallengeModal';
import CustomTransactionModal from './components/CustomTransactionModal';
import ArchitectureModal from './components/ArchitectureModal';
import SarReportModal from './components/SarReportModal';

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  // Modals
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isSarModalOpen, setIsSarModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Scenarios
      const scenRes = await fetch('/api/scenarios');
      const scenData = await scenRes.json();
      if (scenData.success && scenData.scenarios) {
        setScenarios(scenData.scenarios);
        // Automatically evaluate first scenario if none loaded
        if (scenData.scenarios.length > 0) {
          handleSelectScenario(scenData.scenarios[0]);
        }
      }

      // 2. Fetch Logs
      fetchLogs();

      // 3. System Health
      const healthRes = await fetch('/api/system-health');
      const healthData = await healthRes.json();
      if (healthData.success) {
        setSystemHealth(healthData);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleSelectScenario = async (scenario) => {
    setActiveScenarioId(scenario.id);
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentEvaluation(data.data);
        fetchLogs();
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluateCustom = async (customPayload) => {
    setActiveScenarioId('custom');
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customPayload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentEvaluation(data.data);
        fetchLogs();
      }
    } catch (err) {
      console.error('Custom evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleChallengeResolved = (updatedTransaction) => {
    setCurrentEvaluation(updatedTransaction);
    fetchLogs();
  };

  return (
    <div className="app-container" id="fraud-detection-system-app">
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        systemHealth={systemHealth}
      />

      {/* 2. Threat Scenarios Selector */}
      <ScenarioPicker
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        isEvaluating={isEvaluating}
      />

      {/* 3. Visual System Orchestration Flow */}
      <OrchestrationFlow
        evaluation={currentEvaluation}
        isEvaluating={isEvaluating}
      />

      {/* 4. Hero Evaluation: Gauge + Decision Summary */}
      <section className="hero-evaluation-grid" id="main-evaluation-panel">
        <RiskGauge
          score={currentEvaluation?.scoring?.totalRiskScore ?? 0}
          decision={currentEvaluation?.scoring?.decision ?? 'APPROVE'}
        />

        <DecisionSummary
          evaluation={currentEvaluation}
          onOpenChallengeModal={() => setIsChallengeModalOpen(true)}
          onOpenSarModal={() => setIsSarModalOpen(true)}
        />
      </section>

      {/* 5. Five Parallel AI Agents Deep-Dive */}
      <AgentScoreCards
        agentResults={currentEvaluation?.agentResults}
      />

      {/* 6. Dynamic Behavioral & Network Graph Viewer */}
      <NetworkGraphViewer
        currentBeneficiaryId={currentEvaluation?.transactionDetails?.beneficiary?.id || currentEvaluation?.transactionDetails?.beneficiary?.accountNumber}
        currentUserId={currentEvaluation?.user?.accountNumber || 'ACC_77189021'}
      />

      {/* 7. Real-Time Audit Log Table */}
      <AuditLogTable
        logs={auditLogs}
        onSelectLog={(log) => setCurrentEvaluation(log)}
      />

      {/* Modals */}
      <StepUpChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        transaction={currentEvaluation}
        onChallengeResolved={handleChallengeResolved}
      />

      <CustomTransactionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onEvaluateCustom={handleEvaluateCustom}
      />

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <SarReportModal
        isOpen={isSarModalOpen}
        onClose={() => setIsSarModalOpen(false)}
        transaction={currentEvaluation}
      />
    </div>
  );
}
