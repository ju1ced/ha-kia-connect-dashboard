# Battery View

## Purpose

The Battery view is the first detail section reachable from the Overview hub. It
expands the compact Overview battery summary into a focused charging and range
surface.

## Composition

`dashboard/views/battery.yaml` composes these card fragments:

- `battery-hero.yaml` for the page headline and mapped battery context.
- `battery-charge-controls.yaml` for native charging control placeholders.
- `battery-range.yaml` for range and state-of-charge context.
- `battery-health.yaml` for charge limit, plug, and future health metrics.
- `battery-charging-session.yaml` for charging session placeholders.
- `battery-back-navigation.yaml` for returning to Overview.

## Navigation

Overview links to this page through `/lovelace/kia-battery`. The Battery page
links back to `/lovelace/overview` until the final dashboard URL strategy is
customized for a user's Home Assistant instance.

## Entity Rules

Battery cards reference logical mapping keys only. Raw Home Assistant entity IDs
remain in `dashboard/templates/entities.yaml`.

## Native Card Baseline

The first Battery view uses native Lovelace cards only:

- `markdown`
- `grid`
- `button`

Future PRs can replace placeholders with richer reusable cards after the
binding pattern is agreed.
