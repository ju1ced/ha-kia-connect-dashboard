# Energy View

The Energy view is the fourth detail surface behind the Overview navigation. It
expands range and charging context into focused blocks for efficiency, range,
charging context, history, and a return path to Overview.

## Route

- View file: `dashboard/views/power-flow.yaml`
- Navigation path: `/lovelace/kia-energy`
- Entry point: Overview section navigation

## Card Ownership

- `dashboard/cards/energy-hero.yaml` owns page context and energy mapping scope.
- `dashboard/cards/energy-efficiency.yaml` owns future consumption and
  efficiency trends.
- `dashboard/cards/energy-range-context.yaml` owns range, charge level, and
  charge target context.
- `dashboard/cards/energy-charging-context.yaml` owns charging state, charging
  power, and plug context.
- `dashboard/cards/energy-history.yaml` owns future historical charts and
  statistics.
- `dashboard/cards/energy-back-navigation.yaml` owns return navigation to
  Overview.

## Mapped Template Usage

Energy detail cards use `custom:decluttering-card` wrappers for range rows,
charging rows, placeholder section notes, and back navigation. Chart-ready blocks
remain section notes until statistics entities or helper sensors are mapped.

## Entity Rules

Energy cards must not hardcode Home Assistant entity IDs. New efficiency or
history metrics should first be added to `dashboard/templates/entities.yaml`,
then consumed by logical mapping names from these cards.

## Home Charger Contract

The custom card Energy renderer accepts optional `charger_*` mappings without
depending on a charger vendor. It separates the surface into:

- live EVSE status, power, current, session energy, and total imported energy;
- mode, current-limit, and session controls;
- solar, household, grid, and grid-support context;
- latest-session cost context and optional historical totals.

Commands are opt-in through `charger_controls: true` and continue to use Home
Assistant entities. Button entities are pressed, select entities receive
`select_option`, and number entities receive `set_value`. Browser confirmation
remains enabled unless the existing `confirm_actions` option is disabled.
For integrations that lose their strategy while paused,
`charger_resume_via_mode: true` remembers the current strategy and restores it
through the mode select instead of invoking a resume action that may fall back to
Standard.

The history summary accepts optional Home Assistant utility-meter or template
sensors through `charger_energy_today`, `charger_energy_week`,
`charger_energy_month`, `charger_energy_price`, `charger_session_cost`, and
`charger_cost_month`. A mapped energy price can estimate session and monthly
costs when explicit cost sensors are absent, and accepts euro or cent per-kWh
units. When none are mapped, the Energy tab shows a clear helper-ready placeholder
instead of inventing history from the current total.
The repository includes a Home Assistant package example at
`examples/home-assistant-packages/charger_history.yaml`; it creates daily,
weekly, and monthly utility meters plus a tariff-based monthly cost sensor.
Individual available helpers render independently.

See `docs/hacs-card-configuration.md` for the generic mapping and a Smappee EV
example.

## Follow-up Work

- Add explicit energy and efficiency mapping keys when the reference entities are
  known.
- Decide which chart card should render historical consumption once statistics
  entities exist.
