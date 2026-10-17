import React, { useRef, useEffect, useState } from 'react';

export default function NetworkGraphViewer({ currentBeneficiaryId, currentUserId }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 'ACC_77189021', label: 'Alex Chen', type: 'user', risk: 'low', x: 180, y: 190 },
      { id: 'ACC_99214300', label: 'Sarah Connor', type: 'user', risk: 'medium', x: 280, y: 300 },
      { id: 'MERCHANT_COFFEE_BEANS', label: 'Artisan Coffee', type: 'merchant', risk: 'low', x: 80, y: 100 },
      { id: 'MERCHANT_TECHMART_GLOBAL', label: 'TechMart', type: 'merchant', risk: 'low', x: 300, y: 110 },
      { id: 'ACC_CLEAN_LANDLORD', label: 'Taipei Realty', type: 'merchant', risk: 'low', x: 120, y: 310 },
      { id: 'ACC_MULE_HUB_99', label: 'Mule Aggregator #99', type: 'mule_hub', risk: 'critical', x: 520, y: 180 },
      { id: 'ACC_MULE_SATELLITE_A', label: 'Shadow Mule Alpha', type: 'mule_satellite', risk: 'high', x: 440, y: 80 },
      { id: 'ACC_MULE_SATELLITE_B', label: 'Shadow Mule Beta', type: 'mule_satellite', risk: 'high', x: 450, y: 300 },
      { id: 'CRYPTO_OFFRAMP_VAULT', label: 'Sanctioned Mixer', type: 'crypto_sink', risk: 'critical', x: 680, y: 190 }
    ],
    edges: [
      { from: 'ACC_77189021', to: 'MERCHANT_COFFEE_BEANS', label: 'Legitimate' },
      { from: 'ACC_77189021', to: 'MERCHANT_TECHMART_GLOBAL', label: 'Legitimate' },
      { from: 'ACC_77189021', to: 'ACC_CLEAN_LANDLORD', label: 'Rent' },
      { from: 'ACC_MULE_SATELLITE_A', to: 'ACC_MULE_HUB_99', label: 'Funnel' },
      { from: 'ACC_MULE_SATELLITE_B', to: 'ACC_MULE_HUB_99', label: 'Funnel' },
      { from: 'ACC_MULE_HUB_99', to: 'CRYPTO_OFFRAMP_VAULT', label: 'Wash/Disperse' }
    ]
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let angle = 0;

    const render = () => {
      angle += 0.03;
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Scale positions relative to canvas dimensions
      const scaleX = rect.width / 780;
      const scaleY = rect.height / 380;

      // Draw Edges
      graphData.edges.forEach((edge) => {
        const source = graphData.nodes.find(n => n.id === edge.from);
        const target = graphData.nodes.find(n => n.id === edge.to);
        if (!source || !target) return;

        const sx = source.x * scaleX;
        const sy = source.y * scaleY;
        const tx = target.x * scaleX;
        const ty = target.y * scaleY;

        const isCurrentTxnPath = 
          (source.id === currentUserId && target.id === currentBeneficiaryId) ||
          (target.id === currentBeneficiaryId);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.lineWidth = isCurrentTxnPath ? 3 : 1.5;
        ctx.strokeStyle = isCurrentTxnPath 
          ? (target.risk === 'critical' ? 'hsl(350, 89%, 60%)' : 'hsl(188, 94%, 53%)') 
          : 'hsla(220, 25%, 35%, 0.4)';
        ctx.stroke();

        // Animated particles along edges
        if (isCurrentTxnPath) {
          const t = (Math.sin(angle) + 1) / 2;
          const px = sx + (tx - sx) * t;
          const py = sy + (ty - sy) * t;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = target.risk === 'critical' ? 'hsl(350, 89%, 60%)' : 'hsl(188, 94%, 53%)';
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      graphData.nodes.forEach((node) => {
        const nx = node.x * scaleX;
        const ny = node.y * scaleY;
        const isCurrentTarget = node.id === currentBeneficiaryId;
        const isCurrentUser = node.id === currentUserId;

        // Node Ring / Glow
        let nodeColor = 'hsl(215, 20%, 65%)';
        if (node.risk === 'critical') nodeColor = 'hsl(350, 89%, 60%)';
        else if (node.risk === 'high') nodeColor = 'hsl(38, 95%, 52%)';
        else if (node.risk === 'low') nodeColor = 'hsl(158, 85%, 45%)';
        if (node.type === 'user') nodeColor = 'hsl(250, 84%, 64%)';

        // Outer pulse if current txn target
        if (isCurrentTarget || isCurrentUser) {
          ctx.beginPath();
          ctx.arc(nx, ny, 20 + Math.sin(angle * 2) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(nx, ny, isCurrentTarget ? 15 : 12, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = isCurrentTarget ? 15 : 6;
        ctx.shadowColor = nodeColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + 24);

        if (node.type === 'mule_hub') {
          ctx.fillStyle = 'hsl(350, 89%, 60%)';
          ctx.font = '700 9px monospace';
          ctx.fillText('[MULE HUB]', nx, ny + 35);
        } else if (node.type === 'crypto_sink') {
          ctx.fillStyle = 'hsl(350, 89%, 60%)';
          ctx.font = '700 9px monospace';
          ctx.fillText('[SANCTIONED]', nx, ny + 35);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [graphData, currentBeneficiaryId, currentUserId]);

  return (
    <div className="glass-card" id="network-graph-card">
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div className="section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Behavioral & Network Graph Dynamic Visualizer (Agent 4)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Real-time node centrality • Mule syndicate cluster detection • 2-Hop sanction distance
        </div>
      </div>

      <div className="graph-canvas-container">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'hsl(250, 84%, 64%)' }}></div>
            <span>Cardholder Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'hsl(158, 85%, 45%)' }}></div>
            <span>Legitimate Merchant</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: 'hsl(350, 89%, 60%)' }}></div>
            <span>Flagged Mule Hub / Sanctioned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
