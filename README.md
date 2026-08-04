# HA Kia Connect Dashboard

[![CI](https://github.com/ju1ced/ha-kia-connect-dashboard/actions/workflows/ci.yaml/badge.svg)](https://github.com/ju1ced/ha-kia-connect-dashboard/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HA Kia Connect Dashboard is a Home Assistant Lovelace dashboard inspired by the
Kia Connect mobile experience. The project aims to become the reference
open-source Hyundai/Kia dashboard for Home Assistant users.

## Status

The current stable HACS card provides responsive Overview, Battery, Vehicle,
Climate, Energy, Location, and Settings views. It supports Dutch and English,
battery diagnostics, cover-based window controls, generic home charger mappings,
Smappee strategy controls, charging history helpers, tariff estimates, and
repository-side validation tools. Trip analytics, additional climate comfort
features, reviewed medium-risk vehicle actions, and complete screenshot
documentation remain planned.

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
- The HACS custom card owns the primary production dashboard experience.
- The repository-side modular YAML flow remains available for rendering and
  architecture validation while its long-term support scope is reviewed.
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

## Planned Work

- Climate comfort entities and schedules.
- Trip, regeneration, and long-term energy analytics.
- Reviewed lock, light, and other medium-risk vehicle actions.
- Installation, customization, troubleshooting, FAQ, and current screenshots.

See `ROADMAP.md` and `TASKS.md` for the maintained project plan.

## Repository Layout

See `ARCHITECTURE.md` for the planned layout and dashboard composition strategy.
