# Project Plan

## Product Direction

HA Kia Connect Dashboard remains a frontend-only HACS Lovelace card. It will
offer the app-like experience and guided configuration of a custom Home
Assistant panel without requiring a Python integration, private WebSocket API,
or separate configuration file.

The repository-side YAML dashboard remains a reference and validation fixture.
The supported production path is `custom:kia-dashboard-card`.

## Guiding Principles

- Existing card YAML remains valid and is editable through the visual editor.
- Home Assistant owns persistence, undo, and the live card preview.
- Editor changes preserve unknown and future configuration properties.
- Optional features remain hidden or read-only until their mappings and safety
  options are configured.
- Entity mappings are grouped by vehicle function and searchable by Home
  Assistant entity ID or friendly name.
- The frontend card stays vehicle-agnostic even though the reference vehicle is
  a 2026 Kia EV6 GT-Line RWD.
- The legacy render flow continues to centralize IDs in
  `dashboard/templates/entities.yaml`.

## Visual Editor Delivery Plan

### Phase 1 — Editor foundation

- Register a `kia-dashboard-card-editor` through `getConfigElement()`.
- Supply a safe minimal stub configuration through `getStubConfig()`.
- Implement immutable nested updates and standard `config-changed` events.
- Preserve properties the editor does not yet understand.

### Phase 2 — Guided vehicle configuration

- Group entity mappings into Vehicle, Battery, Access, Climate, Energy,
  Location, Actions, and Home charger sections.
- Use self-contained entity selectors with friendly-name suggestions and manual
  entity-ID input.
- Show configured counts and allow mappings to be cleared.
- Keep advanced sections collapsed by default.

### Phase 3 — Behavior and appearance

- Expose reviewed safety toggles, freshness thresholds, history limits, map
  options, and image paths.
- Keep dangerous controls opt-in and explain their effect in the editor.
- Validate numeric settings before emitting configuration changes.

### Phase 4 — Quality and documentation

- Add regression checks for editor registration, immutable updates, clearing,
  and preservation of unknown YAML.
- Document visual-editor usage alongside the YAML reference.
- Validate editor layout in desktop and mobile Home Assistant card dialogs.

### Phase 5 — Follow-up validation

- Test the editor against a real Home Assistant instance.
- Capture light and dark theme screenshots.
- Refine labels and domain filters from user feedback without changing the
  persisted configuration contract.

## Definition of Done

- The card can be added and configured without writing YAML.
- Every supported entity mapping is reachable from the visual editor.
- Existing YAML opens without data loss and remains usable after editing.
- Safety-sensitive actions remain disabled unless explicitly enabled.
- Automated frontend, structure, mapping, version, and documentation checks
  pass.
- Manual Home Assistant validation is tracked separately when it requires a
  live installation or real vehicle.
