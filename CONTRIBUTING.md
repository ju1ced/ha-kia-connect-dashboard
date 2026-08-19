# Contributing

Thank you for helping build HA Kia Connect Dashboard.

## Workflow

- Keep pull requests small and milestone-focused.
- Do not hardcode Home Assistant entity IDs outside `dashboard/templates/entities.yaml`.
- Run validation locally before opening a pull request.
- Document any new dashboard card, template, or configuration option.

## Quality Bar

A contribution must preserve modular YAML, responsive layouts, documented templates, and the Kia Connect inspired design language.

## Release Version Validation

Release preparation must update `KIA_DASHBOARD_CARD_VERSION` and add the newest
dated release heading to `CHANGELOG.md`. Run the repository check before opening
the release pull request:

```shell
python scripts/check_version_consistency.py
```

CI also runs the check for pull requests, `main`, and `v*` tags. During a tag
build, the tag must equal `v` followed by the dashboard and changelog version.

Before publishing a release, follow `docs/release-checklist.md`. Pull requests
upload a short-lived Home Assistant test artifact; install it using
`docs/release-testing.md` and record the manual editor, responsive, and theme
results in the pull request.
