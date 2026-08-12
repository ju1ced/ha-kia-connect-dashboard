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
- `dashboard/cards/vehicle-locks.yaml` owns the legacy reference lock state.
- `dashboard/cards/vehicle-openings.yaml` owns doors, windows, trunk, and hood state.
- `dashboard/cards/vehicle-lights.yaml` owns exterior light state and future light controls.
- `dashboard/cards/vehicle-warnings.yaml` owns aggregated vehicle warnings.
- `dashboard/cards/vehicle-back-navigation.yaml` owns return navigation to Overview.

## Entity Rules

Vehicle cards must not hardcode Home Assistant entity IDs. New vehicle state
should first be added to `dashboard/templates/entities.yaml`, then consumed by
logical mapping names from these cards.

## Mapped Template Usage

Vehicle uses the shared mapped template patterns:

- `kia_mapped_state_row` renders lock, opening, and light values.
- `kia_mapped_section_note` renders warning and placeholder notes.
- `kia_back_to_overview` renders the standard return navigation.

The HACS card can enable reviewed lock and unlock controls with
`vehicle_controls: true`. They only activate for a mapped `lock.*` entity, ask
for explicit confirmation, and wait for the entity to report the requested
state. The default timeout is 90 seconds and can be changed with
`vehicle_action_timeout` in milliseconds.

The target Kia inventory exposes trunk, hood, and headlamp state without paired
commands. Hazard-light buttons do not expose a reliable end state, and the
charge-port switch semantics have not been validated. Those controls therefore
remain read-only.
