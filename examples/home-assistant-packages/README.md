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
     charger_cost_month: sensor.kia_charger_cost_this_month
   ```

A utility meter starts counting when Home Assistant first loads it. Its first
daily, weekly, or monthly cycle is therefore partial; the next complete cycle is
the first directly comparable period.

For Smappee EV, the lifetime source normally follows this pattern:

```yaml
source: sensor.smappee_ev_YOURSTATION_energy_import_kwh_1
```
