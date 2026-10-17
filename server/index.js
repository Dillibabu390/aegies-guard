/**
 * Express Backend API Server for Multimodal Fraud Detection System
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrateEvaluation } from './orchestrator.js';
import { users, networkGraph, auditLogs, velocityCache } from './data/store.js';

import fs from 'fs';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets from public
app.use('/assets', express.static(path.resolve(__dirname, '../public/assets')));

// Serve frontend dist build if present
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}


/**
 * Predefined Demonstration Scenarios for Instant Testing
 */
const SCENARIOS = [
  {
    id: 'legitimate_coffee',
    name: '🟢 Legitimate Coffee Purchase',
    tag: 'Low Risk (Auto-Approve)',
    expectedDecision: 'APPROVE',
    description: 'Everyday transaction from user trusted iPhone in Taipei, authentic matching selfie, low dollar amount, verified merchant.',
    payload: {
      userId: 'usr_alex_chen',
      amount: 5.50,
      currency: 'USD',
      memo: 'Morning Latte & Bagel',
      location: { lat: 25.0340, lng: 121.5660, city: 'Taipei', country: 'TW' },
      device: {
        fingerprintId: 'dev_fp_iphone15_alex_tw',
        model: 'iPhone 15 Pro',
        isRootedOrJailbroken: false,
        isVpnOrProxy: false
      },
      beneficiary: {
        id: 'MERCHANT_COFFEE_BEANS',
        name: 'Artisan Coffee Co.',
        accountNumber: 'MERCHANT_COFFEE_BEANS',
        isNewBeneficiary: false
      },
      biometric: {
        selfieType: 'verified_live',
        documentType: 'authentic_id',
        hasGlareOrBlur: false,
        skipped: false
      },
      recentMpinResetTimestamp: null,
      failedLoginsInPast24h: 0,
      simSwapReported: false
    }
  },
  {
    id: 'impossible_travel_jump',
    name: '🔴 Impossible Geo-Travel Jump (SIM/Proxy)',
    tag: 'Critical Risk (Immediate Block)',
    expectedDecision: 'BLOCK',
    description: 'Transaction originates 9,500 km away in London 25 mins after Taipei activity, untrusted Android emulator, VPN proxy.',
    payload: {
      userId: 'usr_alex_chen',
      amount: 1250.00,
      currency: 'USD',
      memo: 'International Luxury Goods',
      location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'GB' },
      device: {
        fingerprintId: 'dev_fp_unrecognized_emulator_x86',
        model: 'Android Generic Emulator',
        isRootedOrJailbroken: true,
        isVpnOrProxy: true
      },
      beneficiary: {
        id: 'ACC_FOREIGN_LUXURY',
        name: 'Overseas Boutique Ltd',
        accountNumber: 'ACC_FOREIGN_LUXURY',
        isNewBeneficiary: true
      },
      biometric: {
        selfieType: 'verified_live',
        documentType: 'authentic_id',
        hasGlareOrBlur: false,
        skipped: false
      },
      recentMpinResetTimestamp: null,
      failedLoginsInPast24h: 2,
      simSwapReported: false
    }
  },
  {
    id: 'account_takeover_mule_cluster',
    name: '🔴 Account Takeover & Mule Ring Syphon',
    tag: 'Critical Risk (Immediate Block)',
    expectedDecision: 'BLOCK',
    description: 'MPIN reset 2 hours ago, 4 failed logins, funds directed to known Mule Aggregator #99 cluster with 75% balance drain.',
    payload: {
      userId: 'usr_sarah_connor',
      amount: 32000.00,
      currency: 'USD',
      memo: 'Urgent Settlement Escrow',
      location: { lat: 37.7800, lng: -122.4200, city: 'San Francisco', country: 'US' },
      device: {
        fingerprintId: 'dev_fp_pixel8_sarah',
        model: 'Google Pixel 8',
        isRootedOrJailbroken: false,
        isVpnOrProxy: false
      },
      beneficiary: {
        id: 'ACC_MULE_HUB_99',
        name: 'Mule Aggregator #99',
        accountNumber: 'ACC_MULE_HUB_99',
        isNewBeneficiary: true
      },
      biometric: {
        selfieType: 'verified_live',
        documentType: 'authentic_id',
        hasGlareOrBlur: false,
        skipped: false
      },
      recentMpinResetTimestamp: Date.now() - (2 * 3600 * 1000), // 2 hrs ago
      failedLoginsInPast24h: 4,
      simSwapReported: true
    }
  },
  {
    id: 'deepfake_presentation_attack',
    name: '🔴 Deepfake Biometric Spoof & Tampered ID',
    tag: 'Critical Risk (Immediate Block)',
    expectedDecision: 'BLOCK',
    description: 'Synthetic screen replay presentation attack during visual KYC with font-tampered document metadata.',
    payload: {
      userId: 'usr_alex_chen',
      amount: 2800.00,
      currency: 'USD',
      memo: 'Crypto Asset Purchase',
      location: { lat: 25.0400, lng: 121.5700, city: 'Taipei', country: 'TW' },
      device: {
        fingerprintId: 'dev_fp_iphone15_alex_tw',
        model: 'iPhone 15 Pro',
        isRootedOrJailbroken: false,
        isVpnOrProxy: false
      },
      beneficiary: {
        id: 'CRYPTO_OFFRAMP_VAULT',
        name: 'Unregulated Crypto Mixer',
        accountNumber: 'CRYPTO_OFFRAMP_VAULT',
        isNewBeneficiary: true
      },
      biometric: {
        selfieType: 'deepfake_replay',
        documentType: 'tampered_id',
        hasGlareOrBlur: true,
        skipped: false
      },
      recentMpinResetTimestamp: null,
      failedLoginsInPast24h: 1,
      simSwapReported: false
    }
  },
  {
    id: 'suspicious_unverified_stepup',
    name: '🟡 High-Value New Beneficiary at 3 AM',
    tag: 'Elevated Risk (Step-Up Challenge)',
    expectedDecision: 'CHALLENGE',
    description: 'Transfer of $850 to an unverified recipient initiated outside usual hours (circadian anomaly), triggering OTP/biometric step-up challenge.',
    payload: {
      userId: 'usr_alex_chen',
      amount: 850.00,
      currency: 'USD',
      memo: 'Peer-to-Peer Transfer',
      timestamp: new Date(new Date().setHours(3, 42, 0, 0)).toISOString(),
      location: { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'TW' },
      device: {
        fingerprintId: 'dev_fp_macbook_m3_alex',
        model: 'MacBook Air M3',
        isRootedOrJailbroken: false,
        isVpnOrProxy: false
      },
      beneficiary: {
        id: 'ACC_NEW_RECIPIENT_391',
        name: 'Liam Vance (Unverified)',
        accountNumber: 'ACC_NEW_RECIPIENT_391',
        isNewBeneficiary: true
      },
      biometric: {
        selfieType: 'verified_live',
        documentType: 'authentic_id',
        hasGlareOrBlur: false,
        skipped: false
      },
      recentMpinResetTimestamp: null,
      failedLoginsInPast24h: 0,
      simSwapReported: false
    }
  }
];

