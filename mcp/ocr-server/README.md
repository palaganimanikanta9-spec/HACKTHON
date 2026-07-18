# SmartSave OCR MCP Server

This is the dedicated OCR Model Context Protocol (MCP) server for **SmartSave AI Wallet**.

It provides document text extraction from PDFs, PNGs, and JPEGs. It is built using Python, FastAPI, OpenCV image preprocessing, and Tesseract OCR.

---

## 1. Directory Structure

```
ocr-server/
├── app.py              # Main FastAPI / FastMCP server code
├── requirements.txt    # Python dependency manifest
└── README.md           # Documentation
```

---

## 2. Dependencies
- **Tesseract OCR**: (System dependency, optional fallback simulator included)
- **FastAPI** / **Uvicorn**: REST API server layer
- **OpenCV Headless**: Image processing (grayscale, Otsu binarization, normalization)
- **PyPDF**: Native digital PDF text extractor
- **FastMCP**: Model Context Protocol integration

---

## 3. Running the Server

### Start the REST API Server (Port 5001)
```bash
python app.py
```
This launches a FastAPI listener on `http://localhost:5001`.

### Start the MCP stdio Server
```bash
python app.py mcp
```
This runs the FastMCP stdio interface loop, letting any MCP client query tools.

---

## 4. API Endpoints

### `POST /ocr`
Accepts document formats. Supports local file paths or raw file uploads.

#### Query Options:
- `file_path`: Path to local file (e.g. `uploads/proof-xyz.png`)
- `default_amount`: (Optional) Float amount to populate if regex parsing fails

#### Response JSON:
```json
{
  "success": true,
  "rawText": "HOSPITAL EMERGENCY INVOICE\nTotal: $750.00\nDate: 2026-07-17",
  "confidence": 0.95,
  "pages": 1,
  "fields": {
    "merchant": "Hospital Emergency Services",
    "date": "2026-07-17",
    "amount": "750.00"
  }
}
```
