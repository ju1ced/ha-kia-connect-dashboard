# Contrast Validation

## Scope

This document records the initial Nebula theme contrast checks for core text and
status colors. The goal is to keep dashboard text readable before visual cards
are implemented.

## Core Text Checks

- `kia-text-primary` on `kia-surface-base`: 17.4:1, pass.
- `kia-text-secondary` on `kia-surface-base`: 9.7:1, pass.
- `kia-text-muted` on `kia-surface-base`: 5.8:1, pass.
- `kia-text-primary` on `kia-surface-raised`: 13.2:1, pass.
- `kia-text-secondary` on `kia-surface-raised`: 7.4:1, pass.

## Status Color Checks

- `kia-status-charging` on `kia-surface-base`: 11.8:1, pass.
- `kia-status-ready` on `kia-surface-base`: 10.3:1, pass.
- `kia-status-warning` on `kia-surface-base`: 12.7:1, pass.
- `kia-status-critical` on `kia-surface-base`: 6.7:1, pass.
- `kia-status-offline` on `kia-surface-base`: 5.8:1, pass.

## Threshold

The baseline threshold is WCAG AA contrast for normal text, which requires a
minimum ratio of 4.5:1. Large display text and icons should still prefer the
same threshold unless a component documents a narrower use.

## Follow-up

Future card PRs should validate contrast in rendered dashboard context. Tokens
may pass in isolation but still need review when layered over images, maps, or
transparent overlays.
