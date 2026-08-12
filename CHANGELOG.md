# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Added a single automatic Kia data refresh after lock or unlock when the
  requested state does not arrive during the configurable grace period.

## 2.16.0 - 2026-08-12

- Added opt-in Vehicle lock and unlock controls with explicit confirmation,
  returned-state verification, timeout feedback, and unavailable-state guards.
- Documented live Smappee charging-statistics validation, published an
  anonymized reference card configuration, and added troubleshooting guidance.
- Parked real-journey trip validation, designated the HACS card as the supported
  production path, and retained modular YAML as a reference/validation fixture.

## 2.15.0 - 2026-08-12

- Added permanent charging-history analysis based on Home Assistant long-term
  statistics, with selectable 30, 90, and 365-day periods.
- Added charging totals, charging-day averages, estimated costs, a daily chart,
  and an expandable table while filtering configurable standby consumption.
- Added optional yearly charging-energy helpers and documentation for the new
  history configuration.

## 2.14.0 - 2026-08-12

- Added automatic per-trip route-source selection between two driver phones,
  using recent GPS movement and optional automotive activity signals.
- Added Kia-only and fixed-phone modes, with Kia fallback and a locked driver
  choice that prevents a stationary phone at home from entering another
  driver's trip.

## 2.13.0 - 2026-08-12

- Fixed intermittent desktop Energy layout gaps when conditional driving
  analytics forced otherwise paired cards onto incomplete grid rows.
- Made vehicle energy and home power-flow panels full-width with responsive
  multi-column statistics, while keeping live charger and controls paired.
- Moved the selected-day route map beside the trip calendar and cached loaded
  calendar ranges to make repeat navigation faster.
- Added opt-in one-minute driver-phone breadcrumbs and segmented route storage
  for substantially more detailed trip routes.

## 2.12.0 - 2026-08-11

- Added CI validation that keeps the built-in dashboard version aligned with
  the latest changelog release and verifies `v*` tag builds against both.

## 2.11.0 - 2026-08-11

- Added connection-health diagnostics to Settings, with separate Kia vehicle
  data freshness and home-charger connectivity states.
- Replaced the hardcoded Overview connection value with current, delayed,
  stale, unavailable, or unconfigured status derived from `last_updated`.
- Added configurable vehicle freshness thresholds and regression coverage for
  stale Kia data and online/offline charger states.

## 2.10.0 - 2026-08-11

- Added an approximate OpenStreetMap route view and expandable TRONITY-style
  trip table with start, end, duration, energy, consumption, speed, and
  odometer details.
- Extended persistent trips to the backward-compatible `kia_trip_v2` schema
  with route breadcrumbs, odometer values, Kia energy breakdown, regeneration,
  and optional five-minute active sampling.

## 2.9.2 - 2026-08-10

- Fixed Local Calendar trip storage for raw GPS coordinate values that Home
  Assistant interpreted as non-serializable native tuples.
- Prevented a failed calendar write from blocking every later trip and added a
  package regression check for the persistent-session recovery path.

## 2.9.1 - 2026-08-07

- Made the per-day table in the official Kia daily-driving section collapsible,
  while keeping the period totals visible.

## 2.9.0 - 2026-08-07

- Added optional Local Calendar-backed trip persistence with a monthly day
  picker, per-day summaries, and a complete stored-trip overview on Location.
- Added a ready-to-copy Home Assistant trip package that snapshots Kia values,
  writes versioned calendar events, recovers an active trip after restart, and
  avoids duplicate events.
- Kept bounded Recorder reconstruction as the automatic fallback when no trip
  calendar is mapped.

## 2.8.0 - 2026-08-07

- Expanded Location with up to 30 official Kia daily-driving records and period
  totals for distance, energy, consumption, regeneration, and climate use.
- Added bounded, on-demand Home Assistant Recorder analysis that reconstructs
  recent individual trips from engine or ignition, odometer, tracker, and
  battery history without a TRONITY dependency.
- Added configurable daily-history, Recorder-window, and trip-count limits plus
  English and Dutch trip-history presentation.

## 2.7.0 - 2026-08-06

- Added optional daily-driving, today's-driving, total-regeneration, and
  drive-mode mappings verified against live Kia Connect entities.
- Added a 14-day consumption and regeneration chart with today's distance and
  efficiency to Energy.
- Replaced the Location trip placeholder with mapped daily driving context while
  retaining the placeholder when no compatible entities are configured.

## 2.6.0 - 2026-08-06

- Added optional seat-heating, seat-ventilation, rear-window-heating, climate
  schedule, and departure-time mappings to the Climate view.
- Added combined per-seat status mappings and dual departure-program context
  verified against the target EV6 through Home Assistant MCP.
- Added safe direct toggles for supported comfort action entities and Home
  Assistant detail dialogs for select or read-only mappings.

- Synchronized the built-in card version shown in Settings with the latest stable
  release.
- Refreshed the roadmap, milestones, task list, issue backlog, and README to
  reflect the post-v2.5.1 project state.

## 2.5.1 - 2026-07-29

- Combined traction-battery condition and 12V status into one balanced Battery
  card.
- Integrated four compact window status and cover controls into Vehicle.
- Added `cover.open_cover` and `cover.close_cover` support to the card and
  repository render tooling.

## 2.5.0 - 2026-07-29

- Added traction-battery diagnostics, thermal management, 12V status, estimated
  charge duration, and energy-consumption mappings.
- Added Smart Key battery feedback, climate actions, and optional window action
  mappings.

