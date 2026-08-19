# Release Checklist

## Prepare

- [ ] Choose the semantic version and update `KIA_DASHBOARD_CARD_VERSION`.
- [ ] Add a dated release heading to `CHANGELOG.md`.
- [ ] Run `python scripts/check_version_consistency.py --tag vX.Y.Z`.
- [ ] Confirm the pull request contains no unrelated files.

## Validate

- [ ] All **QA Agent** checks pass on the release commit.
- [ ] Download and install the CI test artifact using
      `docs/release-testing.md`.
- [ ] Test an existing YAML configuration in the visual editor.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Test Home Assistant light and dark themes.
- [ ] Confirm remote vehicle and charger controls remain opt-in.
- [ ] Record any environment-specific limitation in the pull request.

## Publish

- [ ] Merge the reviewed release pull request into `main`.
- [ ] Create the annotated tag `vX.Y.Z` on the merge commit.
- [ ] Confirm tag CI passes and version validation accepts the tag.
- [ ] Create the GitHub release from the matching changelog section.
- [ ] Confirm HACS sees the new release and serves the expected JavaScript
      version.

## Post-release

- [ ] Install or update through HACS on a real Home Assistant instance.
- [ ] Confirm the Settings tab reports the released version.
- [ ] Move completed development notes out of `Unreleased` when necessary.
- [ ] Keep rollback instructions and the previous release available.
