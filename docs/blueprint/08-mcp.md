# 08 — MCP Architecture (OCR + AI Verification)

## 8.1 What is MCP?

**Model Context Protocol (MCP)** is an open standard developed by Anthropic for connecting AI models to tools, data sources, and services. In SmartSave, we use MCP to expose two AI capabilities as structured, callable tools:

1. **OCR Tool** — Extract text from documents
2. **Expense Classification Tool** — Classify extracted text as essential/non-essential

**WHY MCP:**
- Standardized tool interface — swap AI providers without changing the API layer
- Built-in request/response schema validation via JSON Schema
- Each server is independently deployable and scalable
- Clean separation: the Express API knows *what* to call, not *how* AI works
- Future-proof: MCP is becoming the industry standard for AI tool integration
- Enables AI agents to use these tools directly in future iterations

---

## 8.2 MCP Server Architecture

```
Express API
    │
    │  HTTP JSON-RPC (MCP Protocol)
    ├──────────────────────────────►  OCR MCP Server
    │                                   │
    │                                   ├── Google Cloud Vision API
    │                                   │     (Production: high accuracy)
    │                                   └── Tesseract.js
    │                                         (Fallback: offline capable)
    │
    └──────────────────────────────►  AI Verification MCP Server
                                        │
                                        └── OpenAI GPT-4o API
                                              (Structured output mode)
```

---

## 8.3 OCR MCP Server

### Tool Definition

```typescript
// apps/mcp-ocr/src/tools/extract-text.tool.ts

export const extractTextTool = {
  name: "extract_document_text",
  description: `
    Extracts text from an uploaded document image or PDF.
    Supports receipts, bills, invoices, prescriptions, and other financial documents.
    Returns structured extracted text ready for expense classification.
  `,
  inputSchema: {
    type: "object",
    properties: {
      fileBase64: {
        type: "string",
        description: "Base64-encoded file content"
      },
      mimeType: {
        type: "string",
        enum: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
        description: "MIME type of the document"
      },
      filename: {
        type: "string",
        description: "Original filename for logging"
      }
    },
    required: ["fileBase64", "mimeType"]
  }
};
```

### Server Implementation

```typescript
// apps/mcp-ocr/src/server.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { VisionService } from "./services/vision.service.js";

const server = new McpServer({
  name: "smartsave-ocr",
  version: "1.0.0",
});

server.tool(
  "extract_document_text",
  {
    fileBase64: z.string(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
    filename: z.string().optional()
  },
  async ({ fileBase64, mimeType, filename }) => {
    const visionService = new VisionService();
    
    const result = await visionService.extractText(fileBase64, mimeType);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            extractedText: result.text,
            confidence: result.confidence,
            documentType: result.detectedType,  // "receipt" | "bill" | "prescription" | "unknown"
            wordCount: result.wordCount,
            hasAmounts: result.hasAmounts,      // bool: were dollar amounts detected?
            detectedAmounts: result.amounts,    // ["$150.00", "$45.99"]
          })
        }
      ]
    };
  }
);
```

### Vision Service Strategy

```typescript
// apps/mcp-ocr/src/services/vision.service.ts

class VisionService {
  async extractText(base64: string, mimeType: string): Promise<OcrResult> {
    
    if (process.env.GOOGLE_VISION_API_KEY && mimeType !== 'application/pdf') {
      // Primary: Google Cloud Vision (high accuracy on receipts)
      return this.extractWithGoogleVision(base64, mimeType);
    }
    
    if (mimeType === 'application/pdf') {
      // PDFs: Convert to image first, then Vision
      const imageBase64 = await this.pdfToImage(base64);
      return this.extractWithGoogleVision(imageBase64, 'image/png');
    }
    
    // Fallback: Tesseract.js (offline, lower accuracy)
    return this.extractWithTesseract(base64, mimeType);
  }
  
  private async extractWithGoogleVision(base64: string, mimeType: string) {
    // Google Cloud Vision Document Text Detection
    // Better than TEXT_DETECTION for structured documents
    const response = await visionClient.documentTextDetection({
      image: { content: base64 }
    });
    
    const text = response[0].fullTextAnnotation?.text ?? '';
    return {
      text: this.cleanText(text),
      confidence: this.calculateConfidence(response),
      // ...
    };
  }
}
```

---

## 8.4 AI Verification MCP Server

### Tool Definition

```typescript
// apps/mcp-ai-verification/src/tools/classify-expense.tool.ts

export const classifyExpenseTool = {
  name: "classify_expense",
  description: `
    Analyzes extracted document text to classify a withdrawal request as 
    'essential' or 'non_essential'. 
    
    Essential expenses include: medical/hospital bills, rent/mortgage payments, 
    utility bills, educational fees, groceries, emergency repairs, 
    insurance premiums, prescription medications.
    
    Non-essential expenses include: entertainment, dining out, shopping for 
    non-necessities, travel for leisure, subscriptions for entertainment, 
    luxury items.
    
    Returns a structured classification with confidence score and reasoning.
  `,
  inputSchema: {
    type: "object",
    properties: {
      extractedText: { type: "string" },
      withdrawalAmount: { type: "string" },
      currency: { type: "string" }
    },
    required: ["extractedText", "withdrawalAmount", "currency"]
  }
};
```

### Classification Prompt Engineering

