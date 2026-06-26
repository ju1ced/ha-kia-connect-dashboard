# Architecture

## Overview

The dashboard is organized as a Home Assistant Lovelace YAML project. `dashboard/dashboard.yaml` will act as the composition root and include view files from `dashboard/views/`. Cards, popups, templates, and themes are isolated into purpose-specific folders.

## Directory Layout

```text
dashboard/
  dashboard.yaml
  views/
  cards/
  popups/
  templates/
  themes/
assets/
  images/
  icons/
docs/
  screenshots/
.github/
```

## Entity Mapping Contract

All Home Assistant entities are declared in `dashboard/templates/entities.yaml`. Other YAML files must reference logical variables from the mapping layer rather than hardcoded entity IDs. CI will reject direct entity references outside that mapping file.

## Template Strategy

- `decluttering_templates.yaml` defines reusable Lovelace card patterns.
- `colors.yaml` centralizes semantic color tokens.
- `icons.yaml` centralizes icon choices.
- `entities.yaml` is the only vehicle-specific configuration surface.

## UI Strategy

The visual language combines Kia Connect, Apple HIG, Material Design 3, and Tesla-style vehicle dashboards: generous spacing, rounded corners, soft shadows, muted surfaces, and clear status hierarchy.

## QA Strategy

The QA Agent runs automated checks for repository structure, YAML syntax, Markdown style, formatting, missing assets, duplicate entities, direct entity references, and required documentation before pull requests are accepted.
