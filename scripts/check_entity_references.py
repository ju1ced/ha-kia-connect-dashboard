"""Reject direct Home Assistant entity references outside the entity map."""

from pathlib import Path
import re
import sys

ALLOWED = Path("dashboard/templates/entities.yaml")
PATTERN = re.compile(r"\b(?:sensor|binary_sensor|switch|lock|climate|device_tracker|button|number|select|input_boolean|input_number|input_select)\.[a-zA-Z0-9_]+\b")
violations = []
for path in Path(".").rglob("*.yaml"):
    if path == ALLOWED or ".git" in path.parts:
        continue
    text = path.read_text(encoding="utf-8")
    for match in PATTERN.finditer(text):
        violations.append(f"{path}:{text[:match.start()].count(chr(10)) + 1}: {match.group(0)}")

if violations:
    print("Direct entity references are only allowed in dashboard/templates/entities.yaml")
    print("\n".join(violations))
    sys.exit(1)
