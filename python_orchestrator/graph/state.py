"""
LangGraph State Definition for AegisGuard Multi-Agent Fraud Detection
=====================================================================
Defines the shared state that flows through all agent nodes in the graph,
and Pydantic models used for Google Gemini structured output via LangChain.
"""

from typing import TypedDict
from pydantic import BaseModel, Field


# ============================================================================
# Pydantic Models for Google Gemini Structured Output (via LangChain)
# Each model defines the exact schema Gemini must return for type-safe parsing.
# ============================================================================

class TelemetryGeminiInsight(BaseModel):
    """Gemini's analysis of transaction telemetry anomalies."""
    anomaly_summary: str = Field(
        description="Concise 2-sentence explanation of the key telemetry anomalies detected"
    )
    risk_confidence: float = Field(
        ge=0.0, le=1.0,
        description="Confidence level (0.0-1.0) that this transaction exhibits anomalous telemetry"
    )
    recommended_action: str = Field(
        description="Suggested next step for this telemetry risk profile"
    )


class AuditRAGAssessment(BaseModel):
    """Gemini RAG-enhanced assessment of account security audit signals."""
    risk_points: int = Field(
        ge=0, le=25,
        description="AI-assessed risk score from 0 to 25 based on audit evidence"
    )
    threat_category: str = Field(
        description="Primary threat classification (e.g., Account Takeover, Credential Stuffing, Authorized)"
    )
    reasoning: str = Field(
        description="2-sentence forensic security explanation of the risk assessment"
    )
    is_account_takeover_likely: bool = Field(
        description="Whether this transaction pattern matches known Account Takeover vectors"
    )


class MultimodalAssessment(BaseModel):
    """Gemini's assessment of biometric and document verification signals."""
    risk_points: int = Field(
        ge=0, le=25,
        description="AI-assessed identity risk score from 0 to 25"
    )
    is_presentation_attack: bool = Field(
        description="Whether the biometric input appears to be a spoof, deepfake, or synthetic replay"
    )
    reasoning: str = Field(
        description="2-sentence visual forensic analysis explaining the identity risk assessment"
    )


class BehavioralGraphAssessment(BaseModel):
    """Gemini's assessment of behavioral patterns and network graph risk."""
    risk_points: int = Field(
        ge=0, le=25,
        description="AI-assessed behavioral and graph risk score from 0 to 25"
    )
    threat_category: str = Field(
        description="Behavioral threat classification (e.g., Mule Network, Circadian Anomaly, Normal)"
    )
    reasoning: str = Field(
        description="2-sentence behavioral and graph analysis explanation"
    )
    is_mule_network_suspected: bool = Field(
        description="Whether the beneficiary appears linked to known money mule networks"
    )


class ScamCoercionAssessment(BaseModel):
    """Gemini's assessment of scam narrative, social engineering coercion, and Google Search Grounding."""
    risk_points: int = Field(
        ge=0, le=25,
        description="AI-assessed coercion and scam risk score from 0 to 25"
    )
    threat_category: str = Field(
        description="Scam classification e.g. Law Enforcement Impersonation, Crypto Pig Butchering, Tax Authority Scam, Family Emergency, Normal"
    )
    is_coercion_detected: bool = Field(
        description="Whether the victim appears to be operating under active psychological coercion, deceptive guidance, or remote coaching"
    )
    reasoning: str = Field(
        description="2-sentence forensic security analysis of scam semantics and coercion cues"
    )
    scam_indicators: list[str] = Field(
        default_factory=list,
        description="Specific behavioral and semantic scam flags detected"
    )


# ============================================================================
# LangGraph State — Shared across all nodes in the fraud detection graph
# ============================================================================

class FraudDetectionState(TypedDict, total=False):
    """
    Shared state for the LangGraph Fraud Detection workflow.

    Flow:
      1. Inputs are set before graph invocation (payload, user_profile, etc.)
      2. Each agent node reads inputs and writes to its own result key
      3. The aggregator node reads all agent results and computes the final decision
      4. evaluation_result contains the complete forensic dossier

    Using total=False so agent results default to None before being set.
    """

    # --- Inputs (set before graph invocation) ---
    payload: dict
    user_profile: dict
    velocity_history: list
    gemini_api_key: str
    transaction_id: str

    # --- Agent Results (each agent node writes to exactly one key) ---
    agent1_result: dict  # Set by telemetry_node
    agent2_result: dict  # Set by audit_rag_node
    agent3_result: dict  # Set by multimodal_node
    agent4_result: dict  # Set by behavioral_node
    agent5_result: dict  # Set by scam_coercion_node

    # --- Final Output (set by aggregator node) ---
    evaluation_result: dict

