"""Validate referenced local dashboard image assets when dashboard YAML is added."""

from pathlib import Path
import re
import sys

PATTERN = re.compile(r"(?:/local/|assets/images/)([^'\"\s)]+\.(?:png|jpg|jpeg|webp|svg))")
violations = []
for path in Path("dashboard").rglob("*.yaml"):
    text = path.read_text(encoding="utf-8")
    for match in PATTERN.finditer(text):
        raw = match.group(0)
        asset = Path(raw.replace("/local/", "assets/"))
        if not asset.exists():
            violations.append(f"{path}: missing {asset}")

if violations:
    print("Missing image references:")
    print("\n".join(violations))
    sys.exit(1)
