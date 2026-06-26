"""Validate the required repository structure for milestone-focused development."""

from pathlib import Path
import sys

REQUIRED_PATHS = [
    "dashboard/views",
    "dashboard/cards",
    "dashboard/popups",
    "dashboard/templates",
    "dashboard/themes",
    "assets/images",
    "assets/icons",
    "docs/screenshots",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/ISSUE_TEMPLATE/question.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".github/workflows/ci.yaml",
    "PROJECT_PLAN.md",
    "ARCHITECTURE.md",
    "ROADMAP.md",
    "TASKS.md",
    "MILESTONES.md",
    "ISSUES.md",
]

missing = [path for path in REQUIRED_PATHS if not Path(path).exists()]
if missing:
    print("Missing required project paths:")
    print("\n".join(missing))
    sys.exit(1)
