# Overview Shell

## Purpose

The Overview view is the first dashboard surface. Milestone 4 establishes the
page structure and card ownership before live entity rendering is connected.

## Composition

`dashboard/views/overview.yaml` composes these card fragments:

- `overview-hero.yaml` for vehicle identity and primary context.
- `battery-summary.yaml` for battery and charging placeholders.
- `quick-actions.yaml` for native Lovelace action buttons.
- `vehicle-status.yaml` for lock, opening, and light placeholders.
- `location-summary.yaml` for tracker, odometer, and future map context.
- `tire-status.yaml` for tire pressure placeholders.
- `overview-footer.yaml` for implementation notes.

## Entity Rules

The Overview shell does not hardcode Home Assistant entity IDs. Cards reference
logical mapping keys such as `battery.level` and `locks.door_lock`. Future data
cards should resolve those keys through reusable templates while keeping raw
entity IDs inside `dashboard/templates/entities.yaml`.

## Native Card Baseline

This shell uses native Lovelace cards only:

- `markdown`
- `grid`
- `button`

More advanced styling and dynamic cards can be introduced later through focused
PRs after the data-binding pattern is reviewed.
