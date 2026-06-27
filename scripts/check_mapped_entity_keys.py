"""Validate logical entity keys used by dashboard cards."""

from pathlib import Path
import re
import sys

ENTITY_MAP = Path("dashboard/templates/entities.yaml")
SCAN_ROOTS = [Path("dashboard/cards"), Path("dashboard/views")]

ENTITY_LINE = re.compile(r"^\s*(?:-\s*)?entity:\s*[\"']?([^\"'#]+?)\s*[\"']?\s*$")
GROUP_LINE = re.compile(r"^([a-z][a-z0-9_]*):\s*$")
KEY_LINE = re.compile(r"^\s{2}([a-z][a-z0-9_]*):\s*.+$")
LOGICAL_KEY = re.compile(r"^([a-z][a-z0-9_]*)\s*(?:\.|/)\s*([a-z][a-z0-9_]*)$")
REAL_ENTITY = re.compile(
    r"^(?:sensor|binary_sensor|switch|lock|climate|device_tracker|button|"
    r"number|select|input_boolean|input_number|input_select)\."
    r"[a-zA-Z0-9_]+$"
)


def load_mapped_keys() -> set[str]:
    keys = set()
    group = None
    for line in ENTITY_MAP.read_text(encoding="utf-8").splitlines():
        group_match = GROUP_LINE.match(line)
        if group_match:
            group = group_match.group(1)
            continue
        key_match = KEY_LINE.match(line)
        if group and key_match:
            keys.add(f"{group}.{key_match.group(1)}")
    return keys


def normalize_entity(raw: str) -> str | None:
    value = raw.strip()
    if value.startswith("[[") and value.endswith("]]"):
        return None
    if REAL_ENTITY.match(value):
        return None
    match = LOGICAL_KEY.match(value)
    if not match:
        return value
    return f"{match.group(1)}.{match.group(2)}"


mapped_keys = load_mapped_keys()
violations = []

for root in SCAN_ROOTS:
    for path in root.rglob("*.yaml"):
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            match = ENTITY_LINE.match(line)
            if not match:
                continue
            normalized = normalize_entity(match.group(1))
            if normalized is None:
                continue
            if normalized not in mapped_keys:
                violations.append(f"{path}:{line_number}: {match.group(1).strip()}")

if violations:
    print("Mapped entity keys used by cards must exist in dashboard/templates/entities.yaml")
    print("\n".join(violations))
    sys.exit(1)
