# Tasks

## Maintenance

- [x] Synchronize the built-in card version with v2.5.1.
- [x] Replace the pre-HACS roadmap with the current product roadmap.
- [x] Reconcile milestones, tasks, and issue backlog with shipped functionality.
- [x] Automate built-in version validation against release metadata.
- [ ] Decide whether legacy modular YAML views remain a supported install path.
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

## Safe vehicle actions

- [ ] Review lock and unlock entities, confirmation wording, and result feedback.
- [ ] Review supported light, trunk, hood, and charge-port actions separately.
- [ ] Keep every action disabled until its state and command result are observable.
- [ ] Add regression tests for each approved action domain and failure path.

## Documentation and visual QA

- [ ] Capture real Home Assistant screenshots for every view.
- [ ] Validate desktop, tablet, and mobile layouts.
- [ ] Validate light and dark Home Assistant themes.
- [ ] Complete installation and customization guides.
- [ ] Complete troubleshooting and FAQ documentation.
- [ ] Publish an anonymized, complete reference card configuration.
