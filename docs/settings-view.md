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
- `dashboard/cards/settings-actions.yaml` owns refresh and local mapping action
  placement.
- `dashboard/cards/settings-maintenance.yaml` owns refresh result, climate command
  result, charging command result, mapping health, dashboard version,
  diagnostics, and troubleshooting notes.
- `dashboard/cards/settings-back-navigation.yaml` owns return navigation to
  Overview.

## Mapped Template Usage

Settings detail cards use `custom:decluttering-card` wrappers for action buttons,
state rows, section notes, entity diagnostics, and back navigation.

The Refresh Vehicle button uses a reviewed low-risk `button.press` binding through
`kia_mapped_perform_action_button`. Mapping Details uses `more-info` and remains a
local read-only action surface.

## Entity Rules

Settings cards must not hardcode Home Assistant entity IDs. Any future action or
status entity should first be added to `dashboard/templates/entities.yaml`, then
consumed by logical mapping names from these cards.

## Diagnostic Rules

Settings owns the first read-only diagnostics surface for mapping problems. When
a dashboard row renders as unknown, unavailable, or missing, the guidance should
point users back to `dashboard/templates/entities.yaml` before suggesting card
changes.

Runtime mapping health states are defined in `docs/runtime-mapping-health.md`.

## Action Rules

Only low-risk Settings actions are active before the first Home Assistant test.
Medium-risk and high-risk vehicle actions must stay behind the confirmation
pattern and remain inert until last-command feedback is available.

## Feedback Rules

Settings maintenance rows show read-only feedback for last refresh result, future
climate command result, future charging command result, mapping health, and
dashboard version. Climate and charging command feedback must exist before those
medium-risk actions are enabled.

## Follow-up Work

- Add version and troubleshooting links once installation documentation is added.
- Enable medium-risk actions only after their confirmation and feedback behavior
  has been tested in Home Assistant.
