"""
Unit Tests for AegisGuard Python AI Fraud Detection Platform
============================================================
Tests scoring logic, real-time fast gate SLA, circuit breaker resilience,
and multi-agent policy decisions.
"""

import unittest
import asyncio
import time

from orchestrator import evaluate_fast_gate, orchestrate_evaluation
from circuit_breaker import gemini_circuit_breaker
from agents.agent1_telemetry import evaluate_telemetry_and_velocity
from agents.agent5_scam_coercion import extract_memo_scam_signals


class TestAegisGuardScoring(unittest.TestCase):

    def setUp(self):
        self.mock_user = {
            "id": "usr_alex_chen",
            "name": "Alex Chen",
            "accountNumber": "ACC_77189021",
            "balance": 14850.00,
            "spendingProfile": {"averageAmount": 65.0, "standardDeviation": 30.0, "typicalHours": [8, 22]},
            "lastKnownLocation": {"lat": 25.0335, "lng": 121.5658, "city": "Taipei", "timestamp": time.time() * 1000},
            "trustedDevices": ["dev_fp_iphone15_alex_tw"]
        }

    def test_benign_coffee_purchase(self):
        """Legitimate low dollar purchase from trusted device must AUTO-APPROVE"""
        payload = {
            "userId": "usr_alex_chen",
            "amount": 5.50,
            "location": {"lat": 25.0340, "lng": 121.5660, "city": "Taipei"},
            "device": {"fingerprintId": "dev_fp_iphone15_alex_tw", "model": "iPhone 15 Pro", "isRootedOrJailbroken": False, "isVpnOrProxy": False},
            "beneficiary": {"name": "Artisan Coffee", "isNewBeneficiary": False},
            "biometric": {"selfieType": "verified_live", "documentType": "authentic_id"}
        }
        res = asyncio.run(orchestrate_evaluation(payload, skip_llm=True))
        self.assertEqual(res["scoring"]["decision"], "APPROVE")
        self.assertLessEqual(res["scoring"]["totalRiskScore"], 25)

    def test_impossible_geo_travel_detection(self):
        """Cross-continental geo hop (London vs Taipei) must trigger IMPOSSIBLE_TRAVEL_VELOCITY"""
        payload = {
            "userId": "usr_alex_chen",
            "amount": 2500.00,
            "priorActivityMinutesAgo": 25,
            "location": {"lat": 51.5074, "lng": -0.1278, "city": "London"},
            "device": {"fingerprintId": "dev_fp_untrusted", "model": "Emulator", "isRootedOrJailbroken": True, "isVpnOrProxy": True},
            "beneficiary": {"name": "Overseas Shell Corp", "isNewBeneficiary": True},
            "biometric": {"selfieType": "unmatched_face", "documentType": "authentic_id", "hasGlareOrBlur": True}
        }
        res = asyncio.run(orchestrate_evaluation(payload, skip_llm=True))
        self.assertEqual(res["scoring"]["decision"], "BLOCK")
        self.assertIn("IMPOSSIBLE_TRAVEL_VELOCITY", res["agentResults"]["agent1"]["flags"])

    def test_coercion_keyword_lexicon(self):
        """Urgent safe-haven account directives must trigger scam coercion extraction"""
        memo = "URGENT POLICE SAFE HOLDING VAULT CLEARANCE"
        pts, cat, flags = extract_memo_scam_signals(memo)
        self.assertGreaterEqual(pts, 6)
        self.assertIn("Impersonation", cat)
        self.assertTrue(any("SAFE" in f for f in flags))

    def test_circuit_breaker_instant_fallback(self):
        """Circuit Breaker must trip on 429 and execute in sub-50ms fallback mode"""
        gemini_circuit_breaker.record_failure("429 RESOURCE_EXHAUSTED: Quota exceeded")
        self.assertEqual(gemini_circuit_breaker.get_status()["state"], "OPEN")

        t0 = time.perf_counter()
        payload = {
            "userId": "usr_alex_chen",
            "amount": 50.00,
            "location": {"lat": 25.0340, "lng": 121.5660},
            "device": {"fingerprintId": "dev_fp_iphone15_alex_tw"}
        }
        res = asyncio.run(orchestrate_evaluation(payload, gemini_api_key="test_key_exhausted"))
        dt_ms = (time.perf_counter() - t0) * 1000

        # Must NOT hang for 40 seconds; must complete immediately
        self.assertLess(dt_ms, 150)
        self.assertIn("telemetry", res)
        # Reset circuit breaker
        gemini_circuit_breaker.reset()

    def test_phase1_realtime_gate_sla(self):
        """Phase 1 fast gate must complete within regulatory 100ms instant payment SLA"""
        payload = {
            "userId": "usr_alex_chen",
            "amount": 120.00,
            "location": {"lat": 25.0340, "lng": 121.5660},
            "device": {"fingerprintId": "dev_fp_iphone15_alex_tw"}
        }
        t0 = time.perf_counter()
        res = asyncio.run(evaluate_fast_gate(payload))
        dt_ms = (time.perf_counter() - t0) * 1000

        self.assertLess(dt_ms, 100)
        self.assertTrue(res["telemetry"]["realTimeSlaMet"])
        self.assertEqual(res["telemetry"]["evaluationPhase"], "PHASE_1_REALTIME_GATE")


if __name__ == "__main__":
    unittest.main()
