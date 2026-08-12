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
  charging_power: sensor.your_vehicle_ev_charging_power
  plug_connected: binary_sensor.your_vehicle_ev_battery_plug
  charging_limit: number.your_vehicle_ac_charging_limit
  dc_charging_limit: number.your_vehicle_dc_charging_limit
  odometer: sensor.your_vehicle_odometer
  vin: sensor.your_vehicle_identification_number
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

## Connection Health

The Overview connection chip and the Settings diagnostics use `last_updated`
to report whether Kia vehicle data is current, delayed, or stale. The defaults
are current for the first 30 minutes, delayed until 180 minutes, and stale
after that. Both thresholds can be adjusted at card level:

```yaml
type: custom:kia-dashboard-card
vehicle_fresh_minutes: 30
vehicle_stale_minutes: 180
entities:
  last_updated: sensor.your_vehicle_last_refresh
```

`last_updated` must contain a timestamp Home Assistant can parse. Missing,
unknown, or unavailable values are reported explicitly instead of showing a
false Online state.

The home charger is diagnosed separately through the optional
`charger_online` mapping described below. A stale Kia timestamp does not imply
that the charger is offline, and an online charger does not imply that Kia
Connect authentication is healthy.

Lovelace cards cannot read the Kia integration's config-entry authentication
state directly. Stale vehicle data is therefore a practical warning that can
indicate expired authentication, an integration repair, or a Kia cloud outage;
it is not a direct authentication check.

## Optional Vehicle and Climate Details

Vehicle identity, individual openings, windows, and climate comfort signals use
optional mappings. Only map entities that the vehicle integration actually
exposes:

```yaml
type: custom:kia-dashboard-card
entities:
  vin: sensor.your_vehicle_identification_number
  front_left_door: binary_sensor.your_vehicle_front_left_door
  front_right_door: binary_sensor.your_vehicle_front_right_door
  rear_left_door: binary_sensor.your_vehicle_rear_left_door
  rear_right_door: binary_sensor.your_vehicle_rear_right_door
  front_left_window: binary_sensor.your_vehicle_front_left_window
  front_right_window: binary_sensor.your_vehicle_front_right_window
  rear_left_window: binary_sensor.your_vehicle_rear_left_window
  rear_right_window: binary_sensor.your_vehicle_rear_right_window
  set_temperature: sensor.your_vehicle_set_temperature
  cabin_temperature: sensor.your_vehicle_cabin_temperature
  outside_temperature: sensor.your_vehicle_outside_temperature
  defrost: binary_sensor.your_vehicle_defrost
  steering_wheel_heater: binary_sensor.your_vehicle_steering_wheel_heater
  rear_window_heater: binary_sensor.your_vehicle_rear_window_heater
  driver_seat: sensor.your_vehicle_driver_seat
  passenger_seat: sensor.your_vehicle_passenger_seat
  rear_left_seat: sensor.your_vehicle_rear_left_seat
  rear_right_seat: sensor.your_vehicle_rear_right_seat
  driver_seat_heating: select.your_vehicle_driver_seat_heating
  passenger_seat_heating: select.your_vehicle_passenger_seat_heating
  rear_left_seat_heating: select.your_vehicle_rear_left_seat_heating
  rear_right_seat_heating: select.your_vehicle_rear_right_seat_heating
  driver_seat_ventilation: select.your_vehicle_driver_seat_ventilation
  passenger_seat_ventilation: select.your_vehicle_passenger_seat_ventilation
  rear_left_seat_ventilation: select.your_vehicle_rear_left_seat_ventilation
  rear_right_seat_ventilation: select.your_vehicle_rear_right_seat_ventilation
  climate_schedule: input_boolean.your_vehicle_climate_schedule
  climate_departure_time: input_datetime.your_vehicle_departure_time
  climate_schedule_1: switch.your_vehicle_scheduled_departure_1
  climate_departure_time_1: sensor.your_vehicle_first_departure_time
  climate_departure_days_1: sensor.your_vehicle_first_departure_days
  climate_schedule_2: switch.your_vehicle_scheduled_departure_2
  climate_departure_time_2: sensor.your_vehicle_second_departure_time
  climate_departure_days_2: sensor.your_vehicle_second_departure_days
```

The VIN appears as a read-only quick-reference button in the Vehicle header.
Missing optional temperature or comfort entities remain unavailable; do not map
a different measurement merely to fill an empty field. Seat and rear-window
comfort tiles only appear when mapped. `switch.*`, `input_boolean.*`, and
`button.*` mappings are actionable with confirmation; other domains open the
standard Home Assistant entity dialog. Climate schedule and departure mappings
are intentionally context-only until an integration-independent service
contract exists. Use the four combined `*_seat` mappings when the integration
reports one state per seat. Only use the separate heating and ventilation keys
when the integration exposes those capabilities as distinct entities; a
combined seat mapping takes precedence for that position. The numbered schedule
keys support integrations that expose two independent departure programs.

