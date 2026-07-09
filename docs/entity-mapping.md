# Entity Mapping

## Purpose

`dashboard/templates/entities.yaml` is the repository-side YAML render mapping.
It exists for maintainers and users who render the full YAML dashboard package
with `scripts/render_dashboard.py`.

HACS users of `custom:kia-dashboard-card` do not need this file. They should add
Home Assistant entity IDs directly to the card configuration in the dashboard
editor or Lovelace YAML.

This split keeps the public repository safe to publish while preserving the
portable YAML render flow for development and full-package tests.

## HACS Card Configuration

For normal HACS usage, configure the card directly:

```yaml
type: custom:kia-dashboard-card
title: Kia EV6
subtitle: GT-Line RWD
entities:
  battery_level: sensor.your_vehicle_ev_battery_level
  battery_range: sensor.your_vehicle_ev_range
  charging_state: binary_sensor.your_vehicle_ev_battery_charge
  odometer: sensor.your_vehicle_odometer
  location: device_tracker.your_vehicle_location
  door_lock: lock.your_vehicle_door_lock
```

See `docs/hacs-card-configuration.md` for the full HACS card example.

## YAML Render Mapping

For repository-side YAML rendering, `dashboard/templates/entities.yaml` is the
only file that may contain Home Assistant entity IDs. Every dashboard view, card,
popup, and template should use logical mapping keys instead of direct entity IDs.

The checked-in file must contain generic example IDs only. Do not commit personal
entity IDs, vehicle nicknames, home locations, VINs, account data, or other
private Home Assistant details.

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
- `settings` stores dashboard administration action entities.

## Logical Key Syntax

Dashboard cards pass mapped entities to shared card templates with logical keys.
Both of these forms are accepted while the dashboard is being assembled:

- Dot form: `battery.level`
- Slash form: `climate / cabin_temperature`

CI normalizes both forms and verifies that each referenced key exists in
`dashboard/templates/entities.yaml`.

## Missing Entity Handling

If the HACS card shows an unknown, unavailable, or missing value, inspect the
entity configured on that card first.

If the rendered YAML package shows an unknown, unavailable, or missing value,
inspect `dashboard/templates/entities.yaml` first. Card files should keep their
logical keys unchanged unless the dashboard contract itself changes.

Settings owns the first read-only diagnostic surface for these mapping problems.
Future runtime health checks should reuse that surface before adding inline
alerts to every detail page.

## Rules

- Configure HACS card entities directly on `custom:kia-dashboard-card`.
- Add repository-side YAML render entity IDs only to
  `dashboard/templates/entities.yaml`.
- Keep the checked-in mapping generic and safe for a public repository.
- Use stable logical names that describe dashboard intent, not integration names.
- Keep one entity per logical key.
- Prefer adding missing keys over reusing unrelated keys.
- Document optional or unavailable integration entities before using them.

## Validation

The QA workflow runs two entity checks for the YAML render flow:

- `scripts/check_entity_references.py` rejects direct Home Assistant entity IDs
  outside `dashboard/templates/entities.yaml`.
- `scripts/check_mapped_entity_keys.py` rejects card-level logical keys that do
  not exist in `dashboard/templates/entities.yaml`.

## Customization Flow For YAML Rendering

1. Copy the default `entities.yaml` outside the public branch or edit it only in
   your private Home Assistant deployment copy.
2. Replace the example entity IDs with entities from your Home Assistant
   instance.
3. Leave logical keys unchanged unless the dashboard contract changes.
4. Run the QA checks before opening a pull request.
