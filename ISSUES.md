# Issue Backlog

## Current limitations

- Trip route, destination, distance, duration, and movement data are placeholders
  until generic entity mappings are defined.
- Seat comfort, rear-window heating, and dual departure context now support
  optional mappings verified against the target EV6. Direct seat-level selection
  and schedule editing still depend on the integration-specific entity or
  service contract.
- Remote lock and light actions remain read-only pending action-safety review and
  reliable command-result entities.
- Real Home Assistant screenshots do not yet cover every view, breakpoint, and
  theme mode.
- The legacy modular YAML flow and the HACS custom card overlap and need a clear
  long-term support decision.

## Maintenance risks

- The built-in card version is manually maintained and can drift from GitHub
  releases without an automated validation check.
- Planning and changelog documents require explicit updates during every release.
- Optional entities vary significantly between Hyundai/Kia integration versions;
  new mappings must remain capability-driven and optional.

## Completed backlog items

The repository already includes entity-reference, mapped-key, image-reference,
required-structure, runtime-health, syntax, formatting, Markdown, and YAML
validation. Core Overview, Battery, Vehicle, Climate, Energy, Location, and
Settings layouts are implemented.
