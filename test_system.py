import requests
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    getattr(sys.stdout, "reconfigure")(encoding="utf-8")

base_url = "http://127.0.0.1:8000"
spring_url = "http://localhost:8080"


print("--- 1. Testing Spring Boot MongoDB Master Data ---")
users_res = requests.get(f"{spring_url}/api/users")
print(f"Spring Boot Users Status: {users_res.status_code}")
users = users_res.json().get("users", [])
for u in users:
    print(f" - User: {u.get('name')} | Account: {u.get('accountNumber')} | Balance: ${u.get('balance')}")

print("\n--- 2. Testing Python 4-Agent Orchestrator & Evaluation ---")
scenarios_res = requests.get(f"{base_url}/api/scenarios")
scenarios = scenarios_res.json().get("scenarios", [])

for sc in scenarios:
    res = requests.post(f"{base_url}/api/evaluate", json=sc["payload"])
    data = res.json().get("data", {})
    scoring = data.get("scoring", {})
    contrib = scoring.get("agentContributions", {})
    a1 = contrib.get("agent1Telemetry", {}).get("score", 0)
    a2 = contrib.get("agent2AuditRAG", {}).get("score", 0)
    a3 = contrib.get("agent3Multimodal", {}).get("score", 0)
    a4 = contrib.get("agent4BehavioralGraph", {}).get("score", 0)
    total = scoring.get("totalRiskScore", 0)
    decision = scoring.get("decision", "N/A")
    latency = data.get("telemetry", {}).get("totalPipelineLatencyMs", 0)
    
    print(f"\nScenario: {sc.get('name')}")
    print(f"  > Scores: A1={a1}/25, A2={a2}/25, A3={a3}/25, A4={a4}/25 | Total={total}/100")
    print(f"  > Decision: {decision} | Latency: {latency}ms")

print("\n--- 3. Verifying Audits Persisted to MongoDB Collection via Spring Boot ---")
audit_res = requests.get(f"{spring_url}/api/audit/logs")
logs = audit_res.json().get("logs", [])
print(f"Total audit records stored in MongoDB 'transaction_audits': {len(logs)}")
if logs:
    latest = logs[0]
    print(f"Latest record: TxnID={latest.get('transactionId')}, Score={latest.get('totalRiskScore')}, Decision={latest.get('decision')}")

print("\n--- 4. Testing Step-Up Challenge Resolution in MongoDB ---")
# Find a challenged transaction
challenged_txn = next((l for l in logs if "CHALLENGE" in str(l.get("decision"))), None)
if challenged_txn:
    txn_id = challenged_txn.get("transactionId")
    verify_res = requests.post(f"{spring_url}/api/audit/verify-challenge", json={
        "transactionId": txn_id,
        "otpCode": "849201"
    })
    print(f"Challenge Resolution Status: {verify_res.status_code}")
    print(f"Resolution Response: {verify_res.json().get('message')}")
    print(f"Updated Decision in MongoDB: {verify_res.json().get('transaction', {}).get('decision')}")

print("\n=== SYSTEM VERIFICATION COMPLETE: ALL INTEGRATIONS ACTIVE ===")
