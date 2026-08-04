# Climate View

The Climate view is the third detail surface behind the Overview navigation. It
expands the Overview quick actions into focused blocks for cabin temperature,
HVAC state, optional seat and rear-window comfort, remote climate actions,
schedule or departure context, and a return path to Overview.

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
- `dashboard/cards/climate-comfort.yaml` owns HVAC, defrost, steering-wheel,
  rear-window, and seat-comfort state.
- `dashboard/cards/climate-session.yaml` owns schedule and departure context.
- `dashboard/cards/climate-back-navigation.yaml` owns return navigation to
  Overview.

## Mapped Template Usage

Climate detail cards use `custom:decluttering-card` wrappers for mapped state
rows, action buttons, section notes, and back navigation. The HACS card treats
`switch.*`, `input_boolean.*`, and `button.*` comfort mappings as confirmed
actions. Select and read-only mappings open the standard Home Assistant entity
dialog so integration-specific options remain intact.

## Entity Rules

Climate cards must not hardcode Home Assistant entity IDs. New climate state
should first be added to `dashboard/templates/entities.yaml`, then consumed by
logical mapping names from these cards. Every comfort and schedule key is
optional because entity coverage differs by region, vehicle, and integration
version.

## Follow-up Work

- Inventory the exact seat and rear-window entities available on the target EV6.
- Add target-temperature or schedule editing only after a stable generic service
  contract is documented.