## Earlier development history

- Replaced raw binary on/off values in Vehicle with contextual lock, opening,
  window, charge-port, light, and tire-status labels.

- Added a built-in card version with optional HACS update-entity override and a
  read-only VIN quick reference in Vehicle.
- Documented the complete optional Vehicle and Climate mapping contract.

- Added a generic mapped charger energy-price sensor for session and monthly cost
  estimates, including EUR/kWh and cents-per-kWh unit handling.

- Preserved charger strategy across Pause and Resume for integrations that lose
  their selected mode and otherwise fall back to Standard.
- Added readable home-charger status labels and treated configured Home Assistant
  button entities with an initial `unknown` state as actionable mappings.
- Added ready-to-copy daily, weekly, and monthly charger utility meters plus a
  monthly tariff-cost helper, with incremental history rendering in Energy.
- Reworked the Overview summary panels to use inline, card-local layout rules so
  Home Assistant renders the battery, action, vehicle, location, and tire content
  as explicit full-panel compositions instead of compact centered blocks.
- Polished Overview panel content fill so the hero vehicle, hero metrics,
  battery summary, quick actions, vehicle status, location, and tire cards use
  their available space more like the visual reference.
- Split the Overview header from the hero, rebuilt the hero as a render-style
  vehicle-and-metrics panel, and aligned the first Overview card row to the
  visual reference while preserving status-aware EV6 imagery.
- Tightened Overview spacing, enlarged the status-aware hero vehicle imagery,
  and forced custom panel contents to fill their cards responsively.
- Made Overview panel content explicitly full-width and responsive, and switched
  the default hero vehicle image to the front-right EV6 view used by the visual
  reference.
- Stabilized the Overview hero and panel internals so the EV6 image renders
  larger and dashboard cards keep their intended alignment in Home Assistant.
- Rebuilt the Overview content cards as render-like dashboard panels with a
  battery ring, quick-action panel, compact vehicle status list, map-style
  location summary, tire diagram, and systems status panel.
- Reworked the Overview composition toward the visual reference with a calmer
  left-weighted hero, single-row navigation, and more compact visual cards.
- Added real EV6 Overview hero imagery with status-aware switching for charging
  and active climate states.
- Rebuilt the Overview page around a responsive `layout-card` grid so the first
  Home Assistant test can better match the visual dashboard reference across
  desktop, tablet, and mobile widths.
- Improved visual card text wrapping and Overview navigation readability during
  the first Home Assistant render tests.
- Removed markdown formatting from the visual Overview footer to avoid Home
  Assistant card configuration errors.
- Added Kia Horizon light and dark mode tokens plus visual card fallbacks so the
  dashboard stays readable when Home Assistant uses automatic theme mode.
- Added configurable dashboard route rendering for Home Assistant installs that
  do not use `/lovelace` as the Kia dashboard URL base.
- Converted the Climate, Energy, Location, and Settings detail pages to the dark
  visual card pattern.
- Converted the Battery and Vehicle detail pages to the dark visual card pattern.
- Added the first dark visual Overview layer with reusable `button-card` and
  `card-mod` card patterns.
- Aligned the first-test entity map and affected Settings, Vehicle, Climate, and
  test documentation with the available Oprit Nebula Home Assistant entities.
- Refreshed README and roadmap status for first Home Assistant test readiness.
- Added Settings feedback rows and mapped entities for future climate and
  charging command results.
- Bound low-risk Settings actions to reviewed targets for refresh and mapping
  details.
- Added a reusable mapped perform-action button template for low-risk Home
  Assistant button actions.
- Added inline unavailable alert placement rules and a reusable inline mapping
  alert template.
- Added a runtime mapping health check script for comparing mapped entities with
  Home Assistant state exports.
- Added CI coverage for the runtime mapping health check script.
- Added a first Home Assistant test checklist for installation, navigation,
  theme loading, and safe test scope.
- Added a dashboard render script that converts logical entity keys into mapped
  Home Assistant entity IDs for test installation output.
- Added generated output ignores for linting and source control.
- Added Settings feedback rows for refresh result, mapping health, and dashboard version.
- Added a confirmation-capable mapped action template for future safe actions.
- Added a runtime mapping health example contract for future diagnostics.
- Added read-only entity diagnostics guidance for missing, unknown, or unavailable mapped entities.
- Connected Settings detail cards to reusable mapped entity template patterns.
- Connected Location detail cards to reusable mapped entity template patterns.
- Connected Energy detail cards to reusable mapped entity template patterns.
- Connected Climate detail cards to reusable mapped entity template patterns.
- Connected Vehicle detail cards to reusable mapped entity template patterns.
- Connected Battery detail cards to reusable mapped entity template patterns.
- Added reusable mapped entity card patterns and template usage documentation.
- Added the first Settings detail view shell and dashboard administration card fragments.
- Added the first Location detail view shell and position context card fragments.
- Added the first Energy detail view shell and power flow card fragments.
- Added the first Climate detail view shell and cabin comfort card fragments.
- Added the first Vehicle detail view shell and vehicle state card fragments.
- Added the first Battery detail view shell and charging card fragments.
- Added the first native Lovelace Overview shell and card fragments.
- Added Kia Horizon theme tokens, semantic colors, semantic icons, and contrast notes.
- Added entity mapping, include convention, and extension point contracts.
- Added project planning, architecture, roadmap, milestones, and task backlog.
- Added baseline repository structure for the Home Assistant dashboard project.
