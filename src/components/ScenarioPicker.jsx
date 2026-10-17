import React from 'react';

export default function ScenarioPicker({ scenarios, activeScenarioId, onSelectScenario, isEvaluating }) {
  return (
    <div className="scenarios-container" id="scenario-selector-section">
      <div className="section-header">
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Instant Threat Simulation Presets (1-Click Run)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Select a preset to inject telemetry through the 4-agent parallel pipeline
        </div>
      </div>

      <div className="scenarios-grid">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const badgeClass = scenario.expectedDecision.toLowerCase();

          return (
            <div
              key={scenario.id}
              id={`scenario-card-${scenario.id}`}
              className={`scenario-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectScenario(scenario)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`scenario-badge ${badgeClass}`}>
                  {scenario.tag}
                </span>
                {isActive && isEvaluating && (
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-cyan)' }}>
                    Evaluating...
                  </span>
                )}
              </div>
              <div className="scenario-title">{scenario.name}</div>
              <div className="scenario-desc">{scenario.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
