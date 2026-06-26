# HA Kia Connect Dashboard

[![CI](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml/badge.svg)](https://github.com/OWNER/ha-kia-connect-dashboard/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

HA Kia Connect Dashboard is a Home Assistant Lovelace YAML dashboard inspired by the Kia Connect mobile experience. The project aims to become the reference open-source Hyundai/Kia dashboard for Home Assistant users.

## Status

This repository is in Milestone 1: repository setup and architecture planning. Dashboard implementation will begin only after the architecture, validation, and template contracts are reviewed.

## Mission

Create a native Home Assistant dashboard that is polished, modular, responsive, documented, and easy to adapt to different Hyundai/Kia vehicles by replacing one entity mapping file.

## Supported Reference Vehicle

The first reference vehicle is a 2026 Kia EV6 GT-Line RWD in Snow White Pearl. The dashboard architecture is intentionally vehicle-agnostic.

## Design Principles

- Kia Connect inspired visual language.
- Native Home Assistant YAML only.
- No duplicated YAML or copy-paste card definitions.
- Entity IDs are abstracted through `dashboard/templates/entities.yaml`.
- Production-quality documentation and validation.

## Planned Documentation

- Installation guide.
- Customization guide.
- Troubleshooting guide.
- FAQ.
- Screenshot gallery placeholders in `docs/screenshots/`.

## Repository Layout

See `ARCHITECTURE.md` for the planned layout and dashboard composition strategy.
