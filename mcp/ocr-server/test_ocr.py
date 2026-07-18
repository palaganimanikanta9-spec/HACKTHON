import os
import unittest
from datetime import datetime
from app import extract_fields, process_file_path

class TestOCRExtraction(unittest.TestCase):
    def test_extract_fields_basic(self):
        text = "STARBUCKS COFFEE\nDate: 12/25/2026\nSubtotal: $4.50\nTOTAL DUE: 5.25"
        fields = extract_fields(text)
        self.assertEqual(fields["merchant"], "Starbucks")
        self.assertEqual(fields["date"], "12/25/2026")
        self.assertEqual(fields["amount"], "5.25")

    def test_extract_fields_fallback(self):
        text = "Random shop line\nSome other details\nNo matching float"
        fields = extract_fields(text, default_amount=99.99)
        self.assertEqual(fields["merchant"], "Random shop line")
        self.assertEqual(fields["amount"], "99.99")

if __name__ == "__main__":
    unittest.main()
