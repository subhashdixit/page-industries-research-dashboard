"""Check PDF provenance, projection boundaries and statement arithmetic."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def check() -> None:
    """Keep reported figures distinct from projections and verify source identity."""
    data = json.loads((ROOT / "site/data.json").read_text())
    source = ROOT / "Part-2/Part-2.pdf"
    if hashlib.sha256(source.read_bytes()).hexdigest() != data["source"]["sha256"]:
        raise ValueError("Original PDF changed; re-verify transcription")
    for row in data["rows"]:
        expected = (
            "historical_reported" if row["year"] <= 2020 else "assignment_projection"
        )
        if row["kind"] != expected:
            raise ValueError("Historical and projected values were mixed")
        if abs(row["sales"] - row["expenses"] - row["operating_profit"]) > 0.02:
            raise ValueError(
                "Operating statement exceeds the source-rounding tolerance."
            )
    if data["source"]["pages"] != [12, 13]:
        raise ValueError("Unexpected transcription provenance")
    print("PDF hash, periods and statement checks passed")


if __name__ == "__main__":
    check()
