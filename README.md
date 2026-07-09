# HA Kia Connect Dashboard

[![CI](https://github.com/ju1ced/ha-kia-connect-dashboard/actions/workflows/ci.yaml/badge.svg)](https://github.com/ju1ced/ha-kia-connect-dashboard/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HA Kia Connect Dashboard is a Home Assistant Lovelace dashboard inspired by the
Kia Connect mobile experience. The project aims to become the reference
open-source Hyundai/Kia dashboard for Home Assistant users.

## Status

This repository now contains a HACS-installable Lovelace card, Kia Horizon theme
tokens, mapped entity contracts for the repository-side YAML render flow,
read-only entity diagnostics, runtime mapping health checks, and a first-test
render path for Home Assistant. The Overview is moving to a custom Lovelace card
so the production layout can match the visual render more closely than nested
YAML cards allow. Real Home Assistant screenshots and medium-risk vehicle
actions are still in progress.

## Mission

Create a native Home Assistant dashboard that is polished, modular, responsive,
documented, and easy to adapt to different Hyundai/Kia vehicles by configuring
card entities or, for the optional YAML render flow, replacing one example entity
mapping file.

## Supported Reference Vehicle

The first reference vehicle is a 2026 Kia EV6 GT-Line RWD in Snow White Pearl.
The dashboard architecture is intentionally vehicle-agnostic.

## Design Principles

- Kia Connect inspired visual language.
- HACS users configure entities directly on `custom:kia-dashboard-card`.
- Repository-side YAML renders use example mappings only.
- Overview layout is owned by a dedicated Lovelace custom card.
- Detail pages remain modular YAML while the custom-card pattern matures.
- Production-quality documentation and validation.

## HACS Card Usage

Install this repository as a HACS frontend custom repository, then register the
Lovelace resource if Home Assistant does not add it automatically:

```yaml
- url: /hacsfiles/ha-kia-connect-dashboard/ha-kia-connect-dashboard.js
  type: module
```

Add the card to a dashboard and configure your own entities there:

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

See `docs/hacs-card-configuration.md` for the complete card configuration.

## First Home Assistant Test

Use `docs/first-home-assistant-test.md` for the first manual test checklist.
If you use the repository-side YAML dashboard package, render a Home
Assistant-ready copy with:

```bash
python3 scripts/render_dashboard.py
```

If your Home Assistant dashboard is mounted under another URL path, pass that
route base during rendering:

```bash
python3 scripts/render_dashboard.py --dashboard-path /kia-ev6
```

The rendered package is written to `build/home-assistant-dashboard/`.

The remaining detail pages still depend on `decluttering-card`, `button-card`,
`card-mod`, and `layout-card` being registered as Lovelace resources in Home
Assistant.

The Overview hero expects EV6 visual assets under Home Assistant's `/local`
static path, for example `/config/www/vehicles/ev6_front_right.png`,
`/config/www/vehicles/ev6_charging.png`, and
`/config/www/vehicles/ev6_climate.png`.

## Visual References

Reference renders are available in `docs/screenshots/` and documented in
`docs/visual-reference.md`.

## Planned Documentation

- Customization guide.
- Troubleshooting guide.
- FAQ.
- Real Home Assistant screenshot gallery.

## Repository Layout

See `ARCHITECTURE.md` for the planned layout and dashboard composition strategy.
