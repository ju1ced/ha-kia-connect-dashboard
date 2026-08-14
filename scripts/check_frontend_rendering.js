const assert = require("node:assert/strict");

let KiaDashboardCard;
global.document = {
  scrollingElement: {
    scrollHeight: 2000,
    clientHeight: 800,
    scrollTop: 640,
    scrollLeft: 0,
  },
};
global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {};
  }

  getRootNode() {
    return { host: null };
  }
};
global.customElements = {
  define(_name, constructor) {
    KiaDashboardCard = constructor;
  },
};
global.window = { customCards: [] };

require("../ha-kia-connect-dashboard.js");

const card = new KiaDashboardCard();
card._config = {
  entities: {
    battery_level: "sensor.ev_battery",
    trip_person_tracker: "device_tracker.phone",
  },
};

const battery = { state: "80" };
const oldHass = {
  locale: { language: "nl" },
  states: {
    "sensor.ev_battery": battery,
    "device_tracker.phone": { state: "home", attributes: { latitude: 50.8 } },
  },
};
const trackerOnlyUpdate = {
  locale: { language: "nl" },
  states: {
    "sensor.ev_battery": battery,
    "device_tracker.phone": {
      state: "not_home",
      attributes: { latitude: 50.9 },
    },
  },
};
assert.equal(card._shouldRenderForHass(oldHass, trackerOnlyUpdate), false);

const batteryUpdate = {
  locale: { language: "nl" },
  states: {
    "sensor.ev_battery": { state: "79" },
    "device_tracker.phone": trackerOnlyUpdate.states["device_tracker.phone"],
  },
};
assert.equal(card._shouldRenderForHass(oldHass, batteryUpdate), true);
assert.equal(
  card._shouldRenderForHass(oldHass, {
    ...oldHass,
    locale: { language: "en" },
  }),
  true,
);

const scrollParent = {
  scrollHeight: 1600,
  clientHeight: 600,
  scrollTop: 420,
  scrollLeft: 12,
  parentElement: null,
  getRootNode() {
    return { host: null };
  },
};
card.parentElement = scrollParent;
const positions = card._captureScrollPositions();
global.document.scrollingElement.scrollTop = 0;
scrollParent.scrollTop = 0;
scrollParent.scrollLeft = 0;
card._restoreScrollPositions(positions);
assert.equal(global.document.scrollingElement.scrollTop, 640);
assert.equal(scrollParent.scrollTop, 420);
assert.equal(scrollParent.scrollLeft, 12);

const source = require("node:fs").readFileSync(
  require.resolve("../ha-kia-connect-dashboard.js"),
  "utf8",
);
assert.match(source, /class="map trip-route-map-canvas"/);
assert.match(
  source,
  /class="map-tiles trip-route-tiles trip-route-html-tiles"/,
);

console.log("Frontend rendering guard checks passed.");
