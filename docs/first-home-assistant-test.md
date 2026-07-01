# First Home Assistant Test

## Goal

This checklist gets the dashboard ready for a first Home Assistant test behind an
existing home dashboard button. The first test should verify navigation, layout,
theme loading, read-only live data, and low-risk Settings actions.

Remote vehicle commands should stay disabled or untested until the action
bindings have their own safety pass.

## Before You Start

Confirm these items in Home Assistant:

- The Kia integration is already installed and exposing vehicle entities.
- HACS or another install path provides `decluttering-card`.
- YAML mode or a dashboard include workflow is available for Lovelace.
- You can edit the existing Home dashboard button for the Kia EV6 entry point.

## Prepare The Entity Map

Update `dashboard/templates/entities.yaml` with the real entity IDs from your
Home Assistant instance. Keep all other dashboard files unchanged unless a real
entity shape differs from the dashboard assumption.

Example:

```yaml
battery:
  level: sensor.oprit_nebula_ev_battery_level
```

The source dashboard uses logical keys such as `battery.level`. The render step
turns those logical keys into Home Assistant entity IDs for the test package.

## Check Runtime Mapping Health

After updating the entity map, run the runtime health check. Without Home
Assistant state data it reports which mappings can be checked later:

```bash
python scripts/check_runtime_mapping_health.py
```

With a Home Assistant state export, it reports `ok`, `missing`, `unknown`, and
`unavailable` rows:

```bash
python scripts/check_runtime_mapping_health.py --states-json ha-states.json
```

Use `docs/runtime-mapping-health.md` for export details and strict-mode usage.
Fix missing or incorrect mapped entity IDs before rendering the test dashboard.

## Render The Test Dashboard

Run the render step from the repository root:

```bash
python scripts/render_dashboard.py
```

The rendered Home Assistant-ready files are written to:

```text
build/home-assistant-dashboard/
```

Copy the contents of that rendered folder into the Home Assistant dashboard
package location you use for this test.

## Install Theme

Copy the Kia Horizon theme from:

```text
dashboard/themes/
```

into your Home Assistant themes folder, then reload themes in Home Assistant.
Select the theme before doing the visual pass.

## Register Required Resource

Make sure `decluttering-card` is available as a Lovelace resource. A typical
resource entry looks like this:

```yaml
url: /hacsfiles/lovelace-decluttering-card/decluttering-card.js
type: module
```

Adjust the URL if your Home Assistant instance exposes HACS resources under a
different path.

## Connect The Home Button

Keep the Kia dashboard behind the existing Home dashboard button. Point the
button to the Kia Overview route:

```yaml
type: button
name: KIA EV6
icon: mdi:car-electric
tap_action:
  action: navigate
  navigation_path: /lovelace/overview
```

If the dashboard is mounted under another Lovelace URL, adjust the route to
match that local dashboard path.

## First Test Scope

Check these items first:

- The Home dashboard button opens the Kia Overview page.
- The Overview page shows the main vehicle sections.
- Battery, Vehicle, Climate, Energy, Location, and Settings pages open from the
  Overview page.
- The Kia Horizon theme loads correctly.
- Read-only data rows show values or understandable unavailable states.
- Settings shows latest scan, climate state, charging state, and vehicle data
  details.
- Settings Refresh Vehicle calls the mapped refresh button only.
- Settings Vehicle Data Details opens the mapped vehicle data more-info panel
  only.

## Do Not Test Yet

Avoid these until the action binding milestone is complete:

- Starting or stopping climate remotely.
- Starting or stopping charging remotely.
- Locking or unlocking the vehicle remotely.
- Any service call that changes vehicle state beyond refreshing status.

## Capture Reference Evidence

After the first pass, add screenshots for:

- Overview on desktop.
- Overview on mobile.
- Settings diagnostics.
- One detail page with live data.

Store real screenshots next to the current visual references in
`docs/screenshots/` once the first Home Assistant install is stable.
