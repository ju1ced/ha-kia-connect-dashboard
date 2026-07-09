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
  start_charging: switch.your_vehicle_ev_charging
```

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
