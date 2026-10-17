#!/usr/bin/env bash
# ==============================================================================
# AegisGuard AI - Cloud Run Deployment Script (Bash / Cloud Shell)
# ==============================================================================

set -euo pipefail

PROJECT_ID="${1:-${GCP_PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-aegisguard-ai}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"

echo "=============================================================================="
echo "              AEGISGUARD AI - GOOGLE CLOUD RUN DEPLOYMENT"
echo "=============================================================================="

if ! command -v gcloud &> /dev/null; then
    echo "[Error] gcloud CLI not found. Please install Google Cloud SDK."
    exit 1
fi

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    read -rp "Enter your Google Cloud Project ID: " PROJECT_ID
fi

# Load GEMINI_API_KEY from .env if present and empty
if [ -z "$GEMINI_API_KEY" ] && [ -f ".env" ]; then
    GEMINI_API_KEY=$(grep -E "^GEMINI_API_KEY=" .env | cut -d '=' -f2- | tr -d ' \r\n' || true)
fi

ENV_VARS="HOST=0.0.0.0"
if [ -n "$GEMINI_API_KEY" ]; then
    ENV_VARS="${ENV_VARS},GEMINI_API_KEY=${GEMINI_API_KEY}"
    echo "  > Gemini AI Key detected and attached."
fi

echo "Deploying ${SERVICE_NAME} to project ${PROJECT_ID} in ${REGION}..."

gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "$ENV_VARS"

echo "[Success] Deployment complete!"
