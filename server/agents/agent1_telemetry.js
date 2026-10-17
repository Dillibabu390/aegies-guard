/**
 * Agent 1: Transaction Telemetry & Velocity Agent
 * Point Allocation: 0 to 25 Pts Max
 * Evaluates deterministic telemetry parameters:
 *  - Transaction amount deviation vs historical baseline
 *  - Geographic distance jumps (Haversine formula & impossible travel velocity km/h)
 *  - 1-hour rolling transaction velocity
 *  - Device trust factors (device fingerprint match, emulator/root detection, VPN/Tor IP)
 */

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function evaluateTelemetryAndVelocity(payload, userProfile, velocityHistory) {
  const startTime = performance.now();
  let score = 0;
  const breakdown = [];
  const flags = [];

  const amount = Number(payload.amount) || 0;
  const avg = userProfile?.spendingProfile?.averageAmount || 50;
  const std = userProfile?.spendingProfile?.standardDeviation || 25;

  // 1. Amount Deviation Analysis (0 - 7 pts)
  const zScore = std > 0 ? (amount - avg) / std : 0;
  if (zScore > 5 || amount >= avg * 10) {
    const pts = 7;
    score += pts;
    flags.push('CRITICAL_AMOUNT_SPIKE');
    breakdown.push({
      metric: 'Amount Deviation',
      riskPoints: pts,
      status: 'HIGH_RISK',
      detail: `Txn amount ($${amount.toFixed(2)}) is >10x above normal mean ($${avg.toFixed(2)}) (Z-Score: ${zScore.toFixed(1)})`
    });
  } else if (zScore > 2.5 || amount >= avg * 4) {
    const pts = 4;
    score += pts;
    flags.push('ELEVATED_AMOUNT');
    breakdown.push({
      metric: 'Amount Deviation',
      riskPoints: pts,
      status: 'ELEVATED',
      detail: `Txn amount ($${amount.toFixed(2)}) is >4x above normal mean ($${avg.toFixed(2)})`
    });
  } else {
    breakdown.push({
      metric: 'Amount Deviation',
      riskPoints: 0,
      status: 'NORMAL',
      detail: `Txn amount ($${amount.toFixed(2)}) aligns with normal spending behavior ($${avg.toFixed(2)})`
    });
  }

  // 2. Geographic Jump & Travel Velocity (0 - 9 pts)
  let geoVelocityKmH = 0;
  let distanceKm = 0;
  if (userProfile?.lastKnownLocation && payload.location) {
    const lastLoc = userProfile.lastKnownLocation;
    const currentLoc = payload.location;
    distanceKm = calculateHaversineDistance(lastLoc.lat, lastLoc.lng, currentLoc.lat, currentLoc.lng);
    const elapsedHours = Math.max(0.01, (Date.now() - (lastLoc.timestamp || Date.now())) / (1000 * 3600));
    geoVelocityKmH = distanceKm / elapsedHours;

    if (geoVelocityKmH > 850 && distanceKm > 500) {
      // Impossible human travel velocity (commercial passenger jet ~ 850-900 km/h)
      const pts = 9;
      score += pts;
      flags.push('IMPOSSIBLE_TRAVEL_VELOCITY');
      breakdown.push({
        metric: 'Geo Velocity Jump',
        riskPoints: pts,
        status: 'HIGH_RISK',
        detail: `Impossible travel: ${Math.round(distanceKm)} km jumped in ${(elapsedHours * 60).toFixed(0)} mins (${Math.round(geoVelocityKmH)} km/h speed)`
      });
    } else if (distanceKm > 200 && geoVelocityKmH > 350) {
      const pts = 5;
      score += pts;
      flags.push('RAPID_GEO_RELOCATION');
      breakdown.push({
        metric: 'Geo Velocity Jump',
        riskPoints: pts,
        status: 'ELEVATED',
        detail: `Rapid geographic relocation: ${Math.round(distanceKm)} km at ${Math.round(geoVelocityKmH)} km/h`
      });
    } else {
      breakdown.push({
        metric: 'Geo Velocity Jump',
        riskPoints: 0,
        status: 'NORMAL',
        detail: `Location consistent with domestic profile (${Math.round(distanceKm)} km delta)`
      });
    }
  } else {
    breakdown.push({
      metric: 'Geo Velocity Jump',
      riskPoints: 0,
      status: 'NORMAL',
      detail: 'No historical geo jump detected'
    });
  }

  // 3. 1-Hour Rolling Velocity Tracking (0 - 5 pts)
  const recentCount = (velocityHistory || []).filter(tx => (Date.now() - tx.timestamp) < 3600 * 1000).length;
  if (recentCount >= 6) {
    const pts = 5;
    score += pts;
    flags.push('HOURLY_VELOCITY_BURST');
    breakdown.push({
      metric: '1-Hour Transaction Velocity',
      riskPoints: pts,
      status: 'HIGH_RISK',
      detail: `Velocity surge: ${recentCount + 1} transactions requested within past 60 minutes`
    });
  } else if (recentCount >= 3) {
    const pts = 3;
    score += pts;
    flags.push('ELEVATED_HOURLY_VELOCITY');
    breakdown.push({
      metric: '1-Hour Transaction Velocity',
      riskPoints: pts,
      status: 'ELEVATED',
      detail: `Elevated velocity: ${recentCount + 1} transactions in past 60 minutes`
    });
  } else {
    breakdown.push({
      metric: '1-Hour Transaction Velocity',
      riskPoints: 0,
      status: 'NORMAL',
      detail: `Normal velocity: ${recentCount + 1} txn in window`
    });
  }

  // 4. Device Fingerprint & Integrity Trust (0 - 4 pts)
  const device = payload.device || {};
  const isTrusted = (userProfile?.trustedDevices || []).includes(device.fingerprintId);
  let deviceRisk = 0;

  if (device.isRootedOrJailbroken) {
    deviceRisk += 2;
    flags.push('DEVICE_ROOT_DETECTED');
  }
  if (device.isVpnOrProxy) {
    deviceRisk += 2;
    flags.push('ANONYMIZING_PROXY_IP');
  }
  if (!isTrusted) {
    deviceRisk += 2;
    flags.push('UNRECOGNIZED_DEVICE');
  }
  deviceRisk = Math.min(4, deviceRisk);
  score += deviceRisk;

  breakdown.push({
    metric: 'Device Trust Factor',
    riskPoints: deviceRisk,
    status: deviceRisk >= 3 ? 'HIGH_RISK' : (deviceRisk > 0 ? 'ELEVATED' : 'TRUSTED'),
    detail: isTrusted 
      ? (deviceRisk > 0 ? `Trusted device but suspicious signals (VPN/Root detected)` : `Hardware fingerprint recognized & verified (${device.model || 'Known Device'})`)
      : `Unrecognized device fingerprint '${device.fingerprintId || 'Unknown'}'`
  });

  const finalScore = Math.min(25, Math.max(0, score));
  const latencyMs = Math.round(performance.now() - startTime);

  return {
    agentId: 'agent_1_telemetry_velocity',
    agentName: 'Transaction Telemetry & Velocity Agent',
    score: finalScore,
    maxScore: 25,
    latencyMs,
    status: finalScore >= 18 ? 'CRITICAL' : (finalScore >= 10 ? 'WARNING' : 'OPTIMAL'),
    summary: finalScore >= 15 
      ? `High telemetry friction detected: ${flags.join(', ')}`
      : (finalScore > 5 ? `Moderate velocity/telemetry anomalies observed.` : `Deterministic telemetry parameters within baseline norms.`),
    flags,
    metrics: {
      amount,
      zScore: Number(zScore.toFixed(2)),
      distanceKm: Math.round(distanceKm),
      geoVelocityKmH: Math.round(geoVelocityKmH),
      oneHourTxnCount: recentCount + 1,
      deviceTrusted: isTrusted
    },
    breakdown
  };
}
