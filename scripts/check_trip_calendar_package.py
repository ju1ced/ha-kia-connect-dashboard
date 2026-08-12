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
capture = capture.partition("  - id: kia_trip_calendar_capture_route")[0]

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
if "'schema': 'kia_trip_v2'" not in store:
    errors.append("completed trips must use the extended v2 schema")
for field in (
    "'route_points'",
    "'odometer_start'",
    "'odometer_end'",
    "'drive_energy_kwh'",
    "'climate_energy_kwh'",
    "'electronics_energy_kwh'",
    "'regenerated_energy_kwh'",
):
    if field not in store:
        errors.append(f"calendar JSON is missing {field}")
if "  - id: kia_trip_calendar_capture_route" not in content:
    errors.append("route point capture automation is missing")
for helper in range(2, 7):
    if f"kia_trip_route_points_{helper}:" not in content:
        errors.append(f"route helper segment {helper} is missing")
if (
    "is_state('input_boolean.kia_trip_use_driver_tracker', 'on')" not in content
    or "device_tracker.your_driver_phone" not in content
    or "device_tracker.your_second_driver_phone" not in content
    or "minutes: \"/1\"" not in content
):
    errors.append("driver-phone route sampling must be opt-in and sampled once per minute")
if (
    "  - id: kia_trip_calendar_select_route_tracker" not in content
    or "kia_trip_route_mode:" not in content
    or "Primary phone" not in content
    or "Secondary phone" not in content
    or "primary_movement_km:" not in content
    or "secondary_movement_km:" not in content
    or "primary_recent:" not in content
    or "secondary_recent:" not in content
    or "minutes: \"/2\"" not in content
    or "phone-primary" not in content
    or "phone-secondary" not in content
):
    errors.append("automatic route selection must score and lock either driver phone")
if (
    "states('input_text.kia_trip_selected_route_tracker')" not in content
    or "entity_id: input_text.kia_trip_route_source" not in content
):
    errors.append("the selected tracker and route source must persist for the active trip")
if "'route_source': states('input_text.kia_trip_route_source')" not in store:
    errors.append("calendar JSON must identify the route source")
if "  - id: kia_trip_calendar_detailed_sampling" not in content:
    errors.append("optional detailed sampling automation is missing")
if (
    "entity_id: input_boolean.kia_trip_detailed_sampling" not in content
    or "entity_id: button.your_vehicle_force_refresh" not in content
):
    errors.append("detailed sampling must be explicitly gated and use the refresh button")

if errors:
    print("Trip calendar package validation failed:")
    print("\n".join(f"- {error}" for error in errors))
    sys.exit(1)

print("Trip calendar package validation passed")
