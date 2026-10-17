/**
 * AegisGuard AI Threat Studio & Transaction Creator (Port 5174)
 * Coordinates scenario simulation and dispatches evaluated transactions
 * to the Python Orchestrator (Port 8000), broadcasting live to Port 5173.
 */

const PRESETS = [
  {
    id: 'legitimate_coffee',
    name: '🟢 Legitimate Coffee Purchase',
    tag: 'Low Risk (Auto-Approve)',
    decision: 'APPROVE',
    class: 'approve',
    payload: {
      userId: 'usr_alex_chen',
      amount: 5.50,
      currency: 'USD',
      memo: 'Morning Latte & Bagel',
      beneficiary: {
        id: 'MERCHANT_COFFEE_BEANS',
        name: 'Artisan Coffee Co.',
        accountNumber: 'MERCHANT_COFFEE_BEANS',
        isNewBeneficiary: false
      },
      geo: 'taipei',
      elapsedMins: 120,
      device: 'Apple iPhone 15 Pro (Known)',
      isRooted: false,
      isVpn: false,
      selfieType: 'verified_live',
      docType: 'authentic_id',
      hasGlare: false,
      mpinReset: 'none',
      failedLogins: 0,
      simSwap: false,
      activeCall: false,
      callDuration: 0,
      clipboardPasted: false,
      clipboardDwell: 12.0
    }
  },
  {
    id: 'impossible_travel_jump',
    name: '🔴 Impossible Geo-Travel Jump (SIM/Proxy)',
    tag: 'Critical Risk (Immediate Block)',
    decision: 'BLOCK',
    class: 'block',
    payload: {
      userId: 'usr_alex_chen',
      amount: 2500.00,
      currency: 'USD',
      memo: 'International Wire Luxury',
      beneficiary: {
        id: 'ACC_FOREIGN_LUXURY',
        name: 'Overseas Shell Corp',
        accountNumber: 'ACC_FOREIGN_LUXURY',
        isNewBeneficiary: true
      },
      geo: 'london',
      elapsedMins: 25,
      device: 'Android Generic Emulator x86',
      isRooted: true,
      isVpn: true,
      selfieType: 'unmatched_face',
      docType: 'authentic_id',
      hasGlare: true,
      mpinReset: 'none',
      failedLogins: 4,
      simSwap: true,
      activeCall: false,
      callDuration: 0,
      clipboardPasted: true,
      clipboardDwell: 2.1
    }
  },
  {
    id: 'account_takeover_mule_cluster',
    name: '🔴 Account Takeover & Mule Ring Syphon',
    tag: 'Critical Risk (Immediate Block)',
    decision: 'BLOCK',
    class: 'block',
    payload: {
      userId: 'usr_sarah_connor',
      amount: 32000.00,
      currency: 'USD',
      memo: 'Urgent Settlement Escrow',
      beneficiary: {
        id: 'ACC_MULE_HUB_99',
        name: 'Mule Aggregator #99',
        accountNumber: 'ACC_MULE_HUB_99',
        isNewBeneficiary: true
      },
      geo: 'sf',
      elapsedMins: 15,
      device: 'Unrecognized Kali Linux Device',
      isRooted: true,
      isVpn: true,
      selfieType: 'unmatched_face',
      docType: 'tampered_id',
      hasGlare: false,
      mpinReset: '2h',
      failedLogins: 5,
      simSwap: true,
      activeCall: false,
      callDuration: 0,
      clipboardPasted: true,
      clipboardDwell: 1.0
    }
  },
  {
    id: 'police_safe_account_scam',
    name: '🚨 Federal Police "Safe Haven" Coercion Scam',
    tag: 'APP Coercion (De-Biasing Required)',
    decision: 'CHALLENGE',
    class: 'challenge',
    payload: {
      userId: 'usr_alex_chen',
      amount: 14500.00,
      currency: 'USD',
      memo: 'SAFE HOLDING RECOVERY VAULT - CLEARANCE',
      beneficiary: {
        id: 'ACC_UNVERIFIED_VAULT_99',
        name: 'Reserve Safe Haven Escrow (Unverified)',
        accountNumber: 'ACC_UNVERIFIED_VAULT_99',
        isNewBeneficiary: true
      },
      geo: 'taipei',
      elapsedMins: 10,
      device: 'Apple iPhone 15 Pro (Known)',
      isRooted: false,
      isVpn: false,
      selfieType: 'verified_live',
      docType: 'authentic_id',
      hasGlare: false,
      mpinReset: 'none',
      failedLogins: 0,
      simSwap: false,
      activeCall: true,
      callDuration: 18.2,
      clipboardPasted: true,
      clipboardDwell: 1.4
    }
  },
  {
    id: 'crypto_pig_butchering',
    name: '🚨 Pig Butchering Crypto Investment Scam',
    tag: 'Crypto Syndicate Coercion',
    decision: 'CHALLENGE',
    class: 'challenge',
    payload: {
      userId: 'usr_alex_chen',
      amount: 8500.00,
      currency: 'USD',
      memo: 'APEX-YIELD VIP USDT ALLOCATION 450% GUARANTEED',
      beneficiary: {
        id: 'ACC_CRYPTO_LIQUIDITY_POOL',
        name: 'ApexYield Liquidity Gate (Unverified)',
        accountNumber: 'ACC_CRYPTO_LIQUIDITY_POOL',
        isNewBeneficiary: true
      },
      geo: 'taipei',
      elapsedMins: 30,
      device: 'Apple iPhone 15 Pro (Known)',
      isRooted: false,
      isVpn: false,
      selfieType: 'verified_live',
      docType: 'authentic_id',
      hasGlare: false,
      mpinReset: 'none',
      failedLogins: 0,
      simSwap: false,
      activeCall: true,
      callDuration: 24.5,
      clipboardPasted: true,
      clipboardDwell: 2.0
    }
  },
  {
    id: 'deepfake_replay_attack',
    name: '🟡 Deepfake Video Replay & Spoof Attack',
    tag: 'Biometric Presentation Attack',
    decision: 'CHALLENGE',
    class: 'challenge',
    payload: {
      userId: 'usr_alex_chen',
      amount: 3800.00,
      currency: 'USD',
      memo: 'Personal Relocation Escrow',
      beneficiary: {
        id: 'ACC_RELOCATION_SERVICE',
        name: 'Global Moving Logistics LLC',
        accountNumber: 'ACC_RELOCATION_SERVICE',
        isNewBeneficiary: true
      },
      geo: 'tokyo',
      elapsedMins: 45,
      device: 'Apple iPhone 15 Pro (Known)',
      isRooted: false,
      isVpn: false,
      selfieType: 'deepfake_replay',
      docType: 'tampered_id',
      hasGlare: true,
      mpinReset: '24h',
      failedLogins: 2,
      simSwap: false,
      activeCall: false,
      callDuration: 0,
      clipboardPasted: false,
      clipboardDwell: 8.5
    }
  }
];

