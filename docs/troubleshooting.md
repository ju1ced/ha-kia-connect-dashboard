# Troubleshooting and FAQ

## The card still shows the previous version

Update the repository in HACS, clear the browser frontend cache, and reload the
dashboard. Settings shows the JavaScript version that the browser actually
loaded.

## Charging history is empty

Map `charger_total_energy` to an energy sensor with `state_class: total` or
`total_increasing`. Home Assistant only provides permanent statistics from the
date it began recording that statistic; the card cannot reconstruct older
values. Use the refresh button after the first statistic appears.

## Small daily energy values are not listed as charging days

The total and chart include every statistic. The charging-day table excludes
values below `charger_history_min_kwh`, which defaults to `0.2 kWh`, so charger
standby consumption does not look like a session.

## Lock buttons are disabled

Map `door_lock` to a `lock.*` entity and set `vehicle_controls: true`. A binary
lock-status sensor is not actionable. The currently matching action is disabled
when the vehicle already reports that state.

## A lock command times out

The service call may have reached Kia while the refreshed lock state arrived too
late. Check the Kia integration log and refresh the vehicle before retrying. You
can raise `vehicle_action_timeout`, but do not assume a timeout means the vehicle
remained in its previous physical state.

## Kia data is delayed or stale

Check the `last_updated` entity, Home Assistant Repairs, and the Kia integration.
The dashboard cannot read the integration's authentication state directly.

## A mapped value says unavailable

Open the entity in Home Assistant Developer Tools and verify its state and unit.
Settings lists missing or unavailable mappings. Do not replace a temporary
integration outage with a hardcoded dashboard value.

## Which installation path is supported?

Use the HACS `custom:kia-dashboard-card`. The modular YAML files remain reference
material and repository validation fixtures; they are not the primary production
installation path.
