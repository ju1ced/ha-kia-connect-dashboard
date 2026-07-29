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

  const settings = card._renderSettingsTab();
  assert.match(settings, /11 of 11 available/);
  assert.match(settings, /Dashboard version/);
  assert.match(settings, /2.4.0/);
  assert.equal(window.customCards[0].version, "2.4.0");

  const vehicle = card._renderVehicleTab();
  assert.match(vehicle, /KNAC481A1T5253159/);
  assert.match(vehicle, /data-info="vin"/);

  card._config.entities.dashboard_version = "update.dashboard";
  card._hass.states["update.dashboard"] = { state: "off", attributes: { installed_version: "2.3.0" } };
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
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
