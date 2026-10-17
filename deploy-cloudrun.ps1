# ==============================================================================
# AegisGuard AI - Cloud Run Deployment Script (PowerShell)
# ==============================================================================

param (
    [string]$ProjectId = "",
    [string]$Region = "us-central1",
    [string]$ServiceName = "aegisguard-ai",
    [string]$GeminiApiKey = ""
)

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "              AEGISGUARD AI - GOOGLE CLOUD RUN DEPLOYMENT" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Auto-detect and ensure gcloud is in PATH
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $candidatePaths = @(
        "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin",
        "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin",
        "${env:ProgramFiles(x86)}\Google\Cloud SDK\google-cloud-sdk\bin"
    )
    foreach ($cand in $candidatePaths) {
        if ($cand -and (Test-Path "$cand\gcloud.cmd")) {
            $env:PATH = "$cand;$env:PATH"
            break
        }
    }
}

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "[Notice] Google Cloud SDK ('gcloud') is not currently found in your PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick ways to proceed:" -ForegroundColor Cyan
    Write-Host "  1. Install via Windows Package Manager (run in PowerShell):" -ForegroundColor White
    Write-Host "     winget install --id Google.CloudSDK -e --accept-source-agreements" -ForegroundColor Green
    Write-Host ""
    Write-Host "  2. Download the official Windows Installer:" -ForegroundColor White
    Write-Host "     https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -ForegroundColor Green
    Write-Host ""
    Write-Host "  3. Deploy via Google Cloud Shell (Zero Local Setup):" -ForegroundColor White
    Write-Host "     Open https://shell.cloud.google.com, clone/upload your repo, and run: ./deploy-cloudrun.sh" -ForegroundColor Green
    Write-Host ""
    exit 1
}

# 2. Check for active GCP credentials
$activeAccount = (gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null)
if (-not $activeAccount) {
    Write-Host "`n[Authentication Required] No logged-in Google Cloud account found." -ForegroundColor Yellow
    Write-Host "Launching Google Cloud authentication in your web browser..." -ForegroundColor Cyan
    gcloud auth login
    $activeAccount = (gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null)
}

# 3. Get current active GCP project if not provided
if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null)
    if (-not $ProjectId -or $ProjectId -eq "(unset)") {
        $ProjectId = Read-Host "Enter your Google Cloud Project ID"
    }
}

Write-Host "`nTarget Deployment Target:" -ForegroundColor Yellow
Write-Host "  Project ID:   $ProjectId" -ForegroundColor Green
Write-Host "  Service Name: $ServiceName" -ForegroundColor Green
Write-Host "  Region:       $Region" -ForegroundColor Green

# 3. Read GEMINI_API_KEY from .env if not specified
if (-not $GeminiApiKey -and (Test-Path ".env")) {
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "^GEMINI_API_KEY=(.+)$") {
            $GeminiApiKey = $matches[1].Trim()
            break
        }
    }
}

# 4. Prepare Environment Variables string
$envVars = "HOST=0.0.0.0"
if ($GeminiApiKey) {
    $envVars += ",GEMINI_API_KEY=$GeminiApiKey"
    Write-Host "  Gemini AI:    API Key detected and included." -ForegroundColor Green
} else {
    Write-Host "  Gemini AI:    No API Key passed; fallback rule engines will engage." -ForegroundColor Gray
}

# 5. Execute Cloud Run source deployment
Write-Host "`nInitiating Google Cloud Run build & deployment from source..." -ForegroundColor Cyan
Write-Host "Command: gcloud run deploy $ServiceName --source . --project $ProjectId --region $Region --platform managed --allow-unauthenticated`n" -ForegroundColor DarkGray

gcloud run deploy $ServiceName `
    --source . `
    --project $ProjectId `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 1Gi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --set-env-vars $envVars `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[Success] AegisGuard AI is live on Cloud Run!" -ForegroundColor Green
} else {
    Write-Host "`n[Failed] Cloud Run deployment failed with code $LASTEXITCODE." -ForegroundColor Red
}