## Optional Battery Diagnostics and Efficiency

Battery focuses on pack condition, thermal management, the 12V system, and the
current charging estimate. Energy owns driving-efficiency trends. Vehicle shows
the Smart Key battery warning and optional individual window actions.

```yaml
type: custom:kia-dashboard-card
entities:
  battery_state_of_health: sensor.your_vehicle_ev_state_of_health_battery
  battery_capacity: sensor.your_vehicle_ev_battery_capacity
  battery_remaining_energy: sensor.your_vehicle_ev_battery_remaining_energy
  battery_pack_voltage: sensor.your_vehicle_ev_battery_pack_voltage
  battery_temperature_min: sensor.your_vehicle_ev_battery_temperature_min
  battery_temperature_max: sensor.your_vehicle_ev_battery_temperature_max
  battery_water_temperature: sensor.your_vehicle_ev_battery_water_temperature
  battery_heating: binary_sensor.your_vehicle_ev_battery_heating
  battery_heater_power: sensor.your_vehicle_ev_power_consumption_battery_heater
  battery_precondition: binary_sensor.your_vehicle_ev_battery_precondition
  battery_winter_mode: binary_sensor.your_vehicle_ev_battery_winter_mode
  battery_12v_level: sensor.your_vehicle_car_battery_level
  battery_12v_fault: binary_sensor.your_vehicle_12v_battery_fault
  estimated_charge_duration: sensor.your_vehicle_estimated_charge_duration
  average_energy_consumption: sensor.your_vehicle_average_energy_consumption
  energy_consumption_90d: sensor.your_vehicle_90_day_energy_consumption
  daily_driving_stats: sensor.your_vehicle_daily_driving_stats
  today_driving_stats: sensor.your_vehicle_today_s_daily_driving_stats
  total_energy_regeneration: sensor.your_vehicle_total_energy_regeneration
  drive_mode: sensor.your_vehicle_drive_mode
  engine: binary_sensor.your_vehicle_engine
  ignition: binary_sensor.your_vehicle_ignition
  trip_calendar: calendar.your_vehicle_trips
  smart_key_battery_warning: binary_sensor.your_vehicle_smart_key_battery_warning
  vent_windows: button.your_vehicle_vent_all_windows
  front_left_window_open: cover.your_vehicle_front_left_window
  front_left_window_close: cover.your_vehicle_front_left_window
  front_right_window_open: cover.your_vehicle_front_right_window
  front_right_window_close: cover.your_vehicle_front_right_window
  rear_left_window_open: cover.your_vehicle_rear_left_window
  rear_left_window_close: cover.your_vehicle_rear_left_window
  rear_right_window_open: cover.your_vehicle_rear_right_window
  rear_right_window_close: cover.your_vehicle_rear_right_window
```

Energy-storage sensors reported in `kJ` are converted to `kWh` for display.
All action mappings are optional. Window status can remain mapped to the
integration's binary sensors, while the open and close action keys can both point
to the same `cover.*` entity. The card calls `cover.open_cover` and
`cover.close_cover` respectively. Button mappings continue to use
`button.press`. Confirmation remains enabled unless `confirm_actions: false`
is configured.

The driving mappings are also optional. When available, the Energy view
renders the latest 14 driving days directly from the date-keyed attributes of
`daily_driving_stats`, together with today's distance, efficiency, regenerated
energy, and total regeneration. The Location view adds up to 30 official Kia
driving days with distance, energy, consumption, regeneration, and climate use.

When `engine` or `ignition` is mapped together with `odometer`, the Location
view also reads recent states from Home Assistant Recorder and reconstructs
individual completed trips. Existing `location`, `battery_level`, and
`battery_remaining_energy` mappings enrich those trips with origin,
destination, state-of-charge change, energy use, consumption, and average
speed. Recorder-derived values are estimates because Kia updates may arrive
several minutes apart. The card does not force-refresh the vehicle.

Recorder history defaults to 7 days and 12 trips. Both are configurable; the
history window is deliberately capped at 14 days to keep browser queries
bounded:

```yaml
type: custom:kia-dashboard-card
trip_history_days: 7
trip_history_limit: 12
daily_history_limit: 30
```

No helper entities are required. The available history still depends on Home
Assistant Recorder retention and on the Kia integration observing an engine or
ignition transition.

### Persistent trip calendar

Map a dedicated Home Assistant Local Calendar to retain completed trips beyond
Recorder retention:

