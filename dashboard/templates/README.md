# Templates

This folder contains reusable dashboard contracts and shared template inputs.

## Files

- `entities.yaml` maps logical dashboard keys to Home Assistant entity IDs.
- `colors.yaml` defines semantic color tokens for dashboard templates.
- `icons.yaml` defines semantic icon choices for dashboard domains.
- `decluttering_templates.yaml` defines reusable Lovelace card patterns for
  mapped state rows, mapped action buttons, notes, and standard navigation.

## Ownership Rules

- Keep vehicle-specific entity IDs in `entities.yaml` only.
- Keep reusable visual decisions in colors, icons, or decluttering templates.
- Do not place page layout here. Use `dashboard/views/` for page composition.
- Do not place one-off cards here. Use `dashboard/cards/` for card fragments.
- Keep mapped template patterns generic enough to work across Battery, Vehicle,
  Climate, Energy, Location, and Settings surfaces.
