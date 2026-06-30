# HA Kia Connect Dashboard

[![CI](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml/badge.svg)](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HA Kia Connect Dashboard is a Home Assistant Lovelace YAML dashboard inspired by
the Kia Connect mobile experience. The project aims to become the reference
open-source Hyundai/Kia dashboard for Home Assistant users.

## Status

This repository now contains the initial Lovelace dashboard shell, Kia Horizon
theme tokens, mapped entity contracts, detail pages, read-only entity diagnostics
guidance, and a first-test render path for Home Assistant. Runtime health checks,
safe service actions, and real Home Assistant screenshots are still in progress.

## Mission

Create a native Home Assistant dashboard that is polished, modular, responsive,
documented, and easy to adapt to different Hyundai/Kia vehicles by replacing one
entity mapping file.

## Supported Reference Vehicle

The first reference vehicle is a 2026 Kia EV6 GT-Line RWD in Snow White Pearl.
The dashboard architecture is intentionally vehicle-agnostic.

## Design Principles

- Kia Connect inspired visual language.
- Native Home Assistant YAML only.
- No duplicated YAML or copy-paste card definitions.
- Entity IDs are abstracted through `dashboard/templates/entities.yaml`.
- Production-quality documentation and validation.

## First Home Assistant Test

Use `docs/first-home-assistant-test.md` for the first manual test checklist.
After updating `dashboard/templates/entities.yaml`, render a Home Assistant-ready
copy with:

```bash
python scripts/render_dashboard.py
```

The rendered package is written to `build/home-assistant-dashboard/`.

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
