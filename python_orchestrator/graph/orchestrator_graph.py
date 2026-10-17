"""
LangGraph Multi-Agent Orchestration Flow
========================================
Builds the LangGraph StateGraph that executes the 4 AI agents in parallel
and aggregates their results into a final risk decision.
"""

import time
from datetime import datetime

from langgraph.graph import StateGraph, START, END
from graph.state import FraudDetectionState

# Import the refactored LangChain-enabled agents
from agents.agent1_telemetry import evaluate_telemetry_and_velocity
from agents.agent2_audit_rag import evaluate_audit_and_rag
from agents.agent3_multimodal import evaluate_multimodal_identity
from agents.agent4_behavioral_graph import evaluate_behavioral_and_graph
from agents.agent5_scam_coercion import evaluate_scam_and_coercion


# ============================================================================
# LangGraph Node Definitions
# ============================================================================

async def telemetry_node(state: FraudDetectionState) -> FraudDetectionState:
    """Agent 1: Evaluates telemetry and writes to agent1_result."""
    result = await evaluate_telemetry_and_velocity(
        payload=state["payload"],
        user_profile=state["user_profile"],
        velocity_history=state["velocity_history"],
        gemini_api_key=state["gemini_api_key"]
    )
    return {"agent1_result": result}


async def audit_rag_node(state: FraudDetectionState) -> FraudDetectionState:
    """Agent 2: Evaluates Audit RAG and writes to agent2_result."""
    result = await evaluate_audit_and_rag(
        payload=state["payload"],
        user_profile=state["user_profile"],
        gemini_api_key=state["gemini_api_key"]
    )
    return {"agent2_result": result}


async def multimodal_node(state: FraudDetectionState) -> FraudDetectionState:
    """Agent 3: Evaluates multimodal signals and writes to agent3_result."""
    result = await evaluate_multimodal_identity(
        payload=state["payload"],
        user_profile=state["user_profile"],
        gemini_api_key=state["gemini_api_key"]
    )
    return {"agent3_result": result}


async def behavioral_node(state: FraudDetectionState) -> FraudDetectionState:
    """Agent 4: Evaluates behavioral graph and writes to agent4_result."""
    result = await evaluate_behavioral_and_graph(
        payload=state["payload"],
        user_profile=state["user_profile"],
        gemini_api_key=state["gemini_api_key"]
    )
    return {"agent4_result": result}


async def scam_coercion_node(state: FraudDetectionState) -> FraudDetectionState:
    """Agent 5: Evaluates scam narrative, coercion, and Google Search Grounding."""
    result = await evaluate_scam_and_coercion(
        payload=state["payload"],
        user_profile=state["user_profile"],
        gemini_api_key=state["gemini_api_key"]
    )
    return {"agent5_result": result}


