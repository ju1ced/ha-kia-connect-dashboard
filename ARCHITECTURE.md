# Architecture

## Overview

The dashboard is organized as a Home Assistant Lovelace YAML project.
`dashboard/dashboard.yaml` will act as the composition root and include view
files from `dashboard/views/`. Cards, popups, templates, and themes are isolated
into purpose-specific folders.

## Directory Layout

```text
dashboard/
  dashboard.yaml
  views/
  cards/
  popups/
  templates/
    entities.yaml
  themes/
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

## UI Strategy

The visual language combines Kia Connect, Apple HIG, Material Design 3, and
Tesla-style vehicle dashboards: generous spacing, rounded corners, soft shadows,
muted surfaces, and clear status hierarchy.

## QA Strategy

The QA Agent runs automated checks for repository structure, YAML syntax,
Markdown style, formatting, missing assets, duplicate entities, direct entity
references, and required documentation before pull requests are accepted.
