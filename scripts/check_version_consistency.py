"""Verify that repository release metadata uses one dashboard version."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import re
import sys
from typing import Mapping


VERSION = r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?"
CARD_VERSION_PATTERN = re.compile(
    rf'^const KIA_DASHBOARD_CARD_VERSION = "(?P<version>{VERSION})";$',
    re.MULTILINE,
)
CHANGELOG_VERSION_PATTERN = re.compile(
    rf"^## (?P<version>{VERSION}) - \d{{4}}-\d{{2}}-\d{{2}}$",
    re.MULTILINE,
)


class VersionConsistencyError(ValueError):
    """Raised when release metadata is missing or inconsistent."""


def extract_version(pattern: re.Pattern[str], text: str, source: str) -> str:
    match = pattern.search(text)
    if not match:
        raise VersionConsistencyError(f"No release version found in {source}.")
    return match.group("version")


def detected_tag(environment: Mapping[str, str]) -> str | None:
    if environment.get("GITHUB_REF_TYPE") == "tag":
        return environment.get("GITHUB_REF_NAME") or None
    reference = environment.get("GITHUB_REF", "")
    prefix = "refs/tags/"
    return reference[len(prefix) :] if reference.startswith(prefix) else None


def validate_versions(card_text: str, changelog_text: str, tag: str | None = None) -> str:
    card_version = extract_version(CARD_VERSION_PATTERN, card_text, "dashboard card")
    changelog_version = extract_version(CHANGELOG_VERSION_PATTERN, changelog_text, "CHANGELOG.md")
    if card_version != changelog_version:
        raise VersionConsistencyError(
            "Dashboard version "
            f"{card_version} does not match latest changelog release {changelog_version}."
        )

    if tag is not None:
        expected_tag = f"v{card_version}"
        if tag != expected_tag:
            raise VersionConsistencyError(
                f"Release tag {tag} does not match dashboard version {card_version}; "
                f"expected {expected_tag}."
            )
    return card_version


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--card", type=Path, default=Path("ha-kia-connect-dashboard.js"))
    parser.add_argument("--changelog", type=Path, default=Path("CHANGELOG.md"))
    parser.add_argument("--tag", help="Explicit release tag; defaults to the GitHub tag environment.")
    args = parser.parse_args()

    tag = args.tag or detected_tag(os.environ)
    try:
        version = validate_versions(
            args.card.read_text(encoding="utf-8"),
            args.changelog.read_text(encoding="utf-8"),
            tag,
        )
    except (OSError, VersionConsistencyError) as error:
        print(f"Version consistency check failed: {error}")
        return 1

    tag_suffix = f" and release tag {tag}" if tag else ""
    print(f"Dashboard and changelog versions match: {version}{tag_suffix}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
