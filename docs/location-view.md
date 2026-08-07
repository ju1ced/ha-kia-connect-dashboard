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
drive mode. A full-width daily-history section below the current location cards
uses up to 30 date-keyed Kia records and shows period totals plus per-day
distance, consumption, energy, regeneration, and climate use.

Mapping `engine` or `ignition` together with `odometer` enables the subsequent
Trip History section. It requests a bounded history window from Home Assistant
Recorder only while Location is active, pairs running and stopped transitions,
and calculates completed trips. Tracker, battery-level, and remaining-energy
history enrich the result when those mappings are present. These trip values
are explicitly presented as estimates because cached Kia updates do not provide
exact event timestamps or a GPS breadcrumb route.

The original placeholder remains when no driving mappings are available. Trip
reconstruction reports its missing mappings separately, so daily Kia history
continues to work without Recorder-based trips.
