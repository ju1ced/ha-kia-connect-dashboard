# Overview Shell

## Purpose

The Overview view is the first dashboard surface. Milestone 4 establishes the
page structure and card ownership before live entity rendering is connected.

This dashboard is designed to be opened from an existing Home Assistant dashboard,
such as a Kia EV6 button on a home page. Once the user lands on Overview, all
vehicle-specific sections should be reachable from this page.

See `docs/home-assistant-integration.md` for the recommended Home dashboard entry
flow.

## Composition

`dashboard/views/overview.yaml` composes these card fragments:

- `overview-hero.yaml` for vehicle identity and primary context.
- `section-navigation.yaml` for internal navigation to detail sections.
- `battery-summary.yaml` for battery and charging placeholders.
- `quick-actions.yaml` for native Lovelace action buttons.
- `vehicle-status.yaml` for lock, opening, and light placeholders.
- `location-summary.yaml` for tracker, odometer, and future map context.
- `tire-status.yaml` for tire pressure placeholders.
- `overview-footer.yaml` for implementation notes.

## Navigation Model

The Overview page acts as the hub for the Kia dashboard package. The first
navigation shell exposes native Lovelace `navigate` actions for these future
sections:

- Battery
- Vehicle
- Climate
- Energy
- Location
- Settings

The initial navigation paths use stable placeholders such as
`/lovelace/kia-battery`. These can be adjusted later to match the user's actual
Home Assistant dashboard URL strategy.

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