```yaml
type: custom:kia-dashboard-card
entities:
  trip_calendar: calendar.your_vehicle_trips
trip_calendar_start: "2020-01-01"
trip_calendar_limit: 250
```

With this mapping, Location uses the calendar as its primary trip source and
shows a monthly date picker with `Day` and `Overview` modes. `Day` fetches only
the visible month and places its route preview beside the calendar on wide
screens. Previously loaded calendar ranges are kept in a small in-memory cache,
so returning to a month or switching views does not repeat the same API request.
`Overview` requests events from `trip_calendar_start`; when
that option is omitted, the card uses January 1 ten years ago. The rendered trip
list defaults to 250 and is capped at 1000, while its period summary still uses
all returned events. Recorder reconstruction remains the fallback when
`trip_calendar` is omitted.

The card accepts versioned `kia_trip_v1` and `kia_trip_v2` JSON descriptions, so
unrelated calendar appointments are ignored. Version 2 adds a route map,
odometer values, regeneration, and per-system energy details while preserving
older trips. Install the
companion package from
`examples/home-assistant-packages/trip_calendar.yaml` to create those events.
The package setup and required source-entity replacements are documented in the
adjacent package README.

The package can optionally sample a designated driver phone once per minute
during an engine-confirmed trip. This produces a much closer breadcrumb route
than the relatively sparse Kia tracker without sending coordinates to a route
service. It does not perform road snapping.

## Optional Settings Entities

The Settings panel can show additional read-only integration and dashboard
feedback when these entity keys are configured:

```yaml
type: custom:kia-dashboard-card
entities:
  last_climate_result: sensor.your_vehicle_last_climate_result
  last_charging_result: sensor.your_vehicle_last_charging_result
  vehicle_data: sensor.your_vehicle_raw_data
  dashboard_version: sensor.your_dashboard_version
```

- `last_climate_result` and `last_charging_result` provide command feedback;
  they are intentionally separate from the physical climate and charging state.
- `vehicle_data` is the read-only raw-data or mapping entity opened by Vehicle
  Data Details.
- The card displays its built-in release version when `dashboard_version` is
  omitted. An optional mapped entity overrides it; for `update.*` entities the
  card reads `installed_version` before falling back to the entity state.

For Home Assistant sections dashboards, make the card span the full section:

```yaml
layout_options:
  grid_columns: full
  grid_rows: auto
```

## Optional Home Charger

The Energy tab accepts a brand-independent charger mapping. Read-only entities
work immediately; charger commands remain disabled until `charger_controls` is
explicitly set to `true`. When `charger_online` is mapped, Settings reports its
connection independently from Kia vehicle-data freshness.

```yaml
type: custom:kia-dashboard-card
charger_controls: false
entities:
  charger_online: binary_sensor.your_charger_connected
  charger_status: sensor.your_charger_status
  charger_mode: select.your_charger_mode
  charger_power: sensor.your_charger_power
  charger_current: sensor.your_charger_current
  charger_current_limit: number.your_charger_current_limit
  charger_session_energy: sensor.your_charger_session_energy
  charger_total_energy: sensor.your_charger_total_energy
  charger_energy_price: sensor.your_average_energy_price
  charger_grid_support: sensor.your_charger_grid_support
  charger_pv_power: sensor.your_home_pv_power
  charger_house_power: sensor.your_home_consumption_power
  charger_grid_power: sensor.your_home_grid_power
  charger_start: button.your_charger_start
  charger_pause: button.your_charger_pause
  charger_resume: button.your_charger_resume
  charger_stop: button.your_charger_stop
```

Mode values default to `standard`, `smart`, and `solar`. Integrations using
different option names can map them without changing the card:

```yaml
charger_modes:
  standard: normal
  smart: balanced
  solar: excess_only
```

Some integrations lose the selected strategy while a charger is paused and
resume in their default mode. Enable mode-aware resume to let the card remember
the selected strategy before Pause and restore it through `charger_mode` when
Resume is pressed:

```yaml
charger_resume_via_mode: true
```

The remembered value is kept for the current browser session. If no safe value
is available, Resume sends no command and asks the user to choose Standard,
Smart, or Solar explicitly. Leave this option disabled for integrations whose
dedicated resume entity already preserves the charging strategy.

### Smappee EV example

The `myny-git/smappee_ev` integration maps directly to the generic contract:

