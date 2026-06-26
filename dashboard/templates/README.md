# Templates

This folder contains reusable dashboard contracts and shared template inputs.

## Files

- `entities.yaml` maps logical dashboard keys to Home Assistant entity IDs.
- `colors.yaml` will define semantic color tokens.
- `icons.yaml` will define semantic icon choices.
- `decluttering_templates.yaml` will define reusable Lovelace card patterns.

## Ownership Rules

- Keep vehicle-specific entity IDs in `entities.yaml` only.
- Keep reusable visual decisions in colors, icons, or decluttering templates.
- Do not place page layout here. Use `dashboard/views/` for page composition.
- Do not place one-off cards here. Use `dashboard/cards/` for card fragments.
