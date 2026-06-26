# Climate View

The Climate view is the third detail surface behind the Overview navigation. It
expands the Overview quick actions into focused blocks for cabin temperature,
HVAC state, comfort toggles, remote climate actions, session context, and a
return path to Overview.

## Route

- View file: `dashboard/views/cabin-comfort.yaml`
- Navigation path: `/lovelace/kia-climate`
- Entry point: Overview section navigation

## Card Ownership

- `dashboard/cards/climate-hero.yaml` owns page context and climate mapping
  groups.
- `dashboard/cards/climate-temperature.yaml` owns cabin and outside temperature
  readouts.
- `dashboard/cards/climate-controls.yaml` owns start and stop action placement.
- `dashboard/cards/climate-comfort.yaml` owns HVAC, defrost, and steering wheel
  heater state.
- `dashboard/cards/climate-session.yaml` owns remote climate session context.
- `dashboard/cards/climate-back-navigation.yaml` owns return navigation to
  Overview.

## Entity Rules

Climate cards must not hardcode Home Assistant entity IDs. New climate state
should first be added to `dashboard/templates/entities.yaml`, then consumed by
logical mapping names from these cards.

## Follow-up Work

- Bind temperature, HVAC, defrost, and heating rows to the reusable mapped-entity
  template pattern.
- Decide which climate actions need confirmation before activation.
- Add target-temperature and session-timer controls once the service contract is
  documented.
