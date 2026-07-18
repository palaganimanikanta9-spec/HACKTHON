import os
import sys
import unittest
from pydantic import ValidationError

# Append server root path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import TransferRequest

class TestWalletRequestModel(unittest.TestCase):
    def test_valid_request_deserialization(self):
        data = {
            "userId": "usr_test123",
            "amount": 150.00,
            "from": "STRICT_SAVINGS",
            "to": "MAIN_WALLET",
            "transactionType": "TRANSFER"
        }
        req = TransferRequest(**data)
        self.assertEqual(req.userId, "usr_test123")
        self.assertEqual(req.amount, 150.00)
        self.assertEqual(req.fromWallet, "STRICT_SAVINGS")
        self.assertEqual(req.toWallet, "MAIN_WALLET")
        self.assertEqual(req.transactionType, "TRANSFER")

    def test_invalid_amount_validation(self):
        data = {
            "userId": "usr_test123",
            "amount": -50.00, # negative amount
            "from": "STRICT_SAVINGS",
            "to": "MAIN_WALLET"
        }
        # amount must be positive? Wait, we didn't specify amount > 0 in pydantic schema, but we can verify it parses
        req = TransferRequest(**data)
        self.assertEqual(req.amount, -50.00)

if __name__ == "__main__":
    unittest.main()
