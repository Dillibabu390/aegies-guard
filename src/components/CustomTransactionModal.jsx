import React, { useState } from 'react';

export default function CustomTransactionModal({ isOpen, onClose, onEvaluateCustom }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({
    userId: 'usr_alex_chen',
    amount: '450.00',
    currency: 'USD',
    memo: 'Custom Online Transfer',
    locationPreset: 'taipei',
    devicePreset: 'trusted_iphone',
    biometricPreset: 'verified_live',
    mpinResetRecent: false,
    failedLogins: '0',
    simSwap: false,
    beneficiaryPreset: 'merchant_coffee'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build payload according to selections
    let location = { lat: 25.0330, lng: 121.5654, city: 'Taipei', country: 'TW' };
    if (form.locationPreset === 'london') {
      location = { lat: 51.5074, lng: -0.1278, city: 'London', country: 'GB' };
    } else if (form.locationPreset === 'san_francisco') {
      location = { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'US' };
    }

    let device = {
      fingerprintId: 'dev_fp_iphone15_alex_tw',
      model: 'iPhone 15 Pro',
      isRootedOrJailbroken: false,
      isVpnOrProxy: false
    };
    if (form.devicePreset === 'rooted_emulator') {
      device = {
        fingerprintId: 'dev_fp_unrecognized_emulator_x86',
        model: 'Generic Android Emulator',
        isRootedOrJailbroken: true,
        isVpnOrProxy: true
      };
    } else if (form.devicePreset === 'tor_proxy') {
      device = {
        fingerprintId: 'dev_fp_unknown_linux_desktop',
        model: 'Tor Browser 13.0',
        isRootedOrJailbroken: false,
        isVpnOrProxy: true
      };
    }

    let biometric = {
      selfieType: 'verified_live',
      documentType: 'authentic_id',
      hasGlareOrBlur: false,
      skipped: false
    };
    if (form.biometricPreset === 'deepfake') {
      biometric = {
        selfieType: 'deepfake_replay',
        documentType: 'authentic_id',
        hasGlareOrBlur: true,
        skipped: false
      };
    } else if (form.biometricPreset === 'tampered_id') {
      biometric = {
        selfieType: 'verified_live',
        documentType: 'tampered_id',
        hasGlareOrBlur: false,
        skipped: false
      };
    } else if (form.biometricPreset === 'bypassed') {
      biometric = { skipped: true };
    }

    let beneficiary = {
      id: 'MERCHANT_COFFEE_BEANS',
      name: 'Artisan Coffee Co.',
      accountNumber: 'MERCHANT_COFFEE_BEANS',
      isNewBeneficiary: false
    };
    if (form.beneficiaryPreset === 'mule_hub') {
      beneficiary = {
        id: 'ACC_MULE_HUB_99',
        name: 'Mule Aggregator #99',
        accountNumber: 'ACC_MULE_HUB_99',
        isNewBeneficiary: true
      };
    } else if (form.beneficiaryPreset === 'crypto_mixer') {
      beneficiary = {
        id: 'CRYPTO_OFFRAMP_VAULT',
        name: 'Unregulated Crypto Mixer',
        accountNumber: 'CRYPTO_OFFRAMP_VAULT',
        isNewBeneficiary: true
      };
    } else if (form.beneficiaryPreset === 'unknown_p2p') {
      beneficiary = {
        id: 'ACC_UNKNOWN_P2P_77',
        name: 'Unverified Third Party',
        accountNumber: 'ACC_UNKNOWN_P2P_77',
        isNewBeneficiary: true
      };
    }

    const payload = {
      userId: form.userId,
      amount: parseFloat(form.amount) || 50,
      currency: form.currency,
      memo: form.memo,
      location,
      device,
      biometric,
      beneficiary,
      recentMpinResetTimestamp: form.mpinResetRecent ? Date.now() - (2 * 3600 * 1000) : null,
      failedLoginsInPast24h: parseInt(form.failedLogins, 10) || 0,
      simSwapReported: form.simSwap
    };

    onEvaluateCustom(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" id="custom-txn-modal-overlay">
      <div className="modal-content" id="custom-txn-modal-content">
        <div className="modal-header">
          <div className="modal-title">Custom Telemetry & Transaction Builder</div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">User Account Profile</label>
              <select
                className="form-select"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              >
                <option value="usr_alex_chen">Alex Chen (Balance: $14,850)</option>
                <option value="usr_sarah_connor">Sarah Connor (Balance: $42,100)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                className="form-input mono"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Geographic Location</label>
              <select
                className="form-select"
                value={form.locationPreset}
                onChange={(e) => setForm({ ...form, locationPreset: e.target.value })}
              >
                <option value="taipei">Taipei, TW (Baseline Home Location)</option>
                <option value="london">London, UK (9,500km Geo-Velocity Jump!)</option>
                <option value="san_francisco">San Francisco, CA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Device & Network Integrity</label>
              <select
                className="form-select"
                value={form.devicePreset}
                onChange={(e) => setForm({ ...form, devicePreset: e.target.value })}
              >
                <option value="trusted_iphone">Trusted iPhone 15 Pro (Hardware Match)</option>
                <option value="rooted_emulator">Rooted Android Emulator x86 + Datacenter IP</option>
                <option value="tor_proxy">Tor Exit Node / Anonymizing Proxy</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Visual Biometrics (Agent 3)</label>
              <select
                className="form-select"
                value={form.biometricPreset}
                onChange={(e) => setForm({ ...form, biometricPreset: e.target.value })}
              >
                <option value="verified_live">Authentic Live 3D Selfie (Match 97%)</option>
                <option value="deepfake">Deepfake Screen Replay / Mask Attack</option>
                <option value="tampered_id">Tampered Government ID Document OCR</option>
                <option value="bypassed">Biometric Prompt Bypassed / Stripped</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Beneficiary Account (Agent 4)</label>
              <select
                className="form-select"
                value={form.beneficiaryPreset}
                onChange={(e) => setForm({ ...form, beneficiaryPreset: e.target.value })}
              >
                <option value="merchant_coffee">Artisan Coffee Co. (Verified Merchant)</option>
                <option value="mule_hub">ACC_MULE_HUB_99 (High In-Degree Laundering)</option>
                <option value="crypto_mixer">CRYPTO_OFFRAMP_VAULT (Sanctioned Mixer)</option>
                <option value="unknown_p2p">Unverified New Beneficiary P2P</option>
              </select>
            </div>
          </div>

          {/* Security History Audit Options */}
          <div style={{ background: 'hsla(223, 28%, 15%, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-label" style={{ color: 'var(--brand-cyan)' }}>Security History & Database RAG Telemetry</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.mpinResetRecent}
                  onChange={(e) => setForm({ ...form, mpinResetRecent: e.target.checked })}
                />
                <span>MPIN Reset in last 2h</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.simSwap}
                  onChange={(e) => setForm({ ...form, simSwap: e.target.checked })}
                />
                <span>SIM Swap Flagged</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Failed Logins:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="form-input"
                  style={{ width: '55px', padding: '4px 6px' }}
                  value={form.failedLogins}
                  onChange={(e) => setForm({ ...form, failedLogins: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-custom-txn">
              Dispatch to 4-Agent Orchestrator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
