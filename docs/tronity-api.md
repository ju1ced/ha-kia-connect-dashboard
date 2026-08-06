# TRONITY API integration research

## Goal

Use TRONITY trip data to enrich the dashboard with individual trip details that
Kia Connect does not expose, while keeping credentials and API traffic inside
Home Assistant.

## Verified current state

- TRONITY Premium and Professional users can access their own vehicle data with
  the public API. Its interactive documentation is available after signing in to
  the [TRONITY platform](https://app.tronity.tech).
- The official [TRONITY Home Assistant integration](https://github.com/tronity/homeassistant)
  authenticates server-side with a client ID and client secret, then reads the
  vehicle's `last_record` endpoint.
- That integration currently exposes odometer, range, battery level, charging,
  plug state, charger power, and remaining charge time. It does not expose trip
  history.
- TRONITY's trip model includes start and end times, battery levels, odometer
  readings, addresses, energy use, consumption, and cost. Route geometry is not
  confirmed by the public documentation.

## Recommended architecture

The dashboard card must not call TRONITY directly. Doing so would expose the
client secret or bearer token in the browser and would bypass Home Assistant's
state, history, and permission model.

Extend the Home Assistant integration instead:

1. Reuse its server-side authentication and HTTP session.
2. Add a separate trip-data coordinator with a conservative refresh interval.
3. Expose compact Home Assistant entities for the latest trip and recent trip
   summaries.
4. Add optional, provider-neutral entity mappings to this card.

Suggested card mappings are:

- `trip_start`
- `trip_end`
- `trip_duration`
- `trip_distance`
- `trip_origin`
- `trip_destination`
- `trip_energy`
- `trip_consumption`
- `trip_history`

Addresses and trip history are sensitive data. Credentials must remain in the
integration's config entry, responses should not be logged, and history
attributes should be bounded to avoid excessive recorder storage.

## Information still required

The authenticated API documentation must be checked before implementation. In
particular, we need the exact trip endpoint and response schema, pagination and
date filters, rate limits, and whether coordinates or route geometry are
available. These details should not be guessed.

## Implementation sequence

1. Export the relevant OpenAPI fragment or a redacted example response from the
   signed-in TRONITY API documentation. Do not share client credentials.
2. Prototype read-only trip retrieval in a dedicated integration branch.
3. Add coordinator, entity, pagination, privacy, and error-handling tests.
4. Verify the entities against a live vehicle.
5. Implement the provider-neutral card mappings and trip presentation here.

## Sources

- [TRONITY: public API availability](https://help.tronity.io/hc/en-us/articles/360018514299-Are-there-public-APIs-available-at-TRONITY)
- [TRONITY: trip fields](https://help.tronity.io/hc/en-us/articles/4403445762962-How-can-I-create-trips-manually)
- [Official TRONITY Home Assistant integration](https://github.com/tronity/homeassistant)
