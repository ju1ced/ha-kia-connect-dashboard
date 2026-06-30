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

Use `kia_mapped_action_button` for local actions such as `more-info` or future
navigation patterns that do not perform a Home Assistant service call.

Expected inputs:

- `entity` receives the mapped action entity value.
- `name` is the user-facing command label.
- `icon` is the semantic icon for the action.
- `action` defaults to `none` until a local action pattern is chosen.

Use `kia_mapped_perform_action_button` only for reviewed low-risk Home Assistant
service actions such as pressing a mapped refresh button.

Expected inputs:

- `entity` receives the mapped action entity value.
- `name` is the user-facing command label.
- `icon` is the semantic icon for the action.
- `perform_action` is the Home Assistant action, such as `button.press`.

Use `kia_mapped_confirm_action_button` when the future action needs a
confirmation prompt. The template still supports `action: none`, so it can show
risk intent before real services are enabled.

Expected inputs:

- `entity` receives the mapped action entity value.
- `name` is the user-facing command label.
- `icon` is the semantic icon for the action.
- `action` defaults to `none` until a service or navigation pattern is chosen.
- `confirmation_text` explains what the user is confirming.

See `docs/action-safety-contract.md` before enabling any mapped action button.

### Section Notes

Use `kia_mapped_section_note` for short explanatory or empty-state content that
must stay visually consistent across detail pages.

### Entity Diagnostics

Use `kia_mapped_entity_diagnostics` for Settings guidance and future diagnostic
surfaces that explain missing, unknown, or unavailable mapped entities. The
pattern must stay read-only and should point users back to
`dashboard/templates/entities.yaml`.

### Inline Mapping Alerts

Use `kia_inline_mapping_alert` for future compact alerts near critical page data.
Inline alerts must stay read-only and should be reserved for cases where missing,
unknown, or unavailable mapped data blocks the purpose of a page section.

Expected inputs:

- `severity` is the alert title.
- `icon` is the semantic alert icon.
- `title` names the affected feature area.
- `content` gives a short remediation hint and should point users to Settings or
  the entity mapping file.

See `docs/inline-unavailable-alerts.md` before adding inline alerts to detail
pages.

### Back Navigation

Use `kia_back_to_overview` when a detail page needs the standard return button.

## Usage Shape

Page cards call these patterns through `custom:decluttering-card` and pass
logical mapping keys as variables. The dashboard root exposes the templates with
`decluttering_templates: !include templates/decluttering_templates.yaml`.

## Review Rules

- Do not hardcode Home Assistant entity IDs in cards or views.
- Add or update entity IDs only in `dashboard/templates/entities.yaml`.
- Keep every card-level logical entity key present in the mapping file.
- Prefer one shared template pattern over repeated one-off YAML.
- Keep page cards responsible for layout and ownership, not raw entity details.
- Keep service action buttons limited to reviewed low-risk targets.
- Keep confirm-action buttons inert until the command confirmation pattern is reviewed.
- Keep diagnostics read-only until runtime health checks are documented.
- Keep inline alerts limited to critical page-blocking mapped data.

## Follow-up Work

- Add last-command feedback rows before enabling medium-risk commands.
- Add inline alerts to affected page groups after the first Home Assistant test
  identifies repeated missing, unknown, or unavailable states.
