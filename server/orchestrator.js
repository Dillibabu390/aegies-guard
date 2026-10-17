/**
 * AI Orchestrator for Multimodal Fraud Detection System
 * Coordinates parallel execution of 4 AI Agents:
 *  - Agent 1: Transaction Telemetry & Velocity (0 - 25 Pts)
 *  - Agent 2: Audit & Database RAG (0 - 25 Pts)
 *  - Agent 3: Multimodal Identity (0 - 25 Pts)
 *  - Agent 4: Behavioral & Graph Anomaly (0 - 25 Pts)
 * Computes Total Risk Index (0 - 100) and applies Policy Decision Rules:
 *  - Score >= 90: BLOCK / REJECT
 *  - 50 <= Score < 90: CHALLENGE (Step-Up Authentication)
 *  - Score < 50: APPROVE
 */

import { evaluateTelemetryAndVelocity } from './agents/agent1_telemetry.js';
import { evaluateAuditAndRAG } from './agents/agent2_audit_rag.js';
import { evaluateMultimodalIdentity } from './agents/agent3_multimodal.js';
import { evaluateBehavioralAndGraph } from './agents/agent4_behavioral_graph.js';
import { users, velocityCache, auditLogs } from './data/store.js';

export async function orchestrateEvaluation(payload, options = {}) {
  const orchestratorStartTime = performance.now();
  const txnId = payload.transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const userId = payload.userId || 'usr_alex_chen';
  const userProfile = users[userId] || users['usr_alex_chen'];
  const userVelocityHistory = velocityCache.get(userId) || [];

  const geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY || null;

  // 1. Parallel Dispatch to All 4 Agents
  const [
    agent1Result,
    agent2Result,
    agent3Result,
    agent4Result
  ] = await Promise.all([
    evaluateTelemetryAndVelocity(payload, userProfile, userVelocityHistory),
    evaluateAuditAndRAG(payload, userProfile, geminiApiKey),
    evaluateMultimodalIdentity(payload, userProfile, geminiApiKey),
    evaluateBehavioralAndGraph(payload, userProfile)
  ]);

  // 2. Score Aggregation (0 - 100 Scale)
  const totalScore = Math.min(100, Math.max(0, 
    agent1Result.score + agent2Result.score + agent3Result.score + agent4Result.score
  ));

  // 3. Policy Decision Engine
  let decision = 'APPROVE';
  let decisionLevel = 'SAFE';
  let actionRequired = 'TRANSACTION_CLEARED';
  let recommendedActionText = 'Low risk detected. Transaction auto-approved and dispatched to clearing network.';

  if (totalScore >= 90) {
    decision = 'BLOCK';
    decisionLevel = 'CRITICAL';
    actionRequired = 'LOCK_ACCOUNT_AND_HALT';
    recommendedActionText = 'Severe fraud indicators confirmed across multiple vectors. Transaction blocked; account placed on security hold.';
  } else if (totalScore >= 50) {
    decision = 'CHALLENGE';
    decisionLevel = 'WARNING';
    actionRequired = 'STEP_UP_AUTHENTICATION';
    recommendedActionText = 'Elevated aggregate risk score. Step-up authentication required (Dynamic OTP / Biometric verification challenge).';
  }

  // Latency & Performance Telemetry
  const totalLatencyMs = Math.round(performance.now() - orchestratorStartTime);

  // Compile Comprehensive Forensic Dossier
  const evaluationResult = {
    transactionId: txnId,
    timestamp: new Date().toISOString(),
    user: {
      id: userProfile.id,
      name: userProfile.name,
      accountNumber: userProfile.accountNumber
    },
    transactionDetails: {
      amount: Number(payload.amount),
      currency: payload.currency || 'USD',
      beneficiary: payload.beneficiary || { name: 'Unknown', accountNumber: 'ACC_UNKNOWN' },
      memo: payload.memo || 'Digital Payment'
    },
    scoring: {
      totalRiskScore: totalScore,
      maxScore: 100,
      decision,
      decisionLevel,
      actionRequired,
      recommendedActionText,
      agentContributions: {
        agent1Telemetry: { score: agent1Result.score, max: 25, percentage: Math.round((agent1Result.score / 25) * 100) },
        agent2AuditRAG: { score: agent2Result.score, max: 25, percentage: Math.round((agent2Result.score / 25) * 100) },
        agent3Multimodal: { score: agent3Result.score, max: 25, percentage: Math.round((agent3Result.score / 25) * 100) },
        agent4BehavioralGraph: { score: agent4Result.score, max: 25, percentage: Math.round((agent4Result.score / 25) * 100) }
      }
    },
    agentResults: {
      agent1: agent1Result,
      agent2: agent2Result,
      agent3: agent3Result,
      agent4: agent4Result
    },
    telemetry: {
      totalPipelineLatencyMs: totalLatencyMs,
      orchestratorMode: geminiApiKey ? 'HYBRID_GEMINI_ASSISTED' : 'HIGH_PERFORMANCE_DETERMINISTIC_AI',
      timestamp: Date.now()
    },
    stepUpStatus: decision === 'CHALLENGE' ? 'PENDING_CHALLENGE' : (decision === 'APPROVE' ? 'VERIFIED' : 'FAILED')
  };

  // 4. Update Rolling Velocity Cache
  userVelocityHistory.push({
    timestamp: Date.now(),
    amount: Number(payload.amount),
    txnId
  });
  velocityCache.set(userId, userVelocityHistory);

  // 5. Append to Audit Trail (Keep latest 100 in memory)
  auditLogs.unshift(evaluationResult);
  if (auditLogs.length > 100) {
    auditLogs.pop();
  }

  return evaluationResult;
}