async def aggregator_node(state: FraudDetectionState) -> FraudDetectionState:
    """
    Aggregator: Runs after all 5 agents complete.
    Computes final risk score, applies policy engine, and formats the output dossier.
    """
    a1 = state["agent1_result"]
    a2 = state["agent2_result"]
    a3 = state["agent3_result"]
    a4 = state["agent4_result"]
    a5 = state.get("agent5_result") or {
        "score": 0, "status": "NORMAL", "summary": "No scam signals",
        "threatCategory": "Normal", "isCoercionDetected": False, "breakdown": [], "flags": [],
        "latencyMs": 0, "metrics": {}, "llmInsight": {}
    }
    
    payload = state["payload"]
    user_profile = state["user_profile"]

    # Score Aggregation (0 - 100 Scale normalized from 5 x 25 = 125 max)
    raw_sum = a1["score"] + a2["score"] + a3["score"] + a4["score"] + a5["score"]
    total_score = min(100, max(0, round((raw_sum * 100) / 125)))

    # Coercion and Policy Decision Engine
    is_coerced = a5.get("isCoercionDetected", False)
    all_flags = (
        (a1.get("flags") or []) +
        (a2.get("flags") or []) +
        (a3.get("flags") or []) +
        (a4.get("flags") or []) +
        (a5.get("flags") or [])
    )

    # Critical Fraud Hard Triggers
    has_critical_attack = (
        ("IMPOSSIBLE_TRAVEL_VELOCITY" in all_flags and ("DEVICE_ROOTED_OR_JAILBROKEN" in all_flags or "UNTRUSTED_DEVICE_ORIGIN" in all_flags or "PROXY_OR_VPN_DETECTED" in all_flags)) or
        "DEEPFAKE_OR_SPOOF_DETECTED" in all_flags or
        "DOCUMENT_TAMPERING_DETECTED" in all_flags or
        "SANCTIONED_NODE_TRANSFER" in all_flags or
        "MULE_AGGREGATOR_CLUSTER" in all_flags or
        a3.get("geminiVision", {}).get("isDeepfakeOrSpoof", False) or
        (a1.get("score", 0) >= 15 and a3.get("score", 0) >= 10)  # Telemetry jump + Biometric mismatch
    )

    if (total_score >= 60) or (has_critical_attack and total_score >= 25):
        decision = "BLOCK"
        decision_level = "CRITICAL"
        action_required = "COERCION_HALT_AND_FREEZE" if (is_coerced and total_score >= 65) else "LOCK_ACCOUNT_AND_HALT"
        recommended_action_text = (
            f"Severe social engineering & psychological coercion confirmed ({a5.get('threatCategory', 'APP Scam')}). Fund transfer blocked; victim account shielded."
            if (is_coerced and total_score >= 65) else
            f"Severe multi-vector fraud indicators confirmed ({', '.join(all_flags[:2])}). Transaction blocked; account placed on security hold."
        )
    elif is_coerced or (total_score >= 25):
        decision = "CHALLENGE"
        decision_level = "WARNING"
        action_required = "DEBIASING_INTERVENTION" if is_coerced else "STEP_UP_AUTHENTICATION"
        recommended_action_text = (
            f"Psychological coercion detected ({a5.get('threatCategory', 'Social Engineering')}). Mandatory AI De-Biasing scam interview deployed to mobile simulator."
            if is_coerced else
            "Elevated aggregate risk score. Step-up authentication required (Dynamic OTP / Biometric verification challenge)."
        )
    else:
        decision = "APPROVE"
        decision_level = "SAFE"
        action_required = "TRANSACTION_CLEARED"
        recommended_action_text = "Low risk detected across all 5 agents. Transaction auto-approved and dispatched to clearing network."

    from datetime import timezone
    evaluation_result = {
        "transactionId": state["transaction_id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": user_profile.get("id", payload.get("userId")),
            "name": user_profile.get("name", "Account Holder"),
            "accountNumber": user_profile.get("accountNumber", "ACC_UNKNOWN")
        },
        "transactionDetails": {
            "amount": float(payload.get("amount", 0.0)),
            "currency": payload.get("currency", "USD"),
            "beneficiary": payload.get("beneficiary", {"name": "Unknown", "accountNumber": "ACC_UNKNOWN"}),
            "memo": payload.get("memo", "Digital Payment")
        },
        "scoring": {
            "totalRiskScore": total_score,
            "maxScore": 100,
            "decision": decision,
            "decisionLevel": decision_level,
            "actionRequired": action_required,
            "recommendedActionText": recommended_action_text,
            "isCoercionDetected": is_coerced,
            "agentContributions": {
                "agent1Telemetry": {"score": a1["score"], "max": 25, "percentage": round((a1["score"] / 25) * 100)},
                "agent2AuditRAG": {"score": a2["score"], "max": 25, "percentage": round((a2["score"] / 25) * 100)},
                "agent3Multimodal": {"score": a3["score"], "max": 25, "percentage": round((a3["score"] / 25) * 100)},
                "agent4BehavioralGraph": {"score": a4["score"], "max": 25, "percentage": round((a4["score"] / 25) * 100)},
                "agent5ScamCoercion": {"score": a5["score"], "max": 25, "percentage": round((a5["score"] / 25) * 100)}
            }
        },
        "agentResults": {
            "agent1": a1,
            "agent2": a2,
            "agent3": a3,
            "agent4": a4,
            "agent5": a5
        },
        "flags": all_flags,
        "reasons": [
            b.get("whatHappened") or b.get("detail")
            for agent in [a1, a2, a3, a4, a5]
            for b in agent.get("breakdown", [])
            if b.get("riskPoints", 0) > 0
        ] or [recommended_action_text],
        "telemetry": {
            "orchestratorEngine": "LANGGRAPH_5_AGENT_FASTAPI",
            "databaseEngine": "SPRING_BOOT_MONGODB",
            "timestamp": int(time.time() * 1000)
        },
        "stepUpStatus": "PENDING_CHALLENGE" if decision == "CHALLENGE" else ("VERIFIED" if decision == "APPROVE" else "FAILED")
    }

    return {"evaluation_result": evaluation_result}


# ============================================================================
# Build the LangGraph
# ============================================================================

def build_fraud_detection_graph():
    # 1. Initialize StateGraph
    builder = StateGraph(FraudDetectionState)

    # 2. Add Nodes (5 Parallel Microservice Agents + 1 Aggregator)
    builder.add_node("telemetry_agent", telemetry_node)
    builder.add_node("audit_rag_agent", audit_rag_node)
    builder.add_node("multimodal_agent", multimodal_node)
    builder.add_node("behavioral_agent", behavioral_node)
    builder.add_node("scam_coercion_agent", scam_coercion_node)
    builder.add_node("aggregator", aggregator_node)

    # 3. Define Edges for Parallel Execution
    # Start -> All 5 agents run concurrently
    builder.add_edge(START, "telemetry_agent")
    builder.add_edge(START, "audit_rag_agent")
    builder.add_edge(START, "multimodal_agent")
    builder.add_edge(START, "behavioral_agent")
    builder.add_edge(START, "scam_coercion_agent")

    # All 5 agents -> Aggregator
    builder.add_edge("telemetry_agent", "aggregator")
    builder.add_edge("audit_rag_agent", "aggregator")
    builder.add_edge("multimodal_agent", "aggregator")
    builder.add_edge("behavioral_agent", "aggregator")
    builder.add_edge("scam_coercion_agent", "aggregator")

    # Aggregator -> End
    builder.add_edge("aggregator", END)

    # 4. Compile the graph
    return builder.compile()

# Export a compiled instance
fraud_graph = build_fraud_detection_graph()

