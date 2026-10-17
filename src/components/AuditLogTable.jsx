import React, { useState } from 'react';

export default function AuditLogTable({ logs, onSelectLog }) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDossier, setActiveDossier] = useState(null);

  const filteredLogs = (logs || []).filter((log) => {
    const decision = log.scoring?.decision || '';
    if (filter === 'APPROVE' && !decision.includes('APPROV')) return false;
    if (filter === 'CHALLENGE' && !decision.includes('CHALLENGE')) return false;
    if (filter === 'BLOCK' && !decision.includes('BLOCK')) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = (log.transactionId || '').toLowerCase().includes(q);
      const matchUser = (log.user?.name || '').toLowerCase().includes(q);
      const matchBen = (log.transactionDetails?.beneficiary?.name || '').toLowerCase().includes(q);
      return matchId || matchUser || matchBen;
    }
    return true;
  });

  return (
    <div className="glass-card" id="audit-log-section">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Real-Time Audit & Security Event Stream
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '6px 12px', fontSize: '12px' }}
            placeholder="Search txn ID, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Decisions</option>
            <option value="APPROVE">Approved Only</option>
            <option value="CHALLENGE">Challenged Only</option>
            <option value="BLOCK">Blocked Only</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Txn ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Beneficiary</th>
              <th>Risk Score</th>
              <th>A1 / A2 / A3 / A4</th>
              <th>Outcome</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No transaction audit records matching current filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const totalScore = log.scoring?.totalRiskScore || 0;
                const decision = log.scoring?.decision || 'UNKNOWN';
                const c = log.scoring?.agentContributions || {};

                let badgeClass = 'approve';
                if (decision.includes('BLOCK')) badgeClass = 'block';
                else if (decision.includes('CHALLENGE')) badgeClass = 'challenge';

                return (
                  <tr key={log.transactionId} onClick={() => setActiveDossier(log)}>
                    <td className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="mono" style={{ fontWeight: '600', color: 'var(--brand-cyan)' }}>
                      {log.transactionId}
                    </td>
                    <td>{log.user?.name}</td>
                    <td className="mono" style={{ fontWeight: '700' }}>
                      ${Number(log.transactionDetails?.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.transactionDetails?.beneficiary?.name}
                    </td>
                    <td>
                      <span className="mono" style={{ 
                        fontWeight: '800', 
                        color: totalScore >= 90 ? 'var(--neon-block)' : (totalScore >= 50 ? 'var(--neon-challenge)' : 'var(--neon-safe)')
                      }}>
                        {totalScore}/100
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {c.agent1Telemetry?.score ?? 0} | {c.agent2AuditRAG?.score ?? 0} | {c.agent3Multimodal?.score ?? 0} | {c.agent4BehavioralGraph?.score ?? 0}
                    </td>
                    <td>
                      <span className={`scenario-badge ${badgeClass}`} style={{ fontSize: '11px' }}>
                        {decision}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDossier(log);
                        }}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Forensic Dossier Modal */}
      {activeDossier && (
        <div className="modal-overlay" onClick={() => setActiveDossier(null)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                Forensic Dossier: <span className="mono" style={{ color: 'var(--brand-cyan)' }}>{activeDossier.transactionId}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveDossier(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                <div className="stat-label">Subject & Transaction</div>
                <div style={{ fontSize: '13px', marginTop: '6px' }}>
                  <strong>{activeDossier.user?.name}</strong> • ${activeDossier.transactionDetails?.amount} USD
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  To: {activeDossier.transactionDetails?.beneficiary?.name}
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                <div className="stat-label">Aggregated Policy Verdict</div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '6px' }}>
                  Risk Score: {activeDossier.scoring?.totalRiskScore}/100 • {activeDossier.scoring?.decision}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {activeDossier.scoring?.recommendedActionText}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Raw Orchestration JSON Telemetry</label>
              <pre className="mono" style={{ background: 'hsl(225, 40%, 6%)', padding: '14px', borderRadius: '8px', fontSize: '11px', color: '#a5b4fc', maxHeight: '280px', overflowY: 'auto' }}>
                {JSON.stringify(activeDossier, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeDossier, null, 2));
                  alert('Forensic dossier copied to clipboard!');
                }}
              >
                Copy JSON Dossier
              </button>
              <button className="btn btn-primary" onClick={() => setActiveDossier(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
