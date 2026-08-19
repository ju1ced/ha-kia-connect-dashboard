const assert = require("node:assert/strict");
const fs = require("node:fs");

const registry = new Map();

global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelectorAll: () => [],
      querySelector: () => null,
    };
  }

  dispatchEvent(event) {
    this.lastEvent = event;
    return true;
  }
};

global.CustomEvent = class {
  constructor(type, options = {}) {
    this.type = type;
    Object.assign(this, options);
  }
};

global.document = {
  createElement(name) {
    const Constructor = registry.get(name);
    return Constructor ? new Constructor() : { localName: name };
  },
};

global.customElements = {
  define(name, constructor) {
    registry.set(name, constructor);
  },
  get(name) {
    return registry.get(name);
  },
};

global.window = { customCards: [] };

require("../ha-kia-connect-dashboard.js");

const source = fs.readFileSync(
  require.resolve("../ha-kia-connect-dashboard.js"),
  "utf8",
);
const editorGroups =
  source.match(/const KIA_EDITOR_ENTITY_GROUPS = \[([\s\S]*?)\n\];/)?.[1] || "";
const runtimeEntityKeys = [...source.matchAll(/_entity\("([^"]+)"\)/g)].map(
  (match) => match[1],
);
for (const key of new Set(runtimeEntityKeys)) {
  assert.match(
    editorGroups,
    new RegExp(`\\b${key}\\b`),
    `runtime entity mapping ${key} must be reachable in the editor`,
  );
}
assert.doesNotMatch(
  source,
  /<ha-entity-picker/,
  "the editor must not depend on unsupported Home Assistant internals",
);

const Card = registry.get("kia-dashboard-card");
const Editor = registry.get("kia-dashboard-card-editor");

assert.ok(Card, "card must be registered");
assert.ok(Editor, "visual editor must be registered");
assert.deepEqual(Card.getStubConfig(), {
  title: "Kia EV6",
  subtitle: "",
  entities: {},
});
assert.deepEqual(new Card().getGridOptions(), {
  columns: "full",
  min_columns: 6,
});

Card.getConfigElement().then((element) => {
  assert.ok(
    element instanceof Editor,
    "getConfigElement must return the Kia editor",
  );
});

const editor = new Editor();
editor._config = {
  type: "custom:kia-dashboard-card",
  title: "Existing vehicle",
  future_option: { keep: true },
  entities: {
    battery_level: "sensor.old_battery",
    future_mapping: "sensor.keep_me",
  },
};

editor._setEntity("battery_level", "sensor.new_battery");
assert.equal(editor.lastEvent.type, "config-changed");
assert.equal(
  editor.lastEvent.detail.config.entities.battery_level,
  "sensor.new_battery",
);
assert.equal(
  editor.lastEvent.detail.config.entities.future_mapping,
  "sensor.keep_me",
);
assert.deepEqual(editor.lastEvent.detail.config.future_option, { keep: true });

editor._setEntity("battery_level", "");
assert.equal("battery_level" in editor.lastEvent.detail.config.entities, false);
assert.equal(
  editor.lastEvent.detail.config.entities.future_mapping,
  "sensor.keep_me",
);

editor._setField("vehicle_controls", true, false);
assert.equal(editor.lastEvent.detail.config.vehicle_controls, true);
editor._setField("vehicle_controls", false, false);
assert.equal("vehicle_controls" in editor.lastEvent.detail.config, false);

editor._setImage("normal", "custom.png");
assert.equal(editor.lastEvent.detail.config.images.normal, "custom.png");
editor._setImage("normal", "");
assert.equal("images" in editor.lastEvent.detail.config, false);

console.log("Visual editor contract checks passed.");