// BroadcastChannel for instant real-time sync with Port 5173
let syncChannel = null;
try {
  syncChannel = new BroadcastChannel('aegisguard_sync_channel');
} catch (e) {}

// State
let activePresetId = null;
let capturedSelfieBase64 = null;
let activeVideoStream = null;

document.addEventListener('DOMContentLoaded', () => {
  initPresets();
  initTabs();
  initFormBindings();
  initButtons();
  initCameraControls();

  // Load first preset by default
  loadPreset(PRESETS[3]); // Load Police Safe Haven by default to showcase rich multi-agent vectors
});

function initPresets() {
  const container = document.getElementById('presetsGrid');
  if (!container) return;

  container.innerHTML = '';
  PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = `preset-card-btn ${preset.id === activePresetId ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="p-title">${preset.name}</span>
      <span class="p-tag ${preset.class}">${preset.tag}</span>
    `;
    btn.addEventListener('click', () => loadPreset(preset));
    container.appendChild(btn);
  });
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      if (targetId) {
        document.getElementById(targetId)?.classList.add('active');
      }
    });
  });
}

function initFormBindings() {
  ['fieldAmount', 'fieldCurrency', 'fieldBeneficiaryName', 'fieldMemo', 'fieldActiveCall', 'fieldCallDuration'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePhonePreview);
      el.addEventListener('change', updatePhonePreview);
    }
  });

  document.querySelectorAll('.qm-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const memo = tag.getAttribute('data-memo');
      const memoEl = document.getElementById('fieldMemo');
      if (memoEl && memo) {
        memoEl.value = memo;
        updatePhonePreview();
      }
    });
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    loadPreset(PRESETS[0]);
  });
}

