import os
import sys
import uuid
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn
from mcp.server.fastmcp import FastMCP

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("smartsave-wallet-server")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("🛑 DATABASE_URL is not defined in environment variables!")
    DATABASE_URL = "postgresql://postgres:8760@localhost:5432/smartsave"

# Strip Prisma-specific query params that psycopg2 doesn't understand
if "?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?")[0]

# ── Pydantic Transfer Models ──────────────────────────────────────

class TransferRequest(BaseModel):
    userId: str = Field(..., description="Unique Clerk ID of the authenticated user")
    amount: float = Field(..., description="Amount of money to transfer")
    fromWallet: str = Field(..., alias="from", description="Source wallet type: MAIN_WALLET, NORMAL_SAVINGS, STRICT_SAVINGS, EXTERNAL")
    toWallet: str = Field(..., alias="to", description="Destination wallet type: MAIN_WALLET, NORMAL_SAVINGS, STRICT_SAVINGS, EXTERNAL")
    transactionType: str = Field("TRANSFER", description="TRANSFER, WITHDRAWAL, DEPOSIT")

    class Config:
        populate_by_name = True

class TransferResponse(BaseModel):
    success: bool
    transactionId: str
    walletBalance: float
    strictSavingsBalance: float
    normalSavingsBalance: float
    message: str