```yaml
charger_controls: true
charger_resume_via_mode: true
entities:
  charger_online: binary_sensor.smappee_ev_YOURGATEWAY_mqtt_connected
  charger_status: sensor.smappee_ev_YOURSTATION_status_current_1
  charger_mode: select.smappee_ev_YOURSTATION_charging_mode_1
  charger_power: sensor.smappee_ev_YOURSTATION_power_total_1
  charger_current: sensor.smappee_ev_YOURSTATION_current_total_1
  charger_current_limit: number.smappee_ev_YOURSTATION_current_1
  charger_session_energy: sensor.smappee_ev_YOURSTATION_session_energy_1
  charger_total_energy: sensor.smappee_ev_YOURSTATION_energy_import_kwh_1
  charger_grid_support: sensor.smappee_ev_YOURSTATION_support_grid_1
  charger_pv_power: sensor.smappee_ev_YOURGATEWAY_pv_power
  charger_house_power: sensor.smappee_ev_YOURGATEWAY_house_consumption_power
  charger_grid_power: sensor.smappee_ev_YOURGATEWAY_grid_power
  charger_start: button.smappee_ev_YOURSTATION_start_charging_1
  charger_pause: button.smappee_ev_YOURSTATION_pause_charging_1
  charger_resume: button.smappee_ev_YOURSTATION_resume_charging_1
  charger_stop: button.smappee_ev_YOURSTATION_stop_charging_1
```

Smappee EV 2026.7.x can expose `standard` after Pause and its Resume button can
fall back to Standard when the previous mode is no longer present in integration
state. `charger_resume_via_mode: true` avoids that fallback by restoring the mode
the card observed before Pause.

The latest-session card also reads compatible timestamp and tariff attributes
from `charger_session_energy`. Optional `charger_energy_today`,
`charger_energy_week`, `charger_energy_month`, `charger_energy_price`,
`charger_session_cost`, and `charger_cost_month` mappings can point to Home
Assistant utility meters, tariff sensors, or template sensors for persistent
historical totals.

`charger_energy_price` accepts a sensor or input number in `EUR/kWh`, `€/kWh`,
`ct/kWh`, or `c€/kWh`. A mapped price is shown in history and takes precedence
over a tariff attribute when estimating the latest session. An explicit
`charger_session_cost` still takes precedence. When monthly energy is available
without `charger_cost_month`, the card calculates the monthly cost from the
mapped price.

A ready-to-copy Home Assistant package is available at
`examples/home-assistant-packages/charger_history.yaml`. After replacing its
source entity and restarting Home Assistant, map the generated helpers:

```yaml
entities:
  charger_energy_today: sensor.kia_charger_energy_today
  charger_energy_week: sensor.kia_charger_energy_week
  charger_energy_month: sensor.kia_charger_energy_month
  charger_energy_price: input_number.kia_charger_energy_price
  charger_cost_month: sensor.kia_charger_cost_this_month
```

The Energy tab renders whichever history helpers are available. Missing optional
periods no longer create empty cards.

## Theme Behavior

The card follows Home Assistant theme variables for background, card surface,
text, dividers, primary color, and status colors. That means it adapts to Home
Assistant's automatic, light, and dark theme modes without requiring a separate
card option.

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
entity is missing, unsupported, or rejected by the integration. A `PIN
verification failed` message means Home Assistant received the command but the
Kia/Bluelink integration rejected the remote action.

Remote actions ask for browser confirmation by default. You can disable that for
testing only:

```yaml
type: custom:kia-dashboard-card
confirm_actions: false
```

## Charge Limit Sliders

When `charging_limit` or `dc_charging_limit` points to a `number.*` entity, the
Battery panel renders AC and DC charging limit sliders. Changing a slider calls
`number.set_value` with the selected percentage. If either key points to another
domain, that value is shown as read-only text. If `dc_charging_limit` is omitted,
the DC slider is hidden.

## Location Map

The Location panel uses the configured `location` device tracker. If that tracker
has `latitude` and `longitude` attributes, the card shows an OpenStreetMap tile
preview centered on those coordinates. If those attributes are missing, the card
falls back to a neutral map placeholder while still showing tracker state.

The default map zoom is `16`. You can tune it per dashboard if the preview feels
too close or too far away:

```yaml
type: custom:kia-dashboard-card
map_zoom: 16
```

If your tracker state is correct but the map marker is not using the expected
coordinate source, you can override the map coordinates directly:

```yaml
type: custom:kia-dashboard-card
location:
  latitude: 50.000000
  longitude: 3.000000
```

You can also map separate latitude and longitude entities when your integration
exposes them:

```yaml
type: custom:kia-dashboard-card
entities:
  location: device_tracker.your_vehicle_location
  latitude: sensor.your_vehicle_latitude
  longitude: sensor.your_vehicle_longitude
```

The location marker uses `ev6_top.png` by default. You can override it through
the normal image configuration:

```yaml
type: custom:kia-dashboard-card
images:
  map_marker: ev6_top.png
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
