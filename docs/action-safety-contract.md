# Action Safety Contract

## Purpose

Remote vehicle actions must be reviewed before they are enabled. The dashboard
currently keeps action buttons inert with `action: none`; this contract defines
what must be true before refresh, climate, charging, lock, or maintenance actions
become active.

## Action Classes

### Low Risk

Low-risk actions refresh data or open local dashboard surfaces.

Examples:

- Refresh vehicle status.
- Open mapping or diagnostics surfaces.

Expected behavior:

- No confirmation required unless the action calls an external service.
- Clear visual feedback after activation.

### Medium Risk

Medium-risk actions change comfort or charging behavior but do not immediately
unlock the vehicle.

Examples:

- Start climate.
- Stop climate.
- Start charging.
- Stop charging.

Expected behavior:

- Confirmation before activation.
- Clear button label and icon.
- Visible last-command or session feedback.

### High Risk

High-risk actions affect physical access or security.

Examples:

- Unlock doors.
- Open or release charge-port controls if supported.
- Any future action that changes access state.

Expected behavior:

- Explicit confirmation before activation.
- No high-risk action on Overview quick actions by default.
- Prefer detail-page placement with surrounding status context.

## Template Rules

- Keep `kia_mapped_action_button` inert until a service or confirmation pattern
  is reviewed.
- Use `kia_mapped_confirm_action_button` when an action will need a confirmation
  prompt before activation.
- Keep confirm-action buttons on `action: none` until the real service or
  navigation target is documented.
- Add new action templates only when the risk class is documented.
- Do not mix status rows and service calls in one template.
- Keep Home Assistant service targets in documented mapping or script surfaces.

## Feedback Rules

- Add read-only last-result rows before enabling an action.
- Show action feedback in Settings first unless a detail page needs immediate
  context for safe use.
- Do not treat entity availability alone as proof that an action is safe.

## Follow-up Work

- Choose the Home Assistant confirmation pattern for medium-risk actions.
- Decide whether service calls should target scripts, buttons, or integration
  services directly.
- Add last-command feedback before enabling climate or charging controls.