```typescript
// apps/mcp-ai-verification/src/prompts/classification.prompt.ts

export function buildClassificationPrompt(
  extractedText: string,
  amount: string,
  currency: string
): { system: string; user: string } {
  
  const system = `
You are a financial document verification AI for SmartSave, a savings protection application.

Your role is to analyze documents uploaded by users who are requesting withdrawals from their protected savings account. You must determine if the expense is ESSENTIAL or NON_ESSENTIAL.

ESSENTIAL expenses (APPROVE withdrawal):
- Medical: Doctor visits, hospital bills, prescriptions, medical procedures, dental emergency
- Housing: Rent, mortgage, essential home repairs (plumbing, electricity, heating/cooling)
- Utilities: Electricity, water, gas, internet (if needed for work)
- Education: Tuition, textbooks, educational courses, school supplies
- Transportation: Car repair for work commute, public transit
- Food: Groceries, essential food supplies (NOT restaurant dining)
- Insurance: Health insurance, car insurance, renter's/homeowner's insurance
- Emergency: Any document proving a genuine emergency situation

NON_ESSENTIAL expenses (REJECT withdrawal):
- Entertainment: Movies, concerts, sports events, gaming
- Dining: Restaurants, cafes, food delivery services
- Shopping: Clothing (non-emergency), electronics (non-work), accessories
- Travel: Vacations, leisure trips, hotels for non-emergency
- Subscriptions: Netflix, Spotify, gym (unless medical necessity)
- Luxury: High-end items, optional upgrades

IMPORTANT RULES:
1. If the document is unclear, unreadable, or appears fake/edited → classify as NON_ESSENTIAL with reasoning
2. If the document amount doesn't reasonably match the withdrawal amount → flag discrepancy
3. Be strict but fair — user wellbeing depends on accurate classification
4. Always provide clear, empathetic reasoning

Response MUST be valid JSON matching this exact schema:
{
  "category": "essential" | "non_essential",
  "confidence": number (0.0 to 1.0),
  "documentType": string (e.g., "medical_bill", "rent_receipt", "utility_bill", "unknown"),
  "reasoning": string (2-3 sentences explaining the decision),
  "documentAmountDetected": string | null,
  "amountMatchesWithdrawal": boolean | null,
  "flags": string[] (any concerns or anomalies noted)
}
`;

  const user = `
Please classify the following withdrawal request:

Withdrawal Amount: ${currency} ${amount}

Document Text (extracted via OCR):
---
${extractedText.slice(0, 4000)} // Limit context window
---

Analyze the document and provide your classification as valid JSON.
`;

  return { system, user };
}
```

### LLM Service with Structured Output

```typescript
// apps/mcp-ai-verification/src/services/llm.service.ts

class LLMService {
  async classifyExpense(
    extractedText: string,
    amount: string,
    currency: string
  ): Promise<ClassificationResult> {
    
    const { system, user } = buildClassificationPrompt(extractedText, amount, currency);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      response_format: { type: "json_object" }, // Structured output mode
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 500,
    });
    
    const raw = JSON.parse(response.choices[0].message.content!);
    return this.validateAndParseResult(raw);
  }
  
  private validateAndParseResult(raw: unknown): ClassificationResult {
    // Zod validation of LLM response
    return classificationResultSchema.parse(raw);
  }
}
```

---

## 8.5 MCP Client in Express API

```typescript
// apps/api/src/services/mcp.service.ts

class MCPService {
  private ocrClient: MCPClient;
  private verificationClient: MCPClient;
  
  constructor() {
    // MCP servers communicate via HTTP in production
    // (stdio transport is for local development only)
    this.ocrClient = new MCPClient({
      baseUrl: process.env.OCR_MCP_URL,
      apiKey: process.env.MCP_API_KEY
    });
    
    this.verificationClient = new MCPClient({
      baseUrl: process.env.AI_VERIFICATION_MCP_URL,
      apiKey: process.env.MCP_API_KEY
    });
  }
  
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    const result = await this.ocrClient.callTool("extract_document_text", {
      fileBase64: buffer.toString('base64'),
      mimeType
    });
    
    const parsed = JSON.parse(result.content[0].text);
    return parsed.extractedText;
  }
  
  async classifyExpense(params: ClassifyParams): Promise<ClassificationResult> {
    const result = await this.verificationClient.callTool("classify_expense", {
      extractedText: params.extractedText,
      withdrawalAmount: params.amount.toString(),
      currency: params.currency
    });
    
    return JSON.parse(result.content[0].text);
  }
}
```

---

## 8.6 MCP Server Configuration

```typescript
// apps/mcp-ocr/src/index.ts (HTTP transport for production)

import express from 'express';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

// API key authentication for MCP-to-API calls
app.use('/mcp', (req, res, next) => {
  const key = req.headers['x-mcp-api-key'];
  if (key !== process.env.MCP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

---

## 8.7 Fallback Strategy

```
Primary: Google Cloud Vision (OCR) + GPT-4o (Classification)
         │
         ├── If Google Vision fails → Tesseract.js (local OCR)
         │
         └── If GPT-4o fails → Claude 3.5 Sonnet (fallback LLM)
                               │
                               └── If all fail → Return error to user
                                   "Document verification temporarily unavailable.
                                    Please try again in a few minutes."
```
