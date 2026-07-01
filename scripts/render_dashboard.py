"""Render a Home Assistant-ready dashboard from logical entity keys."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import shutil
import sys

DEFAULT_SOURCE = Path("dashboard")
DEFAULT_OUTPUT = Path("build/home-assistant-dashboard")
DEFAULT_ENTITY_MAP = Path("dashboard/templates/entities.yaml")
DEFAULT_DASHBOARD_PATH = "/lovelace"

GROUP_LINE = re.compile(r"^([a-z][a-z0-9_]*):\s*$")
KEY_LINE = re.compile(r"^\s{2}([a-z][a-z0-9_]*):\s*(.+?)\s*$")
ENTITY_LINE = re.compile(
    r"^(?P<prefix>\s*(?:-\s*)?entity:\s*)(?P<quote>[\"']?)"
    r"(?P<value>[^\"'#]+?)(?P=quote)(?P<suffix>\s*)$"
)
NAVIGATION_LINE = re.compile(
    r"^(?P<prefix>\s*(?:-\s*)?(?:navigation_path|path):\s*)"
    r"(?P<quote>[\"']?)(?P<value>/lovelace(?:/[^\"']*)?)"
    r"(?P=quote)(?P<suffix>\s*)$"
)
LOGICAL_KEY = re.compile(r"^([a-z][a-z0-9_]*)\s*(?:\.|/)\s*([a-z][a-z0-9_]*)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render dashboard YAML by replacing logical entity keys with mapped Home Assistant entities."
    )
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Dashboard source directory.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Rendered dashboard output directory.")
    parser.add_argument("--entity-map", type=Path, default=DEFAULT_ENTITY_MAP, help="Logical entity mapping file.")
    parser.add_argument(
        "--dashboard-path",
        default=DEFAULT_DASHBOARD_PATH,
        help="Base Lovelace dashboard URL path used for internal navigation.",
    )
    return parser.parse_args()


def clean_value(raw: str) -> str:
    value = raw.strip()
    if " #" in value:
        value = value.split(" #", 1)[0].strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    return value


def normalize_dashboard_path(raw: str) -> str:
    value = raw.strip()
    if not value:
        return DEFAULT_DASHBOARD_PATH
    if not value.startswith("/"):
        value = f"/{value}"
    return value.rstrip("/") or "/"


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
            mapping[f"{group}.{key_match.group(1)}"] = clean_value(key_match.group(2))

    return mapping


def normalize_logical_key(value: str) -> str | None:
    if value.startswith("[[") and value.endswith("]]"):
        return None

    match = LOGICAL_KEY.match(value.strip())
    if not match:
        return None

    return f"{match.group(1)}.{match.group(2)}"


def rewrite_navigation_path(line: str, dashboard_path: str) -> str:
    match = NAVIGATION_LINE.match(line)
    if not match:
        return line

    current_path = match.group("value")
    suffix = current_path.removeprefix(DEFAULT_DASHBOARD_PATH)
    rendered_path = f"{dashboard_path}{suffix}" if dashboard_path != "/" else suffix or "/"
    return f"{match.group('prefix')}{match.group('quote')}{rendered_path}{match.group('quote')}{match.group('suffix')}"


def render_yaml_file(path: Path, mapping: dict[str, str], dashboard_path: str) -> list[str]:
    missing: list[str] = []
    rendered_lines: list[str] = []

    for line in path.read_text(encoding="utf-8").splitlines():
        rewritten_line = rewrite_navigation_path(line, dashboard_path)
        match = ENTITY_LINE.match(rewritten_line)
        if not match:
            rendered_lines.append(rewritten_line)
            continue

        logical_key = normalize_logical_key(match.group("value"))
        if not logical_key:
            rendered_lines.append(rewritten_line)
            continue

        if logical_key not in mapping:
            missing.append(logical_key)
            rendered_lines.append(rewritten_line)
            continue

        rendered_lines.append(f"{match.group('prefix')}{mapping[logical_key]}{match.group('suffix')}")

    path.write_text("\n".join(rendered_lines) + "\n", encoding="utf-8")
    return missing


def render_dashboard(source: Path, output: Path, entity_map: Path, dashboard_path: str) -> int:
    if not source.exists():
        print(f"Source dashboard directory not found: {source}", file=sys.stderr)
        return 1
    if not entity_map.exists():
        print(f"Entity map not found: {entity_map}", file=sys.stderr)
        return 1

    mapping = load_entity_map(entity_map)
    normalized_dashboard_path = normalize_dashboard_path(dashboard_path)
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(source, output)

    missing: list[str] = []
    for yaml_file in output.rglob("*.yaml"):
        missing.extend(render_yaml_file(yaml_file, mapping, normalized_dashboard_path))

    if missing:
        print("Missing logical entity mappings:", file=sys.stderr)
        for key in sorted(set(missing)):
            print(f"- {key}", file=sys.stderr)
        return 1

    print(f"Rendered dashboard written to {output}")
    print(f"Internal navigation path base: {normalized_dashboard_path}")
    print("Copy the rendered folder contents to your Home Assistant dashboard package path.")
    return 0


def main() -> int:
    args = parse_args()
    return render_dashboard(args.source, args.output, args.entity_map, args.dashboard_path)


if __name__ == "__main__":
    raise SystemExit(main())
