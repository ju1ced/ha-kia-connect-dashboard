# HA Kia Connect Dashboard

[![CI](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml/badge.svg)](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HA Kia Connect Dashboard is a Home Assistant Lovelace dashboard inspired by the
Kia Connect mobile experience. The project aims to become the reference
open-source Hyundai/Kia dashboard for Home Assistant users.

## Status

This repository now contains the initial Lovelace dashboard shell, Kia Horizon
theme tokens, mapped entity contracts, a responsive dark visual Overview layer,
read-only entity diagnostics, runtime mapping health checks, low-risk Settings
actions, and a first-test render path for Home Assistant. The Overview is moving
to a custom Lovelace card so the production layout can match the visual render
more closely than nested YAML cards allow. Real Home Assistant screenshots and
medium-risk vehicle actions are still in progress.

## Mission

Create a native Home Assistant dashboard that is polished, modular, responsive,
documented, and easy to adapt to different Hyundai/Kia vehicles by replacing one
entity mapping file.

## Supported Reference Vehicle

The first reference vehicle is a 2026 Kia EV6 GT-Line RWD in Snow White Pearl.
The dashboard architecture is intentionally vehicle-agnostic.

## Design Principles

- Kia Connect inspired visual language.
- Entity IDs are abstracted through `dashboard/templates/entities.yaml`.
- Overview layout is owned by a dedicated Lovelace custom card.
- Detail pages remain modular YAML while the custom-card pattern matures.
- Production-quality documentation and validation.

## First Home Assistant Test

Use `docs/first-home-assistant-test.md` for the first manual test checklist.
After updating `dashboard/templates/entities.yaml`, render a Home Assistant-ready
copy with:

```bash
python3 scripts/render_dashboard.py
```

If your Home Assistant dashboard is mounted under another URL path, pass that
route base during rendering:

```bash
python3 scripts/render_dashboard.py --dashboard-path /kia-ev6
```

The rendered package is written to `build/home-assistant-dashboard/`.

The Overview page depends on the `kia-dashboard-card` frontend resource from this
repository. When installed through HACS, register:

```yaml
- url: /hacsfiles/ha-kia-connect-dashboard/ha-kia-connect-dashboard.js
  type: module
```

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
