# Theme Tokens

## Purpose

Kia Horizon is the first dashboard theme for HA Kia Connect Dashboard. It defines
a quiet, high-contrast dark interface inspired by Kia Connect surfaces and
modern vehicle dashboard UI patterns.

The theme separates raw color values from dashboard intent. Cards and views
should use semantic tokens, not one-off color literals.

## Token Groups

- `kia-surface-*` tokens define backgrounds, raised cards, overlays, and borders.
- `kia-text-*` tokens define readable text levels.
- `kia-brand-*` tokens define primary interaction and accent colors.
- `kia-status-*` tokens define vehicle and system state colors.
- `kia-battery-*` tokens define battery-specific thresholds.
- `kia-radius-*` tokens define border radius scale.
- `kia-spacing-*` tokens define spacing scale.
- `kia-shadow-*` tokens define elevation.

## Usage Rules

- Use semantic tokens such as `var(--kia-status-warning)` in dashboard cards.
- Avoid raw hex colors in views, cards, or popups.
- Use status colors only for state, warnings, or action feedback.
- Use brand colors sparingly for primary controls and active states.
- Keep surface hierarchy clear: base, raised, elevated, then overlay.

## Files

- `dashboard/themes/kia-horizon.yaml` defines Home Assistant theme variables.
- `dashboard/templates/colors.yaml` maps semantic color groups for templates.
- `dashboard/templates/icons.yaml` maps semantic icon names for dashboard domains.

## Review Checklist

- New colors are semantic and not tied only to a raw hue name.
- New colors have enough contrast for their intended text or icon use.
- New icons describe dashboard intent, not integration implementation details.
- New tokens are documented when they introduce a new visual role.
