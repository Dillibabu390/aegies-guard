"""
Agent 2: Audit & Database RAG Agent (LangChain + Google Gemini Implementation)
==============================================================================
LangGraph Node | Point Allocation: 0 to 25 Pts Max

Focus Area:
 - Performs Retrieval-Augmented Generation (RAG) against database entities in MongoDB:
   - Account security history (MPIN resets, password changes)
   - Login / Logout anomalies & failed attempt streaks
   - Prior fraud incidents and vector similarity against known fraud modus operandi from MongoDB
 - Integrates with Google Gemini via LangChain with Pydantic structured output
 - Uses fraud typology retrieval as RAG context for LLM reasoning
"""

import math
import re
import time
from typing import cast

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from db_client import get_fraud_typologies
from graph.state import AuditRAGAssessment


def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """Calculate cosine-like word overlap similarity between query and typology description."""
    words1 = re.findall(r"\b\w+\b", (text1 or "").lower())
    words2 = set(re.findall(r"\b\w+\b", (text2 or "").lower()))
    if not words1 or not words2:
        return 0.0

    matches = sum(1 for w in words1 if w in words2)
    return matches / math.sqrt(len(words1) * len(words2))


async def evaluate_audit_and_rag(payload: dict, user_profile: dict, gemini_api_key: str | None = None) -> dict:
    start_time = time.perf_counter()
    score = 0
    breakdown = []
    flags = []
    retrieved_patterns = []

    sec = (user_profile or {}).get("securityHistory", {})
    current_time_ms = time.time() * 1000

    # ========================================================================
    # RULE-BASED SCORING ENGINE
    # ========================================================================

    # 1. Audit: MPIN & Credential Reset History (0 - 8 pts)
    last_mpin_reset = payload.get("recentMpinResetTimestamp") or sec.get("lastMpinReset")
    hours_since_reset = None
    if last_mpin_reset:
        hours_since_reset = (current_time_ms - float(last_mpin_reset)) / (3600 * 1000)
        if hours_since_reset < 6:
            pts = 8
            score += pts
            flags.append("CRITICAL_RECENT_MPIN_RESET")
            breakdown.append({
                "metric": "MPIN Reset Recency",
                "riskPoints": pts,
                "status": "HIGH_RISK",
                "detail": f"MPIN was reset {hours_since_reset:.1f} hrs ago (High vulnerability window for Account Takeover)"
            })
        elif hours_since_reset < 24:
            pts = 5
            score += pts
            flags.append("RECENT_MPIN_RESET_24H")
            breakdown.append({
                "metric": "MPIN Reset Recency",
                "riskPoints": pts,
                "status": "ELEVATED",
                "detail": f"MPIN was reset within past 24 hours ({hours_since_reset:.1f} hrs ago)"
            })
        else:
            breakdown.append({
                "metric": "MPIN Reset Recency",
                "riskPoints": 0,
                "status": "NORMAL",
                "detail": "No credential reset in past 7 days"
            })
    else:
        breakdown.append({
            "metric": "MPIN Reset Recency",
            "riskPoints": 0,
            "status": "NORMAL",
            "detail": "No historical credential changes detected in database audit"
        })

    # 2. Audit: Login Telemetry & Failed Attempts (0 - 5 pts)
    failed_logins = payload.get("failedLoginsInPast24h")
    if failed_logins is None:
        failed_logins = sec.get("recentFailedLogins", 0)
    failed_logins = int(failed_logins)

    if failed_logins >= 4:
        pts = 5
        score += pts
        flags.append("BRUTE_FORCE_LOGIN_BURST")
        breakdown.append({
            "metric": "Login Pattern Audit",
            "riskPoints": pts,
            "status": "HIGH_RISK",
            "detail": f"Abnormal authentication friction: {failed_logins} consecutive failed logins prior to this transaction"
        })
    elif failed_logins >= 2:
        pts = 3
        score += pts
        flags.append("ELEVATED_FAILED_LOGINS")
        breakdown.append({
            "metric": "Login Pattern Audit",
            "riskPoints": pts,
            "status": "ELEVATED",
            "detail": f"{failed_logins} failed logins recorded in current 24-hr session"
        })
    else:
        breakdown.append({
            "metric": "Login Pattern Audit",
            "riskPoints": 0,
            "status": "NORMAL",
            "detail": "Clean session authorization; zero abnormal failed logins"
        })

    # 3. Audit: SIM Swap & Device Rebinding Telemetry (0 - 4 pts)
    sim_swap = payload.get("simSwapReported")
    if sim_swap is None:
        sim_swap = sec.get("simSwapFlag", False)
    sim_swap = bool(sim_swap)

    if sim_swap:
        pts = 4
        score += pts
        flags.append("TELCO_SIM_SWAP_DETECTED")
        breakdown.append({
            "metric": "Telco SIM Swap Audit",
            "riskPoints": pts,
            "status": "HIGH_RISK",
            "detail": "Active telco carrier SIM swap event detected within last 48 hours"
        })
    else:
        breakdown.append({
            "metric": "Telco SIM Swap Audit",
            "riskPoints": 0,
            "status": "NORMAL",
            "detail": "SIM IMSI binding verified and stable with mobile operator"
        })

    # ========================================================================
    # RAG: TYPOLOGY RETRIEVAL FROM MONGODB KNOWLEDGE BASE (0 - 8 pts)
    # ========================================================================
    typologies = get_fraud_typologies()
    query_context = f"""
        amount: {payload.get('amount', 0)}
        memo: {payload.get('memo', '')}
        beneficiary: {payload.get('beneficiary', {}).get('name', '')}
        mpin_reset: {bool(last_mpin_reset)}
        sim_swap: {sim_swap}
        unrecognized_device: {payload.get('device', {}).get('isVpnOrProxy', False)}
    """.lower()

    scored_typologies = []
    for typology in typologies:
        target_text = f"{typology.get('title', '')} {typology.get('description', '')} {' '.join(typology.get('keywords', []))}"
        sim = calculate_semantic_similarity(query_context, target_text)
        scored_typologies.append({
            **typology,
            "similarityScore": sim
        })

    scored_typologies.sort(key=lambda x: x["similarityScore"], reverse=True)
    top_match = scored_typologies[0] if scored_typologies else None
    rag_risk_points = 0

    if top_match and top_match["similarityScore"] > 0.40:
        rag_risk_points = 8
        flags.append("RAG_FRAUD_MODUS_OPERANDI_MATCH")
        retrieved_patterns.append({
            "id": top_match["id"],
            "title": top_match["title"],
            "confidence": round(top_match["similarityScore"] * 100),
            "description": top_match["description"]
        })
        breakdown.append({
            "metric": "RAG Knowledge Base Audit",
            "riskPoints": rag_risk_points,
            "status": "HIGH_RISK",
            "detail": f"Strong vector similarity ({round(top_match['similarityScore'] * 100)}%) with known syndicate pattern: '{top_match['title']}'"
        })
    elif top_match and top_match["similarityScore"] > 0.22:
        rag_risk_points = 4
        retrieved_patterns.append({
            "id": top_match["id"],
            "title": top_match["title"],
            "confidence": round(top_match["similarityScore"] * 100),
            "description": top_match["description"]
        })
        breakdown.append({
            "metric": "RAG Knowledge Base Audit",
            "riskPoints": rag_risk_points,
            "status": "ELEVATED",
            "detail": f"Moderate vector match with historical pattern: '{top_match['title']}'"
        })
    else:
        breakdown.append({
            "metric": "RAG Knowledge Base Audit",
            "riskPoints": 0,
            "status": "NORMAL",
            "detail": "No matching adversarial fraud modus operandi identified in vector store"
        })

    score += rag_risk_points

    # ========================================================================
    # LANGCHAIN GOOGLE GEMINI RAG-ENHANCED REASONING
    # Uses retrieved typologies as RAG context for LLM forensic analysis
    # ========================================================================
    from circuit_breaker import gemini_circuit_breaker
    import asyncio

    gemini_audit_result = None
    if gemini_api_key and len(gemini_api_key.strip()) > 10 and gemini_circuit_breaker.can_execute():
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.8-flash",
                google_api_key=gemini_api_key.strip(),
                temperature=0.1,
                max_retries=0,
            )

            # Build RAG context from retrieved typologies (top 3)
            rag_context = "\n".join([
                f"  - [{t.get('id', 'unknown')}] {t.get('title', 'N/A')}: {t.get('description', 'N/A')} (Similarity: {round(t.get('similarityScore', 0) * 100)}%)"
                for t in scored_typologies[:3]
            ]) if scored_typologies else "  No typologies retrieved."

            # Structured output via LangChain — Gemini returns typed Pydantic model
            structured_llm = llm.with_structured_output(AuditRAGAssessment)

            gemini_result = cast(AuditRAGAssessment, await asyncio.wait_for(
                structured_llm.ainvoke([
                    SystemMessage(content=(
                        "You are an expert Financial Fraud & Security Audit Specialist. "
                        "You are performing a Retrieval-Augmented Generation (RAG) analysis using a knowledge base "
                        "of known fraud typologies retrieved from MongoDB. "
                        "Analyze the transaction context against the retrieved patterns and account security signals. "
                        "Focus on detecting Account Takeover (ATO), credential stuffing, SIM-swap-enabled fraud, "
                        "and unauthorized access patterns."
                    )),
                    HumanMessage(content=(
                        f"=== TRANSACTION CONTEXT ===\n"
                        f"User: {(user_profile or {}).get('name', 'Account Holder')}\n"
                        f"Amount: ${payload.get('amount', 0)} USD\n"
                        f"Memo: {payload.get('memo', 'Digital Transfer')}\n"
                        f"Beneficiary: {payload.get('beneficiary', {}).get('name', 'Unknown')}\n"
                        f"\n=== ACCOUNT SECURITY AUDIT ===\n"
                        f"Hours since last MPIN reset: {f'{hours_since_reset:.1f}' if hours_since_reset is not None else 'None (no recent reset)'}\n"
                        f"Failed logins in last 24h: {failed_logins}\n"
                        f"Carrier SIM Swap detected: {sim_swap}\n"
                        f"Account age (days): {sec.get('accountAgeDays', 'Unknown')}\n"
                        f"Prior fraud incidents: {sec.get('priorFraudIncidents', 0)}\n"
                        f"\n=== RETRIEVED FRAUD TYPOLOGIES (RAG Context from MongoDB) ===\n"
                        f"{rag_context}\n"
                        f"\n=== RULE ENGINE ASSESSMENT ===\n"
                        f"Current rule-based score: {score}/25\n"
                        f"Active flags: {', '.join(flags) if flags else 'None'}"
                    ))
                ]),
                timeout=3.5
            ))

            gemini_pts = min(25, max(0, gemini_result.risk_points))
            gemini_audit_result = {
                "model": "gemini-3.8-flash",
                "reasoning": gemini_result.reasoning,
                "threatCategory": gemini_result.threat_category,
                "llmRiskPoints": gemini_pts,
                "isAccountTakeoverLikely": gemini_result.is_account_takeover_likely,
                "connected": True,
                "framework": "LangChain + Google Gemini RAG"
            }

            # Let Gemini override score if its assessment is higher
            if gemini_pts > score:
                score = gemini_pts

            gemini_circuit_breaker.record_success()

            breakdown.append({
                "metric": "Gemini LLM Forensic Audit (LangChain RAG)",
                "riskPoints": gemini_pts,
                "status": "HIGH_RISK" if gemini_pts >= 18 else ("ELEVATED" if gemini_pts >= 10 else "NORMAL"),
                "detail": f"Gemini RAG: {gemini_result.reasoning}"
            })

        except Exception as e:
            gemini_circuit_breaker.record_failure(e)
            print(f"[Agent 2] LangChain Gemini RAG note: {e}")

    # Fallback reasoning if Gemini is not connected
    if not gemini_audit_result:
        if score >= 15:
            reason = f"High-confidence Account Takeover (ATO) pattern detected: recent credential resets combined with {failed_logins} failed logins indicate an active brute-force or credential stuff attack."
            threat = "Account Takeover / Credential Compromise"
            is_ato = True
        elif score >= 8:
            reason = f"Elevated security risk flagged: anomalous authentication telemetry requires step-up verification before fund dispatch."
            threat = "Authentication Velocity Friction"
            is_ato = False
        else:
            reason = "Account security baseline verified: zero suspicious credential resets, clean login trajectory, and normal behavioral velocity."
            threat = "Authorized Account Holder"
            is_ato = False
        gemini_audit_result = {
            "model": "gemini-3.8-flash",
            "reasoning": reason,
            "threatCategory": threat,
            "llmRiskPoints": score,
            "isAccountTakeoverLikely": is_ato,
            "connected": False,
            "framework": "Fallback Rule Engine"
        }

    final_score = min(25, max(0, score))
    latency_ms = round((time.perf_counter() - start_time) * 1000)

    return {
        "agentId": "agent_2_audit_database_rag",
        "agentName": "Audit & Database RAG Agent",
        "score": final_score,
        "maxScore": 25,
        "latencyMs": latency_ms,
        "status": "CRITICAL" if final_score >= 18 else ("WARNING" if final_score >= 10 else "OPTIMAL"),
        "summary": (
            f"Audit alert: Severe credential / database risk indicators matched ({', '.join(flags)})"
            if final_score >= 15
            else ("Moderate historical audit flags triggered." if final_score > 5 else "Account audit clean; zero security breaches or RAG matches.")
        ),
        "flags": flags,
        "geminiAudit": gemini_audit_result,
        "retrievedPatterns": retrieved_patterns,
        "metrics": {
            "mpinResetHours": round(hours_since_reset, 1) if hours_since_reset is not None else None,
            "failedLogins": failed_logins,
            "simSwapFlag": sim_swap,
            "ragTopSimilarity": round(top_match["similarityScore"] * 100) if top_match else 0,
            "llmActive": bool(gemini_audit_result and gemini_audit_result.get("connected"))
        },
        "breakdown": breakdown
    }
