# Visual Reference

The current visual references live in `docs/screenshots/` and are committed as
SVG files so GitHub can preview them directly.

## Available References

- `docs/screenshots/overview-reference.svg` shows the intended Overview hub.
- `docs/screenshots/settings-diagnostics-reference.svg` shows the first Settings
  diagnostics surface.
- `docs/screenshots/navigation-flow-reference.svg` shows how an existing Home
  Assistant dashboard links into the Kia Overview and detail pages.

## Implementation Status

The Overview and all detail pages now have the first dark visual card layer using
`button-card`, `card-mod`, and the Kia Horizon theme tokens. Real Home Assistant
screenshots are still needed to validate the rendered package with live data,
actual browser sizing, and the target dashboard route.

## Review Rules

- Treat the SVG renders as layout intent, not generated Home Assistant
  screenshots.
- Update the relevant render when a PR changes first-screen navigation,
  diagnostics structure, or the implemented visual direction.
- Add real screenshots next to these renders once a Home Assistant test install
  is available.
