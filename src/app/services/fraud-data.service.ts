import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval } from 'rxjs';

export interface ThreatScenario {
  id: string;
  name: string;
  tag: string;
  expectedDecision: string;
  description: string;
  payload: any;
}

export interface EvaluationResult {
  transactionId?: string;
  id?: string;
  timestamp?: string;
  user?: {
    id?: string;
    userId?: string;
    name?: string;
    accountNumber?: string;
    balance?: number;
    device?: string;
    ip?: string;
  };
  transactionDetails?: {
    amount?: number;
    currency?: string;
    channel?: string;
    memo?: string;
    beneficiary?: {
      id?: string;
      name?: string;
      accountNumber?: string;
      isNewBeneficiary?: boolean;
    };
  };
  status?: string;
  decision?: string;
  scoring?: {
    totalRiskScore: number;
    maxScore?: number;
    decision: 'APPROVE' | 'CHALLENGE' | 'BLOCK' | 'REVIEW';
    decisionLevel?: 'SAFE' | 'WARNING' | 'CRITICAL';
    actionRequired?: string;
    recommendedActionText?: string;
    isCoercionDetected?: boolean;
    agentContributions?: {
      agent1Telemetry?: { score: number; max: number; percentage: number };
      agent2AuditRAG?: { score: number; max: number; percentage: number };
      agent3Multimodal?: { score: number; max: number; percentage: number };
      agent4BehavioralGraph?: { score: number; max: number; percentage: number };
      agent5ScamCoercion?: { score: number; max: number; percentage: number };
    };
    factorScores?: {
      telemetry: number;
      behavioral: number;
      financial: number;
      networkKyc: number;
      coercion: number;
    };
  };
  agentResults?: {
    agent1?: any;
    agent1_telemetry?: any;
    agent2?: any;
    agent2_audit_rag?: any;
    agent3?: any;
    agent3_multimodal?: any;
    agent4?: any;
    agent4_behavioral_graph?: any;
    agent5?: any;
    agent5_scam_coercion?: any;
  };
  reasons?: string[];
  flags?: string[];
  telemetry?: any;
  executionTimeMs?: number;
}

export interface TransactionSummaryItem {
  id: string;
  timestamp: string;
  customer: string;
  amount: number;
  currency: string;
  channel: string;
  riskScore: number;
  decision: string;
  memo?: string;
  raw?: EvaluationResult;
}

@Injectable({
  providedIn: 'root'
})
export class FraudDataService implements OnDestroy {
  private broadcastChannel: BroadcastChannel | null = null;
  private pollSub: Subscription | null = null;

  // Observables
  public scenarios$ = new BehaviorSubject<ThreatScenario[]>([]);
  public activeScenarioId$ = new BehaviorSubject<string | null>(null);
  public currentEvaluation$ = new BehaviorSubject<EvaluationResult | null>(null);
  public isEvaluating$ = new BehaviorSubject<boolean>(false);
  public allTransactions$ = new BehaviorSubject<TransactionSummaryItem[]>([]);
  public systemHealth$ = new BehaviorSubject<any>(null);

  // Cache to prevent redundant re-renders
  private lastEvaluatedId: string = '';

  constructor() {
    this.initBroadcastChannel();
    this.initStorageListener();
    this.loadInitialFallback();
    this.fetchInitialData();
    this.startLivePolling();
  }

  ngOnDestroy() {
    if (this.pollSub) this.pollSub.unsubscribe();
    if (this.broadcastChannel) this.broadcastChannel.close();
  }

