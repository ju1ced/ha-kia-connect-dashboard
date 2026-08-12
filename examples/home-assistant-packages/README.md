# Home Assistant package examples

These examples create backend helpers used by the dashboard. They are not
loaded by the Lovelace card itself.

## Charger history

1. Enable Home Assistant packages in `configuration.yaml`:

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

2. Copy `charger_history.yaml` to
   `/config/packages/charger_history.yaml`. Home Assistant derives the package
   slug from this filename when using `!include_dir_named`; keep the underscore
   because hyphens are not valid in package slugs.
3. Replace `sensor.your_charger_total_energy` with the charger's lifetime,
   monotonically increasing energy sensor.
4. Restart Home Assistant.
5. Set `input_number.kia_charger_energy_price` to the current energy price.
6. Map the generated entities in the card:

   ```yaml
   entities:
     charger_energy_today: sensor.kia_charger_energy_today
     charger_energy_week: sensor.kia_charger_energy_week
     charger_energy_month: sensor.kia_charger_energy_month
     charger_energy_price: input_number.kia_charger_energy_price
     charger_cost_month: sensor.kia_charger_cost_this_month
   ```

If you already have an automatically updated average or total energy-price
sensor, map that entity as `charger_energy_price` instead. You can omit
`charger_cost_month` to let the card calculate monthly cost from that price and
the monthly energy helper.

A utility meter starts counting when Home Assistant first loads it. Its first
daily, weekly, or monthly cycle is therefore partial; the next complete cycle is
the first directly comparable period.

For Smappee EV, the lifetime source normally follows this pattern:

```yaml
source: sensor.smappee_ev_YOURSTATION_energy_import_kwh_1
```

## Persistent trip calendar

The `trip_calendar.yaml` package stores every completed drive as an event in a
dedicated Home Assistant Local Calendar. This keeps trip history independent of
Recorder retention.

1. Go to **Settings > Devices & services > Add integration** and add **Local
   Calendar**. Name it, for example, `Nebula trips`.
2. Note its entity ID, for example `calendar.nebula_trips`.
3. Copy `trip_calendar.yaml` to `/config/packages/trip_calendar.yaml`.
4. Replace every occurrence of these placeholders:

   ```text
   binary_sensor.your_vehicle_engine
   sensor.your_vehicle_odometer
   sensor.your_vehicle_battery_level
   sensor.your_vehicle_remaining_energy
   sensor.your_vehicle_today_driving_stats
   device_tracker.your_vehicle_location
   device_tracker.your_driver_phone
   button.your_vehicle_force_refresh
   calendar.your_vehicle_trips
   ```

5. Run **Developer tools > YAML > Check configuration**, then restart Home
   Assistant.
6. Map the calendar in the card:

   ```yaml
   entities:
     trip_calendar: calendar.nebula_trips
   ```

The start automation snapshots odometer, state of charge, remaining energy,
daily energy counters, and location. Tracker updates are retained as a compact
breadcrumb route. Six helper segments retain roughly 70-80 one-minute points
instead of truncating the route after the first few coordinates. The stop
automation waits for Kia's final coordinator update,
ignores movements below 0.2 km, checks for an existing trip identifier, and
creates a versioned `kia_trip_v2` calendar event. If Home Assistant restarts
during a trip, the persisted active-trip helper allows the stop automation to
recover it.

`input_boolean.kia_trip_detailed_sampling` starts disabled. Enable it only after
confirming that `button.your_vehicle_force_refresh` works reliably for your Kia
integration. While a trip is active, it requests one refresh every five minutes.
This can expose stops that fall between the integration's normal updates, but it
adds Kia API traffic and cannot guarantee detection of stops shorter than five
minutes.

`input_boolean.kia_trip_use_driver_tracker` also starts disabled. Replace
`device_tracker.your_driver_phone` with the driver's phone tracker (a `person.*`
entity with latitude and longitude is valid too), then enable the helper to use
that tracker for route coordinates while the Kia engine reports an active trip.
The phone is sampled once per minute; it is never used to decide whether a trip
started or stopped. This opt-in avoids silently assigning another person's
movement to the vehicle. The result is a close breadcrumb approximation, not a
road-snapped navigation route; road snapping would require an external routing
or map-matching service.

The package expects the remaining-energy sensor in `kJ`, `Wh`, or `kWh` and
normalizes it to `kWh`. The card treats the resulting values as estimates because
Kia updates can arrive several minutes apart. Test the first few trips before
relying on long-term totals.
