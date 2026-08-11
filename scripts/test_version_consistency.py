"""Regression tests for repository release-version validation."""

import unittest

from scripts.check_version_consistency import (
    VersionConsistencyError,
    detected_tag,
    validate_versions,
)


def card(version: str) -> str:
    return f'const KIA_DASHBOARD_CARD_VERSION = "{version}";\n'


def changelog(version: str) -> str:
    return f"# Changelog\n\n## Unreleased\n\n## {version} - 2026-08-11\n"


class VersionConsistencyTests(unittest.TestCase):
    def test_matching_card_changelog_and_tag(self) -> None:
        self.assertEqual(
            validate_versions(card("2.11.0"), changelog("2.11.0"), "v2.11.0"),
            "2.11.0",
        )

    def test_card_and_changelog_mismatch_fails(self) -> None:
        with self.assertRaisesRegex(VersionConsistencyError, "does not match"):
            validate_versions(card("2.10.0"), changelog("2.11.0"))

    def test_tag_mismatch_fails(self) -> None:
        with self.assertRaisesRegex(VersionConsistencyError, "expected v2.11.0"):
            validate_versions(card("2.11.0"), changelog("2.11.0"), "v2.10.0")

    def test_missing_release_heading_fails(self) -> None:
        with self.assertRaisesRegex(VersionConsistencyError, "CHANGELOG.md"):
            validate_versions(card("2.11.0"), "# Changelog\n\n## Unreleased\n")

    def test_detects_github_tag_environment(self) -> None:
        self.assertEqual(
            detected_tag(
                {"GITHUB_REF_TYPE": "tag", "GITHUB_REF_NAME": "v2.11.0"}
            ),
            "v2.11.0",
        )
        self.assertEqual(
            detected_tag({"GITHUB_REF": "refs/tags/v2.11.0"}), "v2.11.0"
        )
        self.assertIsNone(detected_tag({"GITHUB_REF": "refs/heads/main"}))


if __name__ == "__main__":
    unittest.main()
