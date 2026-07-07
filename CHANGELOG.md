# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

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
