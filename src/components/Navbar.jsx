import React from 'react';

export default function Navbar({ onOpenCustomModal, onOpenArchModal, systemHealth }) {
  return (
    <header className="header-bar" id="main-header">
      <div className="brand-section">
        <div className="brand-logo-badge" id="brand-logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </div>
        <div className="brand-titles">
          <h1>AegisGuard AI</h1>
          <div className="brand-subtitle">
            <span>Pre-Settlement Fraud Prevention & Interception Platform</span>
            <span>•</span>
            <span className="mono" style={{ color: 'var(--brand-cyan)' }}>5-Agent Defense Matrix + Spring Boot MongoDB</span>
          </div>
        </div>
      </div>

      <div className="header-status-strip">
        <div className="status-pill" title="5 Python Autonomous Fraud Prevention Agents">
          <span className="status-dot"></span>
          <span>5/5 AI Defense Agents Online</span>
        </div>

        <div className="status-pill" title="Google Gemini Flash LLM Engine for Agent 2 RAG & Agent 3 Multimodal Vision">
          <span className="status-dot pulsing" style={{ background: '#00f2fe' }}></span>
          <span style={{ color: '#00f2fe' }}>⚡ Gemini Flash LLM Active</span>
        </div>

        <div className="status-pill" title="Spring Boot & MongoDB Monolithic Transaction Service">
          <span className="status-dot pulsing"></span>
          <span>Spring Boot + MongoDB Connected</span>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          id="btn-open-simulator"
          onClick={() => window.open('/consumer', '_blank')}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', borderColor: 'transparent' }}
        >
          📱 Try Consumer App (Webcam)
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          id="btn-open-custom-txn"
          onClick={onOpenCustomModal}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Custom Builder
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          id="btn-open-arch"
          onClick={onOpenArchModal}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Architecture Spec
        </button>
      </div>
    </header>
  );
}
