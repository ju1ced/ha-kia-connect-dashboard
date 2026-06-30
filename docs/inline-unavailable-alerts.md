# Inline Unavailable Alerts

## Purpose

Inline unavailable alerts define where the dashboard should explain missing,
unknown, or unavailable mapped entities outside the Settings diagnostics surface.

The first Home Assistant test should not turn every unavailable row into a page
warning. Inline alerts are reserved for cases where missing data makes a page or
summary misleading.

## Placement Decision

Settings remains the full diagnostics surface. It should show mapping health,
refresh feedback, dashboard version, and troubleshooting guidance.

Detail pages may show compact inline alerts only when a critical mapped entity
blocks the purpose of that page:

- Battery: battery level, charging state, charging power, or estimated range.
- Vehicle: door lock state, opening state, or warning state.
- Climate: cabin temperature, HVAC state, or climate control availability.
- Energy: range context, charging context, or efficiency summary.
- Location: tracker state, odometer, or parking context.
- Overview: only top-level summary values that would otherwise misrepresent the
  vehicle state.

Non-critical unavailable rows should stay as normal Home Assistant row states and
be investigated from Settings.

## Display Rules

Use `kia_inline_mapping_alert` for future inline alerts. Keep each alert:

- Read-only.
- Short enough to scan quickly.
- Close to the affected card group.
- Focused on the logical key or feature area, not raw stack traces.
- Clear that `dashboard/templates/entities.yaml` owns the fix.

Avoid putting more than one inline alert in the same card group. If multiple
entities are unavailable, show one grouped alert and point the user to Settings.

## Example Usage

```yaml
- type: custom:decluttering-card
  template: kia_inline_mapping_alert
  variables:
    - severity: Battery data unavailable
    - icon: mdi:battery-alert
    - title: Battery mapping needs attention
    - content: >-
        Critical battery values are missing or unavailable. Check Settings for
        runtime mapping health before changing dashboard cards.
```

## First Test Policy

During the first Home Assistant test, use inline alerts as review guidance only.
Do not add alerts to every page until real screenshots show where Home Assistant
already communicates unavailable values clearly.

## Follow-up Work

- Add inline alerts to the affected page groups after the first Home Assistant
  test identifies repeated missing or unavailable states.
- Keep Settings as the complete diagnostics view even after inline alerts are
  added.
