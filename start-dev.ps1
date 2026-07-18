# SmartSave AI Wallet — Cross-Service Local Startup Script (Windows PowerShell)
# Starts all services sequentially in separate terminal threads.

$root = $PSScriptRoot

Write-Host "Launching SmartSave AI Wallet Subsystems..." -ForegroundColor Green
Write-Host "Project root: $root" -ForegroundColor DarkGray

# 1. Database check (using local PostgreSQL — Docker not required)
Write-Host "Using local PostgreSQL database..." -ForegroundColor Cyan

# 2. Boot Wallet MCP Server on port 5003
Write-Host "Booting Wallet MCP Server (Port 5003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\mcp\wallet-server'; python app.py`"" -WindowStyle Normal

# 3. Boot OCR MCP Server on port 5001
Write-Host "Booting OCR MCP Server (Port 5001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\mcp\ocr-server'; python app.py`"" -WindowStyle Normal

# 4. Boot AI Verification MCP Server on port 5002
Write-Host "Booting AI Verification MCP Server (Port 5002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\mcp\ai-server'; python app.py`"" -WindowStyle Normal

# 5. Boot Express Backend on port 5000
Write-Host "Booting Express API Backend (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\server'; npm run dev`"" -WindowStyle Normal

# 6. Boot Next.js Frontend Client Dashboard on port 3000
Write-Host "Booting Next.js Client Dashboard (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$root\apps\web'; npm run dev`"" -WindowStyle Normal

Write-Host "All systems initiated! Check the console windows." -ForegroundColor Green
