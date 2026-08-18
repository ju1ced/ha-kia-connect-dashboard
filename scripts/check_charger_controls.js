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
  vehicle_controls: true,
  entities: {
    charger_mode: "select.home_charger_mode",
    charger_pause: "button.home_charger_pause",
    charger_resume: "button.home_charger_resume",
    charger_start: "button.home_charger_start",
    charger_stop: "button.home_charger_stop",
    charger_status: "sensor.home_charger_status",
    charger_session_energy: "sensor.home_charger_session_energy",
    charger_total_energy: "sensor.home_charger_total_energy",
    charger_energy_today: "sensor.home_charger_energy_today",
    charger_energy_month: "sensor.home_charger_energy_month",
    charger_energy_price: "sensor.home_energy_price",
    vin: "sensor.vehicle_vin",
    last_updated: "sensor.vehicle_last_updated",
    refresh: "button.vehicle_refresh",
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
    "button.vehicle_refresh": { state: "unknown", attributes: {} },
    "sensor.home_charger_status": { state: "suspended_evse", attributes: {} },
    "sensor.home_charger_session_energy": {
      state: "10",
      attributes: { unit_of_measurement: "kWh" },
    },
    "sensor.home_charger_total_energy": {
      state: "12276.83",
      attributes: {
        unit_of_measurement: "kWh",
        device_class: "energy",
        state_class: "total_increasing",
      },
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
    "sensor.vehicle_last_updated": {
      state: new Date().toISOString(),
      attributes: { device_class: "timestamp" },
    },
    "sensor.home_charger_energy_today": {
      state: "4.2",
      attributes: { unit_of_measurement: "kWh" },
    },
  },
  callService: async (domain, service, data) => {
    calls.push({ domain, service, data });
    if (domain === "lock" && card._hass.states[data.entity_id]) {
      card._hass.states[data.entity_id].state =
        service === "lock" ? "locked" : "unlocked";
    }
  },
  callApi: async (_method, path) => {
    const entityId = path.replace(/^states\//, "");
    const entity = card._hass.states[entityId];
    return entity ? { entity_id: entityId, ...entity } : undefined;
  },
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
      "Langetermijnstatistieken",
      "Energiegeschiedenis",
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
  assert.match(card.shadowRoot.innerHTML, />Gegevens actueel</);
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
  assert.match(settings, /14 of 14 available/);
  assert.match(settings, /Connection health/);
  assert.match(settings, /Vehicle connection/);
  assert.match(settings, /Data current/);
  assert.match(settings, /Vehicle data updated within the expected interval/);
  assert.match(settings, /Dashboard version/);
  assert.match(settings, /2.17.7/);
  assert.equal(window.customCards[0].version, "2.17.7");

  card._hass.states["sensor.vehicle_last_updated"].state = new Date(
    Date.now() - 4 * 60 * 60 * 1000,
  ).toISOString();
  const staleSettings = card._renderSettingsTab();
  assert.match(staleSettings, /Data stale/);
  assert.match(staleSettings, /Check Kia Connect authentication/);
  card._render();
  assert.match(card.shadowRoot.innerHTML, /class="chip critical"/);
  assert.match(card.shadowRoot.innerHTML, />Data stale</);
  card._hass.states["sensor.vehicle_last_updated"].state =
    new Date().toISOString();

  card._config.entities.charger_online = "binary_sensor.home_charger_online";
  card._hass.states["binary_sensor.home_charger_online"] = {
    state: "on",
    attributes: {},
  };
  assert.match(
    card._renderSettingsTab(),
    /Home charger reports an active connection/,
  );
  card._hass.states["binary_sensor.home_charger_online"].state = "off";
  const offlineSettings = card._renderSettingsTab();
  assert.match(offlineSettings, /Home charger reports that it is offline/);
  assert.match(offlineSettings, /class="settings-connection critical"/);
  card._hass.states["binary_sensor.home_charger_online"].state = "on";

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
  assert.match(vehicle, /data-action="lock_vehicle" disabled/);
  assert.match(vehicle, /data-action="unlock_vehicle"/);
  assert.match(vehicle, /verify the returned lock state/);

  card._hass.states["lock.vehicle"].state = "unlocked";
  let requestedVehicleRefresh = "";
  let requestedVehicleRefreshTimeout = 0;
  const refreshAfterAction = card._refreshVehicleStateAfterAction.bind(card);
  card._refreshVehicleStateAfterAction = async (expectedState, timeout) => {
    requestedVehicleRefresh = expectedState;
    requestedVehicleRefreshTimeout = timeout;
    return false;
  };
  await card._setVehicleLock(true);
  assert.deepEqual(calls.shift(), {
    domain: "lock",
    service: "lock",
    data: { entity_id: "lock.vehicle" },
  });
  assert.equal(requestedVehicleRefresh, "locked");
  assert.equal(requestedVehicleRefreshTimeout, 90000);
  assert.equal(card._notice, "Vehicle locked successfully");
  await card._setVehicleLock(false);
  assert.deepEqual(calls.shift(), {
    domain: "lock",
    service: "unlock",
    data: { entity_id: "lock.vehicle" },
  });
  assert.equal(requestedVehicleRefresh, "unlocked");
  assert.equal(card._notice, "Vehicle unlocked successfully");
  card._refreshVehicleStateAfterAction = refreshAfterAction;

  card._hass.states["lock.vehicle"].state = "unlocked";
  card._config.vehicle_action_refresh_delay = 0;
  await card._refreshVehicleStateAfterAction("locked");
  assert.deepEqual(calls.shift(), {
    domain: "button",
    service: "press",
    data: { entity_id: "button.vehicle_refresh" },
  });
  assert.equal(
    card._notice,
    "Vehicle status refresh requested; waiting for the updated lock state.",
  );
  card._hass.states["lock.vehicle"].state = "locked";
  const callsBeforeCurrentVehicleState = calls.length;
  await card._refreshVehicleStateAfterAction("locked");
  assert.equal(calls.length, callsBeforeCurrentVehicleState);

  card._hass.states["lock.vehicle"] = {
    state: "locked",
    last_updated: "2026-08-12T10:00:00Z",
    attributes: {},
  };
  const callApi = card._hass.callApi;
  card._hass.callApi = async () => ({
    entity_id: "lock.vehicle",
    state: "unlocked",
    last_updated: "2026-08-12T10:01:00Z",
    attributes: {},
  });
  const refreshedLockState =
    await card._readEntityStateFromHomeAssistant("door_lock");
  assert.equal(refreshedLockState.state, "unlocked");
  assert.equal(card._obj("door_lock").state, "unlocked");
  card.hass = {
    ...card._hass,
    states: {
      ...card._hass.states,
      "lock.vehicle": {
        state: "unlocked",
        last_updated: "2026-08-12T10:01:01Z",
        attributes: {},
      },
    },
    callApi,
  };
  assert.equal(card._entityStateOverrides.has("lock.vehicle"), false);
  assert.equal(card._obj("door_lock").state, "unlocked");

  card._config.vehicle_controls = false;
  const readOnlyVehicle = card._renderVehicleTab();
  assert.match(readOnlyVehicle, /data-action="lock_vehicle" disabled/);
  assert.match(readOnlyVehicle, /data-action="unlock_vehicle" disabled/);
  assert.match(readOnlyVehicle, /Set vehicle_controls: true/);
  card._config.vehicle_controls = true;
  card._hass.states["lock.vehicle"].state = "unavailable";
  const unavailableLockVehicle = card._renderVehicleTab();
  assert.match(unavailableLockVehicle, /data-action="lock_vehicle" disabled/);
  assert.match(unavailableLockVehicle, /data-action="unlock_vehicle" disabled/);
  const callsBeforeUnavailableLock = calls.length;
  await card._setVehicleLock(true);
  assert.equal(calls.length, callsBeforeUnavailableLock);
  assert.equal(
    card._notice,
    "Vehicle lock status is unavailable; command not sent.",
  );
  card._hass.states["lock.vehicle"].state = "locked";

  card._config.entities.dashboard_version = "update.dashboard";
  card._hass.states["update.dashboard"] = {
    state: "off",
    attributes: { installed_version: "2.3.0" },
  };
  assert.match(card._renderSettingsTab(), /2.3.0/);
  delete card._config.entities.dashboard_version;

  const energy = card._renderEnergyTab({});
  assert.match(energy, /class="energy-section vehicle-energy card"/);
  assert.match(energy, /class="energy-section charger-flow card"/);
  const energyStyles = card._energyTabStyles();
  assert.match(
    energyStyles,
    /\.vehicle-energy,\.charger-flow\{grid-column:1\/-1\}/,
  );
  assert.match(
    energyStyles,
    /\.vehicle-energy \.energy-stats,\.charger-flow \.energy-stats\.compact\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)\}/,
  );
  assert.match(energy, /Paused by charger/);
  assert.match(energy, /Today/);
  assert.match(energy, /Energy price/);
  assert.match(energy, /0.2773/);
  assert.match(energy, /EUR 2.77/);
  assert.match(energy, /27\.73 <em>EUR/);
  assert.match(energy, /from mapped energy price/);
  assert.doesNotMatch(energy, /This week/);

  let statisticsRequest = null;
  card._hass.callWS = async (request) => {
    statisticsRequest = request;
    return {
      "sensor.home_charger_total_energy": [
        {
          start: new Date("2026-08-08T00:00:00+02:00").getTime(),
          change: 0.05,
          state: 12270.3,
        },
        {
          start: new Date("2026-08-09T00:00:00+02:00").getTime(),
          change: 6.31,
          state: 12276.61,
        },
        {
          start: new Date("2026-08-10T00:00:00+02:00").getTime(),
          change: 0.05,
          state: 12276.66,
        },
        {
          start: new Date("2026-08-11T00:00:00+02:00").getTime(),
          change: 14.34,
          state: 12291,
        },
      ],
    };
  };
  await card._loadChargerHistory(true);
  assert.equal(statisticsRequest.type, "recorder/statistics_during_period");
  assert.deepEqual(statisticsRequest.statistic_ids, [
    "sensor.home_charger_total_energy",
  ]);
  assert.equal(statisticsRequest.period, "day");
  assert.equal(card._chargerHistoryState, "ready");
  assert.equal(card._chargerHistory.length, 4);
  const longTermHistory = card._renderChargerHistoryStatistics(0.2773);
  assert.match(longTermHistory, /Energy used/);
  assert.match(longTermHistory, /20\.8 kWh/);
  assert.match(longTermHistory, /Charging days/);
  assert.match(longTermHistory, />2</);
  assert.match(longTermHistory, /Average per charging day/);
  assert.match(longTermHistory, /10\.3 kWh/);
  assert.match(longTermHistory, /EUR 5\.75/);
  assert.match(longTermHistory, /Show daily charging data/);
  assert.doesNotMatch(longTermHistory, /08 aug.*0\.05 kWh/);
  await card._setChargerHistoryPeriod(30);
  assert.equal(card._chargerHistoryPeriod, 30);
  assert.equal(statisticsRequest.period, "day");

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
  assert.match(drivingLocation, /Show daily details/);
  assert.match(drivingLocation, /aria-expanded="false"/);
  assert.match(drivingLocation, /id="location-daily-details"[^>]*hidden/);
  card._dailyHistoryExpanded = true;
  const expandedDailyHistory = card._renderLocationDailyHistory();
  assert.match(expandedDailyHistory, /Hide daily details/);
  assert.match(expandedDailyHistory, /aria-expanded="true"/);
  assert.doesNotMatch(
    expandedDailyHistory,
    /id="location-daily-details"[^>]*hidden/,
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
        schema: "kia_trip_v2",
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
        origin_coordinates: "50.83683,3.41416",
        destination_coordinates: "51.07469,3.73395",
        route_source: "phone-secondary",
        route_points: [
          "50.83683,3.41416",
          "50.98780,3.70164",
          "51.07469,3.73395",
        ],
        odometer_start: 6329,
        odometer_end: 6341.4,
        drive_energy_kwh: 4.4,
        climate_energy_kwh: 0.2,
        electronics_energy_kwh: 0.1,
        battery_care_energy_kwh: 0,
        regenerated_energy_kwh: 1.3,
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
  let calendarRequestCount = 0;
  card._hass.callApi = async (method, path) => {
    calendarRequestCount += 1;
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
  assert.equal(card._calendarTrips[0].endOdometer, 6341.4);
  assert.equal(card._calendarTrips[0].routePoints.length, 3);
  assert.equal(card._calendarTrips[0].routeSource, "phone-secondary");
  assert.equal(card._calendarTrips[0].regeneratedEnergy, 1.3);
  const legacyTrip = card._calendarTrip({
    ...calendarEvents[0],
    description: JSON.stringify({
      schema: "kia_trip_v1",
      trip_id: "legacy-trip",
      origin_coordinates: "50.8,3.4",
      destination_coordinates: "50.9,3.5",
      distance_km: 10,
      energy_kwh: 2,
    }),
  });
  assert.equal(legacyTrip.id, "legacy-trip");
  assert.equal(legacyTrip.routePoints.length, 2);
  const calendarDayView = card._renderLocationTripHistory();
  assert.match(calendarDayView, /Persistent calendar/);
  assert.match(calendarDayView, /Stored trip history/);
  assert.match(calendarDayView, /data-trip-view="day"/);
  assert.match(calendarDayView, /data-trip-date="2026-08-06"/);
  assert.match(calendarDayView, /Home/);
  assert.match(calendarDayView, /Work/);
  assert.match(calendarDayView, /Approximate routes/);
  assert.match(calendarDayView, /trip-calendar-layout/);
  assert.match(calendarDayView, /Phone-assisted route points/);
  assert.match(calendarDayView, /OpenStreetMap/);
  assert.match(calendarDayView, /location-trip-table/);
  assert.match(calendarDayView, /6341\.4 km/);
  assert.match(calendarDayView, /1\.30 kWh/);
  assert.doesNotMatch(calendarDayView, /<span>Recorder analysis<\/span>/);
  let routeRequest = "";
  global.fetch = async (url) => {
    routeRequest = url;
    return {
      ok: true,
      json: async () => ({
        routes: [
          {
            geometry: {
              coordinates: [
                [3.41416, 50.83683],
                [3.55, 50.9],
                [3.73395, 51.07469],
              ],
            },
          },
        ],
      }),
    };
  };
  card._config.trip_route_matching = true;
  await card._loadMatchedTripRoutes(card._calendarTrips);
  assert.match(
    routeRequest,
    /^https:\/\/router\.project-osrm\.org\/route\/v1\/driving\//,
  );
  assert.match(routeRequest, /3\.414160,50\.836830/);
  const matchedCalendarDayView = card._renderLocationTripHistory();
  assert.match(matchedCalendarDayView, /Road-matched phone route/);
  assert.match(matchedCalendarDayView, /Road-matched route/);
  assert.match(matchedCalendarDayView, /class="trip-route-casing"/);
  assert.match(matchedCalendarDayView, /class="trip-route-line route-0" d="M/);
  assert.match(
    matchedCalendarDayView,
    /class="map-tiles trip-route-tiles trip-route-html-tiles"/,
  );
  assert.match(matchedCalendarDayView, /class="map trip-route-map-canvas"/);
  assert.match(matchedCalendarDayView, /class="trip-route-drag-layer"/);
  assert.match(matchedCalendarDayView, /class="trip-route-map-content"/);
  assert.match(
    matchedCalendarDayView,
    /<img src="https:\/\/tile\.openstreetmap\.org\//,
  );
  assert.doesNotMatch(matchedCalendarDayView, /<image /);
  assert.doesNotMatch(matchedCalendarDayView, /class="trip-route-tint"/);
  assert.match(card._styles(), /\.map:before/);
  assert.match(matchedCalendarDayView, /class="trip-route-overlay"/);
  assert.match(matchedCalendarDayView, /vector-effect="non-scaling-stroke"/);
  assert.doesNotMatch(matchedCalendarDayView, /<polyline/);
  assert.match(matchedCalendarDayView, /data-trip-route-zoom="out"/);
  assert.match(
    matchedCalendarDayView,
    /data-trip-route-zoom="reset"[^>]*disabled/,
  );
  assert.match(matchedCalendarDayView, /data-trip-route-zoom="in"/);
  assert.match(matchedCalendarDayView, /data-trip-route-pan/);
  assert.match(matchedCalendarDayView, /aria-label="Drag map to move"/);
  assert.equal(card._tripRouteZoomOffset(), 0);
  card._setTripRouteZoom("in");
  assert.equal(card._tripRouteZoomOffset(), 1);
  const zoomedCalendarDayView = card._renderLocationTripHistory();
  assert.doesNotMatch(
    zoomedCalendarDayView,
    /data-trip-route-zoom="reset"[^>]*disabled/,
  );
  card._tripSelectedDate = "2026-08-07";
  assert.equal(
    card._tripRouteZoomOffset(),
    0,
    "route zoom should be stored per selected day",
  );
  card._tripSelectedDate = "2026-08-06";
  assert.equal(card._tripRouteZoomOffset(), 1);
  assert.deepEqual(card._tripRoutePanOffset(), { x: 0, y: 0 });
  card._setTripRoutePan(120, -60, false);
  assert.deepEqual(card._tripRoutePanOffset(), { x: 120, y: -60 });
  const pannedCalendarDayView = card._renderLocationTripHistory();
  assert.doesNotMatch(
    pannedCalendarDayView,
    /data-trip-route-zoom="reset"[^>]*disabled/,
  );
  card._tripSelectedDate = "2026-08-07";
  assert.deepEqual(
    card._tripRoutePanOffset(),
    { x: 0, y: 0 },
    "route position should be stored per selected day",
  );
  card._tripSelectedDate = "2026-08-06";
  card._setTripRouteZoom("reset");
  assert.equal(card._tripRouteZoomOffset(), 0);
  assert.deepEqual(card._tripRoutePanOffset(), { x: 0, y: 0 });
  delete global.fetch;
  card._tripCalendarRequestKey = "";
  await card._loadTripCalendar();
  assert.equal(
    calendarRequestCount,
    1,
    "the visible month should be served from the calendar cache",
  );
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
  assert.match(
    fallbackCard._renderEnergyTab({}),
    /Map charger_total_energy to load permanent Home Assistant energy statistics/,
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
  assert.match(dutchTripHistory, /Verberg dagelijkse details/);
  assert.match(dutchTripHistory, /Opgeslagen ritgeschiedenis/);
  assert.match(dutchTripHistory, /Permanente kalender/);
  assert.match(dutchTripHistory, /Volledige kalendergeschiedenis/);
  assert.match(dutchTripHistory, /Gemiddelde snelheid/);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
