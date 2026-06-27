# Settings View

The Settings view is the sixth detail surface behind the Overview navigation. It
completes the initial Overview menu by providing a destination for dashboard
administration, entity mapping guidance, theme context, refresh actions,
maintenance notes, and a return path to Overview.

## Route

- View file: `dashboard/views/dashboard-admin.yaml`
- Navigation path: `/lovelace/kia-settings`
- Entry point: Overview section navigation

## Card Ownership

- `dashboard/cards/settings-hero.yaml` owns page context and administration
  scope.
- `dashboard/cards/settings-entity-mapping.yaml` owns mapping guidance,
  missing-entity handling, and future mapping health checks.
- `dashboard/cards/settings-theme.yaml` owns theme identity and token ownership
  references.
- `dashboard/cards/settings-actions.yaml` owns future refresh and configuration
  action placement.
- `dashboard/cards/settings-maintenance.yaml` owns diagnostics, version, and
  troubleshooting notes.
- `dashboard/cards/settings-back-navigation.yaml` owns return navigation to
  Overview.

## Mapped Template Usage

Settings detail cards use `custom:decluttering-card` wrappers for action buttons,
section notes, entity diagnostics, and back navigation. Action buttons stay inert
with `action: none` until refresh and mapping workflows have documented service
targets.

## Entity Rules

Settings cards must not hardcode Home Assistant entity IDs. Any future action or
status entity should first be added to `dashboard/templates/entities.yaml`, then
consumed by logical mapping names from these cards.

## Diagnostic Rules

Settings owns the first read-only diagnostics surface for mapping problems. When
a dashboard row renders as unknown, unavailable, or missing, the guidance should
point users back to `dashboard/templates/entities.yaml` before suggesting card
changes.

## Follow-up Work

- Bind refresh actions to the mapped controls once the shared action pattern is
  documented.
- Add runtime mapping health checks after the diagnostic source contract exists.
- Add version and troubleshooting links once installation documentation is added.
