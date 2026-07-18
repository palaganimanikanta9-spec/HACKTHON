import os
import sys
import json
import logging
import time
import re
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
from mcp.server.fastmcp import FastMCP
import uvicorn

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smartsave-ai-server")

# Configure Gemini if key is provided
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("📡 Google Gemini API client configured successfully.")
else:
    logger.warning("🛑 GEMINI_API_KEY not found in environment. Running in semantic heuristic mode.")

# ── Pydantic Request/Response Models ────────────────────────────────

class OCRFields(BaseModel):
    merchant: str = "Unknown Merchant"
    date: str = ""
    amount: str = "0.00"

class OCRPayload(BaseModel):
    rawText: str = ""
    merchant: Optional[str] = None
    date: Optional[str] = None
    amount: Optional[str] = None
    confidence: Optional[float] = 0.95
    pages: Optional[int] = 1
    fields: Optional[OCRFields] = None

class VerificationResponse(BaseModel):
    approved: bool = Field(..., description="True if the expense is classified as essential, False otherwise")
    essential: bool = Field(..., description="True if the category is essential, False otherwise")
    category: str = Field(..., description="Sub-category classification (e.g. Medical, Rent, Gaming)")
    confidence: float = Field(..., description="Classification confidence score from 0.0 to 1.0")
    reason: str = Field(..., description="Reasoning statement justifying the decision")
    model: str = Field("gemini", description="AI model name utilized")

# ── Prompt Templates ───────────────────────────────────────────────

SYSTEM_PROMPT = """
You are the SmartSave AI Wallet Verification engine. Your role is to determine if an uploaded receipt or invoice represents an ESSENTIAL or NON-ESSENTIAL expense.

ESSENTIAL Categories (always result in approved=true, essential=true):
- Medical (doctor bills, hospital visits, pharmacy)
- Education (tuition, textbooks)
- Electricity (power bills)
- Water (water utilities)
- Gas (heating gas utilities)
- Internet (home internet subscription)
- Rent (monthly lease, landlord payments)
- Insurance (car, health, home insurance)
- Government Fee (tax, DMV fee, government fine)
- Transportation (bus, train, transit, Uber/Lyft rides)
- Food Essentials (grocery stores, supermarket essentials)
- Emergency Repairs (plumbing, car repair, home maintenance)

NON-ESSENTIAL Categories (always result in approved=false, essential=false):
- Shopping (retail, department stores, general items)
- Luxury (designer wear, high-end brands)
- Gaming (video games, digital currency purchases)
- Entertainment (movies, concerts, streaming services like Netflix)
- Vacation (flights, hotels, trips)
- Restaurant (cafes, Starbucks, dining out, fast food)
- Electronics (gadgets, new phones, game consoles)
- Fashion (clothing retail stores, shoes)
- Subscription Services (software, non-essential monthly renewals)

You must return a raw JSON object ONLY. Do not enclose the output in ```json markdown code blocks. The response schema must be:
{
    "approved": boolean,
    "essential": boolean,
    "category": string,
    "confidence": float,
    "reason": string,
    "model": "gemini"
}
"""

# ── Local Heuristic Fallback Engine ────────────────────────────────

