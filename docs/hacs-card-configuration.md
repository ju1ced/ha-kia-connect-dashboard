# HACS Card Configuration

The HACS package provides the `custom:kia-dashboard-card` Lovelace card. When you
use the card directly in Home Assistant, configure your own entities in the card
YAML. You do not need to edit `dashboard/templates/entities.yaml` for direct HACS
usage.

## Resource

After installing the repository through HACS, make sure this Lovelace resource is
available:

```yaml
- url: /hacsfiles/ha-kia-connect-dashboard/ha-kia-connect-dashboard.js
  type: module
```

## Minimal Card

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
  start_climate: switch.your_vehicle_climate
  stop_climate: switch.your_vehicle_climate
  start_charging: switch.your_vehicle_ev_charging
  stop_charging: switch.your_vehicle_ev_charging
```

For Home Assistant sections dashboards, make the card span the full section:

```yaml
layout_options:
  grid_columns: full
  grid_rows: auto
```

## Actions

The card can call Home Assistant services for quick actions:

- `refresh` presses a `button.*` entity.
- `start_climate` calls `turn_on` on a `switch.*`, `input_boolean.*`, or
  `climate.*` entity.
- `stop_climate` calls `turn_off` on a `switch.*`, `input_boolean.*`, or
  `climate.*` entity.
- `start_charging` calls `turn_on` on a `switch.*` or `input_boolean.*` entity.
- `stop_charging` calls `turn_off` on a `switch.*` or `input_boolean.*` entity.

Configure `start_climate` and `stop_climate` explicitly when your integration
exposes a climate command switch. If they are omitted, the card falls back to the
`climate` entity, which may only open state details or may not support direct
`turn_on` / `turn_off` service calls.

After each action click, the card shows a short feedback message in Quick
Actions. This confirms whether a service call was sent or whether the mapped
entity is missing or unsupported.

Remote actions ask for browser confirmation by default. You can disable that for
testing only:

```yaml
type: custom:kia-dashboard-card
confirm_actions: false
```

## Location Map

The Location panel uses the configured `location` device tracker. If that tracker
has `latitude` and `longitude` attributes, the card shows a simple map tile and
marker. If those attributes are missing, the card falls back to a neutral map
placeholder while still showing tracker state and odometer data.

## Vehicle Images

By default the card loads vehicle images from `/local/vehicles/`:

```text
/config/www/vehicles/ev6_front_right.png
/config/www/vehicles/ev6_charging.png
/config/www/vehicles/ev6_climate.png
/config/www/vehicles/ev6_side.png
/config/www/vehicles/ev6_top.png
```

You can override the image base path and filenames:

```yaml
type: custom:kia-dashboard-card
asset_base: /local/my-car/
images:
  normal: normal.png
  charging: charging.png
  climate: climate.png
```

## Repository Render Helper

The repository also contains a YAML dashboard package and render script for local
development. That path still uses `dashboard/templates/entities.yaml` as an
example mapping file. It is intentionally generic and should not contain private
Home Assistant entity names in the public repository.