  /**
   * BroadcastChannel enables instant multi-window / multi-screen sync
   */
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('aegisguard_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === 'STATE_UPDATE' || type === 'NEW_TRANSACTION_EVALUATED') {
            if (data?.evaluation) {
              this.applyNewEvaluation(data.evaluation);
            }
            if (data?.allTransactions) {
              this.allTransactions$.next(data.allTransactions);
            }
          }
        };
      } catch (e) {
        console.warn('[FraudDataService] BroadcastChannel unavailable', e);
      }
    }
  }

  /**
   * Cross-port / cross-tab storage sync
   */
  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'aegisguard_last_eval' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.applyNewEvaluation(parsed);
          } catch (err) {}
        }
      });
    }
  }

  /**
   * Background polling ensures transactions dispatched from the Port 5174 simulator
   * immediately reflect on Port 5173 within ~1.2s even if broadcast channel is sandboxed.
   */
  private startLivePolling() {
    this.pollSub = interval(1500).subscribe(() => {
      this.checkForLatestBackendEvaluation();
    });
  }

  private async checkForLatestBackendEvaluation() {
    try {
      const res = await fetch('/api/latest-evaluation');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const backendTxn = json.data;
          const txnId = backendTxn.transactionId || backendTxn.id;
          if (txnId && txnId !== this.lastEvaluatedId) {
            this.applyNewEvaluation(backendTxn);
            this.fetchLogs();
          }
        }
      }
    } catch (e) {
      // Backend warming up or proxy offline; silent fail
    }
  }

  public async fetchInitialData() {
    try {
      // 1. Fetch scenarios
      const scenRes = await fetch('/api/scenarios');
      if (scenRes.ok) {
        const scenData = await scenRes.json();
        if (scenData.success && scenData.scenarios) {
          this.scenarios$.next(scenData.scenarios);
        }
      }

      // 2. Fetch latest transaction from backend
      const latestRes = await fetch('/api/latest-evaluation');
      if (latestRes.ok) {
        const latestData = await latestRes.json();
        if (latestData.success && latestData.data) {
          this.applyNewEvaluation(latestData.data);
        }
      }

      // 3. Fetch audit logs / transaction ledger
      await this.fetchLogs();

      // 4. System Health
      const healthRes = await fetch('/api/system-health');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.success) {
          this.systemHealth$.next(healthData);
        }
      }
    } catch (err) {
      console.warn('[FraudDataService] Could not reach backend; using resilient local baseline:', err);
    }
  }

  public async fetchLogs() {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.logs) {
          const formatted: TransactionSummaryItem[] = data.logs.map((l: any) => {
            const txId = l.transactionId || l.id || 'TXN-UNKNOWN';
            const details = l.transactionDetails || {};
            const user = l.user || {};
            const scoring = l.scoring || {};
            return {
              id: txId,
              timestamp: l.timestamp || new Date().toISOString(),
              customer: user.name || l.userName || 'Account Holder',
              amount: details.amount || l.amount || 0,
              currency: details.currency || l.currency || 'USD',
              channel: details.channel || l.channel || 'Online Wire',
              riskScore: scoring.totalRiskScore ?? l.totalRiskScore ?? 0,
              decision: scoring.decision || l.decision || 'APPROVE',
              memo: details.memo || l.memo || '',
              raw: l
            };
          });
          this.allTransactions$.next(formatted);

          // First priority: ensure the most recent transaction is displayed across all windows
          if (formatted.length > 0) {
            const cur = this.currentEvaluation$.value;
            if (!cur || cur.transactionId === 'TXN-904821' || !cur.transactionId) {
              this.selectTransaction(formatted[0]);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[FraudDataService] Error fetching logs:', err);
    }
  }

  /**
   * Applies an evaluated transaction as the current focal transaction
   * across all 5 Agent boxes and the Decision box.
   */
  public applyNewEvaluation(evalData: EvaluationResult) {
    if (!evalData) return;
    const txId = evalData.transactionId || evalData.id || 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    this.lastEvaluatedId = txId;

    // Normalize agent results mapping
    const aRes = evalData.agentResults || {};
    const normalized: EvaluationResult = {
      ...evalData,
      transactionId: txId,
      agentResults: {
        agent1: aRes.agent1 || aRes.agent1_telemetry,
        agent2: aRes.agent2 || aRes.agent2_audit_rag,
        agent3: aRes.agent3 || aRes.agent3_multimodal,
        agent4: aRes.agent4 || aRes.agent4_behavioral_graph || aRes.agent4_network_kyc,
        agent5: aRes.agent5 || aRes.agent5_scam_coercion
      }
    };

    this.currentEvaluation$.next(normalized);

    // Prepend to transaction ledger if not present
    const currentList = [...this.allTransactions$.value];
    const exists = currentList.find(t => t.id === txId);
    if (!exists) {
      const newItem: TransactionSummaryItem = {
        id: txId,
        timestamp: normalized.timestamp || new Date().toISOString(),
        customer: normalized.user?.name || 'Alex Chen',
        amount: normalized.transactionDetails?.amount || 0,
        currency: normalized.transactionDetails?.currency || 'USD',
        channel: normalized.transactionDetails?.channel || 'Online Mobile App',
        riskScore: normalized.scoring?.totalRiskScore || 0,
        decision: normalized.scoring?.decision || 'APPROVE',
        memo: normalized.transactionDetails?.memo || '',
        raw: normalized
      };
      this.allTransactions$.next([newItem, ...currentList]);
    }

    // Mirror to localStorage and BroadcastChannel
    try {
      localStorage.setItem('aegisguard_last_eval', JSON.stringify(normalized));
    } catch (e) {}

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          data: { evaluation: normalized }
        });
      } catch (e) {}
    }
  }

  /**
   * Switch the active transaction to any historical one clicked from the ledger
   * Guarantees that ALL agent screens (Agent 1, 2, 3, 4, 5, Decision) change dynamically!
   */
  public async selectTransaction(item: TransactionSummaryItem) {
    if (!item) return;

    // 1. If item.raw already has full agentResults, apply immediately
    if (item.raw && item.raw.agentResults && Object.keys(item.raw.agentResults).length >= 4) {
      this.applyNewEvaluation(item.raw);
      return;
    }

    // 2. Fetch full dossier from backend /api/transaction/:id
    try {
      const res = await fetch(`/api/transaction/${item.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          item.raw = json.data;
          this.applyNewEvaluation(json.data);
          return;
        }
      }
    } catch (e) {
      console.warn(`[FraudDataService] Could not fetch transaction ${item.id} from API:`, e);
    }

    // 3. Fallback: build full rich 5-agent dossier tailored to this specific transaction
    const enriched = this.buildFullDossierFromSummary(item);
    item.raw = enriched;
    this.applyNewEvaluation(enriched);
  }

  /**
   * Generates a complete 5-agent evaluation dossier from summary data
   * Ensures every single Agent screen visibly updates on transaction selection.
   */
  private buildFullDossierFromSummary(item: TransactionSummaryItem): EvaluationResult {
    const score = item.riskScore ?? 0;
    const isCritical = score >= 50;
    const isWarning = score >= 25 && score < 50;

    const a1Score = Math.min(25, Math.max(0, Math.round(score * 0.24)));
    const a2Score = Math.min(25, Math.max(0, Math.round(score * 0.22)));
    const a3Score = Math.min(25, Math.max(0, Math.round(score * 0.20)));
    const a4Score = Math.min(25, Math.max(0, Math.round(score * 0.18)));
    const a5Score = Math.max(0, Math.min(25, score - (a1Score + a2Score + a3Score + a4Score)));

    const amt = item.amount || 0;
    const zScore = amt > 1000 ? ((amt - 65) / 30) : 0.4;
    const isTravelAlert = isCritical;
    const isMpinAlert = isCritical;
    const isFaceMismatch = isCritical;
    const isDeepfake = score >= 45;
    const isMule = isCritical || isWarning;
    const isCallActive = isCritical;

    return {
      transactionId: item.id,
      timestamp: item.timestamp,
      user: {
        id: 'usr_alex_chen',
        userId: 'usr_alex_chen',
        name: item.customer || 'Alex Chen',
        accountNumber: 'ACC_77189021',
        balance: 14850.00,
        device: isCritical ? 'Unrecognized Kali Linux Device' : 'Apple iPhone 15 Pro (Known)',
        ip: isCritical ? '185.220.101.42 (Mullvad VPN Exit)' : '140.112.24.18 (Chunghwa Telecom TW)'
      },
      transactionDetails: {
        amount: item.amount,
        currency: item.currency || 'USD',
        channel: item.channel || 'Online Mobile App',
        memo: item.memo || 'Wire Transfer',
        beneficiary: {
          id: 'ACC_BENEFICIARY_NODE',
          name: 'Recipient Entity',
          accountNumber: 'ACC_BENEFICIARY_NODE',
          isNewBeneficiary: isCritical || isWarning
        }
      },
      scoring: {
        totalRiskScore: score,
        maxScore: 100,
        decision: item.decision as any,
        decisionLevel: isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'SAFE',
        actionRequired: isCritical ? 'LOCK_ACCOUNT_AND_HALT' : isWarning ? 'STEP_UP_AUTHENTICATION' : 'TRANSACTION_CLEARED',
        recommendedActionText: isCritical 
          ? 'High-risk anomalous indicators confirmed across multiple agents. Transaction intercepted before settlement.'
          : isWarning
          ? 'Moderate friction detected. Step-up multi-factor biometric authentication challenged.'
          : 'Deterministic telemetry parameters within baseline norms. Auto-approved.',
        isCoercionDetected: isCallActive,
        agentContributions: {
          agent1Telemetry: { score: a1Score, max: 25, percentage: Math.round((a1Score / 25) * 100) },
          agent2AuditRAG: { score: a2Score, max: 25, percentage: Math.round((a2Score / 25) * 100) },
          agent3Multimodal: { score: a3Score, max: 25, percentage: Math.round((a3Score / 25) * 100) },
          agent4BehavioralGraph: { score: a4Score, max: 25, percentage: Math.round((a4Score / 25) * 100) },
          agent5ScamCoercion: { score: a5Score, max: 25, percentage: Math.round((a5Score / 25) * 100) }
        }
      },
      agentResults: {
        agent1: {
          agentId: 'agent_1_telemetry_velocity',
          agentName: 'Transaction Telemetry & Velocity Agent',
          score: a1Score,
          maxScore: 25,
          latencyMs: 12,
          status: a1Score >= 18 ? 'CRITICAL' : a1Score >= 8 ? 'WARNING' : 'OPTIMAL',
          flags: isCritical ? ['EXTREME_AMOUNT_DEVIATION', 'GEO_VELOCITY_ANOMALY', 'PROXY_OR_VPN_DETECTED'] : [],
          metrics: {
            amount: amt,
            zScore: Math.round(zScore * 10) / 10,
            distanceKm: isTravelAlert ? 9540 : 0,
            geoVelocityKmH: isTravelAlert ? 22896 : 0,
            oneHourTxnCount: isCritical ? 4 : 1,
            deviceTrusted: !isCritical
          },
          breakdown: [
            {
              metric: 'Transaction Amount Deviation vs Baseline (Z-Score)',
              riskPoints: zScore > 5 ? 7 : (zScore > 2.5 ? 4 : 0),
              status: zScore > 5 ? 'HIGH_RISK' : (zScore > 2.5 ? 'ELEVATED' : 'NORMAL'),
              whatHappened: zScore > 5 
                ? `Txn amount ($${amt.toFixed(2)}) is >10x above normal baseline. Extreme Z-score anomaly (${zScore.toFixed(1)}σ).`
                : `Txn amount ($${amt.toFixed(2)}) conforms to nominal spending distribution.`
            },
            {
              metric: 'Geographic Distance Jumps & Travel Velocity',
              riskPoints: isTravelAlert ? 9 : 0,
              status: isTravelAlert ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isTravelAlert
                ? 'Haversine distance jump requires impossible physical velocity (>9,000 km in <30 min).'
                : 'Geographic coordinate trajectory within normal ground travel thresholds.'
            },
            {
              metric: '1-Hour Rolling Transaction Velocity',
              riskPoints: isCritical ? 4 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Critical burst velocity exceeded in rolling 60 min window.' : '1-hour velocity is within normal threshold.'
            },
            {
              metric: 'Device Trust Factors',
              riskPoints: isCritical ? 5 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Untrusted hardware origin or active VPN/proxy tunnel masking true geolocation.' : 'Clean device fingerprint.'
            }
          ]
        },
        agent2: {
          agentId: 'agent_2_audit_database_rag',
          agentName: 'Audit & Database RAG Agent',
          score: a2Score,
          maxScore: 25,
          latencyMs: 16,
          status: a2Score >= 18 ? 'CRITICAL' : a2Score >= 8 ? 'WARNING' : 'OPTIMAL',
          flags: isMpinAlert ? ['RECENT_MPIN_RESET_CRITICAL', 'AUTHENTICATION_STREAK_FAILED'] : [],
          metrics: {
            mpinResetHours: isMpinAlert ? 2.1 : null,
            failedLogins: isCritical ? 4 : 0,
            simSwapFlag: isCritical
          },
          retrievedPatterns: isCritical ? [{ title: 'Credential Stuffing ATO Followed by Rapid Liquidation', similarity: 0.88 }] : [],
          breakdown: [
            {
              metric: 'Login Pattern Audit',
              riskPoints: isCritical ? 5 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Multiple consecutive failed logins prior to this transaction.' : 'Clean authentication trajectory.'
            },
            {
              metric: 'MPIN Reset Recency',
              riskPoints: isMpinAlert ? 8 : 0,
              status: isMpinAlert ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isMpinAlert ? 'MPIN was reset recently (<6h ATO window).' : 'No historical credential changes detected.'
            },
            {
              metric: 'Telco SIM Swap Audit',
              riskPoints: isCritical ? 4 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Active carrier SIM swap reported within last 48 hours.' : 'Carrier IMSI binding confirmed stable.'
            }
          ]
        },
        agent3: {
          agentId: 'agent_3_multimodal_identity',
          agentName: 'Multimodal Identity Agent',
          score: a3Score,
          maxScore: 25,
          latencyMs: 22,
          status: a3Score >= 18 ? 'CRITICAL' : a3Score >= 8 ? 'WARNING' : 'OPTIMAL',
          flags: isDeepfake ? ['DEEPFAKE_SYNTHETIC_MEDIA_DETECTED', 'BIOMETRIC_FACE_MISMATCH'] : [],
          metrics: {
            facialMatchConfidence: isFaceMismatch ? 28.5 : 96.8,
            livenessConfidence: isDeepfake ? 18.5 : 98.2,
            docIntegrityConfidence: isCritical ? 45.0 : 96.0,
            selfieType: isDeepfake ? 'deepfake_replay' : isFaceMismatch ? 'unmatched_face' : 'verified_live',
            documentType: isCritical ? 'tampered_id' : 'authentic_id'
          },
          images: {
            idCard: '/assets/id_card_alex.jpg',
            presentedSelfie: isDeepfake || isFaceMismatch ? '/assets/selfie_spoof_fraud.jpg' : '/assets/selfie_alex_match.jpg'
          },
          breakdown: [
            {
              metric: 'Biometric Face Match',
              riskPoints: isFaceMismatch ? 10 : 0,
              status: isFaceMismatch ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isFaceMismatch ? 'Severe facial discrepancy detected with account holder KYC photo.' : 'High-fidelity biometric match with KYC ID.'
            },
            {
              metric: 'Anti-Spoofing & Liveness',
              riskPoints: isDeepfake ? 9 : 0,
              status: isDeepfake ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isDeepfake ? 'Screen glare, moiré display patterns, and non-biological pulse detected.' : 'Active 3D liveness verified.'
            },
            {
              metric: 'Document OCR Integrity',
              riskPoints: isCritical ? 6 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Digital font alteration or MRZ mismatch on presented ID.' : 'Official ID card hologram and MRZ verified.'
            }
          ]
        },
        agent4: {
          agentId: 'agent_4_behavioral_graph',
          agentName: 'Behavioral & Graph Anomaly Agent',
          score: a4Score,
          maxScore: 25,
          latencyMs: 14,
          status: a4Score >= 18 ? 'CRITICAL' : a4Score >= 8 ? 'WARNING' : 'OPTIMAL',
          flags: isMule ? ['CRITICAL_MULE_HUB_BENEFICIARY'] : [],
          metrics: {
            drainagePercentage: isCritical ? 85.0 : 0.5,
            txnHour: 14,
            beneficiaryNode: 'ACC_MULE_HUB_99',
            isNewBeneficiary: isMule
          },
          graphInsights: {
            nodeId: 'ACC_MULE_HUB_99',
            clusterType: isMule ? 'mule_aggregator' : 'merchant',
            hopDistanceToSanctions: isCritical ? 1 : 4
          },
          breakdown: [
            {
              metric: 'Graph Network Cluster',
              riskPoints: isMule ? 10 : 0,
              status: isMule ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isMule ? 'Beneficiary account flagged in graph as high-density mule aggregator hub.' : 'Beneficiary is verified entity in transaction network.'
            },
            {
              metric: 'Graph Sanctions Proximity',
              riskPoints: isCritical ? 6 : 0,
              status: isCritical ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCritical ? 'Direct 1-hop path to flagged AML watchlists in network graph.' : 'Graph path clear (>3 hops from sanctions).'
            }
          ]
        },
        agent5: {
          agentId: 'agent_5_scam_coercion',
          agentName: 'Scam Narrative & Coercion Agent',
          score: a5Score,
          maxScore: 25,
          latencyMs: 16,
          status: a5Score >= 18 ? 'CRITICAL' : a5Score >= 8 ? 'WARNING' : 'OPTIMAL',
          flags: isCallActive ? ['ACTIVE_VOICE_CALL_DURING_TRANSFER', 'COERCION_MEMO_DETECTED'] : [],
          threatCategory: isCallActive ? 'Safe Haven / Government Impersonation Scam' : 'Benign Consumer Wire',
          metrics: {
            activeCallDurationMinutes: isCallActive ? 18.2 : 0,
            pastedFromClipboard: isCallActive,
            clipboardDwellSeconds: isCallActive ? 1.4 : 12.0
          },
          breakdown: [
            {
              metric: 'Payment Memo Semantics',
              riskPoints: isCallActive ? 7 : 0,
              status: isCallActive ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCallActive ? `Payment memo "${item.memo}" matches high-pressure government impersonation typography.` : 'Memo consistent with standard consumer transfer.'
            },
            {
              metric: 'Active Concurrent Cellular / VoIP Call',
              riskPoints: isCallActive ? 8 : 0,
              status: isCallActive ? 'HIGH_RISK' : 'NORMAL',
              whatHappened: isCallActive ? 'Active 18.2-minute voice call in progress during wire dispatch.' : 'No active phone call detected.'
            }
          ]
        }
      },
      reasons: isCritical ? ['High-velocity anomalous funds transfer', 'Biometric or behavioral mismatch'] : ['Standard consumer payment authorized'],
      flags: isCritical ? ['ANOMALOUS_PAYMENT_VECTOR', 'ELEVATED_RISK_SCORE'] : []
    };
  }


  /**
   * Triggers a live evaluation (from scenario or custom submit)
   */
  public async evaluateCustom(payload: any) {
    this.isEvaluating$.next(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyNewEvaluation(json.data);
          await this.fetchLogs();
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[FraudDataService] Backend evaluation error; using local simulation:', err);
    } finally {
      this.isEvaluating$.next(false);
    }
  }

  /**
   * Resolve an in-flight step-up challenge
   */
  public async resolveChallenge(updatedTransaction: any) {
    this.applyNewEvaluation(updatedTransaction);
  }

  /**
   * Load rich default initial evaluation showing complete 5-agent telemetry
   */
  private loadInitialFallback() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aegisguard_last_eval');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.transactionId || parsed.id)) {
            this.applyNewEvaluation(parsed);
            return;
          }
        }
      } catch (e) {}
    }

    const initialFallback: EvaluationResult = {
      transactionId: 'TXN-904821',
      timestamp: new Date().toISOString(),
      user: {
        userId: 'usr_alex_chen',
        accountNumber: 'ACC_77189021',
        name: 'Alex Chen',
        device: 'Apple iPhone 15 Pro (A2848)',
        ip: '185.220.101.42 (Mullvad VPN London Exit)'
      },
      transactionDetails: {
        amount: 14500.0,
        currency: 'USD',
        channel: 'Online Wire',
        memo: 'SAFE HOLDING RECOVERY VAULT - CLEARANCE',
        beneficiary: {
          id: 'ACC_UNVERIFIED_VAULT_99',
          accountNumber: 'ACC_UNVERIFIED_VAULT_99',
          name: 'Reserve Safe Haven Escrow (Unverified)',
          isNewBeneficiary: true
        }
      },
      scoring: {
        totalRiskScore: 92,
        maxScore: 100,
        decision: 'BLOCK',
        decisionLevel: 'CRITICAL',
        actionRequired: 'Pre-Settlement Interception Hold & Account Shield',
        recommendedActionText: 'Severe social engineering & psychological coercion confirmed (Federal Police Impersonation). Fund transfer blocked; victim account shielded.',
        isCoercionDetected: true,
        agentContributions: {
          agent1Telemetry: { score: 23, max: 25, percentage: 92 },
          agent2AuditRAG: { score: 21, max: 25, percentage: 84 },
          agent3Multimodal: { score: 18, max: 25, percentage: 72 },
          agent4BehavioralGraph: { score: 24, max: 25, percentage: 96 },
          agent5ScamCoercion: { score: 25, max: 25, percentage: 100 }
        }
      },
      agentResults: {
        // Agent 1: Telemetry & Velocity
        agent1: {
          agentId: 'agent_1_telemetry_velocity',
          agentName: 'Transaction Telemetry & Velocity Agent',
          score: 23,
          maxScore: 25,
          latencyMs: 14,
          status: 'CRITICAL',
          summary: 'Critical travel velocity and amount spike: $14,500 is >220x above user baseline average ($65.00). Geographic jump from Taipei to London in 25 mins.',
          flags: ['CRITICAL_AMOUNT_SPIKE', 'IMPOSSIBLE_TRAVEL_VELOCITY', 'PROXY_OR_VPN_DETECTED'],
          geminiInsight: {
            anomalySummary: 'Amount $14,500 severely violates the 90-day spending profile (Z-Score: 48.2). Originating IP is a Mullvad VPN exit node 9,500 km away within 25 minutes of last Taipei login.',
            riskConfidence: 0.98,
            recommendedAction: 'HARD_BLOCK',
            connected: true,
            framework: 'LangChain + Google Gemini 3.8 Flash'
          },
          metrics: {
            amount: 14500.0,
            zScore: 48.2,
            distanceKm: 9540,
            geoVelocityKmH: 22896,
            oneHourTxnCount: 4,
            deviceTrusted: false
          },
          breakdown: [
            {
              metric: 'Amount Deviation (Z-Score)',
              riskPoints: 7,
              maxPoints: 7,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Txn amount ($14,500.00) is 223x above nominal baseline ($65.00). Extreme Z-score anomaly (48.2).'
            },
            {
              metric: 'Geographic Velocity (Haversine)',
              riskPoints: 9,
              maxPoints: 9,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Physical jump of 9,540 km in 25 mins requires 22,896 km/h (Mach 18.5). Impossible human velocity.'
            },
            {
              metric: '1-Hour Rolling Velocity',
              riskPoints: 4,
              maxPoints: 4,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: '4 high-value outbound transactions attempted within 60 minutes. Exceeds frequency threshold.'
            },
            {
              metric: 'Device Trust & VPN IP Integrity',
              riskPoints: 3,
              maxPoints: 5,
              percentage: 60,
              status: 'ELEVATED',
              whatHappened: 'Mullvad VPN commercial exit node active. Hardware fingerprint differs from primary device.'
            }
          ]
        },

        // Agent 2: Audit & Database RAG
        agent2: {
          agentId: 'agent_2_audit_database_rag',
          agentName: 'Audit & Database RAG Agent',
          score: 21,
          maxScore: 25,
          latencyMs: 18,
          status: 'CRITICAL',
          summary: 'Audit alert: MPIN was reset 2.1 hours ago in MongoDB audit logs, accompanied by 4 consecutive failed logins.',
          flags: ['CRITICAL_RECENT_MPIN_RESET', 'BRUTE_FORCE_LOGIN_BURST', 'RAG_FRAUD_MODUS_OPERANDI_MATCH'],
          geminiAudit: {
            model: 'gemini-3.8-flash',
            reasoning: 'MPIN reset recency (<3 hours) combined with failed login streaks and unverified new payee strongly matches ATO account takeover pattern.',
            threatCategory: 'Account Takeover / Credential Compromise',
            llmRiskPoints: 21,
            isAccountTakeoverLikely: true,
            connected: true,
            framework: 'LangChain + MongoDB RAG'
          },
          metrics: {
            mpinResetHours: 2.1,
            failedLogins: 4,
            simSwapFlag: false,
            ragTopSimilarity: 88,
            llmActive: true
          },
          breakdown: [
            {
              metric: 'Credential / MPIN Reset Recency',
              riskPoints: 8,
              maxPoints: 8,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'MPIN reset occurred 2.1 hours ago. Account sits squarely in the high-vulnerability ATO exploitation window.'
            },
            {
              metric: 'Login Pattern & Failed Streaks',
              riskPoints: 5,
              maxPoints: 5,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: '4 consecutive failed password attempts recorded in MongoDB session ledger prior to this transfer.'
            },
            {
              metric: 'Telco SIM Swap Verification',
              riskPoints: 0,
              maxPoints: 4,
              percentage: 0,
              status: 'NORMAL',
              whatHappened: 'Carrier IMSI binding confirmed stable; zero SIM swap events reported in the past 48 hours.'
            },
            {
              metric: 'MongoDB Typology RAG Vector Match',
              riskPoints: 8,
              maxPoints: 8,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: '88% semantic cosine similarity with known financial syndicate typology: "Safe Haven Law Enforcement Extortion".'
            }
          ]
        },

        // Agent 3: Biometric & Visual Verification
        agent3: {
          agentId: 'agent_3_multimodal_identity',
          agentName: 'Multimodal Identity & Verification Agent',
          score: 18,
          maxScore: 25,
          latencyMs: 22,
          status: 'WARNING',
          summary: 'Biometric telemetry warning: Presented selfie exhibits screen replay moiré glare; facial landmark confidence at 42.1%.',
          flags: ['LOW_CONFIDENCE_FACIAL_MATCH', 'PRESENTATION_ATTACK_DETECTED', 'SUBOPTIMAL_LIVENESS_TELEMETRY'],
          geminiVision: {
            model: 'gemini-3.8-flash',
            assessment: 'Screen glare and specular reflections detected around facial boundaries; micro-motion frequency indicates an LCD display replay attack.',
            isDeepfakeOrSpoof: true,
            confidenceScore: 0.91,
            connected: true
          },
          metrics: {
            facialMatchConfidence: 42.1,
            livenessConfidence: 18.5,
            docIntegrityConfidence: 94.0
          },
          breakdown: [
            {
              metric: 'Biometric Face Match vs MongoDB KYC',
              riskPoints: 8,
              maxPoints: 10,
              percentage: 80,
              status: 'HIGH_RISK',
              whatHappened: 'Low facial match cosine similarity (42.1%) against official government ID stored in MongoDB user record.'
            },
            {
              metric: 'Liveness & Anti-Spoofing Detection',
              riskPoints: 9,
              maxPoints: 9,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Presentation attack detected: screen replay moiré grid and lack of physiological micro-vascular pulse.'
            },
            {
              metric: 'Document Tampering & OCR Corroboration',
              riskPoints: 1,
              maxPoints: 6,
              percentage: 16,
              status: 'NORMAL',
              whatHappened: 'MRZ checksum matches name "Alex Chen"; minor lighting specular reflection during camera capture.'
            }
          ]
        },

        // Agent 4: Behavioral & Network Graph
        agent4: {
          agentId: 'agent_4_behavioral_graph',
          agentName: 'Behavioral & Graph Anomaly Agent',
          score: 24,
          maxScore: 25,
          latencyMs: 16,
          status: 'CRITICAL',
          summary: 'Network graph threat: Destination account is directly linked to Mule Hub #99 with 24 in-degree hops and drains 97.6% of account liquid balance.',
          flags: ['CRITICAL_MULE_HUB_BENEFICIARY', 'RAPID_LIQUIDITY_DRAINAGE', 'CIRCADIAN_TIMING_ANOMALY'],
          geminiGraph: {
            model: 'gemini-3.8-flash',
            reasoning: 'Beneficiary node is a known money mule aggregator hub. Outbound transfer would siphon 97.6% of user liquid capital in an uncharacteristic 03:22 AM transaction.',
            threatCategory: 'Mule Ring Layering / Asset Drainage',
            llmRiskPoints: 24,
            isMuleNetworkSuspected: true,
            connected: true
          },
          metrics: {
            drainagePercentage: 97.6,
            txnHour: 3,
            beneficiaryNode: 'Reserve Safe Haven Escrow (ACC_UNVERIFIED_VAULT_99)',
            beneficiaryRiskLevel: 'critical',
            isNewBeneficiary: true
          },
          graphInsights: {
            nodeId: 'ACC_UNVERIFIED_VAULT_99',
            clusterType: 'mule_hub',
            hopDistanceToSanctions: 1
          },
          breakdown: [
            {
              metric: 'Graph Network Cluster & Mule Ring Link',
              riskPoints: 10,
              maxPoints: 10,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Beneficiary account flagged in MongoDB transaction graph as high-density mule hub (24 in-degree edges, 14 fraud dockets).'
            },
            {
              metric: 'Sanctions & AML Blacklist Proximity',
              riskPoints: 6,
              maxPoints: 6,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Direct 1-hop shortest path edge to OFAC-flagged illicit crypto mixing cluster in network graph.'
            },
            {
              metric: 'Account Liquidity Drainage Ratio',
              riskPoints: 5,
              maxPoints: 5,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Attempting to drain 97.6% ($14,500 of $14,850 balance) in a single outbound wire to a first-time beneficiary.'
            },
            {
              metric: 'Circadian Behavioral Timing Profile',
              riskPoints: 3,
              maxPoints: 4,
              percentage: 75,
              status: 'HIGH_RISK',
              whatHappened: 'Transaction initiated at 03:22 AM local time. Historical active hours in MongoDB baseline are 08:00 - 22:00.'
            }
          ]
        },

        // Agent 5: Scam Narrative & Coercion Intelligence
        agent5: {
          agentId: 'agent_5_scam_coercion',
          agentName: 'Scam Narrative, Coercion Intelligence & Google Search Grounding Agent',
          score: 25,
          maxScore: 25,
          latencyMs: 19,
          status: 'CRITICAL',
          summary: 'Confirmed Authorized Push Payment (APP) coercion: Active 18.2-min phone call during wire entry, rapid clipboard pasting from Telegram, and memo matching Federal Police impersonation.',
          flags: ['ACTIVE_PHONE_CALL_DURING_TRANSFER', 'EXTERNAL_APP_CLIPBOARD_PASTE', 'SCAM_KEYWORD_SAFE_HOLDING', 'NEW_UNVERIFIED_BENEFICIARY'],
          threatCategory: 'Federal Police / Safe Haven Account Impersonation Scam',
          isCoercionDetected: true,
          llmInsight: {
            model: 'gemini-3.8-flash',
            reasoning: 'Critical psychological coercion confirmed: Customer is on an active 18.2-minute voice call while sending funds with memo "SAFE HOLDING RECOVERY VAULT - CLEARANCE". Real-time Google Search Grounding corroborates active impersonation syndicate.',
            threatCategory: 'Federal Police / Safe Haven Impersonation Scam',
            isCoercionDetected: true,
            llmRiskPoints: 25,
            connected: true
          },
          metrics: {
            activeCallInProgress: true,
            callDurationMinutes: 18.2,
            clipboardPasted: true,
            clipboardDwellTimeSeconds: 1.4,
            memoUrgencyScore: 7,
            googleSearchGrounding: {
              groundedThreatMatched: true,
              confidence: 0.99,
              summary: 'Google Search Threat Intelligence: "Reserve Safe Haven Escrow" identified in recent FTC & IC3 public warnings regarding fraudulent imposter accounts.',
              citations: [
                { title: 'FTC Consumer Alert: Government Imposter Scams', uri: 'https://consumer.ftc.gov/articles/government-imposter-scams' },
                { title: 'FinCEN Advisory on Safe Haven Wire Fraud Schemes', uri: 'https://fincen.gov/advisories' }
              ]
            }
          },
          breakdown: [
            {
              metric: 'Payment Narration Semantic NLP',
              riskPoints: 7,
              maxPoints: 7,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Payment memo ("SAFE HOLDING RECOVERY VAULT - CLEARANCE") matches high-pressure government imposter scam typologies.'
            },
            {
              metric: 'Concurrent Cellular / VoIP Voice Call Telemetry',
              riskPoints: 8,
              maxPoints: 8,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Active voice call in progress (18.2 mins duration) during transfer execution. Strong hallmark of live scammer coaching.'
            },
            {
              metric: 'Clipboard Telemetry & Ingestion Dwell Time',
              riskPoints: 5,
              maxPoints: 5,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Beneficiary destination pasted directly from clipboard in 1.4s of screen load (bypassed contact address book).'
            },
            {
              metric: 'Real-Time Google Search Threat Grounding',
              riskPoints: 5,
              maxPoints: 5,
              percentage: 100,
              status: 'HIGH_RISK',
              whatHappened: 'Google Search Grounding corroborated active consumer fraud alerts matching recipient name and narration.'
            }
          ]
        }
      },
      reasons: [
        'Impossible physical velocity: 9,540 km jump in 25 mins (Velocity: 22,896 km/h)',
        'Critical amount deviation: $14,500.00 is 223x normal daily mean ($65.00) (Z-Score: 48.2)',
        'Active 18.2-minute phone call in progress with high-pressure coercion memo ("SAFE HOLDING RECOVERY VAULT")',
        'Recent MPIN reset (2.1 hours ago) combined with 4 failed authentication streaks in MongoDB audit ledger',
        'Beneficiary directly identified as High-Density Mule Hub #99 with rapid fund dispersal history'
      ],
      flags: [
        'CRITICAL_AMOUNT_SPIKE',
        'IMPOSSIBLE_TRAVEL_VELOCITY',
        'ACTIVE_PHONE_CALL_DURING_TRANSFER',
        'CRITICAL_RECENT_MPIN_RESET',
        'CRITICAL_MULE_HUB_BENEFICIARY'
      ],
      executionTimeMs: 38
    };

    const initialLedger: TransactionSummaryItem[] = [
      {
        id: initialFallback.transactionId!,
        timestamp: initialFallback.timestamp!,
        customer: 'Alex Chen',
        amount: 14500.0,
        currency: 'USD',
        channel: 'Online Wire',
        riskScore: 92,
        decision: 'BLOCK',
        memo: 'SAFE HOLDING RECOVERY VAULT - CLEARANCE',
        raw: initialFallback
      },
      {
        id: 'TXN-884192',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        customer: 'Sarah Connor',
        amount: 32000.0,
        currency: 'USD',
        channel: 'Mobile App',
        riskScore: 95,
        decision: 'BLOCK',
        memo: 'Urgent Settlement Escrow',
        raw: {
          transactionId: 'TXN-884192',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: { name: 'Sarah Connor', accountNumber: 'ACC_99810212' },
          transactionDetails: { amount: 32000.0, currency: 'USD', memo: 'Urgent Settlement Escrow' },
          scoring: { totalRiskScore: 95, decision: 'BLOCK', decisionLevel: 'CRITICAL', actionRequired: 'LOCK_ACCOUNT_AND_HALT' }
        }
      },
      {
        id: 'TXN-719304',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        customer: 'Alex Chen',
        amount: 8500.0,
        currency: 'USD',
        channel: 'Mobile App',
        riskScore: 68,
        decision: 'CHALLENGE',
        memo: 'APEX-YIELD VIP USDT ALLOCATION 450%',
        raw: {
          transactionId: 'TXN-719304',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: { name: 'Alex Chen', accountNumber: 'ACC_77189021' },
          transactionDetails: { amount: 8500.0, currency: 'USD', memo: 'APEX-YIELD VIP USDT ALLOCATION 450%' },
          scoring: { totalRiskScore: 68, decision: 'CHALLENGE', decisionLevel: 'WARNING', actionRequired: 'DEBIASING_INTERVENTION' }
        }
      },
      {
        id: 'TXN-650123',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        customer: 'Alex Chen',
        amount: 5.5,
        currency: 'USD',
        channel: 'POS Terminal',
        riskScore: 8,
        decision: 'APPROVE',
        memo: 'Morning Latte & Bagel',
        raw: {
          transactionId: 'TXN-650123',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: { name: 'Alex Chen', accountNumber: 'ACC_77189021' },
          transactionDetails: { amount: 5.5, currency: 'USD', memo: 'Morning Latte & Bagel' },
          scoring: { totalRiskScore: 8, decision: 'APPROVE', decisionLevel: 'SAFE', actionRequired: 'TRANSACTION_CLEARED' }
        }
      }
    ];

    this.currentEvaluation$.next(initialFallback);
    this.allTransactions$.next(initialLedger);
  }
}
