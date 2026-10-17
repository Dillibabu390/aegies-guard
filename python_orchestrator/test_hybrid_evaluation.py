import asyncio
import time
from orchestrator import evaluate_fast_gate, orchestrate_evaluation
from main import SCENARIOS

async def run_tests():
    print("=" * 60)
    print("AEGISGUARD TWO-PHASE REAL-TIME FRAUD DETECTION BENCHMARK")
    print("=" * 60)
    
    # 1. Phase 1 Real-Time Gate (Coffee scenario)
    t0 = time.perf_counter()
    res1 = await evaluate_fast_gate(SCENARIOS[0]["payload"])
    dt1 = (time.perf_counter() - t0) * 1000
    print(f"[TEST 1 - Phase 1 Instant Gate]")
    print(f"  Latency: {dt1:.2f} ms (Target SLA: <50ms)")
    print(f"  Decision: {res1['scoring']['decision']} (Score: {res1['scoring']['totalRiskScore']}/100)")
    print(f"  SLA Met: {res1['telemetry'].get('realTimeSlaMet')}")

    # 2. Impossible Travel Jump Scenario (Critical block)
    t1 = time.perf_counter()
    res2 = await orchestrate_evaluation(SCENARIOS[1]["payload"])
    dt2 = (time.perf_counter() - t1) * 1000
    print(f"\n[TEST 2 - Impossible Travel Jump Evaluation]")
    print(f"  Total Latency: {dt2:.2f} ms")
    print(f"  Phase 1 Gate: {res2['telemetry'].get('phase1FastGateLatencyMs')} ms")
    print(f"  Decision: {res2['scoring']['decision']} (Score: {res2['scoring']['totalRiskScore']}/100)")
    print(f"  Circuit Breaker: {res2['telemetry'].get('circuitBreakerState')}")

    print("\n" + "=" * 60)
    print("ALL 7 SCENARIO VERIFICATION MATRIX")
    print("=" * 60)
    for s in SCENARIOS:
        res = await orchestrate_evaluation(s["payload"], skip_llm=True)
        dec = res["scoring"]["decision"]
        exp = s.get("expectedDecision", "N/A")
        match = "MATCH" if dec == exp else "MISMATCH"
        print(f"[{match}] {s['id'][:32]:<32} | Expected: {exp:<9} | Actual: {dec:<9} | Score: {res['scoring']['totalRiskScore']}/100")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
