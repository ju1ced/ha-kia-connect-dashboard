# Theme Tokens

## Purpose

Kia Horizon is the first dashboard theme for HA Kia Connect Dashboard. It defines
a quiet, high-contrast interface inspired by Kia Connect surfaces and modern
vehicle dashboard UI patterns.

The theme separates raw color values from dashboard intent. Cards and views
should use semantic tokens, not one-off color literals.

## Light And Dark Modes

Kia Horizon defines Home Assistant `light` and `dark` mode values under the same
theme name. When Home Assistant is set to automatic theme mode, the dashboard
can follow the active light or dark appearance without switching themes.

The top-level values remain dark defaults for older Home Assistant installs and
for first paint before mode-specific variables are applied. Visual card templates
also include CSS fallback values so cards remain readable if the theme is not yet
loaded.

## Token Groups

- `kia-surface-*` tokens define backgrounds, raised cards, overlays, and borders.
- `kia-text-*` tokens define readable text levels.
- `kia-brand-*` tokens define primary interaction and accent colors.
- `kia-status-*` tokens define vehicle and system state colors.
- `kia-battery-*` tokens define battery-specific thresholds.
- `kia-card-*` tokens define reusable visual card surfaces, borders, and shadows.
- `kia-hero-*` tokens define the Overview hero surface and vehicle accent.
- `kia-radius-*` tokens define border radius scale.
- `kia-spacing-*` tokens define spacing scale.
- `kia-shadow-*` tokens define elevation.

## Usage Rules

- Use semantic tokens such as `var(--kia-status-warning)` in dashboard cards.
- Add a CSS fallback when a custom card uses a token directly.
- Avoid raw hex colors in views, cards, or popups unless they are fallbacks.
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
- New visual cards are readable in both Home Assistant light and dark modes.
