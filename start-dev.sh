#!/bin/bash
# SmartSave AI Wallet — Linux/macOS Startup script
# Launches all services in separate terminal tabs/background.

echo -e "\e[32m🚀 Launching SmartSave AI Wallet Subsystems...\e[0m"

# 1. Start postgres database
echo -e "\e[36m🔑 Starting postgres database container...\e[0m"
docker-compose up -d db

# 2. Start Wallet MCP Server
echo -e "\e[36m💳 Starting Wallet MCP Server (Port 5003)...\e[0m"
cd mcp/wallet-server && python3 app.py &
WALLET_PID=$!
cd ../..

# 3. Start OCR MCP Server
echo -e "\e[36m👁️ Starting OCR MCP Server (Port 5001)...\e[0m"
cd mcp/ocr-server && python3 app.py &
OCR_PID=$!
cd ../..

# 4. Start AI Verification MCP Server
echo -e "\e[36m🧠 Starting AI Verification MCP Server (Port 5002)...\e[0m"
cd mcp/ai-server && python3 app.py &
AI_PID=$!
cd ../..

# 5. Start Express Backend
echo -e "\e[36m🔌 Starting Express API Backend (Port 5000)...\e[0m"
cd server && npm run dev &
SERVER_PID=$!
cd ..

# 6. Start Next.js Frontend
echo -e "\e[36m💻 Starting Next.js Client (Port 3000)...\e[0m"
cd apps/web && npm run dev &
WEB_PID=$!
cd ../..

echo -e "\e[32m✅ All systems booted! Press Ctrl+C to terminate all services.\e[0m"

trap "kill $WALLET_PID $OCR_PID $AI_PID $SERVER_PID $WEB_PID" EXIT
wait
