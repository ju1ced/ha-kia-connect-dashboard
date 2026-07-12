# Architecture

## Overview

The dashboard is organized as a Home Assistant Lovelace project.
`dashboard/dashboard.yaml` acts as the composition root and includes view files
from `dashboard/views/`. The Overview view is rendered by a dedicated custom
Lovelace card so the main responsive dashboard can be controlled as one visual
surface. Detail views remain YAML-based while the custom-card pattern matures.

The project is intended to integrate into an existing Home Assistant dashboard.
A user's Home dashboard can link to this package through a Kia EV6 button, which
lands on the Overview page. From there, the Overview page acts as the navigation
hub for all Kia-specific sections.

## Directory Layout

```text
dashboard/
  dashboard.yaml
  views/
    overview.yaml
    battery.yaml
    vehicle.yaml
    cabin-comfort.yaml
    power-flow.yaml
    position-context.yaml
    dashboard-admin.yaml
  cards/
    battery-summary.yaml
    battery-hero.yaml
    battery-charge-controls.yaml
    battery-range.yaml
    battery-health.yaml
    battery-charging-session.yaml
    battery-back-navigation.yaml
    vehicle-status.yaml
    vehicle-hero.yaml
    vehicle-locks.yaml
    vehicle-openings.yaml
    vehicle-lights.yaml
    vehicle-warnings.yaml
    vehicle-back-navigation.yaml
    climate-hero.yaml
    climate-temperature.yaml
    climate-controls.yaml
    climate-comfort.yaml
    climate-session.yaml
    climate-back-navigation.yaml
    energy-hero.yaml
    energy-efficiency.yaml
    energy-range-context.yaml
    energy-charging-context.yaml
    energy-history.yaml
    energy-back-navigation.yaml
    location-summary.yaml
    location-hero.yaml
    location-map-context.yaml
    location-odometer.yaml
    location-parking.yaml
    location-trip-context.yaml
    settings-hero.yaml
    settings-entity-mapping.yaml
    settings-theme.yaml
    settings-actions.yaml
    settings-maintenance.yaml
    settings-back-navigation.yaml
  popups/
  templates/
    colors.yaml
    decluttering_templates.yaml
    entities.yaml
    icons.yaml
  themes/
    kia-horizon.yaml
dist/
  ha-kia-connect-dashboard.js
assets/
  images/
  icons/
docs/
  screenshots/
.github/
```

## Configuration Model

The project supports two configuration paths:

- HACS card usage: install the frontend module and configure Home Assistant
  entities directly on `custom:kia-dashboard-card` in the dashboard editor or
  Lovelace YAML.
- Repository-side YAML rendering: use `scripts/render_dashboard.py` to render
  the YAML package from logical mapping keys and the example file at
  `dashboard/templates/entities.yaml`.

`dashboard/templates/entities.yaml` must stay generic in the public repository.
It is an example contract and render helper, not a shared place for a user's
private Home Assistant entity IDs.

## Entity Mapping Contract

The YAML render flow uses `dashboard/templates/entities.yaml` as its only file
for Home Assistant entity IDs. Other repository YAML files must reference logical
variables from the mapping layer rather than hardcoded entity IDs. CI rejects
direct entity references outside that mapping file.

The HACS card does not require this file. Users configure matching entity IDs in
the card configuration instead.

The initial mapping groups are:

- `vehicle` for display metadata.
- `battery` for charge, range, power, and plug state.
- `climate` for cabin temperature and climate controls.
- `location` for tracker and odometer state.
- `locks` for lock entities.
- `openings` for doors, windows, trunk, and hood state.
- `lights` for light state and light controls.
- `tires` for tire pressure sensors.
- `controls` for refresh, charging, and climate actions.
- `settings` for dashboard administration actions.

See `docs/entity-mapping.md` and `docs/hacs-card-configuration.md` for the two
configuration paths.

## Entity Diagnostics Strategy

Settings owns the first read-only diagnostics surface for mapping problems in
the YAML package. Missing, unknown, or unavailable entities should point users
back to the configuration path they are using: the card configuration for HACS,
or `dashboard/templates/entities.yaml` for repository-side YAML rendering.

Runtime health checks should start in Settings before inline alerts are added to
every detail page.

## Include Strategy

