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
  energy context, history helpers, and tariff estimates.
- Confirmation and feedback patterns for enabled remote actions.

## Next: Climate comfort

- Map seat heating and ventilation where entities are available.
- Add rear-window heating and any remaining comfort signals.
- Define climate schedules or departure-time support without coupling the card to
  one integration.

## Next: Trips and energy analytics

- Replace the read-only trip placeholder with mapped route, destination,
  distance, duration, and movement data.
- Add regeneration and driving-history signals where integrations expose them.
- Add consumption charts and long-term statistics using Home Assistant history
  and statistics entities.

## Next: Safe vehicle actions

- Review lock and unlock actions with confirmations and command-result feedback.
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
- Retire or clearly label legacy YAML paths as the custom card becomes the main
  supported experience.
- Keep planning documents aligned with shipped releases and verified entities.
