import os
import sys
import unittest

# Append server root path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import OCRPayload, local_heuristic_classify

class TestAIClassification(unittest.TestCase):
    def test_medical_bill_classification(self):
        payload = OCRPayload(
            rawText="HOSPITAL EMERGENCY SERVICES INVOICE\nTreatments: ER Visit\nTotal: $750.00",
            merchant="HOSPITAL EMERGENCY SERVICES",
            amount="750.00"
        )
        res = local_heuristic_classify(payload)
        self.assertTrue(res["approved"])
        self.assertTrue(res["essential"])
        self.assertEqual(res["category"], "Medical")

    def test_electricity_bill_classification(self):
        payload = OCRPayload(
            rawText="CON EDISON POWER BILL\nElectricity Charges Due: $145.20\nDate: 2026-07-17",
            merchant="CON EDISON",
            amount="145.20"
        )
        res = local_heuristic_classify(payload)
        self.assertTrue(res["approved"])
        self.assertTrue(res["essential"])
        self.assertEqual(res["category"], "Electricity")

    def test_restaurant_bill_classification(self):
        payload = OCRPayload(
            rawText="STARBUCKS COFFEE\n1x Caffe Latte: $4.50\nTOTAL DUE: 5.25",
            merchant="STARBUCKS COFFEE",
            amount="5.25"
        )
        res = local_heuristic_classify(payload)
        self.assertFalse(res["approved"])
        self.assertFalse(res["essential"])
        self.assertEqual(res["category"], "Restaurant")

    def test_gaming_purchase_classification(self):
        payload = OCRPayload(
            rawText="STEAM GAMES INC\nPurchase: Elden Ring\nAmount: $59.99",
            merchant="STEAM GAMES",
            amount="59.99"
        )
        res = local_heuristic_classify(payload)
        self.assertFalse(res["approved"])
        self.assertFalse(res["essential"])
        self.assertEqual(res["category"], "Gaming")

if __name__ == "__main__":
    unittest.main()
