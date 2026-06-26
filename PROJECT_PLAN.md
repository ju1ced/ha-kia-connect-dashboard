# Project Plan

## Purpose

HA Kia Connect Dashboard will provide a polished, Kia Connect inspired Home Assistant dashboard built entirely with native YAML and supported Lovelace cards. The project prioritizes modularity, reusable templates, documentation, and safe customization for different Hyundai/Kia vehicles.

## Guiding Principles

- Entity IDs are centralized in `dashboard/templates/entities.yaml`.
- Dashboard files must not hardcode Home Assistant entity IDs.
- Work proceeds milestone by milestone with small reviewable pull requests.
- YAML is documented, reusable, and validated in CI.
- The first reference vehicle is a 2026 Kia EV6 GT-Line RWD, but the architecture remains vehicle-agnostic.

## Phases

1. Architecture and project management documents.
2. Repository documentation and contributor guidance.
3. Repository structure and validation scaffolding.
4. GitHub workflows and QA automation.
5. Reusable entity, color, icon, and decluttering templates.
6. Dashboard page implementation, starting with Overview after review.

## Definition of Done

- Required repository files exist and match the published architecture.
- CI validates YAML, Markdown, formatting, duplicate entities, missing images, and required files.
- Every dashboard component has documentation explaining purpose and customization points.
- Each milestone is completed in a focused pull request.
