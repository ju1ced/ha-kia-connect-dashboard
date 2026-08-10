"""Guard the persistent-trip package against session-stalling regressions."""

from pathlib import Path
import sys


PACKAGE = Path("examples/home-assistant-packages/trip_calendar.yaml")
content = PACKAGE.read_text(encoding="utf-8")
_, capture_separator, automations = content.partition(
    "  - id: kia_trip_calendar_capture_start"
)
capture, store_separator, store = automations.partition(
    "  - id: kia_trip_calendar_store_completed"
)

errors: list[str] = []

if not capture_separator:
    errors.append("trip-start automation is missing")
if not store_separator:
    errors.append("completed-trip automation is missing")
if (
    "conditions:\n      - condition: state\n"
    "        entity_id: input_boolean.kia_trip_active"
    in capture
):
    errors.append("a stale active helper must not block a new trip start")
if content.count("GPS ") < 2:
    errors.append("unnamed tracker positions must be forced to text")
if "wait_template:" in store or "wait_for_trigger:" not in store:
    errors.append("odometer refresh must use wait_for_trigger")
if store.count("continue_on_error: true") < 2:
    errors.append("calendar failures must not leave the trip helper active")
if "'origin': origin | trim" in store:
    errors.append("native tuple-like location variables must not enter to_json")
if (
    "'origin': states('input_text.kia_trip_start_location') | trim"
    not in store
):
    errors.append("calendar JSON must read the persisted origin as text")
if (
    "states('input_text.kia_trip_start_coordinates') | trim"
    not in store
):
    errors.append("calendar JSON must read persisted coordinates as text")

if errors:
    print("Trip calendar package validation failed:")
    print("\n".join(f"- {error}" for error in errors))
    sys.exit(1)

print("Trip calendar package validation passed")
