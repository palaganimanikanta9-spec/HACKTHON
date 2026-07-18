# SmartSave AI Verification MCP Server

This is the AI Verification Model Context Protocol (MCP) server for **SmartSave AI Wallet**.

It consumes document OCR text and determines if it represents an **ESSENTIAL** or **NON-ESSENTIAL** expense.

---

## 1. Directory Structure
```
ai-server/
├── app.py              # Main FastAPI / FastMCP server code
├── requirements.txt    # Python dependencies
├── tests/
│   └── test_ai.py      # Classification unit tests
└── README.md           # Documentation
```

---

## 2. Dependencies
- **google-generativeai**: SDK for calling Google Gemini API
- **FastMCP**: Model Context Protocol loop
- **FastAPI** / **Uvicorn**: REST API framework

---

## 3. Classification Engine

### Essential Categories (Approved):
- Medical, Education, Electricity, Water, Gas, Internet, Rent, Insurance, Government Fee, Transportation, Food Essentials, Emergency Repairs.

### Non-Essential Categories (Blocked):
- Shopping, Luxury, Gaming, Entertainment, Vacation, Restaurant, Electronics, Fashion, Subscription Services.

*Note: If `GEMINI_API_KEY` is not present, the server uses a strict keyword/regex word boundary local rules classifier (`heuristic-fallback`) that replicates the decision matrices locally.*

---

## 4. Running the Server

### Start the REST API Server (Port 5002)
```bash
python app.py
```

### Start the MCP stdio Server
```bash
python app.py mcp
```

### Querying the `/verify` Endpoint
#### Input:
```json
{
    "rawText": "HOSPITAL EMERGENCY INVOICE\nTotal: $750.00\nDate: 2026-07-17",
    "merchant": "HOSPITAL EMERGENCY SERVICES",
    "amount": "750.00"
}
```

#### Output:
```json
{
    "approved": true,
    "essential": true,
    "category": "Medical",
    "confidence": 0.98,
    "reason": "Hospital invoice detected. Medical treatment is classified as an essential expense.",
    "model": "gemini-2.5-flash"
}
```
