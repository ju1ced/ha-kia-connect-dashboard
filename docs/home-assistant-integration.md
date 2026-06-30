# Home Assistant Integration

## Purpose

This dashboard package is designed to sit behind an existing Home Assistant home
dashboard button. In the reference setup, the user's Home dashboard contains a
KIA EV6 button that opens the Kia Overview page.

The Kia Overview then owns the internal menu for all Kia-specific detail pages.

## Recommended Entry Flow

1. Keep your existing Home Assistant home dashboard as the daily entry point.
2. Add or keep a KIA EV6 button on that home dashboard.
3. Point that button to the Kia Overview route.
4. Use the Overview page to reach Battery, Vehicle, Climate, Energy, Location,
   and Settings.

```text
Home dashboard
  KIA EV6 button
    Kia Overview
      Battery
      Vehicle
      Climate
      Energy
      Location
      Settings
```

## Dashboard Package Route

The package currently uses these route assumptions:

- Overview: `/lovelace/overview`
- Battery: `/lovelace/kia-battery`
- Vehicle: `/lovelace/kia-vehicle`
- Climate: `/lovelace/kia-climate`
- Energy: `/lovelace/kia-energy`
- Location: `/lovelace/kia-location`
- Settings: `/lovelace/kia-settings`

Adjust these paths later if the dashboard is mounted under a different Lovelace
URL in your Home Assistant instance.

## Example Home Button

Use this shape on an existing Home Assistant dashboard button:

```yaml
type: button
name: KIA EV6
icon: mdi:car-electric
tap_action:
  action: navigate
  navigation_path: /lovelace/overview
```

## Internal Navigation Rule

Do not add separate Home dashboard buttons for every Kia detail page unless you
explicitly want shortcuts. The Overview page should remain the primary Kia menu
surface so the package is easy to move or embed later.

## Entity Mapping Rule

Before expecting live data, update `dashboard/templates/entities.yaml` with the
entity IDs from your Home Assistant instance. Keep card files unchanged; they
should continue using logical keys.

## Future Installation Work

This guide intentionally documents the navigation model first. A later
installation guide should add:

- Lovelace dashboard import instructions.
- Resource requirements for custom cards.
- Theme installation steps for Kia Horizon.
- Real screenshots from a Home Assistant test instance.
