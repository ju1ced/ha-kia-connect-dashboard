# Location View

The Location view is the fifth detail surface behind the Overview navigation. It
expands the Overview location summary into focused blocks for tracker context,
odometer, parking state, trip context, and a return path to Overview.

## Route

- View file: `dashboard/views/position-context.yaml`
- Navigation path: `/lovelace/kia-location`
- Entry point: Overview section navigation

## Card Ownership

- `dashboard/cards/location-hero.yaml` owns page context and location mapping
  scope.
- `dashboard/cards/location-map-context.yaml` owns tracker and future map display
  placement.
- `dashboard/cards/location-odometer.yaml` owns odometer display.
- `dashboard/cards/location-parking.yaml` owns parking and update freshness
  context.
- `dashboard/cards/location-trip-context.yaml` owns mapped daily-driving and
  drive-mode context.
- `dashboard/cards/location-back-navigation.yaml` owns return navigation to
  Overview.

## Mapped Template Usage

Location detail cards use `custom:decluttering-card` wrappers for tracker rows,
odometer rows, placeholder section notes, and back navigation. The map block
stays template-based until a native map card can consume the mapped tracker
safely.

## Entity Rules

Location cards must not hardcode Home Assistant entity IDs. New tracker,
odometer, parking, or trip values should first be added to
`dashboard/templates/entities.yaml`, then consumed by logical mapping names from
these cards.

## Driving Context

When `today_driving_stats` or `daily_driving_stats` is mapped, the trip block
shows today's distance and calculated consumption. `drive_mode` adds the current
drive mode. The original placeholder remains when none of these mappings are
available; route and destination are deliberately not inferred.
