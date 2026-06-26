# Vehicle View

The Vehicle view is the second detail surface behind the Overview navigation.
It expands the Overview vehicle status card into focused blocks for locks,
openings, lights, warnings, and a return path to Overview.

## Route

- View file: `dashboard/views/vehicle.yaml`
- Navigation path: `/lovelace/kia-vehicle`
- Entry point: Overview section navigation

## Card Ownership

- `dashboard/cards/vehicle-hero.yaml` owns page context and mapping groups.
- `dashboard/cards/vehicle-locks.yaml` owns lock state and future lock controls.
- `dashboard/cards/vehicle-openings.yaml` owns doors, windows, trunk, and hood state.
- `dashboard/cards/vehicle-lights.yaml` owns exterior light state and future light controls.
- `dashboard/cards/vehicle-warnings.yaml` owns aggregated vehicle warnings.
- `dashboard/cards/vehicle-back-navigation.yaml` owns return navigation to Overview.

## Entity Rules

Vehicle cards must not hardcode Home Assistant entity IDs. New vehicle state
should first be added to `dashboard/templates/entities.yaml`, then consumed by
logical mapping names from these cards.

## Follow-up Work

- Bind lock, opening, and light rows to the reusable mapped-entity template
  pattern.
- Decide which lock and light controls are safe to expose as direct actions.
- Add status-specific styling once the shared card templates are introduced.
