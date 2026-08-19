# Release Candidate Testing

## Purpose

Use this procedure to test a pull-request or release-candidate build in Home
Assistant without replacing the stable HACS resource. The CI artifact contains
the exact JavaScript file that passed the repository checks.

## Download The Test Build

1. Open the successful **QA Agent** workflow run for the pull request.
2. Download `ha-kia-connect-dashboard-test-build` from **Artifacts**.
3. Extract the archive and verify that it contains
   `ha-kia-connect-dashboard.js`.

Artifacts are retained for 14 days. Do not test a file from a failed or
cancelled workflow run.

## Install Alongside HACS

Copy the test JavaScript file to a separate Home Assistant path:

```text
/config/www/kia-dashboard-test/ha-kia-connect-dashboard.js
```

Record the stable Kia Dashboard resource URL and temporarily remove that
resource before registering the test build. Custom elements cannot be registered
twice in the same browser page. Restore the recorded HACS resource URL after the
test.

Register the test resource through **Settings → Dashboards → Resources**:

```text
URL: /local/kia-dashboard-test/ha-kia-connect-dashboard.js?v=X.Y.Z
Type: JavaScript module
```

Refresh Home Assistant and reopen the dashboard editor. Settings inside the Kia
card should report the version being tested. Replace `X.Y.Z` in the resource URL
for every new build so Home Assistant does not reuse a cached JavaScript file.

## Visual Editor Test

1. Add **Kia Dashboard Card** from the card picker.
2. Confirm the initial preview opens without YAML mode.
3. Enter a vehicle name and subtitle.
4. Search an entity mapping by logical name.
5. Expand every mapping group once.
6. Select an entity using its friendly-name suggestion.
7. Enter another valid entity ID manually.
8. Clear a mapping and confirm the related optional content disappears.
9. Enable and disable a non-destructive boolean option.
10. Switch to YAML, add an unknown test property, return to the visual editor,
    change a known field, and confirm the unknown property remains present.

Do not enable remote vehicle or charger controls solely for editor testing.

## Responsive And Theme Test

Check the editor and card at these minimum widths:

- desktop: 1280 px or wider;
- tablet: approximately 768 px;
- mobile: 390 px or the narrowest available phone viewport.

Repeat the editor check in Home Assistant light and dark themes. Verify that:

- labels and inputs remain readable;
- entity rows collapse to one column on mobile;
- no horizontal scrolling is required;
- expanded groups retain usable spacing;
- keyboard focus remains visible.

## Regression Test

Open an existing card configured through YAML and confirm:

- current mappings are prefilled;
- the dashboard still renders all existing tabs;
- lock and charger controls retain their previous opt-in state;
- map coordinates, image overrides, and history settings survive an editor
  change;
- saving from the editor does not remove unrecognized configuration fields.

## Restore Stable HACS

Remove or disable the temporary `/local/` resource, re-enable the stable HACS
resource, and refresh the browser. Delete
`/config/www/kia-dashboard-test/` after testing if it is no longer needed.

Report failures with the Home Assistant version, browser, viewport, theme,
dashboard version, console error, and a screenshot.
