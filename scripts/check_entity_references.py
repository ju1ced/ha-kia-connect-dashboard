"""Reject direct Home Assistant entity references outside the entity map."""

from pathlib import Path
import re
import sys

ALLOWED = Path("dashboard/templates/entities.yaml")
IGNORED_PARTS = {".git", "build", "dist", "node_modules"}
IGNORED_KEYS = {"perform_action"}
PATTERN = re.compile(r"\b(?:sensor|binary_sensor|switch|lock|climate|device_tracker|button|number|select|input_boolean|input_number|input_select)\.[a-zA-Z0-9_]+\b")
KEY = re.compile(r"^\s*(?:-\s*)?([a-z_]+):")
violations = []

for path in Path(".").rglob("*.yaml"):
    if path == ALLOWED or IGNORED_PARTS.intersection(path.parts):
        continue

    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        key_match = KEY.match(line)
        if key_match and key_match.group(1) in IGNORED_KEYS:
            continue

        for match in PATTERN.finditer(line):
            violations.append(f"{path}:{line_number}: {match.group(0)}")

if violations:
    print("Direct entity references are only allowed in dashboard/templates/entities.yaml")
    print("\n".join(violations))
    sys.exit(1)
