# Mapped Template Patterns

The mapped template patterns define the first reusable bridge between dashboard
cards and the entity mapping contract.

## Files

- `dashboard/dashboard.yaml` includes the shared decluttering templates.
- `dashboard/templates/entities.yaml` owns real Home Assistant entity IDs.
- `dashboard/templates/decluttering_templates.yaml` owns reusable Lovelace card
  patterns.
- `dashboard/cards/` owns page-specific card composition.

## Pattern Types

### State Rows

Use `kia_mapped_state_row` for read-only values such as battery level, range,
tracker state, odometer, lock state, and temperature.

Expected inputs:

- `entity` receives the mapped entity value.
- `name` is the user-facing label.
- `icon` is the semantic icon for the row.
- `secondary_info` defaults to `none`.

### Action Buttons

Use `kia_mapped_action_button` for future refresh, charging, climate, lock, and
maintenance actions.

Expected inputs:

- `entity` receives the mapped action entity value.
- `name` is the user-facing command label.
- `icon` is the semantic icon for the action.
- `action` defaults to `none` until a service or confirmation pattern is chosen.

### Section Notes

Use `kia_mapped_section_note` for short explanatory or empty-state content that
must stay visually consistent across detail pages.

### Back Navigation

Use `kia_back_to_overview` when a detail page needs the standard return button.

## Usage Shape

Page cards call these patterns through `custom:decluttering-card` and pass
logical mapping keys as variables. The dashboard root exposes the templates with
`decluttering_templates: !include templates/decluttering_templates.yaml`.

## Review Rules

- Do not hardcode Home Assistant entity IDs in cards or views.
- Add or update entity IDs only in `dashboard/templates/entities.yaml`.
- Prefer one shared template pattern over repeated one-off YAML.
- Keep page cards responsible for layout and ownership, not raw entity details.
- Keep action buttons inert until the command confirmation pattern is reviewed.

## Follow-up Work

- Convert Vehicle, Climate, Energy, Location, and Settings cards in focused PRs.
- Add confirmation and service-call patterns before enabling remote actions.
