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
- HACS or another install path provides this repository's `kia-dashboard-card`.
- HACS or another install path provides `decluttering-card`, `button-card`,
  `card-mod`, and `layout-card` if you also test the YAML detail pages.
- YAML mode or a dashboard include workflow is available if you test the
  repository-side YAML package.
- You know the dashboard URL path that will host the Kia pages.
- You can edit the existing Home dashboard button for the Kia EV6 entry point.
- EV6 hero images are available under `/config/www/vehicles/`, including
  `ev6_front_right.png`, `ev6_charging.png`, and `ev6_climate.png`.

## HACS Card Setup

For a direct HACS test, add `custom:kia-dashboard-card` to a dashboard and
configure your real Home Assistant entities in the card YAML.

```yaml
type: custom:kia-dashboard-card
title: Kia EV6
subtitle: GT-Line RWD
entities:
  battery_level: sensor.your_vehicle_ev_battery_level
  battery_range: sensor.your_vehicle_ev_range
  charging_state: binary_sensor.your_vehicle_ev_battery_charge
  plug_connected: binary_sensor.your_vehicle_ev_battery_plug
  charging_limit: number.your_vehicle_ac_charging_limit
  odometer: sensor.your_vehicle_odometer
  location: device_tracker.your_vehicle_location
  last_updated: sensor.your_vehicle_last_refresh
  climate: climate.your_vehicle_climate_control
  door_lock: lock.your_vehicle_door_lock
  trunk: binary_sensor.your_vehicle_trunk
  hood: binary_sensor.your_vehicle_hood
  lights: binary_sensor.your_vehicle_headlamp_status
  charge_port: binary_sensor.your_vehicle_ev_charge_port
  tire_front_left: binary_sensor.your_vehicle_tire_pressure_front_left
  tire_front_right: binary_sensor.your_vehicle_tire_pressure_front_right
  tire_rear_left: binary_sensor.your_vehicle_tire_pressure_rear_left
  tire_rear_right: binary_sensor.your_vehicle_tire_pressure_rear_right
  refresh: button.your_vehicle_force_refresh
  start_charging: switch.your_vehicle_ev_charging
```

See `docs/hacs-card-configuration.md` for the complete card configuration.

## Optional YAML Package Entity Map

The repository still contains a YAML dashboard package and render script for
local development. That path uses `dashboard/templates/entities.yaml`, but the
public repository keeps that file generic. If you use the render flow, replace
those example entity IDs locally before rendering.

Example:

```yaml
battery:
  level: sensor.your_vehicle_ev_battery_level
```

The source dashboard uses logical keys such as `battery.level`. The render step
turns those logical keys into Home Assistant entity IDs for the test package.

## Check Runtime Mapping Health

After updating the entity map for the optional YAML render flow, run the runtime
health check. Without Home Assistant state data it reports which mappings can be
checked later:

```bash
python3 scripts/check_runtime_mapping_health.py
```

With a Home Assistant state export, it reports `ok`, `missing`, `unknown`, and
`unavailable` rows:

```bash
python3 scripts/check_runtime_mapping_health.py --states-json ha-states.json
```

Use `docs/runtime-mapping-health.md` for export details and strict-mode usage.
Fix missing or incorrect mapped entity IDs before rendering the test dashboard.

## Render The Test Dashboard

Run the render step from the repository root. The default dashboard path is
`/lovelace`:

```bash
python3 scripts/render_dashboard.py
```

If your Kia dashboard is mounted under another URL path, render with the same
base path. For example:

```bash
python3 scripts/render_dashboard.py --dashboard-path /kia-ev6
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

## Register Required Resources

Install this repository as a HACS frontend custom repository or copy the built
resource manually. Make sure this Lovelace resource is registered before opening
the Overview page:

```yaml
- url: /hacsfiles/ha-kia-connect-dashboard/ha-kia-connect-dashboard.js
  type: module
```

The remaining detail pages still need these resources:

```yaml
- url: /hacsfiles/lovelace-decluttering-card/decluttering-card.js
  type: module
- url: /hacsfiles/button-card/button-card.js
  type: module
- url: /hacsfiles/lovelace-card-mod/card-mod.js
  type: module
- url: /hacsfiles/lovelace-layout-card/layout-card.js
  type: module
```

Adjust the URLs if your Home Assistant instance exposes HACS resources under a
different path.

## Connect The Home Button

Keep the Kia dashboard behind the existing Home dashboard button. Point the
button to the Kia Overview route. Use the same dashboard path as the render
command:

```yaml
type: button
name: KIA EV6
icon: mdi:car-electric
tap_action:
  action: navigate
  navigation_path: /lovelace/overview
```

If you rendered with `--dashboard-path /kia-ev6`, the button should navigate to
`/kia-ev6/overview` instead.

## First Test Scope

Check these items first:

- The Home dashboard button opens the Kia Overview page.
- The Overview page is rendered by `custom:kia-dashboard-card`.
- The Overview page shows the responsive dark visual card layer.
- The Overview hero switches to the charging image while charging and the
  climate image while climate is active.
- Battery, Vehicle, Climate, Energy, Location, and Settings pages open from the
  Overview page if you are testing the full YAML package.
- Back to Overview works from every detail page if you are testing the full YAML
  package.
- The Kia Horizon theme loads correctly.
- Read-only data rows show values or understandable unavailable states.
- Settings shows latest scan, climate state, charging state, and vehicle data
  details if you are testing the full YAML package.
- Settings Refresh Vehicle calls the mapped refresh button only if you are
  testing the full YAML package.
- Settings Vehicle Data Details opens the mapped vehicle data more-info panel
  only if you are testing the full YAML package.

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
- Battery with live data.
- Vehicle with live data.
- Climate with live data.
- Energy with live data.
- Location with live data.
- Settings diagnostics.

Store real screenshots next to the current visual references in
`docs/screenshots/` once the first Home Assistant install is stable.
