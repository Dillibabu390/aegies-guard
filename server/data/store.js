/**
 * In-Memory Database & Seed Data Store for Multimodal Fraud Detection System
 */

export const users = {
  'usr_alex_chen': {
    id: 'usr_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@fintech.io',
    phone: '+886-912-345-678',
    accountNumber: 'ACC_77189021',
    balance: 14850.00,
    spendingProfile: {
      averageAmount: 65.0,
      standardDeviation: 30.0,
      typicalHours: [8, 22], // 8 AM to 10 PM
      frequentLocations: ['Taipei City, TW', 'New Taipei, TW']
    },
    lastKnownLocation: {
      lat: 25.0330,
      lng: 121.5654,
      city: 'Taipei',
      country: 'TW',
      timestamp: Date.now() - (25 * 60 * 1000) // 25 minutes ago
    },
    trustedDevices: [
      'dev_fp_iphone15_alex_tw',
      'dev_fp_macbook_m3_alex'
    ],
    securityHistory: {
      lastMpinReset: null, // No recent reset
      recentFailedLogins: 0,
      simSwapFlag: false,
      accountAgeDays: 840,
      priorFraudIncidents: 0
    },
    idCardPhoto: '/assets/id_card_alex.jpg',
    knownFacePhoto: '/assets/selfie_alex_match.jpg'
  },

  'usr_sarah_connor': {
    id: 'usr_sarah_connor',
    name: 'Sarah Connor',
    email: 's.connor@cybersec.org',
    phone: '+1-555-019-2831',
    accountNumber: 'ACC_99214300',
    balance: 42100.00,
    spendingProfile: {
      averageAmount: 140.0,
      standardDeviation: 80.0,
      typicalHours: [7, 23],
      frequentLocations: ['San Francisco, US']
    },
    lastKnownLocation: {
      lat: 37.7749,
      lng: -122.4194,
      city: 'San Francisco',
      country: 'US',
      timestamp: Date.now() - (45 * 60 * 1000)
    },
    trustedDevices: ['dev_fp_pixel8_sarah'],
    securityHistory: {
      lastMpinReset: Date.now() - (3 * 3600 * 1000), // MPIN Reset 3 hours ago!
      recentFailedLogins: 4,
      simSwapFlag: true,
      accountAgeDays: 410,
      priorFraudIncidents: 0
    },
    idCardPhoto: '/assets/id_card_alex.jpg',
    knownFacePhoto: '/assets/selfie_alex_match.jpg'
  }
};

/**
 * Historical Fraud Typologies Knowledge Base for Agent 2 RAG
 */
export const fraudKnowledgeBase = [
  {
    id: 'typology_sim_mpin_drain',
    title: 'SIM Swap followed by MPIN Reset & Instant Outbound Transfer',
    description: 'Adversary executes unauthorized SIM porting, requests emergency MPIN/password reset within 24 hours, adds new unverified beneficiary, and executes high-velocity liquidation.',
    riskFactors: ['recent_mpin_reset_24h', 'sim_swap_telemetry', 'new_beneficiary', 'velocity_spike'],
    baseRiskScore: 23,
    keywords: ['mpin', 'sim swap', 'password reset', 'takeover', 'unauthorized', 'drain', 'fast liquidation']
  },
  {
    id: 'typology_impossible_travel_vpn',
    title: 'Impossible Geo Travel Jump via Proxy/Tor Exit Node',
    description: 'Session origin switches to an IP thousands of kilometers away within minutes of previous activity, indicating credential stuffing or session hijacking through overseas VPN/Tor.',
    riskFactors: ['impossible_geo_velocity', 'untrusted_device', 'datacenter_ip', 'vpn_exit'],
    baseRiskScore: 24,
    keywords: ['vpn', 'tor', 'impossible travel', 'geo jump', 'unrecognized device', 'proxy']
  },
  {
    id: 'typology_money_mule_layering',
    title: 'Money Mule Network Clustering & Rapid Layering',
    description: 'Beneficiary account sits in a dense star cluster with high in-degree transactions from disparate compromised accounts, followed by immediate zero-balance dispersal to offshore or crypto gates.',
    riskFactors: ['high_indegree_beneficiary', 'mule_cluster_link', 'rapid_dispersal', 'sanctioned_neighbor'],
    baseRiskScore: 22,
    keywords: ['mule', 'cluster', 'layering', 'laundering', 'crypto gate', 'fan out', 'shell']
  },
  {
    id: 'typology_biometric_deepfake_presentation',
    title: 'Biometric Presentation Attack & Tampered Document KYC Bypass',
    description: 'Facial verification telemetry displays digital screen reflection, static eye gaze, pixel warping around face boundary, or tampered document font inconsistencies.',
    riskFactors: ['spoof_screen_replay', 'face_mismatch', 'tampered_ocr', 'liveness_failed'],
    baseRiskScore: 25,
    keywords: ['deepfake', 'spoof', 'tampered', 'mismatch', 'mask', 'screen replay', 'reconstructed photo']
  },
  {
    id: 'typology_card_cracking_velocity',
    title: 'Automated Micro-Velocity Card Cracking Attack',
    description: 'Scripted bot execution triggering multiple rapid authorization attempts within an hour to probe limit thresholds.',
    riskFactors: ['hourly_velocity_exceeded', 'amount_anomalous', 'bot_fingerprint'],
    baseRiskScore: 19,
    keywords: ['bot', 'rapid velocity', 'micro charges', 'brute force', 'automated']
  }
];