# ── Database Operations Helpers ────────────────────────────────────

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def execute_db_transfer(req: TransferRequest) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        table_map = {
            "MAIN_WALLET": ("Wallet", "MAIN"),
            "NORMAL_SAVINGS": ("NormalSavings", "SAVINGS"),
            "STRICT_SAVINGS": ("StrictSavings", "STRICT"),
            "EXTERNAL": ("External", "EXTERNAL")
        }

        if req.fromWallet not in table_map or req.toWallet not in table_map:
            raise ValueError(f"Invalid wallet source/destination types: {req.fromWallet} -> {req.toWallet}")

        is_from_external = req.fromWallet == "EXTERNAL"
        is_to_external = req.toWallet == "EXTERNAL"

        if is_from_external and is_to_external:
            raise ValueError("Both source and destination cannot be EXTERNAL")

        txn_id = str(uuid.uuid4())
        notif_id = str(uuid.uuid4())

        # ── Case A: External Deposit to Wallet ─────────────────────────
        if is_from_external:
            to_table, to_label = table_map[req.toWallet]
            
            cursor.execute(f'SELECT balance FROM "{to_table}" WHERE "userId" = %s FOR UPDATE;', (req.userId,))
            to_row = cursor.fetchone()
            if not to_row:
                raise ValueError(f"Destination account {req.toWallet} not found for user {req.userId}")
            
            to_balance = float(to_row["balance"])
            new_to_balance = to_balance + req.amount

            cursor.execute(
                f'UPDATE "{to_table}" SET balance = %s, "updatedAt" = %s WHERE "userId" = %s;',
                (new_to_balance, datetime.utcnow(), req.userId)
            )

            # Create credit log
            cursor.execute(
                """
                INSERT INTO "Transaction" (id, "userId", type, direction, amount, currency, description, status, "walletType", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    txn_id,
                    req.userId,
                    req.transactionType,
                    "CREDIT",
                    req.amount,
                    "USD",
                    "External deposit",
                    "COMPLETED",
                    to_label,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

            # Create notification
            cursor.execute(
                """
                INSERT INTO "Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    notif_id,
                    req.userId,
                    "SUCCESS",
                    "Deposit Completed",
                    f"Funded ${req.amount:.2f} into {req.toWallet.replace('_', ' ')}.",
                    False,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

        # ── Case B: External Withdrawal from Wallet ────────────────────
        elif is_to_external:
            from_table, from_label = table_map[req.fromWallet]

            cursor.execute(f'SELECT balance FROM "{from_table}" WHERE "userId" = %s FOR UPDATE;', (req.userId,))
            from_row = cursor.fetchone()
            if not from_row:
                raise ValueError(f"Source account {req.fromWallet} not found for user {req.userId}")

            from_balance = float(from_row["balance"])
            if from_balance < req.amount:
                raise ValueError(f"Insufficient funds in {req.fromWallet}. Available: ${from_balance:.2f}")

            new_from_balance = from_balance - req.amount

            cursor.execute(
                f'UPDATE "{from_table}" SET balance = %s, "updatedAt" = %s WHERE "userId" = %s;',
                (new_from_balance, datetime.utcnow(), req.userId)
            )

            # Create debit log
            cursor.execute(
                """
                INSERT INTO "Transaction" (id, "userId", type, direction, amount, currency, description, status, "walletType", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    txn_id,
                    req.userId,
                    req.transactionType,
                    "DEBIT",
                    req.amount,
                    "USD",
                    "External payment",
                    "COMPLETED",
                    from_label,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

            # Create notification
            cursor.execute(
                """
                INSERT INTO "Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    notif_id,
                    req.userId,
                    "SUCCESS",
                    "Withdrawal Completed",
                    f"Withdrew ${req.amount:.2f} from {req.fromWallet.replace('_', ' ')}.",
                    False,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

        # ── Case C: Internal Wallet Transfers (Multi-table) ────────────
        else:
            from_table, from_label = table_map[req.fromWallet]
            to_table, to_label = table_map[req.toWallet]

            cursor.execute(f'SELECT balance FROM "{from_table}" WHERE "userId" = %s FOR UPDATE;', (req.userId,))
            from_row = cursor.fetchone()
            if not from_row:
                raise ValueError(f"Source account {req.fromWallet} not found for user {req.userId}")

            cursor.execute(f'SELECT balance FROM "{to_table}" WHERE "userId" = %s FOR UPDATE;', (req.userId,))
            to_row = cursor.fetchone()
            if not to_row:
                raise ValueError(f"Destination account {req.toWallet} not found for user {req.userId}")

            from_balance = float(from_row["balance"])
            to_balance = float(to_row["balance"])

            if from_balance < req.amount:
                raise ValueError(f"Insufficient funds in {req.fromWallet}. Available: ${from_balance:.2f}")

            new_from_balance = from_balance - req.amount
            new_to_balance = to_balance + req.amount

            cursor.execute(
                f'UPDATE "{from_table}" SET balance = %s, "updatedAt" = %s WHERE "userId" = %s;',
                (new_from_balance, datetime.utcnow(), req.userId)
            )
            cursor.execute(
                f'UPDATE "{to_table}" SET balance = %s, "updatedAt" = %s WHERE "userId" = %s;',
                (new_to_balance, datetime.utcnow(), req.userId)
            )

            if req.toWallet == "STRICT_SAVINGS":
                cursor.execute(
                    f'UPDATE "StrictSavings" SET "totalSaved" = "totalSaved" + %s WHERE "userId" = %s;',
                    (req.amount, req.userId)
                )

            # Two transaction records (debit and credit)
            cursor.execute(
                """
                INSERT INTO "Transaction" (id, "userId", type, direction, amount, currency, description, status, "walletType", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    txn_id,
                    req.userId,
                    "TRANSFER_OUT" if req.transactionType == "TRANSFER" else req.transactionType,
                    "DEBIT",
                    req.amount,
                    "USD",
                    f"Transfer to {req.toWallet.replace('_', ' ').title()}",
                    "COMPLETED",
                    from_label,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

            txn_id_2 = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO "Transaction" (id, "userId", type, direction, amount, currency, description, status, "walletType", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    txn_id_2,
                    req.userId,
                    "TRANSFER_IN" if req.transactionType == "TRANSFER" else req.transactionType,
                    "CREDIT",
                    req.amount,
                    "USD",
                    f"Transfer from {req.fromWallet.replace('_', ' ').title()}",
                    "COMPLETED",
                    to_label,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

            cursor.execute(
                """
                INSERT INTO "Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (
                    notif_id,
                    req.userId,
                    "SUCCESS",
                    "Transfer Completed",
                    f"Moved ${req.amount:.2f} from {req.fromWallet.replace('_', ' ')} to {req.toWallet.replace('_', ' ')}.",
                    False,
                    datetime.utcnow(),
                    datetime.utcnow()
                )
            )

        # Commit changes atomically
        conn.commit()

        # Query final balances
        cursor.execute('SELECT balance FROM "Wallet" WHERE "userId" = %s;', (req.userId,))
        wallet_bal = float(cursor.fetchone()["balance"])

        cursor.execute('SELECT balance FROM "StrictSavings" WHERE "userId" = %s;', (req.userId,))
        strict_bal = float(cursor.fetchone()["balance"])

        cursor.execute('SELECT balance FROM "NormalSavings" WHERE "userId" = %s;', (req.userId,))
        normal_bal = float(cursor.fetchone()["balance"])

        return {
            "success": True,
            "transactionId": txn_id,
            "walletBalance": wallet_bal,
            "strictSavingsBalance": strict_bal,
            "normalSavingsBalance": normal_bal,
            "message": "Balances updated and transactions committed successfully."
        }

    except Exception as err:
        conn.rollback()
        logger.error(f"Transaction failed. Rolling back database updates: {err}")
        raise err

    finally:
        cursor.close()
        conn.close()

# ── FastMCP Server Instantiation ──────────────────────────────────

mcp = FastMCP("Wallet-Server")

@mcp.tool()
def execute_transfer(
    userId: str,
    amount: float,
    from_wallet: str,
    to_wallet: str,
    transaction_type: str = "TRANSFER"
) -> dict:
    """Commit wallet and savings balances transfers atomically in the Postgres database."""
    logger.info(f"MCP Tool execute_transfer called for user: {userId}, amount: {amount}")
    try:
        req = TransferRequest(
            userId=userId,
            amount=amount,
            fromWallet=from_wallet,
            toWallet=to_wallet,
            transactionType=transaction_type
        )
        return execute_db_transfer(req)
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ── FastAPI REST Layer ────────────────────────────────────────────

app = FastAPI(title="SmartSave Wallet Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transfer", response_model=TransferResponse)
async def transfer_endpoint(req: TransferRequest):
    """Exposes HTTP REST endpoint for executing account balances transfers."""
    try:
        result = execute_db_transfer(req)
        return TransferResponse(**result)
    except Exception as e:
        logger.error(f"REST API /transfer error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

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
        uvicorn.run(app, host="0.0.0.0", port=5003)