def local_heuristic_classify(payload: OCRPayload) -> Dict[str, Any]:
    """Offline backup semantic rules classifier."""
    logger.info("Executing local heuristic classifier...")
    
    # Extract keywords from rawText or fields
    text_corpus = (payload.rawText or "").lower()
    merchant = (payload.merchant or (payload.fields.merchant if payload.fields else "unknown")).lower()
    amount = float(payload.amount or (payload.fields.amount if payload.fields else "0.00") or "0.00")

    # Define classification map — ORDER MATTERS: essential checks run first
    rules = [
        # ── MEDICAL / HEALTH ───────────────────────────────────────────────────
        (
            r"\b(?:medical|hospital|clinic|health|doctor|dentist|pharmacy|er|care|emergency room|"
            r"patient|prescription|treatment|diagnosis|surgery|nursing|physiotherapy|"
            r"ward|outpatient|inpatient|laboratory|lab report|blood test|x-?ray|mri|"
            r"consultation|specialist|pediatric|gynecology|orthopedic|cardiology)\b",
            "Medical", True
        ),
        # ── EDUCATION / SCHOOL ─────────────────────────────────────────────────
        (
            r"\b(?:school|college|university|tuition|textbook|course|"
            r"admission|enrollment|semester|academic|lecture|faculty|"
            r"daycare|day care|nursery|kindergarten|preschool|"
            r"high school|primary school|secondary school|boarding school|"
            r"tuition fee|admission fee|exam fee|school fee|sports fee|transport fee|"
            r"library fee|registration fee|lab fee|laboratory fee|"
            r"student|fees|term fee|annual fee|educational|institution)\b",
            "Education", True
        ),
        # ── ELECTRICITY / POWER ────────────────────────────────────────────────
        (
            r"\b(?:electric|electricity|power|con edison|pge|energy bill|kwh|"
            r"kilowatt|meter reading|power bill|light bill|energy charge)\b",
            "Electricity", True
        ),
        # ── WATER ─────────────────────────────────────────────────────────────
        (
            r"\b(?:water bill|sewer|utility water|water supply|water charge|"
            r"water meter|water authority)\b",
            "Water", True
        ),
        # ── GAS / HEATING ─────────────────────────────────────────────────────
        (
            r"\b(?:gas bill|heating|utility gas|natural gas|lpg|pipeline gas|"
            r"gas meter|gas supply|gas charge)\b",
            "Gas", True
        ),
        # ── INTERNET / TELECOM ────────────────────────────────────────────────
        (
            r"\b(?:internet|wifi|comcast|xfinity|broadband|verizon|charter|"
            r"att|at&t|spectrum|telecoms?|phone bill|mobile bill|data plan|"
            r"monthly subscription internet)\b",
            "Internet", True
        ),
        # ── RENT / HOUSING ────────────────────────────────────────────────────
        (
            r"\b(?:rent|lease|landlord|real estate|apartment|housing|tenancy|"
            r"monthly rent|rental payment|property|accommodation)\b",
            "Rent", True
        ),
        # ── INSURANCE ─────────────────────────────────────────────────────────
        (
            r"\b(?:insurance|geico|allstate|progressive|state farm|health insurance|"
            r"premium|policy|coverage|indemnity|life insurance|motor insurance|"
            r"insurance payment|insurance receipt)\b",
            "Insurance", True
        ),
        # ── GOVERNMENT / TAX / LEGAL ──────────────────────────────────────────
        (
            r"\b(?:dmv|tax|irs|fine|license|government|fee|passport|visa|"
            r"court|legal|municipality|civic|revenue|council tax|income tax)\b",
            "Government Fee", True
        ),
        # ── TRANSPORTATION ────────────────────────────────────────────────────
        (
            r"\b(?:uber|lyft|transit|metro|subway|bus|train|ticket|airline|"
            r"flight|taxi|cab|commute|toll|transport|fuel bill|petrol bill)\b",
            "Transportation", True
        ),
        # ── GROCERIES / FOOD ESSENTIALS ───────────────────────────────────────
        (
            r"\b(?:grocery|groceries|safeway|kroger|supermarket|trader joe|whole foods|"
            r"aldi|lidl|publix|food essentials|fresh market|produce|provisions)\b",
            "Food Essentials", True
        ),
        # ── EMERGENCY REPAIRS ─────────────────────────────────────────────────
        (
            r"\b(?:repair|mechanic|plumber|plumbing|locksmith|handyman|"
            r"maintenance|home repair|car repair|hvac|electrician|"
            r"emergency service|service call|fix)\b",
            "Emergency Repairs", True
        ),
        # ── NON-ESSENTIAL: RESTAURANT / FOOD OUT ──────────────────────────────
        (
            r"\b(?:starbucks|coffee|restaurant|cafe|dining|mcdonald|burger|pizza|"
            r"deli|sushi|donut|dessert|bakery|fast food|takeout|takeaway|food court)\b",
            "Restaurant", False
        ),
        # ── NON-ESSENTIAL: GAMING ─────────────────────────────────────────────
        (
            r"\b(?:gaming|steam|playstation|xbox|nintendo|epic games|riot|"
            r"game pass|game console|video game|esports)\b",
            "Gaming", False
        ),
        # ── NON-ESSENTIAL: STREAMING/SUBSCRIPTIONS ────────────────────────────
        (
            r"\b(?:netflix|spotify|hulu|disney|hbo|youtube premium|"
            r"prime video|apple tv|streaming|subscription service)\b",
            "Subscription Services", False
        ),
        # ── NON-ESSENTIAL: ENTERTAINMENT ──────────────────────────────────────
        (
            r"\b(?:movie|cinema|theater|theatre|concert|ticketmaster|"
            r"theme park|amusement|entertainment venue|nightclub|bar)\b",
            "Entertainment", False
        ),
        # ── NON-ESSENTIAL: VACATION / TRAVEL ──────────────────────────────────
        (
            r"\b(?:hotel|resort|vacation|cruise|booking|airbnb|trip|holiday|"
            r"travel agency|leisure travel|tourist)\b",
            "Vacation", False
        ),
        # ── NON-ESSENTIAL: LUXURY ─────────────────────────────────────────────
        (
            r"\b(?:gucci|fendi|luxury|louis vuitton|prada|rolex|versace|"
            r"burberry|high-end|designer|premium brand)\b",
            "Luxury", False
        ),
        # ── NON-ESSENTIAL: ELECTRONICS ────────────────────────────────────────
        (
            r"\b(?:apple store|best buy|gadget|console|iphone|ipad|macbook|"
            r"samsung|laptop purchase|new phone|electronics store)\b",
            "Electronics", False
        ),
        # ── NON-ESSENTIAL: FASHION ────────────────────────────────────────────
        (
            r"\b(?:zara|h&m|fashion|clothing store|shoes|apparel|mall|"
            r"department store|footwear|accessories)\b",
            "Fashion", False
        ),
        # ── NON-ESSENTIAL: GENERAL SHOPPING ───────────────────────────────────
        (
            r"\b(?:target|walmart|costco|amazon|ebay|shopping|retail|"
            r"merchandise|wholesale|outlet|general store)\b",
            "Shopping", False
        ),
    ]


    for pattern, category, is_essential in rules:
        if re.search(pattern, merchant) or re.search(pattern, text_corpus):
            reason_statement = f"Merchant '{merchant.title()}' or document contents recognized under '{category}' category, which is classified as {'essential' if is_essential else 'non-essential'}."
            return {
                "approved": is_essential,
                "essential": is_essential,
                "category": category,
                "confidence": 0.95,
                "reason": reason_statement,
                "model": "heuristic-fallback"
            }

    # Default category mapping
    return {
        "approved": False,
        "essential": False,
        "category": "Shopping",
        "confidence": 0.90,
        "reason": f"Document merchant '{merchant.title()}' or contents did not match any standard essential categories. Defaulted to Shopping (non-essential).",
        "model": "heuristic-fallback"
    }