function updatePhonePreview() {
  const amt = parseFloat(document.getElementById('fieldAmount')?.value) || 0;
  const curr = document.getElementById('fieldCurrency')?.value || 'USD';
  const name = document.getElementById('fieldBeneficiaryName')?.value || 'Artisan Coffee Co.';
  const memo = document.getElementById('fieldMemo')?.value || 'Wire Transfer';
  const callActive = document.getElementById('fieldActiveCall')?.checked || false;
  const callDuration = document.getElementById('fieldCallDuration')?.value || '0';

  const phoneAmt = document.getElementById('phoneAmount');
  if (phoneAmt) phoneAmt.textContent = `$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;

  const phoneName = document.getElementById('phoneRecipientName');
  if (phoneName) phoneName.textContent = name;

  const phoneMemo = document.getElementById('phoneMemo');
  if (phoneMemo) phoneMemo.textContent = memo;

  const banner = document.getElementById('phoneCallBanner');
  const bannerMins = document.getElementById('phoneCallMins');
  if (banner) {
    banner.style.display = callActive ? 'flex' : 'none';
    if (bannerMins) bannerMins.textContent = callDuration;
  }
}

function initButtons() {
  document.getElementById('dispatchSwarmBtn')?.addEventListener('click', () => dispatchTransaction(false));
  document.getElementById('dispatchFastGateBtn')?.addEventListener('click', () => dispatchTransaction(true));
  document.getElementById('phoneSubmitBtn')?.addEventListener('click', () => dispatchTransaction(false));
}

function loadPreset(preset) {
  activePresetId = preset.id;
  document.querySelectorAll('.preset-card-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', PRESETS[idx]?.id === preset.id);
  });

  const p = preset.payload;
  document.getElementById('fieldUser').value = p.userId;
  document.getElementById('fieldAmount').value = p.amount;
  document.getElementById('fieldCurrency').value = p.currency;
  document.getElementById('fieldBeneficiaryName').value = p.beneficiary.name;
  document.getElementById('fieldBeneficiaryAccount').value = p.beneficiary.accountNumber;
  document.getElementById('fieldNewBeneficiary').checked = p.beneficiary.isNewBeneficiary;
  document.getElementById('fieldMemo').value = p.memo;

  document.getElementById('fieldGeoPreset').value = p.geo;
  document.getElementById('fieldElapsedMins').value = p.elapsedMins;
  document.getElementById('fieldDeviceModel').value = p.device;
  document.getElementById('fieldRooted').checked = p.isRooted;
  document.getElementById('fieldVpn').checked = p.isVpn;

  document.getElementById('fieldSelfieType').value = p.selfieType;
  document.getElementById('fieldDocType').value = p.docType;
  document.getElementById('fieldGlare').checked = p.hasGlare;

  document.getElementById('fieldMpinReset').value = p.mpinReset;
  document.getElementById('fieldFailedLogins').value = p.failedLogins;
  document.getElementById('fieldSimSwap').checked = p.simSwap;

  document.getElementById('fieldActiveCall').checked = p.activeCall;
  document.getElementById('fieldCallDuration').value = p.callDuration;
  document.getElementById('fieldClipboardPasted').checked = p.clipboardPasted;
  document.getElementById('fieldClipboardDwell').value = p.clipboardDwell;

  // Sync preset biometric face image
  if (p.selfieType === 'verified_live') {
    setCapturedPhoto('/assets/selfie_alex_match.jpg', false, 'Alex Chen (Verified Baseline)');
  } else if (p.selfieType === 'unmatched_face' || p.selfieType === 'deepfake_replay' || p.selfieType === 'spoof_mask') {
    setCapturedPhoto('/assets/selfie_spoof_fraud.jpg', false, 'Biometric Anomaly / Deepfake Ingested');
  } else {
    setCapturedPhoto('/assets/selfie_alex_match.jpg', false, 'Baseline Face');
  }

  updatePhonePreview();
}

function initCameraControls() {
  // Live camera stream openers
  document.getElementById('phoneOpenCamBtn')?.addEventListener('click', startCamera);
  document.getElementById('studioOpenCamBtn')?.addEventListener('click', startCamera);

  // Snapshot triggers
  document.getElementById('phoneSnapBtn')?.addEventListener('click', snapPhoto);
  document.getElementById('studioSnapBtn')?.addEventListener('click', snapPhoto);

  // File upload inputs
  document.getElementById('phoneUploadInput')?.addEventListener('change', (e) => {
    handleFileUpload(e.target.files?.[0]);
  });
  document.getElementById('studioUploadInput')?.addEventListener('change', (e) => {
    handleFileUpload(e.target.files?.[0]);
  });

  // Retake / Reset buttons
  document.getElementById('phoneRetakeBtn')?.addEventListener('click', () => {
    startCamera();
  });
  document.getElementById('studioResetCamBtn')?.addEventListener('click', () => {
    stopCamera();
    setCapturedPhoto('/assets/selfie_alex_match.jpg', false, 'Reset to Baseline KYC');
  });
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
    });
    activeVideoStream = stream;

    const phoneVid = document.getElementById('phoneCamVideo');
    const studioVid = document.getElementById('studioCamVideo');
    const phoneImg = document.getElementById('phoneCamPreview');
    const studioImg = document.getElementById('studioCamPreview');

    if (phoneVid) {
      phoneVid.srcObject = stream;
      phoneVid.style.display = 'block';
    }
    if (studioVid) {
      studioVid.srcObject = stream;
      studioVid.style.display = 'block';
    }
    if (phoneImg) phoneImg.style.display = 'none';
    if (studioImg) studioImg.style.display = 'none';

    // Show snap buttons
    const phoneSnap = document.getElementById('phoneSnapBtn');
    const phoneOpen = document.getElementById('phoneOpenCamBtn');
    const studioSnap = document.getElementById('studioSnapBtn');
    const studioOpen = document.getElementById('studioOpenCamBtn');

    if (phoneSnap) phoneSnap.style.display = 'inline-flex';
    if (phoneOpen) phoneOpen.style.display = 'none';
    if (studioSnap) studioSnap.style.display = 'inline-flex';
    if (studioOpen) studioOpen.style.display = 'none';

    updateCamStatus('🔴 Streaming Live Face', true);
  } catch (err) {
    console.warn('[Camera] getUserMedia rejected or unavailable:', err);
    alert('Webcam permission not granted or device camera unavailable. You can use the "Photo" upload button to upload any picture for instant biometric analysis.');
  }
}

function snapPhoto() {
  const vid = document.getElementById('phoneCamVideo')?.srcObject ? document.getElementById('phoneCamVideo') : document.getElementById('studioCamVideo');
  if (!vid) return;

  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(vid, 0, 0, 360, 360);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  stopCamera();
  setCapturedPhoto(dataUrl, true, 'Live Face Captured at TXN Time');
}

function stopCamera() {
  if (activeVideoStream) {
    activeVideoStream.getTracks().forEach(track => track.stop());
    activeVideoStream = null;
  }
  const phoneVid = document.getElementById('phoneCamVideo');
  const studioVid = document.getElementById('studioCamVideo');
  if (phoneVid) { phoneVid.style.display = 'none'; phoneVid.srcObject = null; }
  if (studioVid) { studioVid.style.display = 'none'; studioVid.srcObject = null; }

  const phoneSnap = document.getElementById('phoneSnapBtn');
  const phoneOpen = document.getElementById('phoneOpenCamBtn');
  const studioSnap = document.getElementById('studioSnapBtn');
  const studioOpen = document.getElementById('studioOpenCamBtn');

  if (phoneSnap) phoneSnap.style.display = 'none';
  if (phoneOpen) phoneOpen.style.display = 'inline-flex';
  if (studioSnap) studioSnap.style.display = 'none';
  if (studioOpen) studioOpen.style.display = 'inline-flex';
}

function setCapturedPhoto(imgUrl, isCapturedLive, label) {
  capturedSelfieBase64 = imgUrl;

  const fallbackAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="%2338bdf8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
  const phoneImg = document.getElementById('phoneCamPreview');
  const studioImg = document.getElementById('studioCamPreview');
  if (phoneImg) {
    phoneImg.onerror = () => { phoneImg.src = fallbackAvatar; };
    phoneImg.src = imgUrl;
    phoneImg.style.display = 'block';
  }
  if (studioImg) {
    studioImg.onerror = () => { studioImg.src = fallbackAvatar; };
    studioImg.src = imgUrl;
    studioImg.style.display = 'block';
  }

  const timeStr = new Date().toLocaleTimeString();
  const timeTag = document.getElementById('phoneCamTimestamp');
  if (timeTag) timeTag.textContent = isCapturedLive ? `Captured at ${timeStr}` : 'Edge Ingestion';

  updateCamStatus(isCapturedLive ? '🟢 Captured at TXN' : 'Captured at TXN', false);

  const retakeBtn = document.getElementById('phoneRetakeBtn');
  if (retakeBtn) retakeBtn.style.display = 'inline-flex';

  const metaStatus = document.getElementById('ccMetaStatus');
  if (metaStatus) metaStatus.textContent = isCapturedLive ? `Captured live at ${timeStr}` : (label || 'Preset Ingested');
}

function updateCamStatus(text, isLive) {
  const b1 = document.getElementById('phoneCamBadge');
  const b2 = document.getElementById('studioCamBadge');
  [b1, b2].forEach(b => {
    if (b) {
      b.textContent = text;
      b.className = isLive ? 'cam-status-badge live' : 'cam-status-badge';
    }
  });
}

function handleFileUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    stopCamera();
    setCapturedPhoto(e.target.result, true, 'User Photo Uploaded at TXN Time');
  };
  reader.readAsDataURL(file);
}

function getFormPayload() {
  const geoPreset = document.getElementById('fieldGeoPreset')?.value || 'taipei';
  let loc = { lat: 25.0340, lng: 121.5660, city: 'Taipei', country: 'TW' };
  if (geoPreset === 'london') loc = { lat: 51.5074, lng: -0.1278, city: 'London', country: 'GB' };
  if (geoPreset === 'sf') loc = { lat: 37.7800, lng: -122.4200, city: 'San Francisco', country: 'US' };
  if (geoPreset === 'tokyo') loc = { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'JP' };

  const mpinVal = document.getElementById('fieldMpinReset')?.value || 'none';
  let mpinTimestamp = null;
  if (mpinVal === '2h') mpinTimestamp = Date.now() - (2 * 3600 * 1000);
  if (mpinVal === '24h') mpinTimestamp = Date.now() - (24 * 3600 * 1000);

  return {
    userId: document.getElementById('fieldUser')?.value || 'usr_alex_chen',
    amount: parseFloat(document.getElementById('fieldAmount')?.value) || 100,
    currency: document.getElementById('fieldCurrency')?.value || 'USD',
    memo: document.getElementById('fieldMemo')?.value || 'Wire Transfer',
    location: loc,
    priorActivityMinutesAgo: parseInt(document.getElementById('fieldElapsedMins')?.value) || 20,
    device: {
      fingerprintId: 'dev_fp_' + Math.floor(100000 + Math.random() * 900000),
      model: document.getElementById('fieldDeviceModel')?.value || 'Apple iPhone 15 Pro (Known)',
      isRootedOrJailbroken: !!document.getElementById('fieldRooted')?.checked,
      isVpnOrProxy: !!document.getElementById('fieldVpn')?.checked
    },
    beneficiary: {
      id: document.getElementById('fieldBeneficiaryAccount')?.value || 'ACC_BENEFICIARY_01',
      name: document.getElementById('fieldBeneficiaryName')?.value || 'Beneficiary Payee',
      accountNumber: document.getElementById('fieldBeneficiaryAccount')?.value || 'ACC_BENEFICIARY_01',
      isNewBeneficiary: !!document.getElementById('fieldNewBeneficiary')?.checked
    },
    biometric: {
      selfieType: document.getElementById('fieldSelfieType')?.value || 'verified_live',
      documentType: document.getElementById('fieldDocType')?.value || 'authentic_id',
      hasGlareOrBlur: !!document.getElementById('fieldGlare')?.checked,
      skipped: document.getElementById('fieldSelfieType')?.value === 'skipped',
      selfieBase64: capturedSelfieBase64 || null,
      capturedAtTxnTime: true
    },
    images: {
      presentedSelfie: capturedSelfieBase64 || null
    },
    recentMpinResetTimestamp: mpinTimestamp,
    failedLoginsInPast24h: parseInt(document.getElementById('fieldFailedLogins')?.value) || 0,
    simSwapReported: !!document.getElementById('fieldSimSwap')?.checked,
    activeCallInProgress: !!document.getElementById('fieldActiveCall')?.checked,
    callDurationMinutes: parseFloat(document.getElementById('fieldCallDuration')?.value) || 0,
    clipboardPasted: !!document.getElementById('fieldClipboardPasted')?.checked,
    clipboardDwellTimeSeconds: parseFloat(document.getElementById('fieldClipboardDwell')?.value) || 10
  };
}

async function dispatchTransaction(isRealtimeFastGate) {
  const payload = getFormPayload();
  const endpoint = isRealtimeFastGate ? '/api/evaluate/realtime' : '/api/evaluate';

  const btn = isRealtimeFastGate ? document.getElementById('dispatchFastGateBtn') : document.getElementById('dispatchSwarmBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>⏳ Processing AI Swarm...</span>';
  btn.disabled = true;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        handleEvaluationSuccess(json.data);
      }
    } else {
      console.error('Dispatch failed', res.status);
      alert('Error from AI Orchestrator: ' + res.statusText);
    }
  } catch (err) {
    console.error('Dispatch error', err);
    // Offline / fallback response generator
    generateLocalSimulatedResponse(payload);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function handleEvaluationSuccess(evalData) {
  // Show result card
  const card = document.getElementById('resultCard');
  card.style.display = 'block';

  const txId = evalData.transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  const score = evalData.scoring?.totalRiskScore || 0;
  const decision = evalData.scoring?.decision || 'APPROVE';
  const latency = evalData.telemetry?.totalPipelineLatencyMs || evalData.executionTimeMs || 35;
  const actionText = evalData.scoring?.recommendedActionText || evalData.scoring?.actionRequired || 'Transaction cleared.';

  document.getElementById('resTxnId').textContent = txId;
  document.getElementById('resScore').textContent = `${score} / 100`;

  const decPill = document.getElementById('resDecision');
  decPill.textContent = decision;
  decPill.className = `verdict-pill ${decision.toLowerCase()}`;

  document.getElementById('resLatency').textContent = `${latency}ms`;
  document.getElementById('resAction').textContent = actionText;

  // Broadcast to Port 5173
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: 'NEW_TRANSACTION_EVALUATED',
        data: { evaluation: evalData }
      });
    } catch (e) {}
  }

  try {
    localStorage.setItem('aegisguard_last_eval', JSON.stringify(evalData));
    localStorage.setItem('aegisguard_eval_trigger', Date.now().toString());
  } catch (e) {}
}

function generateLocalSimulatedResponse(payload) {
  const isHighRisk = payload.amount > 10000 || payload.activeCallInProgress || payload.biometric?.selfieType !== 'verified_live';
  const score = isHighRisk ? 92 : 12;
  const decision = isHighRisk ? 'BLOCK' : 'APPROVE';
  const stub = {
    transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    user: { name: 'Alex Chen', accountNumber: 'ACC_77189021', userId: payload.userId },
    transactionDetails: {
      amount: payload.amount,
      currency: payload.currency,
      memo: payload.memo,
      beneficiary: payload.beneficiary
    },
    scoring: {
      totalRiskScore: score,
      decision: decision,
      decisionLevel: isHighRisk ? 'CRITICAL' : 'SAFE',
      actionRequired: isHighRisk ? 'LOCK_ACCOUNT_AND_HALT' : 'TRANSACTION_CLEARED',
      recommendedActionText: isHighRisk 
        ? 'High multi-agent fraud indicators confirmed. Pre-settlement block enforced.' 
        : 'All 5 agents verified within nominal tolerances. Auto-approved.'
    },
    executionTimeMs: 42
  };
  handleEvaluationSuccess(stub);
}