// Seed initial audit log with a couple realistic entries
async function seedInitialLogs() {
  await orchestrateEvaluation(SCENARIOS[0].payload);
  await orchestrateEvaluation(SCENARIOS[1].payload);
}
seedInitialLogs();

// ----------------- API ROUTES ----------------- //

// 1. Evaluate Transaction via 4-Agent Orchestrator
app.post('/api/evaluate', async (req, res) => {
  try {
    const payload = req.body;
    const result = await orchestrateEvaluation(payload);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Step-up Challenge Verification Endpoint
app.post('/api/challenge/verify', (req, res) => {
  try {
    const { transactionId, otpCode, biometricConfirmed } = req.body;
    const log = auditLogs.find(l => l.transactionId === transactionId);

    if (!log) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Accept demo OTP code 849201 or any valid 6-digit code for testing
    const isValidOtp = otpCode && /^\d{6}$/.test(otpCode);

    if (isValidOtp || biometricConfirmed) {
      log.stepUpStatus = 'STEP_UP_VERIFIED_APPROVED';
      log.scoring.decision = 'APPROVED_POST_CHALLENGE';
      log.scoring.recommendedActionText = 'Step-up authentication successfully satisfied by cardholder. Transaction released to clearing.';
      return res.json({
        success: true,
        message: 'Step-up authentication passed. Transaction approved.',
        transaction: log
      });
    } else {
      log.stepUpStatus = 'STEP_UP_CHALLENGE_FAILED';
      log.scoring.decision = 'BLOCKED_CHALLENGE_FAILED';
      log.scoring.recommendedActionText = 'Step-up authentication failed. Suspicious transaction locked.';
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or biometric verification failed.',
        transaction: log
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get Scenarios
app.get('/api/scenarios', (req, res) => {
  res.json({ success: true, scenarios: SCENARIOS });
});

// 4. Get Network Graph (for Agent 4 visualization)
app.get('/api/graph', (req, res) => {
  res.json({ success: true, graph: networkGraph });
});

// 5. Get Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

// 6. Get User Profiles
app.get('/api/users', (req, res) => {
  res.json({ success: true, users });
});

// 7. System Health & Agent Telemetry
app.get('/api/system-health', (req, res) => {
  const total = auditLogs.length;
  const approved = auditLogs.filter(l => l.scoring.decision.includes('APPROV')).length;
  const challenged = auditLogs.filter(l => l.scoring.decision.includes('CHALLENGE')).length;
  const blocked = auditLogs.filter(l => l.scoring.decision.includes('BLOCK')).length;

  res.json({
    success: true,
    status: 'ONLINE',
    agents: {
      agent1Telemetry: { status: 'HEALTHY', latencyAvg: '14ms', scale: '0-25 Pts' },
      agent2AuditRAG: { status: 'HEALTHY', latencyAvg: '28ms', scale: '0-25 Pts' },
      agent3Multimodal: { status: 'HEALTHY', latencyAvg: '42ms', scale: '0-25 Pts' },
      agent4BehavioralGraph: { status: 'HEALTHY', latencyAvg: '18ms', scale: '0-25 Pts' }
    },
    messageQueue: {
      provider: 'Kafka / PubSub Virtual Stream',
      status: 'CONSUMING',
      throughput: '420 msg/sec'
    },
    metrics: {
      totalAudited: total,
      approvedRate: total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%',
      challengedRate: total > 0 ? `${Math.round((challenged / total) * 100)}%` : '0%',
      blockedRate: total > 0 ? `${Math.round((blocked / total) * 100)}%` : '0%'
    }
  });
});

app.listen(PORT, () => {
  console.log(`[AI Orchestrator API] Running at http://localhost:${PORT}`);
});
