# AegisGuard AI - PowerShell Launcher Script
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "              AEGISGUARD AI - MULTIMODAL FRAUD INTELLIGENCE" -ForegroundColor White
Write-Host "              Two-Phase Pre-Settlement Multi-Agent Swarm System" -ForegroundColor DarkCyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ports & Services:" -ForegroundColor Yellow
Write-Host "  -> Python Orchestrator:         http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  -> Main Golden-Layout Terminal: http://localhost:5173" -ForegroundColor Green
Write-Host "  -> Threat Simulator Studio:     http://localhost:5174" -ForegroundColor Green
Write-Host ""
Write-Host "Launching services concurrently via npm run dev..." -ForegroundColor Gray

cmd.exe /c npm run dev
