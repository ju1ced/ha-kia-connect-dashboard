# Entity Mapping

## Purpose

`dashboard/templates/entities.yaml` is the only file that may contain Home
Assistant entity IDs. Every dashboard view, card, popup, and template should use
logical mapping keys instead of direct entity IDs.

This keeps the dashboard portable across Hyundai and Kia vehicles. A user should
adapt one file, then reuse the rest of the dashboard without search-and-replace.

## Naming Model

Entity groups are organized by dashboard domain:

- `vehicle` stores display metadata.
- `battery` stores battery, range, charge, and plug state sensors.
- `climate` stores cabin temperature and climate control entities.
- `location` stores tracker and odometer entities.
- `locks` stores lock controls.
- `openings` stores doors, windows, trunk, and hood state.
- `lights` stores light state and light controls.
- `tires` stores tire pressure sensors.
- `controls` stores service-like button entities.

## Rules

- Add new Home Assistant entity IDs only to `dashboard/templates/entities.yaml`.
- Use stable logical names that describe dashboard intent, not integration names.
- Keep one entity per logical key.
- Prefer adding missing keys over reusing unrelated keys.
- Document optional or unavailable integration entities before using them.

## Customization Flow

1. Copy the default `entities.yaml`.
2. Replace the placeholder entity IDs with entities from your Home Assistant
   instance.
3. Leave logical keys unchanged unless the dashboard contract changes.
4. Run the QA checks before opening a pull request.
