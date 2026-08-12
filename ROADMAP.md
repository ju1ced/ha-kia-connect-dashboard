# Roadmap

The HACS card, core vehicle views, Dutch localization, Home Assistant locale
selection, Smappee charger integration, battery diagnostics, and window controls
are available in the current stable release.

## Completed foundation

- HACS-installable `custom:kia-dashboard-card` with responsive light and dark UI.
- Overview, Battery, Vehicle, Climate, Energy, Location, and Settings views.
- Generic Home Assistant entity mapping with repository-side render validation.
- Dutch and English UI selected from the Home Assistant locale.
- Battery condition, thermal management, 12V status, charge limits, and session
  context.
- Vehicle openings, tire status, Smart Key warning, and cover-based window
  controls.
- Home charger status, Smappee strategy controls, Pause/Resume mode retention,
  energy context, permanent 30/90/365-day statistics, and tariff estimates.
- Seat comfort, rear-window heating, and departure schedule context.
- Daily driving distance, efficiency, regeneration summaries, and 14-day
  consumption and regeneration charts.
- Extended Kia daily history and estimated individual trips reconstructed from
  bounded Home Assistant Recorder data.
- Persistent Local Calendar trips with a date picker, approximate route map,
  expandable trip table, odometer context, and per-system energy breakdown.
- Separate Kia data-freshness and home-charger connection diagnostics, with a
  dynamic Overview connection status and configurable freshness thresholds.
- CI-enforced dashboard, changelog, and release-tag version consistency.
- Confirmation and feedback patterns for enabled remote actions.
- Opt-in lock and unlock controls with confirmation and returned-state
  verification.

## Parked: Validate persistent trip data

- Validate Recorder-derived trips against real journeys and tune segmentation
  for missed or delayed Kia updates.
- Validate the shipped Local Calendar package, duplicate protection, and restart
  recovery against real journeys.
- Consider one-time import of recent Recorder trips into the persistent calendar.
- Keep TRONITY research as an optional provider path rather than a dependency.
- This work is intentionally parked while Energy, vehicle actions,
  documentation, and maintenance are completed.

## Next: Validate charging history

- Compare daily Home Assistant statistic changes with real Smappee sessions.
- Validate the standby threshold and tariff estimates over 30, 90, and 365-day
  views as more long-term data accumulates.
- Keep the current total-increasing sensor as the permanent source of truth.

## Next: Safe vehicle actions

- Validate the reviewed lock and unlock controls against real Kia responses.
- Review supported light, trunk, hood, and charge-port actions individually.
- Keep unsupported or insufficiently observable actions read-only.

## Next: Documentation and visual QA

- Capture current Home Assistant screenshots for every view.
- Complete installation, customization, troubleshooting, and FAQ documentation.
- Validate desktop, tablet, mobile, light, and dark layouts against real entity
  states.
- Publish a complete reference configuration using anonymized entity examples.

## Maintenance

- Keep the built-in card version, changelog, release tag, and HACS metadata in
  sync.
- Keep legacy modular YAML as a reference and repository validation fixture;
  support production installations through the HACS custom card.
- Keep planning documents aligned with shipped releases and verified entities.
