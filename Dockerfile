# ==============================================================================
# AegisGuard AI - Multimodal Fraud Intelligence System
# Production Multi-Stage Dockerfile for Google Cloud Run
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Frontend & Simulator Asset Compilation (Node.js)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Optimize layer caching: copy dependency manifests first
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy application sources needed for Vite builds
COPY index.html vite.config.js vite.simulator.config.js tsconfig*.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY simulator/ ./simulator/

# Compile Angular 21 Golden Layout Dashboard & Threat Simulator Studio
RUN npm run build:all

# ------------------------------------------------------------------------------
# STAGE 2: Python AI Orchestrator Runtime (FastAPI + LangGraph + Gemini Swarm)
# ------------------------------------------------------------------------------
FROM python:3.11-slim AS production

# System optimizations & Cloud Run environment defaults
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    HOST=0.0.0.0 \
    PYTHONPATH=/app/python_orchestrator

WORKDIR /app

# Install minimal runtime system utilities (curl for health check, certificates)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create secure non-root user for Cloud Run execution
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup --home /app --shell /bin/bash appuser

# Install Python dependencies
COPY python_orchestrator/requirements.txt ./python_orchestrator/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./python_orchestrator/requirements.txt

# Copy built frontend distributions from Stage 1
COPY --from=frontend-builder --chown=appuser:appgroup /build/dist ./dist
COPY --from=frontend-builder --chown=appuser:appgroup /build/simulator/dist ./simulator/dist
COPY --chown=appuser:appgroup public ./public

# Copy Python Swarm Orchestrator source code
COPY --chown=appuser:appgroup python_orchestrator/ ./python_orchestrator/

# Ensure correct file permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose default Cloud Run port
EXPOSE 8080

# Cloud Run healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start Uvicorn web server dynamically bound to Cloud Run's $PORT
# Using 'exec' ensures Uvicorn receives OS signals (SIGTERM) directly for graceful scale-down
CMD ["sh", "-c", "exec uvicorn main:app --app-dir python_orchestrator --host 0.0.0.0 --port ${PORT:-8080} --workers 2"]
