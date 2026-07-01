# Home Assistant Integration

## Purpose

This dashboard package is designed to sit behind an existing Home Assistant home
dashboard button. In the reference setup, the user's Home dashboard contains a
KIA EV6 button that opens the Kia Overview page.

The Kia Overview then owns the internal menu for all Kia-specific detail pages.

## Recommended Entry Flow

1. Keep your existing Home Assistant home dashboard as the daily entry point.
2. Add or keep a KIA EV6 button on that home dashboard.
3. Point that button to the Kia Overview route.
4. Use the Overview page to reach Battery, Vehicle, Climate, Energy, Location,
   and Settings.

```text
Home dashboard
  KIA EV6 button
    Kia Overview
      Battery
      Vehicle
      Climate
      Energy
      Location
      Settings
```

## Dashboard Package Route

The package defaults to these route assumptions:

- Overview: `/lovelace/overview`
- Battery: `/lovelace/kia-battery`
- Vehicle: `/lovelace/kia-vehicle`
- Climate: `/lovelace/kia-climate`
- Energy: `/lovelace/kia-energy`
- Location: `/lovelace/kia-location`
- Settings: `/lovelace/kia-settings`

If the dashboard is mounted under another Lovelace URL path, render with that
path so internal navigation is rewritten in the output package:

```bash
python scripts/render_dashboard.py --dashboard-path /kia-ev6
```

That example renders Overview as `/kia-ev6/overview` and rewrites the internal
menu and Back to Overview buttons to the same route base.

## Required Lovelace Resources

The visual dashboard uses these custom Lovelace resources:

```yaml
- url: /hacsfiles/lovelace-decluttering-card/decluttering-card.js
  type: module
- url: /hacsfiles/button-card/button-card.js
  type: module
- url: /hacsfiles/lovelace-card-mod/card-mod.js
  type: module
```

Adjust the URLs if your Home Assistant instance exposes HACS resources under a
different path.

## Example Home Button

Use this shape on an existing Home Assistant dashboard button. The
`navigation_path` must use the same route base as the rendered dashboard:

```yaml
type: button
name: KIA EV6
icon: mdi:car-electric
tap_action:
  action: navigate
  navigation_path: /lovelace/overview
```

If you rendered with `--dashboard-path /kia-ev6`, use
`navigation_path: /kia-ev6/overview`.

## Internal Navigation Rule

Do not add separate Home dashboard buttons for every Kia detail page unless you
explicitly want shortcuts. The Overview page should remain the primary Kia menu
surface so the package is easy to move or embed later.

## Entity Mapping Rule

Before expecting live data, update `dashboard/templates/entities.yaml` with the
entity IDs from your Home Assistant instance. Keep card files unchanged; they
should continue using logical keys.

Run the dashboard render step before copying the package into Home Assistant:

```bash
python scripts/render_dashboard.py
```

The rendered Home Assistant-ready files are written to
`build/home-assistant-dashboard/`.

## First Test Guide

Use `docs/first-home-assistant-test.md` for the first manual test pass. It
covers the required custom card resources, theme install, existing Home dashboard
button, first navigation checks, and the actions that should remain untested
until the safety binding milestone is complete.
