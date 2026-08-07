const assert = require("node:assert/strict");

class TestElement {
  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelectorAll: () => [],
    };
  }
}

const sessionValues = new Map();
global.HTMLElement = TestElement;
global.navigator = { language: "en" };
global.window = {
  confirm: () => true,
  customCards: [],
  sessionStorage: {
    getItem: (key) => sessionValues.get(key) || null,
    setItem: (key, value) => sessionValues.set(key, value),
  },
  setTimeout: () => 0,
};
global.customElements = {
  registry: new Map(),
  define(name, element) {
    this.registry.set(name, element);
  },
  get(name) {
    return this.registry.get(name);
  },
};

require("../ha-kia-connect-dashboard.js");

const Card = customElements.get("kia-dashboard-card");
const card = new Card();
const calls = [];

card._config = {
  charger_controls: true,
  charger_resume_via_mode: true,
  entities: {
    charger_mode: "select.home_charger_mode",
    charger_pause: "button.home_charger_pause",
    charger_resume: "button.home_charger_resume",
    charger_start: "button.home_charger_start",
    charger_stop: "button.home_charger_stop",
    charger_status: "sensor.home_charger_status",
    charger_session_energy: "sensor.home_charger_session_energy",
    charger_energy_today: "sensor.home_charger_energy_today",
    charger_energy_month: "sensor.home_charger_energy_month",
    charger_energy_price: "sensor.home_energy_price",
    vin: "sensor.vehicle_vin",
  },
};
card._hass = {
  locale: { language: "en" },
  states: {
    "select.home_charger_mode": {
      state: "solar",
      attributes: { options: ["standard", "smart", "solar"] },
    },
    "button.home_charger_pause": { state: "unknown", attributes: {} },
    "button.home_charger_resume": { state: "unknown", attributes: {} },
    "button.home_charger_start": { state: "unknown", attributes: {} },
    "button.home_charger_stop": { state: "unknown", attributes: {} },
    "sensor.home_charger_status": { state: "suspended_evse", attributes: {} },
    "sensor.home_charger_session_energy": {
      state: "10",
      attributes: { unit_of_measurement: "kWh" },
    },
    "sensor.home_charger_energy_month": {
      state: "100",
      attributes: { unit_of_measurement: "kWh" },
    },
    "sensor.home_energy_price": {
      state: "0.2773",
      attributes: { unit_of_measurement: "€/kWh" },
    },
    "sensor.vehicle_vin": {
      state: "KNAC481A1T5253159",
      attributes: { friendly_name: "Vehicle identification number" },
    },
    "sensor.home_charger_energy_today": {
      state: "4.2",
      attributes: { unit_of_measurement: "kWh" },
    },
  },
  callService: async (domain, service, data) =>
    calls.push({ domain, service, data }),
};

