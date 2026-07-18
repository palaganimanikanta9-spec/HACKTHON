# SmartSave Wallet MCP Server

This is the Wallet balance operations Model Context Protocol (MCP) server for **SmartSave AI Wallet**.

It handles atomically modifying balances across Main Wallet, Normal Savings, and Strict Savings using Postgres row-level locks to prevent concurrency race conditions.

---

## 1. Directory Structure
```
wallet-server/
├── app.py              # Main FastAPI / FastMCP server code
├── requirements.txt    # Python dependencies
├── tests/
│   └── test_wallet.py  # Model structure unit tests
└── README.md           # Documentation
```

---

## 2. Balance Operations API

### Endpoint: `/transfer` (POST)
Executes balance changes between internal wallets or external sources.

#### Support values for `from` & `to`:
- `MAIN_WALLET` -> Main Spending Card Wallet
- `NORMAL_SAVINGS` -> Flexible savings balance
- `STRICT_SAVINGS` -> Locked protected vault balance
- `EXTERNAL` -> Cash/Card deposit/withdrawal source

---

## 3. Concurrency Protection & Safety
The server utilizes Postgres transactions and raw row locking (`SELECT FOR UPDATE`) during balance deductions to eliminate race conditions, double-spend vulnerabilities, and account balance inconsistencies.

---

## 4. Running the Server

### Start the REST API Server (Port 5003)
```bash
python app.py
```

### Start the MCP stdio Server
```bash
python app.py mcp
```
