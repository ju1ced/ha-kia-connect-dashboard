"""Check mapped Home Assistant entities against exported runtime states."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
from typing import Any

DEFAULT_ENTITY_MAP = Path("dashboard/templates/entities.yaml")
ENTITY_ID = re.compile(
    r"^(?:sensor|binary_sensor|switch|lock|climate|device_tracker|button|"
    r"number|select|input_boolean|input_number|input_select)\."
    r"[a-zA-Z0-9_]+$"
)
GROUP_LINE = re.compile(r"^([a-z][a-z0-9_]*):\s*$")
KEY_LINE = re.compile(r"^\s{2}([a-z][a-z0-9_]*):\s*(.+?)\s*$")
NOT_CONFIGURED = {"", "null", "none", "not_configured", "disabled", "placeholder", "todo", "tbd"}
PROBLEM_STATES = {"missing", "unknown", "unavailable"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check logical dashboard mappings against Home Assistant state export data."
    )
    parser.add_argument("--entity-map", type=Path, default=DEFAULT_ENTITY_MAP, help="Logical entity mapping file.")
    parser.add_argument(
        "--states-json",
        type=Path,
        help="JSON export of Home Assistant states. Accepts the REST /api/states list shape or an entity-id object map.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with a non-zero status when missing, unknown, or unavailable mapped entities are found.",
    )
    parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Report format.",
    )
    return parser.parse_args()


def clean_value(raw: str) -> str:
    value = raw.strip()
    if " #" in value:
        value = value.split(" #", 1)[0].strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    return value.strip()


def load_entity_map(path: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    group: str | None = None

    for line in path.read_text(encoding="utf-8").splitlines():
        group_match = GROUP_LINE.match(line)
        if group_match:
            group = group_match.group(1)
            continue

        key_match = KEY_LINE.match(line)
        if group and key_match:
            value = clean_value(key_match.group(2))
            if ENTITY_ID.match(value) or value.lower() in NOT_CONFIGURED:
                mapping[f"{group}.{key_match.group(1)}"] = value

    return mapping


def load_states(path: Path | None) -> dict[str, str]:
    if path is None:
        return {}

    raw: Any = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        return {
            str(item["entity_id"]): str(item.get("state", "unknown"))
            for item in raw
            if isinstance(item, dict) and "entity_id" in item
        }

    if isinstance(raw, dict):
        states: dict[str, str] = {}
        for entity_id, value in raw.items():
            if isinstance(value, dict):
                states[str(entity_id)] = str(value.get("state", "unknown"))
            else:
                states[str(entity_id)] = str(value)
        return states

    raise ValueError("States JSON must be a list of state objects or an entity-id object map.")


def health_for(mapped_entity: str, states: dict[str, str]) -> str:
    if mapped_entity.lower() in NOT_CONFIGURED or not ENTITY_ID.match(mapped_entity):
        return "not_configured"
    if not states:
        return "not_checked"
    if mapped_entity not in states:
        return "missing"
    if states[mapped_entity] == "unknown":
        return "unknown"
    if states[mapped_entity] == "unavailable":
        return "unavailable"
    return "ok"


def build_report(mapping: dict[str, str], states: dict[str, str]) -> list[dict[str, str]]:
    report: list[dict[str, str]] = []
    for logical_key, mapped_entity in sorted(mapping.items()):
        health_state = health_for(mapped_entity, states)
        report.append(
            {
                "logical_key": logical_key,
                "mapped_entity": mapped_entity,
                "health_state": health_state,
                "current_state": states.get(mapped_entity, ""),
                "hint": hint_for(health_state),
            }
        )
    return report


def hint_for(health_state: str) -> str:
    hints = {
        "ok": "Mapped entity exists and has a usable state.",
        "missing": "Check whether this entity ID exists in Home Assistant or update dashboard/templates/entities.yaml.",
        "unknown": "Entity exists but currently reports unknown; check the integration state.",
        "unavailable": "Entity exists but is unavailable; check the Kia integration and vehicle connectivity.",
        "not_configured": "Mapping is intentionally empty, disabled, or not an entity ID yet.",
        "not_checked": "No Home Assistant state export was provided, so runtime state was not checked.",
    }
    return hints[health_state]


def print_text_report(report: list[dict[str, str]]) -> None:
    counts: dict[str, int] = {}
    for row in report:
        counts[row["health_state"]] = counts.get(row["health_state"], 0) + 1

    print("Runtime mapping health summary")
    for state in sorted(counts):
        print(f"- {state}: {counts[state]}")

    problem_rows = [row for row in report if row["health_state"] != "ok"]
    if not problem_rows:
        return

    print("\nRows needing attention")
    for row in problem_rows:
        print(f"- {row['logical_key']} -> {row['mapped_entity']}: {row['health_state']}")
        print(f"  {row['hint']}")


def main() -> int:
    args = parse_args()
    mapping = load_entity_map(args.entity_map)
    states = load_states(args.states_json)
    report = build_report(mapping, states)

    if args.format == "json":
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text_report(report)

    if args.strict and any(row["health_state"] in PROBLEM_STATES for row in report):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