async function run() {
  card._handleAction("charger_pause");
  await Promise.resolve();
  assert.deepEqual(calls.shift(), {
    domain: "button",
    service: "press",
    data: { entity_id: "button.home_charger_pause" },
  });

  card._hass.states["select.home_charger_mode"].state = "standard";
  card._handleAction("charger_resume");
  await Promise.resolve();
  assert.deepEqual(calls.shift(), {
    domain: "select",
    service: "select_option",
    data: { entity_id: "select.home_charger_mode", option: "solar" },
  });

  card._config.charger_resume_via_mode = false;
  card._handleAction("charger_resume");
  await Promise.resolve();
  assert.deepEqual(calls.shift(), {
    domain: "button",
    service: "press",
    data: { entity_id: "button.home_charger_resume" },
  });
  card._config.charger_resume_via_mode = true;

  assert.equal(card._chargerStatusLabel("suspended_evse"), "Paused by charger");
  card._hass.locale.language = "nl";
  assert.equal(card._language(), "nl");
  assert.equal(
    card._chargerStatusLabel("suspended_evse"),
    "Gepauzeerd door laadpunt",
  );
  card._render();
  assert.match(card.shadowRoot.innerHTML, />Overzicht</);
  assert.match(card.shadowRoot.innerHTML, />Instellingen</);
  assert.match(card.shadowRoot.innerHTML, /Laadstatus/);
  const dutchTabs = {
    overview: [
      "Snelle acties",
      "Voertuigstatus",
      "Gesloten",
      "Laatst geparkeerd",
      "Geen actieve dashboardwaarschuwingen",
    ],
    battery: [
      "Overzicht EV-batterij",
      "Batterijconditie",
      "Laadniveau",
      "Thermisch beheer",
      "Huidige status",
    ],
    vehicle: [
      "Controle vóór vertrek",
      "Vergrendelingen &amp; verlichting",
      "Deuren &amp; openingen",
      "Bandenspanning",
      "Voertuiggegevens onvolledig",
    ],
    climate: [
      "Interieurcomfort",
      "Gewenste interieurtemperatuur",
      "Bediening op afstand",
      "Systeemstatus",
      "Stuurverwarming",
    ],
    energy: [
      "Thuisladen",
      "Voertuig en laadpunt in één energieoverzicht",
      "Laadstrategie",
      "Energiestroom",
      "Laatste sessie en totalen",
    ],
    location: [
      "Positie-informatie",
      "Laatst bekende locatie",
      "Parkeerinformatie",
      "Klaar voor toekomstige ritgegevens",
    ],
    settings: [
      "Dashboardbeheer",
      "Entiteitstoewijzing",
      "Actief thema",
      "Dashboardacties",
      "Onderhoudsfeedback",
    ],
  };
  const forbiddenDutchUi = [
    "Aanline",
    "Ready-state check",
    "Charge controls",
    "State of charge",
    "Locks &amp; lights",
    "Prepare the cabin",
    "Vehicle and charger in one energy view",
    "Last known location",
    "Dashboard administration",
    "EV battery overview",
    "Estimated range",
    "Plug connected",
    "Awaiting action-safety review",
    "Current driving estimate",
    "Battery health",
    "Traction battery and auxiliary system",
    "Vehicle detail",
    "Locks &amp; lights",
    "Road contact",
    "Cabin comfort",
    "Remote controls",
    "Home charging",
    "Range and connection",
    "Live session",
    "Charging strategy",
    "Power flow context",
    "Latest session and totals",
    "Position context",
    "Parking context",
    "Trip context",
    "Entity mapping",
  ];
  for (const [tab, expected] of Object.entries(dutchTabs)) {
    card._activeTab = tab;
    card._render();
    for (const label of expected)
      assert.match(card.shadowRoot.innerHTML, new RegExp(label));
    for (const label of forbiddenDutchUi)
      assert.doesNotMatch(card.shadowRoot.innerHTML, new RegExp(label));
  }
  card._activeTab = "overview";
  card._render();
  assert.match(card.shadowRoot.innerHTML, />Online</);
  assert.equal(card._localize("Online"), "Online");
  assert.doesNotMatch(card.shadowRoot.innerHTML, /Aanline/);

  card._hass.locale.language = "nl-BE";
  assert.equal(card._language(), "nl");
  card._hass.locale.language = "nl-NL";
  assert.equal(card._language(), "nl");
  card._hass.locale.language = "fr-BE";
  assert.equal(card._language(), "en");
  card._render();
  assert.match(card.shadowRoot.innerHTML, />Overview</);
  assert.match(card.shadowRoot.innerHTML, />Settings</);

  const settings = card._renderSettingsTab();
  assert.match(settings, /11 of 11 available/);
  assert.match(settings, /Dashboard version/);
  assert.match(settings, /2.8.0/);
  assert.equal(window.customCards[0].version, "2.8.0");

  Object.assign(card._config.entities, {
    door_lock: "lock.vehicle",
    charge_port: "binary_sensor.charge_port",
    lights: "binary_sensor.lights",
    front_left_door: "binary_sensor.front_left_door",
    front_right_window: "binary_sensor.front_right_window",
    tire_front_left: "binary_sensor.tire_front_left",
    tire_rear_right: "binary_sensor.tire_rear_right",
  });
  Object.assign(card._hass.states, {
    "lock.vehicle": { state: "locked", attributes: {} },
    "binary_sensor.charge_port": { state: "on", attributes: {} },
    "binary_sensor.lights": { state: "off", attributes: {} },
    "binary_sensor.front_left_door": { state: "off", attributes: {} },
    "binary_sensor.front_right_window": { state: "on", attributes: {} },
    "binary_sensor.tire_front_left": { state: "off", attributes: {} },
    "binary_sensor.tire_rear_right": { state: "on", attributes: {} },
  });

  const vehicle = card._renderVehicleTab();
  assert.match(vehicle, /KNAC481A1T5253159/);
  assert.match(vehicle, /data-info="vin"/);
  assert.match(vehicle, /<b>Locked<\/b>/);
  assert.match(vehicle, /<b>Closed<\/b>/);
  assert.match(vehicle, /<b>Open<\/b>/);
  assert.match(vehicle, /<b>Normal<\/b>/);
  assert.match(vehicle, /<b>Attention<\/b>/);
  assert.match(vehicle, /<b>Off<\/b>/);

  card._config.entities.dashboard_version = "update.dashboard";
  card._hass.states["update.dashboard"] = {
    state: "off",
    attributes: { installed_version: "2.3.0" },
  };
  assert.match(card._renderSettingsTab(), /2.3.0/);
  delete card._config.entities.dashboard_version;

  const energy = card._renderEnergyTab({});
  assert.match(energy, /Paused by charger/);
  assert.match(energy, /Today/);
  assert.match(energy, /Energy price/);
  assert.match(energy, /0.2773/);
  assert.match(energy, /EUR 2.77/);
  assert.match(energy, /27\.73 <em>EUR/);
  assert.match(energy, /from mapped energy price/);
  assert.doesNotMatch(energy, /This week/);

  card._hass.states["sensor.home_energy_price"] = {
    state: "27.73",
    attributes: { unit_of_measurement: "ct/kWh" },
  };
  const centsEnergy = card._renderEnergyTab({});
  assert.match(centsEnergy, /EUR 2.77/);
  assert.match(centsEnergy, /27\.73 <em>EUR/);
  Object.assign(card._config.entities, {
    battery_state_of_health: "sensor.battery_soh",
    battery_capacity: "sensor.battery_capacity",
    battery_remaining_energy: "sensor.battery_remaining",
    battery_pack_voltage: "sensor.battery_voltage",
    battery_temperature_min: "sensor.battery_temp_min",
    battery_temperature_max: "sensor.battery_temp_max",
    battery_water_temperature: "sensor.battery_water_temp",
    battery_heating: "binary_sensor.battery_heating",
    battery_heater_power: "sensor.battery_heater_power",
    battery_precondition: "binary_sensor.battery_precondition",
    battery_winter_mode: "binary_sensor.battery_winter_mode",
    battery_12v_level: "sensor.battery_12v_level",
    battery_12v_fault: "binary_sensor.battery_12v_fault",
    estimated_charge_duration: "sensor.charge_duration",
    average_energy_consumption: "sensor.average_consumption",
    energy_consumption_90d: "sensor.consumption_90d",
    daily_driving_stats: "sensor.daily_driving_stats",
    today_driving_stats: "sensor.today_driving_stats",
    total_energy_regeneration: "sensor.total_regeneration",
    drive_mode: "sensor.drive_mode",
    engine: "binary_sensor.engine",
    ignition: "binary_sensor.ignition",
    odometer: "sensor.odometer",
    location: "device_tracker.location",
    battery_level: "sensor.ev_battery",
    smart_key_battery_warning: "binary_sensor.smart_key_warning",
    vent_windows: "button.vent_windows",
    rear_window_heater: "switch.rear_window_heater",
    driver_seat_heating: "switch.driver_seat_heating",
    passenger_seat_heating: "select.passenger_seat_heating",
    rear_left_seat_heating: "button.rear_left_seat_heating",
    driver_seat_ventilation: "binary_sensor.driver_seat_ventilation",
    climate_schedule: "input_boolean.climate_schedule",
    climate_departure_time: "input_datetime.climate_departure_time",
    front_left_window: "binary_sensor.front_left_window",
    front_right_window: "binary_sensor.front_right_window",
    rear_left_window: "binary_sensor.rear_left_window",
    rear_right_window: "binary_sensor.rear_right_window",
    front_left_window_open: "cover.front_left_window",
    front_left_window_close: "cover.front_left_window",
    front_right_window_open: "cover.front_right_window",
    front_right_window_close: "cover.front_right_window",
    rear_left_window_open: "cover.rear_left_window",
    rear_left_window_close: "cover.rear_left_window",
    rear_right_window_open: "cover.rear_right_window",
    rear_right_window_close: "cover.rear_right_window",
  });
  Object.assign(card._hass.states, {
    "sensor.battery_soh": {
      state: "100",
      attributes: { unit_of_measurement: "%" },
    },
    "sensor.battery_capacity": {
      state: "302400",
      attributes: { unit_of_measurement: "kJ" },
    },
    "sensor.battery_remaining": {
      state: "226771.2",
      attributes: { unit_of_measurement: "kJ" },
    },
    "sensor.battery_voltage": {
      state: "770.2",
      attributes: { unit_of_measurement: "V" },
    },
    "sensor.battery_temp_min": {
      state: "28",
      attributes: { unit_of_measurement: "°C" },
    },
    "sensor.battery_temp_max": {
      state: "33",
      attributes: { unit_of_measurement: "°C" },
    },
    "sensor.battery_water_temp": {
      state: "35",
      attributes: { unit_of_measurement: "°C" },
    },
    "binary_sensor.battery_heating": { state: "off", attributes: {} },
    "sensor.battery_heater_power": {
      state: "0",
      attributes: { unit_of_measurement: "W" },
    },
    "binary_sensor.battery_precondition": { state: "off", attributes: {} },
    "binary_sensor.battery_winter_mode": { state: "on", attributes: {} },
    "sensor.battery_12v_level": {
      state: "100",
      attributes: { unit_of_measurement: "%" },
    },
    "binary_sensor.battery_12v_fault": { state: "off", attributes: {} },
    "sensor.charge_duration": { state: "1:45", attributes: {} },
    "sensor.average_consumption": {
      state: "17.2",
      attributes: { unit_of_measurement: "kWh/100 km" },
    },
    "sensor.consumption_90d": {
      state: "18.1",
      attributes: { unit_of_measurement: "kWh/100 km" },
    },
    "sensor.daily_driving_stats": {
      state: "2",
      attributes: {
        "2026-08-05": {
          distance: 10.5,
          total_consumed: 1235,
          regenerated_energy: 721,
          climate_consumption: 89,
        },
        "2026-08-06": {
          distance: 46.3,
          total_consumed: 6856,
          regenerated_energy: 2623,
          climate_consumption: 807,
        },
        unit_of_measurement: "d",
      },
    },
    "sensor.today_driving_stats": {
      state: "2026-08-06",
      attributes: {
        today_date: "2026-08-06",
        distance: 46.3,
        total_consumed: 6856,
        regenerated_energy: 2623,
        climate_consumption: 807,
      },
    },
    "sensor.total_regeneration": {
      state: "293022",
      attributes: { unit_of_measurement: "Wh" },
    },
    "sensor.drive_mode": { state: "Normal", attributes: {} },
    "binary_sensor.engine": { state: "off", attributes: {} },
    "binary_sensor.ignition": { state: "off", attributes: {} },
    "sensor.odometer": {
      state: "112.4",
      attributes: { unit_of_measurement: "km" },
    },
    "device_tracker.location": {
      state: "Work",
      attributes: { latitude: 50.9, longitude: 3.5 },
    },
    "sensor.ev_battery": {
      state: "75",
      attributes: { unit_of_measurement: "%" },
    },
    "binary_sensor.smart_key_warning": { state: "on", attributes: {} },
    "button.vent_windows": { state: "unknown", attributes: {} },
    "switch.rear_window_heater": { state: "on", attributes: {} },
    "switch.driver_seat_heating": { state: "off", attributes: {} },
    "button.rear_left_seat_heating": { state: "unknown", attributes: {} },
    "select.passenger_seat_heating": {
      state: "high",
      attributes: { options: ["off", "low", "medium", "high"] },
    },
    "binary_sensor.driver_seat_ventilation": { state: "on", attributes: {} },
    "input_boolean.climate_schedule": { state: "on", attributes: {} },
    "input_datetime.climate_departure_time": {
      state: "07:30:00",
      attributes: { has_date: false, has_time: true },
    },
    "binary_sensor.front_left_window": { state: "off", attributes: {} },
    "binary_sensor.front_right_window": { state: "off", attributes: {} },
    "binary_sensor.rear_left_window": { state: "on", attributes: {} },
    "binary_sensor.rear_right_window": { state: "off", attributes: {} },
    "cover.front_left_window": {
      state: "closed",
      attributes: { current_position: 0 },
    },
    "cover.front_right_window": {
      state: "closed",
      attributes: { current_position: 0 },
    },
    "cover.rear_left_window": {
      state: "open",
      attributes: { current_position: 25 },
    },
    "cover.rear_right_window": {
      state: "closed",
      attributes: { current_position: 0 },
    },
  });

  const batteryDiagnostics = card._renderBatteryTab({});
  assert.match(batteryDiagnostics, /100 %/);
  assert.match(batteryDiagnostics, /63 kWh/);
  assert.match(batteryDiagnostics, /84 kWh/);
  assert.match(batteryDiagnostics, /770\.2 V/);
  assert.match(batteryDiagnostics, /28 °C/);
  assert.match(batteryDiagnostics, /33 °C/);
  assert.match(batteryDiagnostics, /1:45/);
  assert.match(card._renderEnergyTab({}), /17\.2/);
  assert.match(card._renderEnergyTab({}), /18\.1/);
  const drivingEnergy = card._renderEnergyTab({});
  assert.match(drivingEnergy, /Daily driving history/);
  assert.match(drivingEnergy, /46\.3/);
  assert.match(drivingEnergy, /14\.8/);
  assert.match(drivingEnergy, /293 kWh/);
  assert.equal((drivingEnergy.match(/class="driving-day"/g) || []).length, 2);
  const historyState = (entityId, state, timestamp, attributes = {}) => ({
    entity_id: entityId,
    state,
    attributes,
    last_changed: timestamp,
    last_updated: timestamp,
  });
  const recorderHistory = [
    [
      historyState("binary_sensor.engine", "off", "2026-08-06T08:00:00+02:00"),
      historyState("binary_sensor.engine", "on", "2026-08-06T08:10:00+02:00"),
      historyState("binary_sensor.engine", "off", "2026-08-06T08:40:00+02:00"),
    ],
    [
      historyState("sensor.odometer", "100", "2026-08-06T08:00:00+02:00", {
        unit_of_measurement: "km",
      }),
      historyState("sensor.odometer", "100.5", "2026-08-06T08:10:00+02:00", {
        unit_of_measurement: "km",
      }),
      historyState("sensor.odometer", "112.4", "2026-08-06T08:40:00+02:00", {
        unit_of_measurement: "km",
      }),
    ],
    [
      historyState(
        "device_tracker.location",
        "Home",
        "2026-08-06T08:00:00+02:00",
        { latitude: 50.8, longitude: 3.4 },
      ),
      historyState(
        "device_tracker.location",
        "not_home",
        "2026-08-06T08:10:00+02:00",
        { latitude: 50.82, longitude: 3.42 },
      ),
      historyState(
        "device_tracker.location",
        "Work",
        "2026-08-06T08:40:00+02:00",
        { latitude: 50.9, longitude: 3.5 },
      ),
    ],
    [
      historyState("sensor.ev_battery", "80", "2026-08-06T08:00:00+02:00", {
        unit_of_measurement: "%",
      }),
      historyState("sensor.ev_battery", "79", "2026-08-06T08:10:00+02:00", {
        unit_of_measurement: "%",
      }),
      historyState("sensor.ev_battery", "75", "2026-08-06T08:40:00+02:00", {
        unit_of_measurement: "%",
      }),
    ],
    [
      historyState(
        "sensor.battery_remaining",
        "288000",
        "2026-08-06T08:00:00+02:00",
        { unit_of_measurement: "kJ" },
      ),
      historyState(
        "sensor.battery_remaining",
        "284400",
        "2026-08-06T08:10:00+02:00",
        { unit_of_measurement: "kJ" },
      ),
      historyState(
        "sensor.battery_remaining",
        "270000",
        "2026-08-06T08:40:00+02:00",
        { unit_of_measurement: "kJ" },
      ),
    ],
  ];
  const reconstructedTrips = card._deriveTripHistory(recorderHistory);
  assert.equal(reconstructedTrips.length, 1);
  assert.equal(reconstructedTrips[0].origin, "Home");
  assert.equal(reconstructedTrips[0].destination, "Work");
  assert.equal(reconstructedTrips[0].durationMinutes, 30);
  assert.equal(reconstructedTrips[0].distance.toFixed(1), "12.4");
  assert.equal(reconstructedTrips[0].usedEnergy.toFixed(1), "5.0");
  assert.equal(reconstructedTrips[0].consumption.toFixed(1), "40.3");
  card._tripHistory = reconstructedTrips;
  card._tripHistoryState = "ready";
  const drivingLocation = card._renderLocationTab({
    lastUpdated: "now",
    mapTiles: null,
    markerImage: "",
  });
  assert.match(drivingLocation, /Today&apos;s driving/);
  assert.match(drivingLocation, /Normal/);
  assert.match(drivingLocation, /Daily driving data/);
  assert.match(
    drivingLocation,
    /Official Kia totals for the latest 2 driving days/,
  );
  assert.match(drivingLocation, /Trip history/);
  assert.match(drivingLocation, /Home/);
  assert.match(drivingLocation, /Work/);
  assert.match(drivingLocation, /12\.4 km/);
  assert.match(drivingLocation, /40\.3 kWh\/100 km/);
  assert.doesNotMatch(drivingLocation, /Ready for future trip data/);
  let historyRequest = null;
  card._tripHistory = [];
  card._tripHistoryState = "idle";
  card._tripHistoryRequestKey = "";
  card._hass.callApi = async (method, path) => {
    historyRequest = { method, path };
    return recorderHistory;
  };
  await card._loadTripHistory();
  assert.equal(historyRequest.method, "GET");
  assert.match(historyRequest.path, /^history\/period\//);
  assert.match(historyRequest.path, /binary_sensor\.engine/);
  assert.equal(card._tripHistoryState, "ready");
  assert.equal(card._tripHistory.length, 1);
  const calendarEvents = [
    {
      summary: "Home → Work · 12.4 km",
      start: { dateTime: "2026-08-06T08:10:00+02:00" },
      end: { dateTime: "2026-08-06T08:40:00+02:00" },
      location: "Work",
      description: JSON.stringify({
        schema: "kia_trip_v1",
        trip_id: "kia-1785996600",
        origin: "Home",
        destination: "Work",
        distance_km: 12.4,
        duration_minutes: 30,
        soc_start: 80,
        soc_end: 75,
        energy_kwh: 5,
        consumption_kwh_100km: 40.3,
        average_speed_kmh: 24.8,
      }),
    },
    {
      summary: "Unrelated calendar event",
      start: "2026-08-06T12:00:00+02:00",
      end: "2026-08-06T13:00:00+02:00",
      description: "Lunch",
    },
  ];
  card._config.entities.trip_calendar = "calendar.vehicle_trips";
  card._hass.states["calendar.vehicle_trips"] = {
    state: "off",
    attributes: {},
    last_updated: "2026-08-06T09:00:00+02:00",
  };
  card._tripViewMode = "day";
  card._tripSelectedDate = "2026-08-06";
  card._tripCalendarMonth = "2026-08";
  card._tripCalendarState = "idle";
  card._tripCalendarRequestKey = "";
  let calendarRequest = null;
  card._hass.callApi = async (method, path) => {
    calendarRequest = { method, path };
    return calendarEvents;
  };
  await card._loadTripCalendar();
  assert.equal(calendarRequest.method, "GET");
  assert.match(calendarRequest.path, /^calendars\/calendar\.vehicle_trips\?/);
  assert.equal(card._tripCalendarState, "ready");
  assert.equal(card._calendarTrips.length, 1);
  assert.equal(card._calendarTrips[0].id, "kia-1785996600");
  assert.equal(card._calendarTrips[0].distance, 12.4);
  const calendarDayView = card._renderLocationTripHistory();
  assert.match(calendarDayView, /Persistent calendar/);
  assert.match(calendarDayView, /Stored trip history/);
  assert.match(calendarDayView, /data-trip-view="day"/);
  assert.match(calendarDayView, /data-trip-date="2026-08-06"/);
  assert.match(calendarDayView, /Home/);
  assert.match(calendarDayView, /Work/);
  assert.doesNotMatch(calendarDayView, /<span>Recorder analysis<\/span>/);
  card._tripViewMode = "overview";
  const calendarOverview = card._renderLocationTripHistory();
  assert.match(calendarOverview, /All calendar history/);
  assert.match(calendarOverview, /Stored trips/);
  assert.match(calendarOverview, /40\.3 kWh\/100 km/);
  const fallbackCard = new Card();
  fallbackCard._config = { entities: {} };
  fallbackCard._hass = { locale: { language: "en" }, states: {} };
  const fallbackLocation = fallbackCard._renderLocationTab({
    lastUpdated: "--",
    mapTiles: null,
    markerImage: "",
  });
  assert.match(fallbackLocation, /Ready for future trip data/);
  assert.doesNotMatch(
    fallbackCard._renderEnergyTab({}),
    /Daily driving history/,
  );
  const vehicleControls = card._renderVehicleTab();
  assert.match(vehicleControls, /Smart key battery/);
  assert.match(vehicleControls, /Replace battery/);
  assert.doesNotMatch(vehicleControls, /Window controls/);
  assert.equal(
    (vehicleControls.match(/class="vehicle-window-tile/g) || []).length,
    4,
  );
  assert.match(
    vehicleControls,
    /data-entity-action="front_left_window_open" data-service="open"/,
  );
  assert.match(
    vehicleControls,
    /data-entity-action="rear_right_window_close" data-service="close"/,
  );
  await card._callEntity("front_left_window_open", "open", "");
  assert.deepEqual(calls.shift(), {
    domain: "cover",
    service: "open_cover",
    data: { entity_id: "cover.front_left_window" },
  });
  await card._callEntity("front_left_window_close", "close", "");
  assert.deepEqual(calls.shift(), {
    domain: "cover",
    service: "close_cover",
    data: { entity_id: "cover.front_left_window" },
  });
  const climateControls = card._renderClimateTab();
  assert.match(climateControls, /data-action="start_climate"/);
  assert.match(climateControls, /data-entity-action="vent_windows"/);
  assert.match(climateControls, /Rear window heat/);
  assert.match(climateControls, /Driver seat heating/);
  assert.match(climateControls, /Passenger seat heating/);
  assert.match(climateControls, /Rear left seat heating/);
  assert.match(climateControls, /<strong>Ready<\/strong>/);
  assert.match(climateControls, /data-entity-action="rear_left_seat_heating"/);
  assert.match(climateControls, /Driver seat ventilation/);
  assert.match(climateControls, /Climate schedule/);
  assert.match(climateControls, /07:30:00/);
  assert.match(
    climateControls,
    /data-entity-action="rear_window_heater" data-service="turn_off"/,
  );
  assert.match(
    climateControls,
    /data-entity-action="driver_seat_heating" data-service="turn_on"/,
  );
  assert.match(climateControls, /data-info="passenger_seat_heating"/);
  await card._callEntity(
    "driver_seat_heating",
    "turn_on",
    "Change climate comfort setting?",
  );
  assert.deepEqual(calls.shift(), {
    domain: "switch",
    service: "turn_on",
    data: { entity_id: "switch.driver_seat_heating" },
  });
  Object.assign(card._config.entities, {
    rear_window_heater: "binary_sensor.back_window_heater",
    driver_seat: "sensor.driver_seat",
    passenger_seat: "sensor.passenger_seat",
    rear_left_seat: "sensor.rear_left_seat",
    rear_right_seat: "sensor.rear_right_seat",
    climate_schedule_1: "switch.departure_schedule_1",
    climate_departure_time_1: "sensor.departure_time_1",
    climate_departure_days_1: "sensor.departure_days_1",
    climate_schedule_2: "switch.departure_schedule_2",
    climate_departure_time_2: "sensor.departure_time_2",
  });
  Object.assign(card._hass.states, {
    "binary_sensor.back_window_heater": { state: "off", attributes: {} },
    "sensor.driver_seat": { state: "Off", attributes: {} },
    "sensor.passenger_seat": { state: "Heating 2", attributes: {} },
    "sensor.rear_left_seat": { state: "Off", attributes: {} },
    "sensor.rear_right_seat": { state: "Ventilation 1", attributes: {} },
    "switch.departure_schedule_1": { state: "on", attributes: {} },
    "sensor.departure_time_1": { state: "07:00:00", attributes: {} },
    "sensor.departure_days_1": { state: "1, 2, 3, 4, 5", attributes: {} },
    "switch.departure_schedule_2": { state: "off", attributes: {} },
    "sensor.departure_time_2": { state: "12:00:00", attributes: {} },
  });
  const verifiedClimateControls = card._renderClimateTab();
  assert.match(verifiedClimateControls, /Driver seat/);
  assert.match(verifiedClimateControls, /Passenger seat/);
  assert.match(verifiedClimateControls, /Heating 2/);
  assert.match(verifiedClimateControls, /Ventilation 1/);
  assert.doesNotMatch(verifiedClimateControls, /Driver seat heating/);
  assert.doesNotMatch(verifiedClimateControls, /Driver seat ventilation/);
  assert.match(verifiedClimateControls, /data-info="rear_window_heater"/);
  assert.doesNotMatch(
    verifiedClimateControls,
    /data-entity-action="rear_window_heater"/,
  );
  assert.match(verifiedClimateControls, /Departure schedule 1/);
  assert.match(verifiedClimateControls, /Departure schedule 2/);
  assert.match(verifiedClimateControls, /07:00:00/);
  assert.match(verifiedClimateControls, /12:00:00/);
  assert.match(verifiedClimateControls, /1, 2, 3, 4, 5/);
  card._hass.locale.language = "nl";
  card._activeTab = "climate";
  card._render();
  const dutchClimateControls = card.shadowRoot.innerHTML;
  assert.match(dutchClimateControls, /Achterruitverwarming/);
  assert.match(dutchClimateControls, /Bestuurderszetel/);
  assert.match(dutchClimateControls, /Klimaatschema/);
  assert.match(dutchClimateControls, /Volgend vertrek/);
  assert.match(dutchClimateControls, /Vertrekprogramma 1/);
  assert.match(dutchClimateControls, /Vertrektijd 2/);
  card._activeTab = "energy";
  card._render();
  const dutchDrivingAnalytics = card.shadowRoot.innerHTML;
  assert.match(dutchDrivingAnalytics, /Dagelijkse rijgeschiedenis/);
  assert.match(dutchDrivingAnalytics, /Afstand vandaag/);
  assert.match(dutchDrivingAnalytics, /Teruggewonnen energie/);
  assert.match(dutchDrivingAnalytics, /Totale regeneratie/);
  card._activeTab = "location";
  card._render();
  const dutchTripHistory = card.shadowRoot.innerHTML;
  assert.match(dutchTripHistory, /Dagelijkse rijgegevens/);
  assert.match(dutchTripHistory, /Opgeslagen ritgeschiedenis/);
  assert.match(dutchTripHistory, /Permanente kalender/);
  assert.match(dutchTripHistory, /Volledige kalendergeschiedenis/);
  assert.match(dutchTripHistory, /Gemiddelde snelheid/);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
