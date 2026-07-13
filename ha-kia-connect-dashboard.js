class KiaDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._notice = "";
    this._activeTab = "overview";
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 12;
  }

  _entity(key) {
    return this._config.entities?.[key];
  }

  _obj(key) {
    const entityId = this._entity(key);
    return entityId && this._hass ? this._hass.states[entityId] : undefined;
  }

  _state(key, fallback = "--") {
    const obj = this._obj(key);
    if (!obj || obj.state === "unknown" || obj.state === "unavailable") return fallback;
    return obj.state;
  }

  _number(key, fallback = "--") {
    const value = Number.parseFloat(this._state(key, ""));
    return Number.isFinite(value) ? Math.round(value * 10) / 10 : fallback;
  }

  _unit(key, fallback = "") {
    return this._obj(key)?.attributes?.unit_of_measurement || fallback;
  }

  _safe(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  }

  _active(key) {
    const value = String(this._state(key, "off")).toLowerCase();
    return ["on", "open", "unlocked", "charging", "connected", "heat", "cool", "heat_cool", "dry", "fan_only"].includes(value);
  }

  _locked() {
    return String(this._state("door_lock", "locked")).toLowerCase() === "locked";
  }

  _charging() {
    const value = String(this._state("charging_state", "off")).toLowerCase();
    return this._active("charging_state") || value.includes("charging") || value.includes("opladen");
  }

  _climateOn() {
    const value = String(this._state("climate", "off")).toLowerCase();
    return value && !["off", "uit", "idle", "unknown", "unavailable", "--"].includes(value);
  }

  _formatDate(value) {
    if (!value || value === "--") return "--";
    const normalized = String(value).replace(/(\d{4}-\d{2}-\d{2})T/, "$1T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(this._hass?.locale?.language || navigator.language || "nl-BE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  _tireStatus(key) {
    const value = String(this._state(key, "OK")).toLowerCase();
    if (["off", "ok", "normal", "closed", "false", "0"].includes(value)) return "OK";
    if (["on", "problem", "warning", "low", "true", "1"].includes(value)) return "Check";
    return this._safe(this._state(key, "OK"));
  }

  _asset(name) {
    if (!name) return "";
    if (name.startsWith("/")) return name;
    return `${this._config.asset_base || "/local/vehicles/"}${name}`;
  }

  _carImage() {
    const images = this._config.images || {};
    if (this._charging()) return this._asset(images.charging || "ev6_charging.png");
    if (this._climateOn()) return this._asset(images.climate || "ev6_climate.png");
    return this._asset(images.normal || "ev6_front_right.png");
  }

  _coord(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  _trackerCoords() {
    const configuredLat = this._coord(this._config.location?.latitude ?? this._config.latitude);
    const configuredLon = this._coord(this._config.location?.longitude ?? this._config.longitude);
    if (configuredLat !== null && configuredLon !== null) return { lat: configuredLat, lon: configuredLon };

    const entityLat = this._coord(this._state("latitude", ""));
    const entityLon = this._coord(this._state("longitude", ""));
    if (entityLat !== null && entityLon !== null) return { lat: entityLat, lon: entityLon };

    const obj = this._obj("location");
    const attrs = obj?.attributes || {};
    const gps = Array.isArray(attrs.gps) ? attrs.gps : [];
    const lat = this._coord(attrs.latitude ?? attrs.lat ?? gps[0]);
    const lon = this._coord(attrs.longitude ?? attrs.lon ?? attrs.lng ?? gps[1]);
    return lat !== null && lon !== null ? { lat, lon } : null;
  }

  _mapTileGrid() {
    const coords = this._trackerCoords();
    if (!coords) return null;
    const configuredZoom = Number.parseInt(this._config.map_zoom ?? this._config.map?.zoom ?? 16, 10);
    const zoom = Math.max(3, Math.min(18, Number.isFinite(configuredZoom) ? configuredZoom : 16));
    const tileSize = 256;
    const radius = 2;
    const gridSize = radius * 2 + 1;
    const scale = 2 ** zoom;
    const latRad = (coords.lat * Math.PI) / 180;
    const xFloat = ((coords.lon + 180) / 360) * scale;
    const yFloat = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
    const xTile = Math.floor(xFloat);
    const yTile = Math.floor(yFloat);
    const xOffset = (xFloat - xTile) * tileSize;
    const yOffset = (yFloat - yTile) * tileSize;
    const centerOffset = radius * tileSize;
    const tiles = [];

    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        const tileX = ((xTile + x) % scale + scale) % scale;
        const tileY = yTile + y;
        if (tileY < 0 || tileY >= scale) {
          tiles.push('<span class="map-tile-empty"></span>');
        } else {
          tiles.push(`<img src="https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png" alt="">`);
        }
      }
    }

    return {
      style: `--map-grid:${gridSize};--map-size:${gridSize * tileSize}px;left:50%;top:50%;transform:translate(-${Math.round(centerOffset + xOffset)}px, -${Math.round(centerOffset + yOffset)}px)`,
      tiles: tiles.join(""),
    };
  }

  _rangeAttrs(key, fallbackMin = 0, fallbackMax = 100, fallbackStep = 1) {
    const attrs = this._obj(key)?.attributes || {};
    const min = Number.parseFloat(attrs.min);
    const max = Number.parseFloat(attrs.max);
    const step = Number.parseFloat(attrs.step);
    return {
      min: Number.isFinite(min) ? min : fallbackMin,
      max: Number.isFinite(max) ? max : fallbackMax,
      step: Number.isFinite(step) && step > 0 ? step : fallbackStep,
    };
  }

  _navigate(section) {
    const tabs = ["overview", "battery", "vehicle", "climate", "energy", "location", "settings"];
    if (!tabs.includes(section) || section === this._activeTab) return;
    this._activeTab = section;
    this._render();
  }

  _moreInfo(key) {
    const entityId = this._entity(key);
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
  }

  _confirm(message) {
    if (this._config.confirm_actions === false) return true;
    return window.confirm(message);
  }

  _noticeMessage(message) {
    this._notice = message;
    this._render();
    window.setTimeout(() => {
      if (this._notice === message) {
        this._notice = "";
        this._render();
      }
    }, 6500);
  }

  _actionErrorMessage(error, entityId) {
    const raw = error?.message || error?.body?.message || String(error || "");
    if (raw.toLowerCase().includes("pin")) return `Action failed for ${entityId}: PIN verification failed in the Kia integration.`;
    return raw || `Action failed for ${entityId}`;
  }

  async _callEntity(entityKey, service, message) {
    const entityId = this._entity(entityKey);
    if (!entityId || !this._hass) {
      this._noticeMessage(`Action entity missing: ${entityKey}`);
      this._moreInfo(entityKey);
      return;
    }

    if (message && !this._confirm(message)) {
      this._noticeMessage("Action cancelled");
      return;
    }

    const domain = entityId.split(".")[0];
    let targetDomain = domain;
    let targetService = service;

    if (domain === "button") targetService = "press";
    if (domain === "lock") targetService = service === "turn_off" ? "unlock" : "lock";

    if (!["button", "lock", "switch", "input_boolean", "climate"].includes(domain)) {
      this._noticeMessage(`Unsupported action entity: ${entityId}`);
      this._moreInfo(entityKey);
      return;
    }

    try {
      await this._hass.callService(targetDomain, targetService, { entity_id: entityId });
      this._noticeMessage(`Sent ${targetDomain}.${targetService} to ${entityId}`);
    } catch (error) {
      this._noticeMessage(this._actionErrorMessage(error, entityId));
    }
  }

  async _setNumber(entityKey, value) {
    const entityId = this._entity(entityKey);
    if (!entityId || !this._hass) return;
    if (!entityId.startsWith("number.")) {
      this._noticeMessage(`Cannot adjust ${entityId}; expected number entity.`);
      return;
    }
    try {
      await this._hass.callService("number", "set_value", { entity_id: entityId, value: Number(value) });
      this._noticeMessage(`Set ${entityId} to ${value} %`);
    } catch (error) {
      this._noticeMessage(this._actionErrorMessage(error, entityId));
    }
  }

  _handleAction(action) {
    if (action === "refresh") this._callEntity("refresh", "press", "");
    if (action === "start_climate") this._callEntity(this._entity("start_climate") ? "start_climate" : "climate", "turn_on", "Start climate now?");
    if (action === "stop_climate") this._callEntity(this._entity("stop_climate") ? "stop_climate" : "climate", "turn_off", "Stop climate now?");
    if (action === "start_charging") this._callEntity("start_charging", "turn_on", "Start charging now?");
    if (action === "stop_charging") this._callEntity("stop_charging", "turn_off", "Stop charging now?");
  }

  _nav(icon, label, section) {
    const active = this._activeTab === section;
    return `<button class="nav-tile${active ? " active" : ""}" data-nav="${section}" aria-current="${active ? "page" : "false"}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></button>`;
  }

  _renderPlaceholder(icon, label) {
    return `<main class="detail-placeholder card" aria-live="polite"><ha-icon icon="${icon}"></ha-icon><div><span>Coming in 2.0.0</span><h2>${label}</h2><p>The ${label} detail view will be added here. The vehicle hero and section navigation remain available above.</p></div></main>`;
  }

  _renderBatteryTab(context = {}) {
    const state = (key) => {
      const obj = this._obj(key);
      const value = String(obj?.state ?? "").trim();
      return obj && value && !["unknown", "unavailable"].includes(value.toLowerCase()) ? { obj, value } : null;
    };
    const measurement = (key, fallbackUnit) => {
      const current = state(key);
      if (!current) return { available: false, text: "Unavailable", value: null };
      const value = Number.parseFloat(current.value);
      if (!Number.isFinite(value)) return { available: false, text: "Unavailable", value: null };
      const rounded = Math.round(value * 10) / 10;
      const unit = current.obj.attributes?.unit_of_measurement || fallbackUnit;
      return { available: true, text: `${rounded}${unit ? ` ${unit}` : ""}`, value: rounded, unit };
    };
    const binary = (key, activeStates, inactiveStates) => {
      const current = state(key);
      if (!current) return null;
      const value = current.value.toLowerCase();
      if (activeStates.includes(value)) return true;
      if (inactiveStates.includes(value)) return false;
      return null;
    };
    const limit = (key, label) => {
      const current = measurement(key, "%");
      if (!current.available) return `<div class="battery-detail-limit unavailable"><span>${label}</span><strong>Unavailable</strong></div>`;
      return `<div class="battery-detail-limit"><span>${label}</span>${this._numberControl(key, current.value, current.unit)}</div>`;
    };
    const battery = measurement("battery_level", "%");
    const pct = battery.available ? Math.max(0, Math.min(100, battery.value)) : 0;
    const range = measurement("battery_range", "km");
    const power = measurement("charging_power", "kW");
    const charging = binary("charging_state", ["on", "charging", "active", "opladen"], ["off", "not charging", "idle", "inactive"]);
    const plugged = binary("plug_connected", ["on", "connected", "true", "1"], ["off", "disconnected", "false", "0"]);
    const chargingText = charging === null ? "Unavailable" : charging ? "Charging" : "Not charging";
    const plugText = plugged === null ? "Unavailable" : plugged ? "Yes" : "No";
    const sessionText = charging === null || plugged === null ? "Unavailable" : charging ? "Charging" : plugged ? "Ready to charge" : "Not connected";
    const hasDc = Boolean(this._entity("dc_charging_limit"));
    const title = (icon, heading, caption) => `<div class="battery-detail-title"><ha-icon icon="${icon}"></ha-icon><div><h3>${heading}</h3><span>${caption}</span></div></div>`;

    return `<main class="battery-detail" aria-label="Battery details">
      <section class="battery-detail-card battery-detail-hero">
        <div class="battery-detail-heading"><span>EV battery overview</span><h2>Battery</h2><p>Range, charging state, limits, and cable status in one focused view.</p></div>
        <div class="battery-detail-gauge${battery.available ? "" : " unavailable"}"${battery.available ? ` style="--level:${pct}%"` : ""}><div><strong>${battery.available ? `${this._safe(battery.value)}<small>%</small>` : "Unavailable"}</strong><span>State of charge</span></div></div>
        <div class="battery-detail-highlights">
          <div><ha-icon icon="mdi:map-marker-distance"></ha-icon><span>Estimated range</span><strong class="${range.available ? "" : "unavailable"}">${this._safe(range.text)}</strong></div>
          <div><ha-icon icon="mdi:battery-charging"></ha-icon><span>Charging state</span><strong class="${charging === true ? "good" : charging === null ? "unavailable" : ""}">${chargingText}</strong></div>
          <div><ha-icon icon="mdi:power-plug"></ha-icon><span>Plug connected</span><strong class="${plugged === null ? "unavailable" : ""}">${plugText}</strong></div>
        </div>
      </section>
      <div class="battery-detail-grid">
        <section class="battery-detail-card">${title("mdi:ev-station", "Charge controls", "Awaiting action-safety review")}<div class="battery-detail-actions"><button disabled aria-disabled="true"><ha-icon icon="mdi:play-circle-outline"></ha-icon>Start charging</button><button class="stop" disabled aria-disabled="true"><ha-icon icon="mdi:stop-circle-outline"></ha-icon>Stop charging</button></div><p>Controls remain disabled until reviewed feedback through <code>last_charging_result</code> is available.</p></section>
        <section class="battery-detail-card">${title("mdi:battery-sync", "Charge limits", "Configured charging targets")}${limit("charging_limit", "AC target")}${hasDc ? limit("dc_charging_limit", "DC target") : ""}</section>
        <section class="battery-detail-card">${title("mdi:map-marker-distance", "Range context", "Current driving estimate")}<div class="battery-detail-stat"><strong class="${range.available ? "" : "unavailable"}">${this._safe(range.text)}</strong><span>Estimated remaining range</span></div>${range.available && battery.available ? `<div class="battery-detail-progress"><span style="width:${pct}%"></span></div>` : ""}<p>Range changes with temperature, driving style, speed, and climate use.</p></section>
        <section class="battery-detail-card">${title("mdi:heart-pulse", "Battery health", "Available battery signals")}<div class="battery-detail-list"><div><span>State of charge</span><strong class="${battery.available ? "" : "unavailable"}">${battery.available ? `${this._safe(battery.value)}%` : "Unavailable"}</strong></div><div><span>Cable state</span><strong class="${plugged === null ? "unavailable" : ""}">${plugged === null ? "Unavailable" : plugged ? "Connected" : "Disconnected"}</strong></div><div><span>Session state</span><strong class="${charging === true ? "good" : charging === null ? "unavailable" : ""}">${charging === null ? "Unavailable" : charging ? "Active" : "Inactive"}</strong></div></div><p>State-of-health and battery temperature will appear when mapped entities become available.</p></section>
        <section class="battery-detail-card battery-detail-session">${title("mdi:flash", "Charging session", "Live connection context")}<div class="battery-detail-session-body"><ha-icon class="${charging === true ? "active" : charging === null ? "unavailable" : ""}" icon="mdi:ev-plug-type2"></ha-icon><div><span>Charging power</span><strong class="${power.available ? "" : "unavailable"}">${this._safe(power.text)}</strong></div><div><span>Current state</span><strong class="${sessionText === "Unavailable" ? "unavailable" : ""}">${sessionText}</strong></div></div><p>Charging history and estimated completion can be added when the integration exposes those entities.</p></section>
      </div>
    </main>`;
  }

  _renderVehicleTab() {
    const read = (key) => {
      const entity = this._obj(key);
      if (!entity) return { value: "Not configured", available: false };
      if (["unknown", "unavailable"].includes(entity.state)) return { value: "Unavailable", available: false };
      return { value: entity.state, available: true };
    };
    const tile = (key, icon, label, context, warning = false) => {
      const current = read(key);
      const tone = !current.available ? " unavailable" : warning ? " warning" : "";
      return `<button class="vehicle-state${tone}" data-info="${key}" ${this._entity(key) ? "" : "disabled"}><ha-icon icon="${icon}"></ha-icon><span><small>${context}</small><strong>${label}</strong></span><b>${this._safe(current.value)}</b><ha-icon class="vehicle-state-indicator" icon="${!current.available ? "mdi:help-circle-outline" : warning ? "mdi:alert-circle-outline" : "mdi:check-circle-outline"}"></ha-icon></button>`;
    };
    const openings = [
      ["front_left_door", "Front left", "Door"], ["front_right_door", "Front right", "Door"], ["rear_left_door", "Rear left", "Door"], ["rear_right_door", "Rear right", "Door"],
      ["trunk", "Trunk", "Cargo opening"], ["hood", "Hood", "Service opening"],
      ["front_left_window", "Front left", "Window"], ["front_right_window", "Front right", "Window"], ["rear_left_window", "Rear left", "Window"], ["rear_right_window", "Rear right", "Window"],
    ];
    const tires = [["tire_front_left", "Front left"], ["tire_front_right", "Front right"], ["tire_rear_left", "Rear left"], ["tire_rear_right", "Rear right"]];
    const openWarnings = openings.filter(([key]) => this._obj(key) && this._active(key));
    const tireWarnings = tires.filter(([key]) => this._obj(key) && this._tireStatus(key) !== "OK");
    const unlocked = Boolean(this._obj("door_lock")) && !this._locked();
    const lightsOn = Boolean(this._obj("lights")) && this._active("lights");
    const warnings = [...(unlocked ? ["Vehicle doors are unlocked."] : []), ...(lightsOn ? ["Headlights are on."] : []), ...openWarnings.map(([, label, context]) => `${context} ${label.toLowerCase()} is open.`), ...tireWarnings.map(([, label]) => `${label} tire pressure needs attention.`)];
    const missingKeys = ["door_lock", "charge_port", "lights", ...openings.map(([key]) => key), ...tires.map(([key]) => key)].filter((key) => !read(key).available);
    const missing = missingKeys.length > 0;
    const summaryTone = warnings.length ? "warning" : missing ? "partial" : "";
    const summaryIcon = warnings.length ? "mdi:alert-outline" : missing ? "mdi:help-circle-outline" : "mdi:shield-check-outline";
    const summaryText = warnings.length ? `${warnings.length} item${warnings.length === 1 ? "" : "s"} to check${missing ? "; data incomplete" : ""}` : missing ? "Vehicle data incomplete" : "No active warnings";
    const heading = `<div class="vehicle-section-title"><ha-icon icon="mdi:car-door"></ha-icon><div><span>Perimeter</span><h2>Doors &amp; openings</h2></div></div>`;
    return `<main class="vehicle-detail"><header class="vehicle-page-heading card"><div><span>Vehicle detail</span><h2>Ready-state check</h2><p>Review access points, exterior lights, and tire status before departure.</p></div><div class="vehicle-page-status ${summaryTone}"><ha-icon icon="${summaryIcon}"></ha-icon><strong>${summaryText}</strong></div></header><section class="vehicle-detail-grid">
      <article class="vehicle-section card vehicle-security"><div class="vehicle-section-title"><ha-icon icon="mdi:shield-car"></ha-icon><div><span>Access</span><h2>Locks &amp; lights</h2></div></div><div class="vehicle-state-list">${tile("door_lock", "mdi:car-door-lock", "Door lock", "Vehicle security", unlocked)}${tile("charge_port", "mdi:ev-plug-type2", "Charge port", "Port state", this._active("charge_port"))}${tile("lights", "mdi:car-light-high", "Headlights", "Exterior lights", lightsOn)}</div><p class="vehicle-section-note"><ha-icon icon="mdi:information-outline"></ha-icon>Remote lock and light commands remain disabled pending the action-safety review.</p></article>
      <article class="vehicle-section card vehicle-openings">${heading}<div class="vehicle-opening-grid">${openings.map(([key, label, context]) => tile(key, key === "trunk" ? "mdi:car-back" : key === "hood" ? "mdi:car-cog" : "mdi:car-door", label, context, this._active(key))).join("")}</div></article>
      <article class="vehicle-section card vehicle-tires"><div class="vehicle-section-title"><ha-icon icon="mdi:car-tire-alert"></ha-icon><div><span>Road contact</span><h2>Tire status</h2></div></div><div class="vehicle-tire-layout"><div>${tile("tire_front_left", "mdi:tire", "Front left", "Tire pressure", this._tireStatus("tire_front_left") !== "OK")}${tile("tire_rear_left", "mdi:tire", "Rear left", "Tire pressure", this._tireStatus("tire_rear_left") !== "OK")}</div><img src="${this._asset(this._config.images?.top || "ev6_top.png")}" alt="Top view of vehicle" onerror="this.style.display='none'"><div>${tile("tire_front_right", "mdi:tire", "Front right", "Tire pressure", this._tireStatus("tire_front_right") !== "OK")}${tile("tire_rear_right", "mdi:tire", "Rear right", "Tire pressure", this._tireStatus("tire_rear_right") !== "OK")}</div></div></article>
      <article class="vehicle-section card vehicle-warnings"><div class="vehicle-section-title"><ha-icon icon="${warnings.length ? "mdi:alert-circle-outline" : missing ? "mdi:help-circle-outline" : "mdi:check-decagram-outline"}"></ha-icon><div><span>Summary</span><h2>${warnings.length ? "Items to review" : missing ? "Vehicle data incomplete" : "Vehicle checks normal"}</h2></div></div>${warnings.length ? `<ul>${warnings.map((warning) => `<li>${this._safe(warning)}</li>`).join("")}</ul>${missing ? `<p class="vehicle-mapping-note">Vehicle data is incomplete: ${missingKeys.length} signal${missingKeys.length === 1 ? " is" : "s are"} missing or unavailable. Check Settings for vehicle mappings.</p>` : ""}` : `<p>${missing ? `No active warnings in available data, but ${missingKeys.length} signal${missingKeys.length === 1 ? " is" : "s are"} missing or unavailable. Check Settings for vehicle mappings.` : "Locks, openings, lights, charge port, and tire pressure report normal states."}</p>`}</article>
    </section></main>`;
  }

  _renderClimateTab() {
    const climate = this._obj("climate");
    const attrs = climate?.attributes || {};
    const on = this._climateOn();
    const unit = this._hass?.config?.unit_system?.temperature || "°C";
    const target = this._entity("set_temperature") ? this._number("set_temperature") : attrs.temperature ?? "--";
    const cabin = this._entity("cabin_temperature") ? this._number("cabin_temperature") : attrs.current_temperature ?? "--";
    const outside = this._entity("outside_temperature") ? this._number("outside_temperature") : "--";
    const temp = (value) => `${this._safe(value)}${value === "--" ? "" : ` ${this._safe(unit)}`}`;
    const mappedState = (key) => {
      const obj = this._obj(key);
      if (!this._entity(key)) return "Not mapped";
      if (!obj || ["unknown", "unavailable"].includes(obj.state)) return "Unavailable";
      return this._active(key) ? "On" : "Off";
    };
    return `<main class="climate-detail" aria-label="Climate details">
      <section class="climate-intro card"><div><span class="climate-eyebrow">Cabin comfort</span><h2>Climate</h2><p>Review temperature, HVAC state, comfort features, and remote controls.</p></div><div class="climate-state ${on ? "is-on" : ""}"><ha-icon icon="${on ? "mdi:fan" : "mdi:fan-off"}"></ha-icon><span>Climate system</span><strong>${this._safe(on ? "On" : this._state("climate", "Unavailable"))}</strong></div></section>
      <section class="climate-temperature card"><div class="climate-heading"><ha-icon icon="mdi:thermometer"></ha-icon><div><span>Temperature</span><h2>Cabin target</h2></div></div><strong class="climate-target">${temp(target)}</strong><div class="climate-readings"><button data-info="cabin_temperature"><span>Cabin</span><strong>${temp(cabin)}</strong></button><button data-info="outside_temperature"><span>Outside</span><strong>${temp(outside)}</strong></button></div></section>
      <section class="climate-controls card"><div class="climate-heading"><ha-icon icon="mdi:remote"></ha-icon><div><span>Remote controls</span><h2>Prepare the cabin</h2></div></div><div class="climate-actions"><button disabled aria-disabled="true" title="Remote climate actions remain disabled pending safety review"><ha-icon icon="mdi:fan"></ha-icon>Start Climate</button><button class="stop" disabled aria-disabled="true" title="Remote climate actions remain disabled pending safety review"><ha-icon icon="mdi:fan-off"></ha-icon>Stop Climate</button></div>${this._notice ? `<p class="notice">${this._safe(this._notice)}</p>` : ""}</section>
      <section class="climate-comfort card"><div class="climate-heading"><ha-icon icon="mdi:car-seat"></ha-icon><div><span>Comfort</span><h2>System state</h2></div></div><div class="climate-readings three"><button data-info="climate"><span>HVAC mode</span><strong>${this._safe(attrs.hvac_action || this._state("climate"))}</strong></button><button data-info="defrost"><span>Defrost</span><strong>${mappedState("defrost")}</strong></button><button data-info="steering_wheel_heater"><span>Steering wheel heat</span><strong>${mappedState("steering_wheel_heater")}</strong></button></div></section>
      <section class="climate-session card"><ha-icon icon="mdi:timer-outline"></ha-icon><div><span>Remote climate session</span><h2>${this._safe(this._entity("last_climate_result") ? this._state("last_climate_result") : "No command result mapped")}</h2><p>Timer and requested mode will appear when mapped state is available.</p></div></section>
    </main>`;
  }

  _renderEnergyTab() {
    const battery = this._number("battery_level");
    const batteryUnit = this._unit("battery_level", "%") || "%";
    const range = this._number("battery_range");
    const rangeUnit = this._unit("battery_range", "km") || "km";
    const chargeTarget = this._number("charging_limit");
    const chargeTargetUnit = this._unit("charging_limit", "%") || "%";
    const chargingPower = this._number("charging_power");
    const chargingPowerUnit = this._unit("charging_power", "kW") || "kW";
    const chargingState = this._charging() ? "Charging" : this._state("charging_state");
    const plugObject = this._obj("plug_connected");
    const plugAvailable = Boolean(plugObject) && !["unknown", "unavailable"].includes(plugObject.state);
    const plugConnected = plugAvailable && this._active("plug_connected");
    const plugState = plugAvailable ? (plugConnected ? "Connected" : "Disconnected") : "--";
    const stat = (key, icon, label, value, unit = "", status = "") => `<button class="energy-stat${status ? ` ${status}` : ""}" data-info="${key}"><span class="energy-stat-icon"><ha-icon icon="${icon}"></ha-icon></span><span class="energy-stat-copy"><small>${label}</small><strong>${this._safe(value)}${unit ? ` <em>${this._safe(unit)}</em>` : ""}</strong></span><ha-icon class="energy-stat-link" icon="mdi:chevron-right"></ha-icon></button>`;

    return `<main class="energy-detail" aria-label="Energy details">
      <section class="energy-intro card"><div><span class="energy-eyebrow">Energy flow</span><h2>Range and charging at a glance</h2><p>Review the vehicle's remaining energy, charge target, live charging state, and cable connection without leaving the dashboard.</p></div><div class="energy-orbit" aria-hidden="true"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div></section>
      <section class="energy-section card"><div class="energy-heading"><span><ha-icon icon="mdi:map-marker-distance"></ha-icon></span><div><small>Range context</small><h2>Remaining energy</h2></div></div><div class="energy-stats">${stat("battery_range", "mdi:map-marker-distance", "Estimated range", range, rangeUnit)}${stat("battery_level", "mdi:battery-high", "Battery level", battery, batteryUnit, battery === "--" ? "" : "positive")}${stat("charging_limit", "mdi:battery-charging-80", "AC charge target", chargeTarget, chargeTargetUnit)}</div><p class="energy-note"><ha-icon icon="mdi:information-outline"></ha-icon><span>Range estimates respond to driving conditions and climate use. The Battery page owns charge controls.</span></p></section>
      <section class="energy-section card"><div class="energy-heading"><span><ha-icon icon="mdi:ev-station"></ha-icon></span><div><small>Charging context</small><h2>Live connection</h2></div></div><div class="energy-stats">${stat("charging_state", "mdi:ev-station", "Charging state", chargingState, "", this._charging() ? "positive" : "")}${stat("charging_power", "mdi:flash", "Charging power", chargingPower, chargingPowerUnit, this._charging() ? "positive" : "")}${stat("plug_connected", "mdi:power-plug", "Plug", plugState, "", plugConnected ? "positive" : "")}</div><p class="energy-note"><ha-icon icon="mdi:shield-check-outline"></ha-icon><span>This page is read-only. Charging actions and limits remain grouped on Battery.</span></p></section>
      <section class="energy-future card"><div class="energy-heading"><span><ha-icon icon="mdi:chart-timeline-variant"></ha-icon></span><div><small>Efficiency</small><h2>Consumption trends</h2></div></div><p>Average consumption, regeneration, and trip efficiency will appear here when those entities are available in the mapping contract.</p><div class="energy-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></section>
      <section class="energy-future card"><div class="energy-heading"><span><ha-icon icon="mdi:history"></ha-icon></span><div><small>History</small><h2>Energy over time</h2></div></div><p>Historical charts stay reserved for statistics entities or helper sensors, keeping Overview focused on the vehicle's current state.</p><button class="energy-back" data-nav="overview"><ha-icon icon="mdi:arrow-left"></ha-icon><span>Back to Overview</span></button></section>
    </main>`;
  }

  _renderLocationTab(context) {
    const { lastUpdated, mapTiles, markerImage } = context;
    const trackerState = this._state("location", "Location unavailable");
    const odometer = `${this._number("odometer")} ${this._unit("odometer", "km")}`;
    const coords = this._trackerCoords();
    const coordinateLabel = coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : "Coordinates unavailable";
    const trackerEntity = this._entity("location");

    return `
      <main class="location-detail" aria-label="Location details">
        <section class="location-detail-map card">
          <div class="location-detail-heading">
            <div><span>Position context</span><h2>Last known location</h2></div>
            <button class="location-info" data-info="location" ${trackerEntity ? "" : "disabled"} aria-label="${trackerEntity ? "Open tracker details" : "Tracker entity not configured"}"><ha-icon icon="mdi:information-outline"></ha-icon></button>
          </div>
          <div class="location-detail-map-canvas">
            ${mapTiles ? `<div class="map-tiles" style="${mapTiles.style}">${mapTiles.tiles}</div>` : `<div class="location-map-empty"><ha-icon icon="mdi:map-marker-off-outline"></ha-icon><span>Map preview needs tracker coordinates</span></div>`}
            ${coords ? `<span class="map-marker"><img src="${markerImage}" alt="Vehicle position" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><ha-icon icon="mdi:car-sports"></ha-icon></span>` : ""}
          </div>
          <div class="location-detail-caption"><ha-icon icon="mdi:crosshairs-gps"></ha-icon><span>${this._safe(coordinateLabel)}</span></div>
        </section>

        <section class="location-detail-summary card">
          <div class="location-detail-heading"><div><span>Tracker</span><h2>${this._safe(trackerState)}</h2></div><ha-icon icon="mdi:map-marker-outline"></ha-icon></div>
          <div class="location-stat-grid">
            <button class="location-stat" data-info="odometer"><ha-icon icon="mdi:counter"></ha-icon><span>Odometer</span><strong>${this._safe(odometer)}</strong></button>
            <div class="location-stat"><ha-icon icon="mdi:clock-outline"></ha-icon><span>Last updated</span><strong>${this._safe(lastUpdated)}</strong></div>
          </div>
        </section>

        <section class="location-context-card location-parking card">
          <ha-icon icon="mdi:parking"></ha-icon>
          <div><span>Parking context</span><h2>${this._safe(trackerState)}</h2><p>The tracker state is the latest known parking area. Update freshness stays visible alongside it.</p></div>
        </section>

        <section class="location-context-card location-trip card muted">
          <ha-icon icon="mdi:map-marker-path"></ha-icon>
          <div><span>Trip context</span><h2>Ready for future trip data</h2><p>Route, destination, and movement details remain read-only placeholders until mapped entities are defined.</p></div>
        </section>

        <button class="location-back card" data-nav="overview"><ha-icon icon="mdi:arrow-left"></ha-icon><span>Back to Overview</span></button>
      </main>`;
  }

  _renderSettingsTab() {
    const configured = Object.entries(this._config.entities || {});
    const available = configured.filter(([, entityId]) => { const state = this._hass?.states?.[entityId]?.state; return Boolean(state) && state !== "unknown" && state !== "unavailable"; });
    const unavailable = configured.filter(([, entityId]) => { const state = this._hass?.states?.[entityId]?.state; return !state || state === "unknown" || state === "unavailable"; });
    const mappingState = configured.length ? `${available.length} of ${configured.length} available` : "No entities configured";
    const mappingOk = configured.length > 0 && unavailable.length === 0;
    const unavailableText = unavailable.length ? unavailable.map(([key]) => key.replaceAll("_", " ")).join(", ") : "All configured entities are reporting usable states.";
    const themeName = this._hass?.themes?.theme || "Home Assistant theme";
    const themeMode = this._hass?.themes?.darkMode ? "Dark mode" : "Light mode";
    const lastUpdated = this._formatDate(this._state("last_updated", "--"));
    const climateResult = this._state("last_climate_result", "Not configured");
    const chargingResult = this._state("last_charging_result", "Not configured");
    const dashboardVersion = this._state("dashboard_version", "Not configured");
    return `<main class="settings-detail" aria-label="Settings detail">
      <section class="settings-heading card"><div class="settings-heading-icon"><ha-icon icon="mdi:tune-variant"></ha-icon></div><div><span class="settings-eyebrow">Dashboard administration</span><h2>Settings</h2><p>Review entity mapping, theme context, safe actions, and integration feedback for this card.</p></div><span class="settings-health ${mappingOk ? "healthy" : "attention"}"><ha-icon icon="${mappingOk ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}"></ha-icon>${mappingOk ? "Mapping healthy" : "Mapping needs attention"}</span></section>
      <div class="settings-grid">
        <section class="settings-panel card settings-mapping"><div class="settings-panel-title"><ha-icon icon="mdi:transit-connection-variant"></ha-icon><div><span>Configuration</span><h2>Entity mapping</h2></div><strong class="${mappingOk ? "healthy-text" : "attention-text"}">${mappingState}</strong></div><p>Entity IDs stay in this card's <code>entities</code> configuration. Missing or unavailable mappings are listed here before card changes are considered.</p><div class="settings-diagnostic ${mappingOk ? "healthy" : "attention"}"><ha-icon icon="${mappingOk ? "mdi:shield-check-outline" : "mdi:alert-outline"}"></ha-icon><div><strong>${mappingOk ? "No mapping issues detected" : "Check configured entities"}</strong><span>${this._safe(unavailableText)}</span></div></div></section>
        <section class="settings-panel card settings-theme"><div class="settings-panel-title"><ha-icon icon="mdi:palette-outline"></ha-icon><div><span>Appearance</span><h2>Theme</h2></div></div><div class="settings-theme-preview"><span class="theme-swatch brand"></span><span class="theme-swatch success"></span><span class="theme-swatch warning"></span><span class="theme-swatch surface"></span></div><dl><div><dt>Active theme</dt><dd>${this._safe(themeName)}</dd></div><div><dt>Color mode</dt><dd>${themeMode}</dd></div><div><dt>Card styling</dt><dd>Semantic Home Assistant tokens</dd></div></dl></section>
        <section class="settings-panel card settings-actions-panel"><div class="settings-panel-title"><ha-icon icon="mdi:gesture-tap-button"></ha-icon><div><span>Low risk</span><h2>Dashboard actions</h2></div></div><p>Refresh requests use the configured refresh entity. Vehicle details remain a local, read-only Home Assistant surface.</p><div class="settings-actions"><button data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon><span><strong>Refresh vehicle</strong><small>Request current Kia data</small></span></button><button data-info="vehicle_data" ${this._entity("vehicle_data") ? "" : "disabled"}><ha-icon icon="mdi:database-eye-outline"></ha-icon><span><strong>Vehicle data details</strong><small>Open the mapped raw-data entity</small></span></button></div>${this._notice ? `<p class="settings-notice">${this._safe(this._notice)}</p>` : ""}</section>
        <section class="settings-panel card settings-maintenance"><div class="settings-panel-title"><ha-icon icon="mdi:tools"></ha-icon><div><span>Read only</span><h2>Maintenance feedback</h2></div></div><div class="settings-feedback">${this._row("mdi:calendar-clock", "Latest scan", lastUpdated, lastUpdated !== "--")}${this._row("mdi:fan", "Climate command state", climateResult, climateResult !== "Not configured")}${this._row("mdi:ev-station", "Charging command state", chargingResult, chargingResult !== "Not configured")}${this._row("mdi:code-json", "Dashboard version", dashboardVersion, dashboardVersion !== "Not configured")}</div><p class="settings-note"><ha-icon icon="mdi:information-outline"></ha-icon><span>For unavailable data, verify the entity in Home Assistant and this card's entity mapping before troubleshooting the layout.</span></p></section>
      </div>
    </main>`;
  }

  _batteryTabStyles() {
    return `
      .battery-detail{margin-top:12px;display:grid;gap:12px}.battery-detail-card{background:linear-gradient(145deg,var(--kia-panel),var(--kia-card));border:1px solid var(--kia-line);border-radius:8px;box-shadow:var(--ha-card-box-shadow,0 8px 22px rgba(0,0,0,.14));padding:clamp(18px,2vw,28px);min-width:0}.battery-detail-card>p,.battery-detail-heading p{margin-top:12px;color:var(--kia-muted);line-height:1.5}
      .battery-detail-hero{min-height:250px;display:grid;grid-template-columns:minmax(220px,.8fr) minmax(190px,.55fr) minmax(300px,1fr);gap:clamp(22px,3vw,54px);align-items:center}.battery-detail-heading>span{color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.battery-detail-heading h2{margin-top:7px;font-size:clamp(30px,3vw,46px);line-height:1}
      .battery-detail-gauge{width:min(190px,100%);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;justify-self:center;background:conic-gradient(var(--green) var(--level),var(--kia-recessed) 0);position:relative}.battery-detail-gauge:before{content:"";position:absolute;inset:12px;border-radius:50%;background:var(--kia-card);border:1px solid var(--kia-line)}.battery-detail-gauge div{position:relative;text-align:center}.battery-detail-gauge strong{display:block;font-size:clamp(34px,3vw,48px)}.battery-detail-gauge small{font-size:.48em}.battery-detail-gauge span,.battery-detail-title span,.battery-detail-highlights span,.battery-detail-stat span,.battery-detail-session-body span{color:var(--kia-muted);font-size:13px}
      .battery-detail-highlights{display:grid;gap:12px}.battery-detail-highlights>div{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:2px 10px;padding:12px 14px;border-radius:8px;background:var(--kia-control);border:1px solid var(--kia-line)}.battery-detail-highlights ha-icon{grid-row:1/3;color:var(--blue);--mdc-icon-size:26px}.battery-detail-highlights strong{font-size:17px}.battery-detail .good{color:var(--green)}.battery-detail .unavailable{color:var(--kia-muted);font-style:italic}.battery-detail-gauge.unavailable{background:var(--kia-recessed);box-shadow:none}.battery-detail-gauge.unavailable strong{font-size:18px}
      .battery-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.battery-detail-title{display:flex;gap:12px;align-items:center;margin-bottom:20px}.battery-detail-title>ha-icon{color:var(--blue);--mdc-icon-size:28px}.battery-detail-title h3{margin:0 0 2px;font-size:20px}.battery-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.battery-detail-actions button{min-height:54px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid var(--kia-line);border-radius:8px;background:var(--kia-control);color:var(--kia-muted);font-weight:800;cursor:not-allowed;opacity:.72}.battery-detail-actions .stop{border-color:var(--kia-line);background:var(--kia-control)}
      .battery-detail-limit+.battery-detail-limit{margin-top:18px}.battery-detail-limit>span{display:block;margin-bottom:7px;color:var(--kia-muted);font-size:13px}.battery-detail-limit .limit-control{grid-template-columns:minmax(90px,auto) minmax(120px,1fr)}.battery-detail-stat strong{display:block;font-size:clamp(28px,3vw,42px)}.battery-detail-progress{height:16px;margin-top:20px;padding:3px;border-radius:8px;background:var(--kia-recessed);border:1px solid var(--kia-line)}.battery-detail-progress span{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--red) 0 30%,var(--amber) 30% 55%,var(--green) 55% 100%)}
      .battery-detail-list{display:grid;gap:1px;border:1px solid var(--kia-line);border-radius:8px;overflow:hidden;background:var(--kia-line)}.battery-detail-list>div{display:flex;justify-content:space-between;gap:18px;padding:12px 14px;background:var(--kia-control)}.battery-detail-list span{color:var(--kia-muted)}.battery-detail-session{grid-column:1/-1}.battery-detail-session-body{display:grid;grid-template-columns:64px repeat(2,minmax(0,1fr));align-items:center;gap:20px}.battery-detail-session-body>ha-icon{width:58px;height:58px;padding:14px;box-sizing:border-box;border-radius:50%;color:var(--kia-muted);background:var(--kia-control);border:1px solid var(--kia-line)}.battery-detail-session-body>ha-icon.active{color:var(--green)}.battery-detail-session-body strong{display:block;margin-top:4px;font-size:20px}
      @media(max-width:1180px){.battery-detail-hero{grid-template-columns:1fr 1fr}.battery-detail-heading{grid-column:1/-1}}@media(max-width:760px){.battery-detail-hero,.battery-detail-grid{grid-template-columns:1fr}.battery-detail-heading,.battery-detail-session{grid-column:auto}.battery-detail-actions{grid-template-columns:1fr}.battery-detail-session-body{grid-template-columns:58px 1fr}.battery-detail-session-body>div:last-child{grid-column:2}.battery-detail-limit .limit-control{grid-template-columns:1fr}}
    `;
  }

  _vehicleTabStyles() {
    return `
      .vehicle-detail { margin-top:12px; display:grid; gap:12px; } .vehicle-page-heading { min-height:118px; padding:22px 26px; display:flex; align-items:center; justify-content:space-between; gap:24px; }
      .vehicle-page-heading>div:first-child>span,.vehicle-section-title span { color:var(--blue); font-size:12px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; } .vehicle-page-heading h2 { margin-top:4px; font-size:clamp(24px,2.2vw,34px); } .vehicle-page-heading p { margin-top:7px; color:var(--kia-muted); }
      .vehicle-page-status { min-width:190px; padding:14px 16px; border:1px solid color-mix(in srgb,var(--green) 50%,var(--kia-line)); border-radius:8px; background:color-mix(in srgb,var(--green) 12%,var(--kia-card)); display:flex; align-items:center; gap:10px; } .vehicle-page-status ha-icon { color:var(--green); --mdc-icon-size:28px; } .vehicle-page-status.warning { border-color:var(--amber); background:color-mix(in srgb,var(--amber) 12%,var(--kia-card)); } .vehicle-page-status.warning ha-icon { color:var(--amber); }
      .vehicle-page-status.partial { border-color:var(--kia-line); background:var(--kia-control); } .vehicle-page-status.partial ha-icon { color:var(--kia-muted); }
      .vehicle-detail-grid { display:grid; grid-template-columns:minmax(280px,.84fr) minmax(420px,1.45fr); grid-template-areas:"security openings" "tires warnings"; gap:12px; } .vehicle-section { padding:20px 22px; min-width:0; } .vehicle-security { grid-area:security; } .vehicle-openings { grid-area:openings; } .vehicle-tires { grid-area:tires; } .vehicle-warnings { grid-area:warnings; }
      .vehicle-section-title { display:flex; align-items:center; gap:12px; margin-bottom:16px; } .vehicle-section-title>ha-icon { color:var(--blue); --mdc-icon-size:28px; } .vehicle-section-title h2 { margin-top:2px; font-size:20px; }
      .vehicle-state-list { display:grid; gap:9px; } .vehicle-state { width:100%; min-height:58px; padding:9px 11px; border:1px solid var(--kia-line); border-radius:8px; background:var(--kia-control); display:grid; grid-template-columns:26px minmax(100px,1fr) auto 22px; align-items:center; gap:10px; text-align:left; } .vehicle-state:hover:not(:disabled),.vehicle-state:focus-visible { border-color:var(--blue); } .vehicle-state:disabled { cursor:default; opacity:.72; }
      .vehicle-state>ha-icon:first-child { color:var(--kia-muted); --mdc-icon-size:21px; } .vehicle-state span { min-width:0; } .vehicle-state small { display:block; color:var(--kia-muted); font-size:11px; } .vehicle-state strong { display:block; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; } .vehicle-state b { max-width:116px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; text-transform:capitalize; }
      .vehicle-state-indicator { color:var(--green); --mdc-icon-size:19px; } .vehicle-state.warning .vehicle-state-indicator { color:var(--amber); } .vehicle-state.unavailable .vehicle-state-indicator { color:var(--kia-muted); } .vehicle-section-note { margin-top:14px; padding-top:13px; border-top:1px solid var(--kia-line); display:flex; gap:8px; color:var(--kia-muted); font-size:12px; line-height:1.4; }
      .vehicle-opening-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; } .vehicle-tire-layout { display:grid; grid-template-columns:minmax(125px,1fr) 92px minmax(125px,1fr); gap:12px; align-items:center; } .vehicle-tire-layout>div { display:grid; gap:10px; } .vehicle-tire-layout img { width:88px; height:154px; object-fit:contain; justify-self:center; filter:drop-shadow(0 10px 12px rgba(0,0,0,.34)); } .vehicle-tire-layout .vehicle-state { grid-template-columns:22px minmax(76px,1fr) auto 20px; padding-inline:9px; }
      .vehicle-warnings { display:flex; flex-direction:column; justify-content:center; } .vehicle-warnings p,.vehicle-warnings ul { color:var(--kia-muted); line-height:1.55; } .vehicle-warnings ul { margin:0; padding-left:20px; } .vehicle-mapping-note { margin-top:12px; }
      @media (max-width:1180px) { .vehicle-detail-grid { grid-template-columns:1fr; grid-template-areas:"security" "openings" "tires" "warnings"; } } @media (max-width:760px) { .vehicle-page-heading { align-items:flex-start; flex-direction:column; } .vehicle-page-status { min-width:0; width:100%; box-sizing:border-box; } .vehicle-opening-grid,.vehicle-tire-layout { grid-template-columns:1fr; } .vehicle-tire-layout img { grid-row:1; height:126px; } }
    `;
  }

  _climateTabStyles() {
    return `
      .climate-detail{margin-top:12px;display:grid;grid-template-columns:1.15fr .85fr;grid-template-areas:"intro intro" "temperature controls" "comfort comfort" "session session";gap:12px}.climate-detail>.card{padding:clamp(20px,2.2vw,32px);min-width:0}.climate-intro{grid-area:intro;display:grid;grid-template-columns:1fr auto;align-items:center;gap:28px;min-height:150px;overflow:hidden}.climate-eyebrow,.climate-heading span,.climate-session span{color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.climate-intro h2{margin-top:4px;font-size:clamp(30px,3vw,46px)}.climate-intro p,.climate-session p{margin-top:8px;color:var(--kia-muted);line-height:1.5}.climate-state{min-width:180px;padding:18px;border:1px solid var(--kia-line);border-radius:8px;background:var(--kia-control);display:grid;grid-template-columns:34px 1fr;gap:3px 12px;align-items:center}.climate-state ha-icon{grid-row:1/3;color:var(--kia-muted);--mdc-icon-size:30px}.climate-state span,.climate-readings span{color:var(--kia-muted);font-size:12px}.climate-state strong{font-size:20px;text-transform:capitalize}.climate-state.is-on{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 14%,var(--kia-card))}.climate-state.is-on ha-icon,.climate-state.is-on strong{color:var(--blue)}.climate-temperature{grid-area:temperature}.climate-controls{grid-area:controls}.climate-comfort{grid-area:comfort}.climate-session{grid-area:session}.climate-heading{display:flex;gap:13px;align-items:center;margin-bottom:20px}.climate-heading>ha-icon{color:var(--blue);--mdc-icon-size:30px}.climate-heading h2{margin-top:2px;font-size:21px}.climate-target{min-height:120px;border-radius:8px;background:var(--kia-recessed);border:1px solid var(--kia-line);display:grid;place-items:center;font-size:clamp(38px,4vw,58px)}.climate-readings,.climate-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}.climate-readings.three{grid-template-columns:repeat(3,minmax(0,1fr))}.climate-readings button{border:1px solid var(--kia-line);background:var(--kia-control);border-radius:8px;min-height:78px;padding:14px;display:flex;flex-direction:column;text-align:left;justify-content:center}.climate-readings strong{margin-top:4px;overflow-wrap:anywhere;text-transform:capitalize}.climate-actions button{min-height:112px;border:1px solid var(--blue);border-radius:8px;background:color-mix(in srgb,var(--blue) 14%,var(--kia-card));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-weight:800}.climate-actions ha-icon{color:var(--blue);--mdc-icon-size:34px}.climate-actions button:disabled{cursor:not-allowed;opacity:.58}.climate-actions .stop{border-color:var(--amber)}.climate-actions .stop ha-icon{color:var(--amber)}.climate-session{display:flex;align-items:center;gap:20px}.climate-session>ha-icon{color:var(--blue);--mdc-icon-size:42px}.climate-session h2{margin-top:5px;font-size:clamp(18px,2vw,24px);overflow-wrap:anywhere}@media(max-width:760px){.climate-detail{grid-template-columns:1fr;grid-template-areas:"intro" "temperature" "controls" "comfort" "session"}.climate-intro{grid-template-columns:1fr}.climate-readings,.climate-readings.three,.climate-actions{grid-template-columns:1fr}.climate-session{align-items:flex-start}}
    `;
  }

  _energyTabStyles() {
    return `
      .energy-detail{margin-top:12px;display:grid;grid-template-columns:1.15fr 1fr;gap:12px}.energy-detail>.card{min-width:0;overflow:hidden}.energy-intro{grid-column:1/-1;min-height:150px;padding:clamp(24px,3vw,42px);display:flex;align-items:center;justify-content:space-between;gap:28px;position:relative}.energy-intro:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 50%,color-mix(in srgb,var(--blue) 18%,transparent),transparent 28%);pointer-events:none}.energy-intro>div:first-child{position:relative;z-index:1;max-width:720px}.energy-eyebrow,.energy-heading small{color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.energy-intro h2{margin-top:7px;font-size:clamp(25px,2.4vw,36px)}.energy-intro p,.energy-future>p{margin-top:10px;color:var(--kia-muted);line-height:1.5}.energy-orbit{flex:0 0 92px;width:92px;height:92px;border-radius:50%;display:grid;place-items:center;color:var(--blue);background:color-mix(in srgb,var(--blue) 12%,var(--kia-card));border:1px solid color-mix(in srgb,var(--blue) 48%,var(--kia-line));box-shadow:0 0 38px color-mix(in srgb,var(--blue) 18%,transparent)}.energy-orbit ha-icon{--mdc-icon-size:44px}.energy-section,.energy-future{padding:22px}.energy-heading{display:flex;align-items:center;gap:12px;margin-bottom:18px}.energy-heading>span{width:42px;height:42px;flex:0 0 42px;border-radius:8px;display:grid;place-items:center;color:var(--blue);background:color-mix(in srgb,var(--blue) 12%,var(--kia-card));border:1px solid var(--kia-line)}.energy-heading h2{margin-top:3px;font-size:20px}.energy-stats{display:grid;gap:10px}.energy-stat{width:100%;min-height:76px;padding:12px 14px;display:grid;grid-template-columns:42px minmax(0,1fr) 22px;align-items:center;gap:12px;color:var(--kia-text);text-align:left;border:1px solid var(--kia-line);border-radius:8px;background:var(--kia-control)}.energy-stat:hover,.energy-stat:focus-visible{border-color:var(--blue);outline:none}.energy-stat-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--blue);background:color-mix(in srgb,var(--blue) 11%,var(--kia-card))}.energy-stat-icon ha-icon{--mdc-icon-size:22px}.energy-stat-copy{min-width:0}.energy-stat-copy small{display:block;color:var(--kia-muted);font-size:12px;font-weight:700}.energy-stat-copy strong{display:block;margin-top:3px;font-size:clamp(18px,1.7vw,24px);line-height:1.1;overflow-wrap:anywhere}.energy-stat-copy em{color:var(--kia-muted);font-size:.65em;font-style:normal;font-weight:700}.energy-stat-link{color:var(--kia-muted);--mdc-icon-size:20px}.energy-stat.positive .energy-stat-icon,.energy-stat.positive .energy-stat-copy strong{color:var(--green)}.energy-note{margin-top:14px;padding-top:14px;border-top:1px solid var(--kia-line);display:flex;align-items:flex-start;gap:9px;color:var(--kia-muted);font-size:12px;line-height:1.45}.energy-note ha-icon{flex:0 0 auto;color:var(--blue);--mdc-icon-size:18px}.energy-future{min-height:210px;position:relative}.energy-bars{height:64px;margin-top:20px;display:flex;align-items:flex-end;gap:8px;opacity:.65}.energy-bars i{flex:1;min-width:8px;height:38%;border-radius:4px 4px 0 0;background:color-mix(in srgb,var(--blue) 46%,var(--kia-line))}.energy-bars i:nth-child(2),.energy-bars i:nth-child(6){height:62%}.energy-bars i:nth-child(3){height:48%}.energy-bars i:nth-child(4){height:82%}.energy-bars i:nth-child(5){height:70%}.energy-bars i:nth-child(7){height:94%}.energy-back{margin-top:20px;min-height:46px;padding:0 16px;display:inline-flex;align-items:center;gap:9px;border:1px solid var(--kia-line);border-radius:8px;background:var(--kia-control);font-weight:800}.energy-back ha-icon{color:var(--blue);--mdc-icon-size:20px}@media(max-width:900px){.energy-detail{grid-template-columns:1fr}.energy-intro{grid-column:auto}}@media(max-width:560px){.energy-intro{align-items:flex-start}.energy-orbit{width:64px;height:64px;flex-basis:64px}.energy-orbit ha-icon{--mdc-icon-size:32px}.energy-section,.energy-future{padding:18px}}
    `;
  }

  _locationTabStyles() {
    return `
      .location-detail { margin-top:12px; display:grid; grid-template-columns:minmax(0,1.45fr) minmax(300px,.75fr); grid-template-areas:"map summary" "map parking" "map trip" "map back"; gap:12px; align-items:stretch; }
      .location-detail-map { grid-area:map; min-height:560px; padding:22px; display:grid; grid-template-rows:auto minmax(360px,1fr) auto; gap:16px; min-width:0; }
      .location-detail-summary { grid-area:summary; padding:22px; display:grid; gap:22px; }
      .location-context-card { padding:22px; display:grid; grid-template-columns:42px 1fr; gap:16px; align-items:start; }
      .location-parking { grid-area:parking; } .location-trip { grid-area:trip; }
      .location-back { grid-area:back; min-height:52px; padding:0 20px; display:flex; align-items:center; justify-content:center; gap:10px; border-color:var(--blue); background:var(--kia-control); color:var(--kia-text); font-weight:800; }
      .location-back ha-icon { color:var(--blue); --mdc-icon-size:21px; }
      .location-detail-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; min-width:0; }
      .location-detail-heading span,.location-stat span,.location-context-card span,.location-detail-caption { color:var(--kia-muted); font-size:13px; }
      .location-detail-heading h2,.location-context-card h2 { margin-top:5px; font-size:clamp(19px,1.55vw,26px); overflow-wrap:anywhere; }
      .location-detail-heading>ha-icon,.location-context-card>ha-icon { color:var(--blue); --mdc-icon-size:34px; }
      .location-info { width:40px; height:40px; border:1px solid var(--kia-line); border-radius:8px; background:var(--kia-control); color:var(--blue); display:grid; place-items:center; }
      .location-info:disabled { cursor:default; color:var(--kia-muted); opacity:.55; }
      .location-detail-map-canvas { min-height:360px; border-radius:8px; background:color-mix(in srgb,var(--kia-control) 62%,var(--blue) 8%); display:grid; place-items:center; position:relative; overflow:hidden; isolation:isolate; }
      .location-detail-map-canvas:after { content:""; position:absolute; inset:0; border:1px solid color-mix(in srgb,var(--blue) 28%,transparent); border-radius:inherit; pointer-events:none; z-index:3; }
      .location-map-empty { display:grid; justify-items:center; gap:12px; color:var(--kia-muted); text-align:center; padding:24px; } .location-map-empty ha-icon { --mdc-icon-size:48px; color:var(--blue); }
      .location-detail-caption { display:flex; align-items:center; gap:8px; min-width:0; } .location-detail-caption ha-icon { --mdc-icon-size:18px; color:var(--blue); }
      .location-stat-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
      .location-stat { min-width:0; min-height:116px; padding:16px; border:1px solid var(--kia-line); border-radius:8px; background:var(--kia-control); color:var(--kia-text); display:grid; grid-template-columns:28px 1fr; grid-template-rows:auto 1fr; gap:8px 10px; text-align:left; }
      button.location-stat { cursor:pointer; } .location-stat ha-icon { grid-row:1 / 3; color:var(--blue); --mdc-icon-size:24px; }
      .location-stat strong { align-self:end; font-size:clamp(15px,1vw,18px); line-height:1.25; overflow-wrap:anywhere; }
      .location-context-card p { margin-top:8px; color:var(--kia-muted); font-size:14px; line-height:1.45; } .location-context-card.muted>ha-icon { color:var(--kia-muted); }
      @media (max-width:980px) { .location-detail { grid-template-columns:1fr 1fr; grid-template-areas:"map map" "summary summary" "parking trip" "back back"; } .location-detail-map { min-height:500px; } }
      @media (max-width:640px) { .location-detail { grid-template-columns:1fr; grid-template-areas:"map" "summary" "parking" "trip" "back"; } .location-detail-map { min-height:0; padding:16px; grid-template-rows:auto minmax(300px,52vh) auto; } .location-detail-summary,.location-context-card { padding:18px; } .location-stat-grid { grid-template-columns:1fr; } }
    `;
  }

  _settingsTabStyles() {
    return `
      .settings-detail { margin-top:10px; display:grid; gap:10px; }
      .settings-heading { min-height:108px; padding:22px 26px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:18px; }
      .settings-heading-icon { width:58px; height:58px; border-radius:8px; display:grid; place-items:center; background:color-mix(in srgb,var(--blue) 16%,var(--kia-card)); border:1px solid color-mix(in srgb,var(--blue) 48%,var(--kia-line)); }
      .settings-heading-icon ha-icon { color:var(--blue); --mdc-icon-size:32px; }
      .settings-eyebrow,.settings-panel-title span { display:block; color:var(--blue); font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
      .settings-heading h2 { margin:2px 0 5px; font-size:clamp(23px,2vw,31px); } .settings-heading p,.settings-panel>p { color:var(--kia-muted); line-height:1.5; }
      .settings-health { min-height:36px; padding:0 12px; border:1px solid; border-radius:999px; display:flex; align-items:center; gap:7px; font-size:12px; font-weight:800; white-space:nowrap; } .settings-health ha-icon { --mdc-icon-size:18px; } .settings-health.healthy { color:var(--green); background:color-mix(in srgb,var(--green) 10%,var(--kia-card)); border-color:color-mix(in srgb,var(--green) 45%,var(--kia-line)); } .settings-health.attention { color:var(--amber); background:color-mix(in srgb,var(--amber) 10%,var(--kia-card)); border-color:color-mix(in srgb,var(--amber) 45%,var(--kia-line)); }
      .settings-grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:10px; } .settings-panel { padding:22px; min-width:0; }
      .settings-panel-title { display:grid; grid-template-columns:38px minmax(0,1fr) auto; align-items:center; gap:11px; margin-bottom:16px; } .settings-panel-title>ha-icon { color:var(--blue); --mdc-icon-size:28px; } .settings-panel-title h2 { margin-top:2px; font-size:19px; } .settings-panel-title>strong { color:var(--kia-muted); font-size:12px; } .settings-panel-title>strong.healthy-text { color:var(--green); } .settings-panel-title>strong.attention-text { color:var(--amber); }
      .settings-diagnostic { margin-top:18px; padding:14px; border:1px solid var(--kia-line); border-radius:8px; display:grid; grid-template-columns:28px minmax(0,1fr); gap:11px; align-items:start; background:var(--kia-control); } .settings-diagnostic ha-icon { --mdc-icon-size:24px; } .settings-diagnostic.healthy ha-icon { color:var(--green); } .settings-diagnostic.attention ha-icon { color:var(--amber); } .settings-diagnostic strong,.settings-diagnostic span { display:block; } .settings-diagnostic span { margin-top:4px; color:var(--kia-muted); font-size:12px; line-height:1.45; text-transform:capitalize; } .settings-mapping code { color:var(--blue); font:inherit; font-weight:700; }
      .settings-theme-preview { height:72px; display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; } .theme-swatch { border-radius:8px; border:1px solid var(--kia-line); } .theme-swatch.brand { background:var(--blue); } .theme-swatch.success { background:var(--green); } .theme-swatch.warning { background:var(--amber); } .theme-swatch.surface { background:var(--kia-recessed); } .settings-theme dl { margin:0; } .settings-theme dl div { padding:10px 0; border-top:1px solid var(--kia-line); display:flex; justify-content:space-between; gap:20px; } .settings-theme dt { color:var(--kia-muted); } .settings-theme dd { margin:0; font-weight:700; text-align:right; }
      .settings-actions { margin-top:17px; display:grid; grid-template-columns:1fr 1fr; gap:10px; } .settings-actions button { min-height:76px; padding:12px 14px; border:1px solid var(--kia-line); border-radius:8px; background:var(--kia-control); display:grid; grid-template-columns:32px 1fr; gap:11px; align-items:center; text-align:left; } .settings-actions button:hover { border-color:var(--blue); } .settings-actions button:disabled { cursor:not-allowed; opacity:.48; } .settings-actions button ha-icon { color:var(--blue); --mdc-icon-size:27px; } .settings-actions button strong,.settings-actions button small { display:block; } .settings-actions button small { margin-top:3px; color:var(--kia-muted); }
      .settings-notice { margin-top:12px !important; padding:9px 11px; border-radius:8px; color:var(--blue) !important; background:color-mix(in srgb,var(--blue) 10%,var(--kia-card)); border:1px solid color-mix(in srgb,var(--blue) 35%,var(--kia-line)); font-size:12px; } .settings-feedback { display:grid; gap:8px; } .settings-feedback .status-row { min-height:47px; } .settings-note { margin-top:14px !important; padding-top:14px; border-top:1px solid var(--kia-line); display:grid; grid-template-columns:22px 1fr; gap:9px; color:var(--kia-muted); font-size:12px; line-height:1.45; } .settings-note ha-icon { color:var(--blue); --mdc-icon-size:19px; }
      @media (max-width:900px) { .settings-grid { grid-template-columns:1fr; } .settings-heading { grid-template-columns:auto 1fr; } .settings-health { grid-column:1/-1; justify-self:start; } } @media (max-width:560px) { .settings-heading,.settings-panel { padding:17px; } .settings-heading-icon { width:48px; height:48px; } .settings-actions { grid-template-columns:1fr; } .settings-panel-title { grid-template-columns:32px minmax(0,1fr); } .settings-panel-title>strong { grid-column:2; } .settings-theme dl div { display:block; } .settings-theme dd { margin-top:3px; text-align:left; } }
    `;
  }

  _tabStyles() {
    return [
      this._batteryTabStyles(),
      this._vehicleTabStyles(),
      this._climateTabStyles(),
      this._energyTabStyles(),
      this._locationTabStyles(),
      this._settingsTabStyles(),
    ].join("");
  }

  _chip(icon, label, value, extra = "") {
    return `<span class="chip ${extra}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span><strong>${this._safe(value)}</strong></span>`;
  }

  _metric(icon, label, value, good = false) {
    return `<div class="metric"><ha-icon icon="${icon}"></ha-icon><div><span>${label}</span><strong class="${good ? "good-text" : ""}">${this._safe(value)}</strong></div></div>`;
  }

  _row(icon, label, value, ok = true) {
    return `<div class="status-row"><ha-icon icon="${icon}"></ha-icon><span>${label}</span><strong>${this._safe(value)}</strong><ha-icon class="${ok ? "ok" : "warn"}" icon="${ok ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}"></ha-icon></div>`;
  }

  _openClosed(key) {
    return this._active(key) ? "open" : "closed";
  }

  _numberControl(entityKey, value, unit, label = "Adjust target") {
    const entityId = this._entity(entityKey) || "";
    if (!entityId.startsWith("number.")) return `<b>${this._safe(value)} ${this._safe(unit)}</b>`;
    const attrs = this._rangeAttrs(entityKey, 50, 100, 1);
    return `<div class="limit-control"><div><b>${this._safe(value)} ${this._safe(unit)}</b><small>${label}</small></div><input data-number="${entityKey}" type="range" min="${attrs.min}" max="${attrs.max}" step="${attrs.step}" value="${value}"></div>`;
  }


  _renderOverviewTab(context) {
    const { battery, batteryPct, range, location, lastUpdated, chargeLimitValue, chargeLimitUnit, dcLimitMarkup, mapTiles, markerImage } = context;
    return `<main class="grid">
          <section class="panel battery-panel">
            <div class="panel-title"><ha-icon icon="mdi:battery-charging"></ha-icon><h2>Battery</h2><button data-nav="battery"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="battery-gauge"><div class="battery-bar"><span style="width:${batteryPct}%"></span></div><strong>${battery}<small>%</small></strong></div>
            <div class="battery-facts"><div><span>Range</span><b>${range}</b></div><div><span>Est. range AC on</span><b>${range}</b></div><div class="wide"><span>AC charging limit</span>${this._numberControl("charging_limit", chargeLimitValue, chargeLimitUnit)}</div>${dcLimitMarkup}</div>
          </section>

          <section class="panel actions-panel">
            <div class="panel-title"><ha-icon icon="mdi:flash"></ha-icon><h2>Quick Actions</h2><button data-nav="settings"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="actions"><button data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon><span>Refresh Data</span></button><button data-action="start_climate"><ha-icon icon="mdi:fan"></ha-icon><span>Start Climate</span></button><button data-action="stop_climate"><ha-icon class="warm" icon="mdi:fan-off"></ha-icon><span>Stop Climate</span></button><button data-action="start_charging"><ha-icon class="good" icon="mdi:ev-plug-type2"></ha-icon><span>Start Charging</span></button></div>
            ${this._notice ? `<p class="notice">${this._safe(this._notice)}</p>` : ""}
          </section>

          <section class="panel vehicle-panel">
            <div class="panel-title"><ha-icon icon="mdi:car-estate"></ha-icon><h2>Vehicle Status</h2><button data-nav="vehicle"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="vehicle-list">
              ${this._row("mdi:lock-outline", "Doors", this._locked() ? "closed" : "open", this._locked())}
              ${this._row("mdi:car-door", "Windows", "closed", true)}
              ${this._row("mdi:car-back", "Trunk", this._openClosed("trunk"), !this._active("trunk"))}
              ${this._row("mdi:car-cog", "Hood", this._openClosed("hood"), !this._active("hood"))}
              ${this._row("mdi:car-light-high", "Lights", this._active("lights") ? "on" : "off", true)}
              ${this._row("mdi:ev-plug-type2", "Charge port", this._active("charge_port") ? "open" : "closed", true)}
            </div>
          </section>

          <section class="panel location-panel">
            <div class="panel-title"><ha-icon icon="mdi:map-marker-outline"></ha-icon><h2>Location</h2><button data-nav="location"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="location-layout"><div class="map">${mapTiles ? `<div class="map-tiles" style="${mapTiles.style}">${mapTiles.tiles}</div>` : ""}<span class="map-marker"><img src="${markerImage}" alt="EV6 location" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><ha-icon icon="mdi:car-sports"></ha-icon></span></div><div class="location-meta"><span>Last parked</span><b>${this._safe(location)}</b></div></div>
          </section>

          <section class="panel tire-panel">
            <div class="panel-title"><ha-icon icon="mdi:car-tire-alert"></ha-icon><h2>Tire Status</h2><button data-nav="vehicle"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="tires"><div class="tire-side"><b>${this._tireStatus("tire_front_left")}</b><span>Front left</span><b>${this._tireStatus("tire_rear_left")}</b><span>Rear left</span></div><img src="/local/vehicles/ev6_top.png" alt="Top view"><div class="tire-side"><b>${this._tireStatus("tire_front_right")}</b><span>Front right</span><b>${this._tireStatus("tire_rear_right")}</b><span>Rear right</span></div></div>
          </section>

          <section class="panel health-panel"><ha-icon class="shield" icon="mdi:shield-check-outline"></ha-icon><div><h2>All systems normal</h2><p>No active dashboard warnings. Review Vehicle and Settings after each Home Assistant update.</p></div><ha-icon class="ghost" icon="mdi:shield-check-outline"></ha-icon></section>
        </main>

        <footer class="footer card"><span><ha-icon icon="mdi:information-outline"></ha-icon>Data provided by Kia Connect</span><span>Updated ${lastUpdated}</span><button data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon></button></footer>`;
  }

  _renderActiveTab(context) {
    const renderers = {
      overview: this._renderOverviewTab,
      battery: this._renderBatteryTab,
      vehicle: this._renderVehicleTab,
      climate: this._renderClimateTab,
      energy: this._renderEnergyTab,
      location: this._renderLocationTab,
      settings: this._renderSettingsTab,
    };
    return (renderers[this._activeTab] || renderers.overview).call(this, context);
  }

  _render() {
    if (!this.shadowRoot) return;

    const title = this._config.title || "Kia EV6";
    const battery = this._number("battery_level", 0);
    const batteryPct = Math.max(0, Math.min(100, Number(battery) || 0));
    const range = `${this._number("battery_range")} ${this._unit("battery_range", "km")}`;
    const odometer = `${this._number("odometer")} ${this._unit("odometer", "km")}`;
    const location = this._state("location", "Home");
    const lastUpdated = this._formatDate(this._state("last_updated", "--"));
    const chargingText = this._charging() ? "Charging" : "Not charging";
    const climateText = this._climateOn() ? "On" : "Off";
    const chargeLimitValue = this._number("charging_limit", 100);
    const chargeLimitUnit = this._unit("charging_limit", "%") || "%";
    const dcChargeLimitValue = this._number("dc_charging_limit", 100);
    const dcChargeLimitUnit = this._unit("dc_charging_limit", "%") || "%";
    const dcLimitMarkup = this._entity("dc_charging_limit")
      ? `<div class="wide"><span>DC charging limit</span>${this._numberControl("dc_charging_limit", dcChargeLimitValue, dcChargeLimitUnit)}</div>`
      : "";
    const lockedText = this._locked() ? "Locked" : "Unlocked";
    const mapTiles = this._mapTileGrid();
    const markerImage = this._asset(this._config.images?.map_marker || "ev6_top.png");

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}${this._tabStyles()}</style>
      <ha-card class="kia-shell">
        <section class="hero card">
          <div class="car-stage"><img src="${this._carImage()}" alt="${this._safe(title)}" onerror="this.src='/local/vehicles/ev6_side.png'"></div>
          <div class="divider"></div>
          <div class="hero-data">
            ${this._metric("mdi:speedometer", "Odometer", odometer)}
            ${this._metric("mdi:ev-plug-type2", "Charging state", chargingText, this._charging())}
            ${this._metric("mdi:calendar-clock", "Last updated", lastUpdated)}
            ${this._metric("mdi:thermometer", "Climate", climateText)}
          </div>
          <div class="status-stack">
            <button class="chip" data-info="door_lock"><ha-icon icon="mdi:lock"></ha-icon><span>Lock</span><strong>${lockedText}</strong></button>
            ${this._chip("mdi:wifi", "Connection", "Online", "online")}
            ${this._chip("mdi:battery", "Battery", `${battery} %`)}
          </div>
        </section>

        <nav class="section-nav card">
          <div class="nav-items">
            ${this._nav("mdi:view-dashboard-outline", "Overview", "overview")}
            ${this._nav("mdi:battery-charging", "Battery", "battery")}
            ${this._nav("mdi:car", "Vehicle", "vehicle")}
            ${this._nav("mdi:fan", "Climate", "climate")}
            ${this._nav("mdi:chart-line", "Energy", "energy")}
            ${this._nav("mdi:map-marker-outline", "Location", "location")}
            ${this._nav("mdi:tune", "Settings", "settings")}
          </div>
        </nav>

        ${this._renderActiveTab({ battery, batteryPct, range, location, lastUpdated, chargeLimitValue, chargeLimitUnit, dcLimitMarkup, mapTiles, markerImage })}
      </ha-card>`;

    this.shadowRoot.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => this._navigate(el.dataset.nav)));
    this.shadowRoot.querySelectorAll("[data-info]").forEach((el) => el.addEventListener("click", () => this._moreInfo(el.dataset.info)));
    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => this._handleAction(el.dataset.action)));
    this.shadowRoot.querySelectorAll("[data-number]").forEach((el) => el.addEventListener("change", () => this._setNumber(el.dataset.number, el.value)));
  }

  _styles() {
    return `
      :host {
        display:block;
        --kia-bg:var(--primary-background-color,#080d13);
        --kia-card:var(--card-background-color,#141b24);
        --kia-panel:color-mix(in srgb,var(--kia-card) 92%,var(--kia-bg));
        --kia-control:color-mix(in srgb,var(--kia-card) 86%,var(--primary-color,#42c8ff) 6%);
        --kia-recessed:color-mix(in srgb,var(--kia-bg) 88%,#000 12%);
        --kia-line:var(--divider-color,#21384b);
        --kia-text:var(--primary-text-color,#f5f8fb);
        --kia-muted:var(--secondary-text-color,#aab7c5);
        --blue:var(--primary-color,#42c8ff);
        --green:var(--success-color,#64f276);
        --amber:var(--warning-color,#ffd15a);
        --red:var(--error-color,#ff5252);
        font-family:var(--primary-font-family, Inter, system-ui, sans-serif);
      }
      ha-card.kia-shell { background:var(--kia-bg); color:var(--kia-text); border:0; box-shadow:var(--ha-card-box-shadow,none); padding:clamp(10px,1.1vw,18px); }
      .card,.panel { background:var(--kia-card); background:linear-gradient(145deg, var(--kia-panel), var(--kia-card)); border:1px solid var(--kia-line); border-radius:8px; box-shadow:var(--ha-card-box-shadow,0 8px 22px rgba(0,0,0,.14)); }
      button { font:inherit; color:inherit; cursor:pointer; } h2,p { margin:0; } .good-text { color:var(--green) !important; }
      .hero { min-height:clamp(230px,23vw,330px); display:grid; grid-template-columns:minmax(420px,1.05fr) 1px minmax(460px,.88fr) minmax(172px,210px); align-items:center; gap:clamp(18px,2.4vw,40px); padding:22px clamp(28px,4.5vw,88px); overflow:hidden; }
      .car-stage { min-width:0; display:flex; justify-content:flex-start; align-items:center; } .car-stage img { width:min(760px,100%); height:clamp(190px,22vw,300px); object-fit:contain; object-position:left center; filter:drop-shadow(0 18px 16px rgba(0,0,0,.25)); }
      .divider { height:70%; background:var(--kia-line); opacity:.72; } .hero-data { justify-self:start; width:min(640px,100%); display:grid; grid-template-columns:1fr 1fr; gap:30px 48px; } .metric { display:grid; grid-template-columns:42px 1fr; gap:12px; align-items:center; min-width:0; } .metric ha-icon { color:var(--kia-muted); --mdc-icon-size:34px; } .metric span,.battery-facts span,.location-layout span,.tire-side span { color:var(--kia-muted); font-size:14px; line-height:1.2; } .metric strong { display:block; font-size:clamp(16px,1.1vw,20px); line-height:1.16; overflow-wrap:anywhere; }
      .section-nav { margin-top:10px; padding:10px 18px 16px; border-bottom:3px solid var(--blue); } .nav-items { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:14px; } .status-stack { display:grid; grid-template-columns:1fr; gap:8px; align-self:center; justify-self:end; width:100%; }
      .nav-tile,.actions button { min-height:84px; border-radius:8px; border:1px solid var(--kia-line); background:var(--kia-control); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; font-weight:700; } .nav-tile ha-icon { color:var(--blue); --mdc-icon-size:32px; } .nav-tile.active { border-color:var(--blue); background:color-mix(in srgb,var(--blue) 18%,var(--kia-card)); box-shadow:inset 0 -3px 0 var(--blue); } .nav-tile.active span { color:var(--blue); }
      .chip { min-height:40px; padding:0 12px; border-radius:8px; border:1px solid var(--kia-line); background:color-mix(in srgb,var(--blue) 14%,var(--kia-card)); display:grid; grid-template-columns:22px 1fr auto; align-items:center; gap:8px; font-weight:700; font-size:13px; text-align:left; } .chip ha-icon { color:var(--blue); --mdc-icon-size:18px; } .chip span { color:var(--kia-muted); } .chip.online { background:color-mix(in srgb,var(--green) 18%,var(--kia-card)); } .chip.online strong { color:var(--green); }
      .grid { margin-top:12px; display:grid; grid-template-columns:1fr 1fr 1.28fr; grid-template-areas:"battery actions vehicle" "location location tires" "location location health"; gap:12px; align-items:stretch; } .panel { min-height:160px; padding:18px 22px; position:relative; overflow:hidden; } .battery-panel{grid-area:battery}.actions-panel{grid-area:actions}.vehicle-panel{grid-area:vehicle}.location-panel{grid-area:location;min-height:340px}.tire-panel{grid-area:tires}.health-panel{grid-area:health}
      .panel-title { display:flex; align-items:center; gap:12px; margin-bottom:12px; } .panel-title h2 { flex:1; font-size:20px; } .panel-title ha-icon { color:var(--blue); } .panel-title button,.footer button { border:0; background:transparent; padding:0; color:var(--kia-muted); }
      .battery-gauge { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:18px; margin:4px 0 18px; } .battery-gauge strong { font-size:clamp(28px,2.25vw,40px); line-height:1; white-space:nowrap; } .battery-gauge small { font-size:.48em; margin-left:4px; } .battery-bar { height:34px; border-radius:8px; padding:5px; background:var(--kia-recessed); border:1px solid var(--kia-line); overflow:hidden; } .battery-bar span { display:block; height:100%; border-radius:6px; background:linear-gradient(90deg,var(--red) 0 30%,var(--amber) 30% 55%,var(--green) 55% 100%); }
      .battery-facts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 18px; } .battery-facts div { min-width:0; } .battery-facts .wide { grid-column:1 / -1; } .battery-facts b { display:block; font-size:clamp(15px,1.1vw,19px); line-height:1.1; overflow-wrap:anywhere; } .limit-control { display:grid; grid-template-columns:auto minmax(120px,1fr); gap:14px; align-items:center; } .limit-control small { display:block; color:var(--kia-muted); font-size:12px; margin-top:2px; } .limit-control input { width:100%; accent-color:var(--blue); }
      .actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; } .actions ha-icon { color:var(--blue); --mdc-icon-size:34px; } .actions .warm { color:var(--amber); } .actions .good { color:var(--green); } .notice { margin-top:12px; color:var(--kia-muted); font-size:13px; line-height:1.35; }
      .vehicle-list { display:grid; gap:13px; padding-inline:8px; } .status-row { display:grid; grid-template-columns:30px 1fr auto 28px; align-items:center; gap:12px; color:var(--kia-muted); } .status-row strong { color:var(--kia-text); } .status-row ha-icon { color:var(--kia-muted); } .status-row .ok { color:var(--green); } .status-row .warn { color:var(--amber); }
      .location-layout { display:grid; grid-template-columns:1fr; grid-template-rows:minmax(260px,1fr) auto; gap:12px; align-items:stretch; height:100%; } .map { min-height:clamp(280px,22vw,380px); border-radius:8px; background:color-mix(in srgb,var(--kia-control) 62%,var(--blue) 8%); display:grid; place-items:center; position:relative; overflow:hidden; isolation:isolate; } .map-tiles { position:absolute; left:0; top:0; width:var(--map-size,1280px); height:var(--map-size,1280px); display:grid; grid-template-columns:repeat(var(--map-grid,5),256px); grid-template-rows:repeat(var(--map-grid,5),256px); transform-origin:0 0; z-index:0; filter:saturate(1.18) contrast(1.08); } .map-tiles img,.map-tile-empty { width:256px; height:256px; display:block; } .map-tile-empty { background:var(--kia-control); } .map:before { content:""; position:absolute; inset:0; background:color-mix(in srgb,var(--kia-card) 4%,transparent); pointer-events:none; z-index:1; } .map-marker { width:46px; height:46px; border-radius:0; background:transparent; border:0; display:grid; place-items:center; box-shadow:none; z-index:2; } .map-marker img { width:42px; height:42px; object-fit:contain; filter:drop-shadow(0 4px 6px rgba(0,0,0,.34)); } .map-marker ha-icon { display:none; color:var(--blue); --mdc-icon-size:28px; } .location-meta { display:grid; grid-template-columns:1fr auto; gap:6px 16px; align-items:end; } .location-meta span { grid-column:1 / -1; } .location-meta b { display:block; font-size:20px; margin:0; }
      .tires { display:grid; grid-template-columns:1fr 86px 1fr; align-items:center; gap:18px; } .tires img { width:86px; height:136px; object-fit:contain; justify-self:center; } .tire-side { display:grid; gap:3px; } .tire-side b { font-size:18px; } .tire-side b:before { content:""; display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--green); margin-right:8px; box-shadow:0 0 7px var(--green); } .tire-side:first-child { text-align:right; }
      .health-panel { display:flex; align-items:center; gap:26px; } .shield { color:var(--green); --mdc-icon-size:56px; } .health-panel h2 { font-size:22px; } .health-panel p { color:var(--kia-muted); margin-top:6px; } .ghost { position:absolute; right:28px; bottom:18px; opacity:.12; --mdc-icon-size:72px; }
      .footer { margin-top:12px; min-height:44px; padding:0 16px; display:flex; align-items:center; justify-content:space-between; color:var(--kia-muted); } .footer span { display:flex; align-items:center; gap:8px; }
      .detail-placeholder { margin-top:12px; min-height:clamp(300px,38vw,560px); padding:clamp(28px,5vw,72px); display:flex; align-items:center; justify-content:center; gap:24px; text-align:left; } .detail-placeholder>ha-icon { color:var(--blue); --mdc-icon-size:64px; } .detail-placeholder span { color:var(--blue); font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; } .detail-placeholder h2 { margin-top:6px; font-size:clamp(28px,3vw,44px); } .detail-placeholder p { max-width:620px; margin-top:10px; color:var(--kia-muted); line-height:1.5; }
      @media (max-width:1180px){.hero{grid-template-columns:1fr;gap:16px}.divider{display:none}.hero-data{grid-template-columns:repeat(2,minmax(0,1fr))}.status-stack{grid-template-columns:repeat(3,minmax(0,1fr));justify-self:stretch}.grid{grid-template-columns:1fr 1fr;grid-template-areas:"battery actions" "vehicle vehicle" "location location" "tires health"}.location-panel{min-height:auto}.location-layout{grid-template-rows:auto auto;height:auto}.map{min-height:clamp(260px,36vw,360px)}.nav-items{grid-template-columns:repeat(3,1fr)}}
      @media (max-width:760px){ha-card.kia-shell{padding:10px}.chip{min-height:36px;padding:0 10px;font-size:12px}.hero{padding:18px;min-height:0}.car-stage img{height:210px;object-position:center}.hero-data,.grid{grid-template-columns:1fr}.grid{grid-template-areas:"battery" "actions" "vehicle" "location" "tires" "health"}.nav-items{grid-template-columns:repeat(2,1fr)}.status-stack{grid-template-columns:1fr}.battery-gauge,.battery-facts,.limit-control{grid-template-columns:1fr}.location-layout{height:auto}.footer{flex-direction:column;align-items:flex-start;padding:12px 16px;gap:8px}.detail-placeholder{min-height:320px;flex-direction:column;text-align:center}}
    `;
  }
}

customElements.define("kia-dashboard-card", KiaDashboardCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "kia-dashboard-card", name: "Kia Dashboard Card", description: "Responsive Kia EV6 overview card for Home Assistant." });