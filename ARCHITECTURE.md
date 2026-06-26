# Architecture

## Overview

The dashboard is organized as a Home Assistant Lovelace YAML project.
`dashboard/dashboard.yaml` acts as the composition root and includes view files
from `dashboard/views/`. Cards, popups, templates, and themes are isolated into
purpose-specific folders.

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
  cards/
    overview-hero.yaml
    section-navigation.yaml
    battery-summary.yaml
    battery-hero.yaml
    battery-charge-controls.yaml
    battery-range.yaml
    battery-health.yaml
    battery-charging-session.yaml
    battery-back-navigation.yaml
    quick-actions.yaml
    vehicle-status.yaml
    location-summary.yaml
    tire-status.yaml
    overview-footer.yaml
  popups/
  templates/
    colors.yaml
    entities.yaml
    icons.yaml
  themes/
    nebula.yaml
assets/
  images/
  icons/
docs/
  screenshots/
.github/
```

## Entity Mapping Contract

All Home Assistant entities are declared in `dashboard/templates/entities.yaml`.
Other YAML files must reference logical variables from the mapping layer rather
than hardcoded entity IDs. CI will reject direct entity references outside that
mapping file.

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

See `docs/entity-mapping.md` for customization rules.

## Include Strategy

`dashboard/dashboard.yaml` owns top-level dashboard composition. Views include
cards and popups, while cards and popups consume shared template inputs.
Templates do not include views or popups.

Folder ownership is documented in `docs/include-conventions.md`.

## Overview Strategy

The first Overview shell uses native Lovelace cards only. It establishes the
screen layout and card ownership for vehicle identity, section navigation,
battery state, quick actions, vehicle status, location context, tire state, and
footer notes.

Overview owns the internal menu structure for the Kia dashboard package. Detail
sections should remain reachable from Overview even when the package is opened
from a button inside a larger Home Assistant home dashboard.

See `docs/overview-shell.md` for the shell contract.

## Battery Strategy

Battery is the first detail view. It expands the Overview battery summary into a
focused surface for state of charge, range, charge controls, charge limit, plug
state, and charging session context.

See `docs/battery-view.md` for the Battery view contract.

## Extension Strategy

New dashboard behavior should land through explicit extension points:

- mapped entities in `dashboard/templates/entities.yaml`
- reusable card fragments in `dashboard/cards/`
- detail surfaces in `dashboard/popups/`
- top-level views in `dashboard/views/`
- semantic theme tokens in `dashboard/themes/`
- maintainer and user documentation in `docs/`

See `docs/extension-points.md` for review rules.

## Template Strategy

- `decluttering_templates.yaml` defines reusable Lovelace card patterns.
- `colors.yaml` centralizes semantic color tokens.
- `icons.yaml` centralizes icon choices.
- `entities.yaml` is the only vehicle-specific configuration surface.

## Theme Strategy

Nebula is the first dashboard theme. It defines Home Assistant theme variables
and semantic Kia dashboard tokens for surfaces, text, brand colors, status
colors, battery states, spacing, radius, and elevation.

Dashboard cards should use semantic tokens such as `var(--kia-status-warning)`
rather than raw color literals. Contrast expectations are documented in
`docs/contrast-validation.md`.

## UI Strategy

The visual language combines Kia Connect, Apple HIG, Material Design 3, and
Tesla-style vehicle dashboards: generous spacing, rounded corners, soft shadows,
muted surfaces, and clear status hierarchy.

## QA Strategy

The QA Agent runs automated checks for repository structure, YAML syntax,
Markdown style, formatting, missing assets, duplicate entities, direct entity
references, and required documentation before pull requests are accepted.
