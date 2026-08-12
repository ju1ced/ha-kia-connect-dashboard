# Tasks

## Maintenance

- [x] Synchronize the built-in card version with v2.5.1.
- [x] Replace the pre-HACS roadmap with the current product roadmap.
- [x] Reconcile milestones, tasks, and issue backlog with shipped functionality.
- [x] Automate built-in version validation against release metadata.
- [x] Keep legacy modular YAML views as reference/validation fixtures and make
      the HACS custom card the supported production path.
- [ ] Move released development notes out of the Unreleased changelog section as
      part of each release.

## Climate comfort

- [x] Inventory available seat-heating and seat-ventilation entities.
- [x] Inventory rear-window heater and additional comfort entities.
- [x] Define a generic mapping contract for climate schedules or departure time.
- [x] Implement and test the mapped climate comfort controls.

## Trips and energy analytics

- [x] Inventory trip, regeneration, and driving-history entities.
- [x] Define optional engine, ignition, odometer, location, and battery inputs
      for estimated individual trips.
- [x] Replace the Location trip placeholder when usable mappings exist.
- [x] Add consumption and regeneration charts backed by Home Assistant history or
      statistics.
- [x] Add extended daily driving data and bounded Recorder-derived trip history
      to Location.
- [ ] Validate trip reconstruction against real journeys and delayed updates.
- [x] Add optional Local Calendar persistence beyond Recorder retention.
- [ ] Validate calendar capture and restart recovery against real journeys.
- [x] Add permanent 30/90/365-day charger statistics with standby filtering.
- [ ] Validate charger statistics, threshold, and tariff estimates against real
      sessions as long-term data accumulates.

## Safe vehicle actions

- [x] Review lock and unlock entities, confirmation wording, and result feedback.
- [x] Enable opt-in lock controls only when mapped to a `lock.*` entity, with
      confirmation and returned-state verification.
- [x] Review light, trunk, hood, and charge-port entities; keep them read-only
      until a reliable command result is available.
- [x] Keep every unreviewed action disabled until its state and command result
      are observable.
- [x] Add regression tests for the approved lock action path.
- [x] Validate lock and unlock against real Kia command timing without disabling
      confirmations.
- [x] Refresh Kia data once after a remote lock action and synchronize the
      confirmed Home Assistant state without a browser reload.

## Documentation and visual QA

- [ ] Capture real Home Assistant screenshots for every view.
- [x] Validate desktop, tablet, and mobile layouts.
- [x] Validate light and dark Home Assistant themes.
- [x] Complete installation and customization guides for the supported HACS
      card path.
- [x] Add troubleshooting and FAQ documentation.
- [x] Publish an anonymized, complete reference card configuration.