`dashboard/dashboard.yaml` owns top-level dashboard composition. Views include
cards and popups, while cards and popups consume shared template inputs.
Templates do not include views or popups.

Folder ownership is documented in `docs/include-conventions.md`.

## Overview Strategy

The Overview page is the primary product surface and uses
`custom:kia-dashboard-card` from the repository-root
`ha-kia-connect-dashboard.js` HACS artifact. This keeps the render-target layout,
responsive behavior, status-aware vehicle image, and content scaling inside one
controlled component instead of spreading the visual rules across nested
Lovelace YAML cards.

The custom card keeps its hero and navigation in the shared shell. Content below
the navigation is selected by `_renderActiveTab`, which delegates to one renderer
per tab: `_renderOverviewTab`, `_renderBatteryTab`, `_renderVehicleTab`,
`_renderClimateTab`, `_renderEnergyTab`, `_renderLocationTab`, and
`_renderSettingsTab`. Each detail tab also owns a matching `*TabStyles` hook.
Detail work should stay inside that tab's renderer and style hook so page PRs can
be developed and reviewed independently without changing the shared dispatcher.

Overview owns the internal menu structure for the Kia dashboard package. Detail
sections should remain reachable from Overview even when the package is opened
from a button inside a larger Home Assistant home dashboard.

For HACS usage, the Overview card receives Home Assistant entity IDs directly in
the card configuration. For repository-side YAML rendering,
`dashboard/views/overview.yaml` still uses logical mapping keys such as
`battery.level` and `location.odometer`, which are rendered into entity IDs by
`scripts/render_dashboard.py`.

See `docs/overview-shell.md` for the shell contract.

## Battery Strategy

Battery is the first detail view. It expands the Overview battery summary into a
focused surface for state of charge, range, charge controls, charge limit, plug
state, and charging session context.

See `docs/battery-view.md` for the Battery view contract.

## Vehicle Strategy

Vehicle is the second detail view. It expands the Overview vehicle summary into
a focused surface for lock state, door and window openings, exterior lights,
vehicle warnings, and return navigation to Overview.

See `docs/vehicle-view.md` for the Vehicle view contract.

## Climate Strategy

Climate is the third detail view. It expands Overview quick actions into a
focused surface for cabin temperature, exterior temperature, HVAC state, comfort
features, remote climate actions, session context, and return navigation to
Overview.

See `docs/climate-view.md` for the Climate view contract.

## Energy Strategy

Energy is the fourth detail view. It expands range and charging context into a
focused surface for efficiency, range interpretation, charging context,
historical metrics, and return navigation to Overview.

See `docs/energy-view.md` for the Energy view contract.

## Location Strategy

Location is the fifth detail view. It expands the Overview location summary into
a focused surface for tracker context, odometer, parking state, trip context,
and return navigation to Overview.

See `docs/location-view.md` for the Location view contract.

## Settings Strategy

Settings is the sixth detail view. It completes the initial Overview navigation
with a focused surface for entity mapping guidance, theme context, refresh
actions, maintenance notes, diagnostics, and return navigation to Overview.

See `docs/settings-view.md` for the Settings view contract.

## Mapped Template Strategy

Mapped templates are the bridge between page card fragments and the entity
mapping contract for the repository-side YAML render flow. The first shared
patterns live in `dashboard/templates/decluttering_templates.yaml` and cover
state rows, action buttons, section notes, entity diagnostics, and standard
return navigation.

Cards should consume these patterns before adding one-off entity rows or action
buttons.

See `docs/mapped-template-patterns.md` for the mapped template contract.

## Extension Strategy

New dashboard behavior should land through explicit extension points:

- card configuration fields for `custom:kia-dashboard-card`
- mapped entities in `dashboard/templates/entities.yaml` for the render flow
- reusable card fragments in `dashboard/cards/`
- detail surfaces in `dashboard/popups/`
- top-level views in `dashboard/views/`
- frontend card code in `dist/`
- semantic theme tokens in `dashboard/themes/`
- maintainer and user documentation in `docs/`

See `docs/extension-points.md` for review rules.

## Template Strategy

- `decluttering_templates.yaml` defines reusable Lovelace card patterns.
- `colors.yaml` centralizes semantic color tokens.
- `icons.yaml` centralizes icon choices.
- `entities.yaml` is the generic example mapping file for repository-side YAML
  rendering only.
