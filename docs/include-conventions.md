# Include Conventions

## Composition Root

`dashboard/dashboard.yaml` is the dashboard composition root. It should include
views from `dashboard/views/` and avoid large inline card definitions.

## Folder Responsibilities

- `dashboard/views/` contains top-level Lovelace views.
- `dashboard/cards/` contains reusable card fragments.
- `dashboard/popups/` contains modal or detail surfaces.
- `dashboard/templates/` contains reusable contracts and template inputs.
- `dashboard/themes/` contains Home Assistant theme files.

## Include Rules

- Views may include cards, popups, and templates.
- Cards may include template inputs, colors, icons, and entity mapping keys.
- Popups may include cards and template inputs.
- Templates should not include views or popups.
- Themes should not include dashboard structure.

## File Naming

Use lowercase, hyphen-separated names for dashboard files:

- `overview.yaml`
- `battery-summary.yaml`
- `charging-popup.yaml`
- `vehicle-status-card.yaml`

Use descriptive names over abbreviations. The filename should make ownership
clear when a lint error or Home Assistant include error appears.

## Change Rules

- Add shared card patterns to `dashboard/cards/`.
- Add one-off page composition to `dashboard/views/`.
- Add reusable variables to `dashboard/templates/`.
- Keep dashboard files small enough to review in focused pull requests.