/**
 * Transaction Graph for Agent 4 Graph Anomaly Detection
 */
export const networkGraph = {
  nodes: [
    { id: 'ACC_77189021', label: 'Alex Chen (Main)', type: 'user', riskLevel: 'low', balance: 14850 },
    { id: 'ACC_99214300', label: 'Sarah Connor', type: 'user', riskLevel: 'medium', balance: 42100 },
    { id: 'MERCHANT_COFFEE_BEANS', label: 'Artisan Coffee Co.', type: 'merchant', riskLevel: 'low', verified: true },
    { id: 'MERCHANT_TECHMART_GLOBAL', label: 'TechMart Electronics', type: 'merchant', riskLevel: 'low', verified: true },
    { id: 'ACC_MULE_HUB_99', label: 'Mule Aggregator #99', type: 'mule_hub', riskLevel: 'critical', flaggedCount: 14, inDegree: 28 },
    { id: 'ACC_MULE_SATELLITE_A', label: 'Shadow Mule Alpha', type: 'mule_satellite', riskLevel: 'high', flaggedCount: 6 },
    { id: 'ACC_MULE_SATELLITE_B', label: 'Shadow Mule Beta', type: 'mule_satellite', riskLevel: 'high', flaggedCount: 8 },
    { id: 'CRYPTO_OFFRAMP_VAULT', label: 'Unregulated Crypto Mixer', type: 'crypto_sink', riskLevel: 'critical', sanctioned: true },
    { id: 'ACC_CLEAN_LANDLORD', label: 'Taipei Realty Mgmt', type: 'merchant', riskLevel: 'low', verified: true }
  ],
  edges: [
    { source: 'ACC_77189021', target: 'MERCHANT_COFFEE_BEANS', weight: 4.80, count: 18, type: 'regular' },
    { source: 'ACC_77189021', target: 'ACC_CLEAN_LANDLORD', weight: 1200.00, count: 6, type: 'rent' },
    { source: 'ACC_77189021', target: 'MERCHANT_TECHMART_GLOBAL', weight: 349.00, count: 2, type: 'retail' },
    // Fraud cluster connections:
    { source: 'ACC_MULE_SATELLITE_A', target: 'ACC_MULE_HUB_99', weight: 4500.00, count: 12, type: 'funnel' },
    { source: 'ACC_MULE_SATELLITE_B', target: 'ACC_MULE_HUB_99', weight: 6800.00, count: 15, type: 'funnel' },
    { source: 'ACC_MULE_HUB_99', target: 'CRYPTO_OFFRAMP_VAULT', weight: 28000.00, count: 34, type: 'wash' }
  ]
};

/**
 * Live Audit Trail Store (persists in memory during application runtime)
 */
export const auditLogs = [];

/**
 * 1-Hour Rolling Transaction Velocity Cache (Redis/In-Memory equivalent)
 */
export const velocityCache = new Map(); // userId -> [{ timestamp, amount, txnId }]