# ── Gemini Invoker with Retry and Timeout ──────────────────────────

def gemini_classify(payload: OCRPayload) -> Dict[str, Any]:
    """Query Google Gemini API using generativeai library."""
    if not GEMINI_API_KEY:
        logger.warning("No GEMINI_API_KEY — using heuristic classifier")
        return local_heuristic_classify(payload)

    # Resolve all available fields — top-level take priority, then nested fields object
    merchant = payload.merchant or (payload.fields.merchant if payload.fields else "Unknown Merchant")
    date = payload.date or (payload.fields.date if payload.fields else datetime.today().strftime("%Y-%m-%d"))
    amount = payload.amount or (payload.fields.amount if payload.fields else "0.00")
    raw_text = payload.rawText or ""

    user_content = f"""Verify the following OCR receipt/invoice metadata and classify the expense:
- Merchant / Provider: {merchant}
- Date: {date}
- Amount: ${amount}
- Full OCR Text extracted from document:
{raw_text if raw_text.strip() else '(No readable text extracted from document)'}

Based on the above, determine if this is an ESSENTIAL or NON-ESSENTIAL expense and return the JSON schema."""

    logger.info(f"Gemini prompt prepared — merchant: {merchant}, amount: {amount}, rawText chars: {len(raw_text)}")

    # Retry parameters (up to 3 retries, exponential backoff)
    max_retries = 3
    base_backoff = 1.0

    for attempt in range(max_retries):
        try:
            logger.info(f"Querying Gemini API (Attempt {attempt + 1}/{max_retries})...")
            
            # Use gemini-2.5-flash as the standard fast cost-effective text model
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            # Execute generation
            response = model.generate_content(
                f"{SYSTEM_PROMPT}\n{user_content}",
                generation_config={"response_mime_type": "application/json"}
            )
            
            if response and response.text:
                clean_text = response.text.strip()
                # Clean code blocks if LLM ignored strict instructions
                if clean_text.startswith("```"):
                    clean_text = re.sub(r"^```(?:json)?\n|```$", "", clean_text, flags=re.MULTILINE).strip()
                
                parsed_json = json.loads(clean_text)
                # Confirm all keys are present
                keys = ["approved", "essential", "category", "confidence", "reason"]
                if all(k in parsed_json for k in keys):
                    parsed_json["model"] = "gemini-2.5-flash"
                    return parsed_json

            raise ValueError("Empty or invalid structured JSON returned by model.")

        except Exception as e:
            logger.warning(f"Gemini generation attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(base_backoff * (2 ** attempt))
            else:
                logger.error("All Gemini API attempts failed. Falling back to local semantic parser.")
                return local_heuristic_classify(payload)

    return local_heuristic_classify(payload)

# ── FastMCP Server Instantiation ──────────────────────────────────

mcp = FastMCP("AI-Verification-Server")

@mcp.tool()
def verify_expense(ocr_data: dict) -> dict:
    """Classify whether the OCR parsed document represents an ESSENTIAL or NON-ESSENTIAL expense."""
    logger.info("MCP Tool verify_expense called.")
    try:
        payload = OCRPayload(**ocr_data)
        return gemini_classify(payload)
    except Exception as e:
        logger.error(f"MCP Tool error: {e}")
        return {
            "approved": False,
            "essential": False,
            "category": "Unknown",
            "confidence": 0.00,
            "reason": f"Error parsing input data: {str(e)}",
            "model": "error-state"
        }

# ── FastAPI REST Layer ────────────────────────────────────────────

app = FastAPI(title="SmartSave AI Verification Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/verify", response_model=VerificationResponse)
async def verify_endpoint(payload: OCRPayload):
    """Exposes HTTP REST endpoint for expense document classification verification."""
    try:
        result = gemini_classify(payload)
        return VerificationResponse(**result)
    except Exception as e:
        logger.error(f"REST API /verify error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "UP", "timestamp": datetime.utcnow().isoformat()}

# Entrypoint for running FastAPI or MCP
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "mcp":
        logger.info("Starting FastMCP stdio loop...")
        mcp.run()
    else:
        logger.info("Starting FastAPI HTTP REST server...")
        uvicorn.run(app, host="0.0.0.0", port=5002)
