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

## Entity Rules

Energy cards must not hardcode Home Assistant entity IDs. New efficiency or
history metrics should first be added to `dashboard/templates/entities.yaml`,
then consumed by logical mapping names from these cards.

## Follow-up Work

- Add explicit energy and efficiency mapping keys when the reference entities are
  known.
- Bind range and charging rows to the reusable mapped-entity template pattern.
- Decide which chart card should render historical consumption once statistics
  entities exist.
