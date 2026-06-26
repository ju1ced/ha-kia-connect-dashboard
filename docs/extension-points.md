# Extension Points

## Supported Extension Types

The dashboard is designed to grow through small, reviewable extension points:

- New mapped entities in `dashboard/templates/entities.yaml`.
- New reusable cards in `dashboard/cards/`.
- New detail popups in `dashboard/popups/`.
- New views in `dashboard/views/`.
- New semantic theme tokens in `dashboard/themes/`.
- New documentation in `docs/`.

## Entity Extensions

Add a new logical key when a dashboard feature needs a Home Assistant entity that
is not already represented. The key should describe the dashboard feature, not a
specific integration implementation.

## Card Extensions

A reusable card should have a narrow purpose and accept logical inputs from the
mapping layer. Avoid hardcoding vehicle-specific assumptions inside cards.

## View Extensions

A view owns page layout and orchestration. It may compose existing cards, but it
should not duplicate reusable card internals.

## Popup Extensions

A popup should focus on one detailed task or status group, such as charging,
climate, tires, or lock state.

## Theme Extensions

Theme additions should use semantic names. Prefer names such as
`kia-status-warning` or `kia-surface-raised` over names tied only to raw colors.

## Review Checklist

- The extension keeps entity IDs inside the mapping file.
- The extension has a clear owner folder.
- The extension is documented when it changes customization behavior.
- The extension can be reviewed independently of unrelated dashboard work.
