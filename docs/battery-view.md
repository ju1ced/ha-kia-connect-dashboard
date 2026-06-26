# Battery View

## Purpose

The Battery view is the first detail section reachable from the Overview hub. It
expands the compact Overview battery summary into a focused charging and range
surface.

## Composition

`dashboard/views/battery.yaml` composes these card fragments:

- `battery-hero.yaml` for the page headline and mapped battery context.
- `battery-charge-controls.yaml` for mapped charging action placeholders.
- `battery-range.yaml` for range and state-of-charge context.
- `battery-health.yaml` for charge limit, plug, and future health metrics.
- `battery-charging-session.yaml` for charging session context.
- `battery-back-navigation.yaml` for returning to Overview.

## Navigation

Overview links to this page through `/lovelace/kia-battery`. The Battery page
links back to `/lovelace/overview` until the final dashboard URL strategy is
customized for a user's Home Assistant instance.

## Entity Rules

Battery cards reference logical mapping keys only. Raw Home Assistant entity IDs
remain in `dashboard/templates/entities.yaml`.

## Mapped Template Usage

Battery is the first detail view connected to the shared mapped template
patterns:

- `kia_mapped_state_row` renders mapped read-only battery values.
- `kia_mapped_action_button` renders inert charging and refresh actions.
- `kia_mapped_section_note` renders consistent placeholder notes.
- `kia_back_to_overview` renders the standard return navigation.

Action buttons remain inert until command confirmation and service-call patterns
are reviewed.
