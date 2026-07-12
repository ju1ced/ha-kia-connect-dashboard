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
    const battery = context.battery ?? this._number("battery_level", 0);
    const pct = context.batteryPct ?? Math.max(0, Math.min(100, Number(battery) || 0));
    const range = context.range ?? `${this._number("battery_range")} ${this._unit("battery_range", "km")}`;
    const charging = this._charging();
    const plugged = this._active("plug_connected");
    const power = `${this._number("charging_power")} ${this._unit("charging_power", "kW")}`;
    const acValue = context.chargeLimitValue ?? this._number("charging_limit", 100);
    const acUnit = context.chargeLimitUnit ?? (this._unit("charging_limit", "%") || "%");
    const hasDc = Boolean(this._entity("dc_charging_limit"));
    const dcValue = this._number("dc_charging_limit", 100);
    const dcUnit = this._unit("dc_charging_limit", "%") || "%";
    const title = (icon, heading, caption) => `<div class="battery-detail-title"><ha-icon icon="${icon}"></ha-icon><div><h3>${heading}</h3><span>${caption}</span></div></div>`;

    return `<main class="battery-detail" aria-label="Battery details">
      <section class="battery-detail-card battery-detail-hero">
        <div class="battery-detail-heading"><span>EV battery overview</span><h2>Battery</h2><p>Range, charging state, limits, and cable status in one focused view.</p></div>
        <div class="battery-detail-gauge" style="--level:${pct}%"><div><strong>${this._safe(battery)}<small>%</small></strong><span>State of charge</span></div></div>
        <div class="battery-detail-highlights">
          <div><ha-icon icon="mdi:map-marker-distance"></ha-icon><span>Estimated range</span><strong>${this._safe(range)}</strong></div>
          <div><ha-icon icon="mdi:battery-charging"></ha-icon><span>Charging state</span><strong class="${charging ? "good" : ""}">${charging ? "Charging" : "Not charging"}</strong></div>
          <div><ha-icon icon="mdi:power-plug"></ha-icon><span>Plug connected</span><strong>${plugged ? "Yes" : "No"}</strong></div>
        </div>
      </section>
      <div class="battery-detail-grid">
        <section class="battery-detail-card">${title("mdi:ev-station", "Charge controls", "Remote actions require confirmation")}<div class="battery-detail-actions"><button data-action="start_charging"><ha-icon icon="mdi:play-circle-outline"></ha-icon>Start charging</button><button class="stop" data-action="stop_charging"><ha-icon icon="mdi:stop-circle-outline"></ha-icon>Stop charging</button></div>${this._notice ? `<p class="battery-detail-notice" role="status">${this._safe(this._notice)}</p>` : ""}</section>
        <section class="battery-detail-card">${title("mdi:battery-sync", "Charge limits", "Configured charging targets")}<div class="battery-detail-limit"><span>AC target</span>${this._numberControl("charging_limit", acValue, acUnit)}</div>${hasDc ? `<div class="battery-detail-limit"><span>DC target</span>${this._numberControl("dc_charging_limit", dcValue, dcUnit)}</div>` : ""}</section>
        <section class="battery-detail-card">${title("mdi:map-marker-distance", "Range context", "Current driving estimate")}<div class="battery-detail-stat"><strong>${this._safe(range)}</strong><span>Estimated remaining range</span></div><div class="battery-detail-progress"><span style="width:${pct}%"></span></div><p>Range changes with temperature, driving style, speed, and climate use.</p></section>
        <section class="battery-detail-card">${title("mdi:heart-pulse", "Battery health", "Available battery signals")}<div class="battery-detail-list"><div><span>State of charge</span><strong>${this._safe(battery)}%</strong></div><div><span>Cable state</span><strong>${plugged ? "Connected" : "Disconnected"}</strong></div><div><span>Session state</span><strong class="${charging ? "good" : ""}">${charging ? "Active" : "Inactive"}</strong></div></div><p>State-of-health and battery temperature will appear when mapped entities become available.</p></section>
        <section class="battery-detail-card battery-detail-session">${title("mdi:flash", "Charging session", "Live connection context")}<div class="battery-detail-session-body"><ha-icon class="${charging ? "active" : ""}" icon="mdi:ev-plug-type2"></ha-icon><div><span>Charging power</span><strong>${this._safe(power)}</strong></div><div><span>Current state</span><strong>${charging ? "Charging" : plugged ? "Ready to charge" : "Not connected"}</strong></div></div><p>Charging history and estimated completion can be added when the integration exposes those entities.</p></section>
      </div>
    </main>`;
  }

  _renderVehicleTab() {
    return this._renderPlaceholder("mdi:car", "Vehicle");
  }

  _renderClimateTab() {
    return this._renderPlaceholder("mdi:fan", "Climate");
  }

  _renderEnergyTab() {
    return this._renderPlaceholder("mdi:chart-line", "Energy");
  }

  _renderLocationTab() {
    return this._renderPlaceholder("mdi:map-marker-outline", "Location");
  }

  _renderSettingsTab() {
    return this._renderPlaceholder("mdi:tune", "Settings");
  }

  _batteryTabStyles() {
    return `
      .battery-detail{margin-top:12px;display:grid;gap:12px}.battery-detail-card{background:linear-gradient(145deg,var(--kia-panel),var(--kia-card));border:1px solid var(--kia-line);border-radius:8px;box-shadow:var(--ha-card-box-shadow,0 8px 22px rgba(0,0,0,.14));padding:clamp(18px,2vw,28px);min-width:0}.battery-detail-card>p,.battery-detail-heading p{margin-top:12px;color:var(--kia-muted);line-height:1.5}
      .battery-detail-hero{min-height:250px;display:grid;grid-template-columns:minmax(220px,.8fr) minmax(190px,.55fr) minmax(300px,1fr);gap:clamp(22px,3vw,54px);align-items:center}.battery-detail-heading>span{color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.battery-detail-heading h2{margin-top:7px;font-size:clamp(30px,3vw,46px);line-height:1}
      .battery-detail-gauge{width:min(190px,100%);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;justify-self:center;background:conic-gradient(var(--green) var(--level),var(--kia-recessed) 0);position:relative}.battery-detail-gauge:before{content:"";position:absolute;inset:12px;border-radius:50%;background:var(--kia-card);border:1px solid var(--kia-line)}.battery-detail-gauge div{position:relative;text-align:center}.battery-detail-gauge strong{display:block;font-size:clamp(34px,3vw,48px)}.battery-detail-gauge small{font-size:.48em}.battery-detail-gauge span,.battery-detail-title span,.battery-detail-highlights span,.battery-detail-stat span,.battery-detail-session-body span{color:var(--kia-muted);font-size:13px}
      .battery-detail-highlights{display:grid;gap:12px}.battery-detail-highlights>div{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:2px 10px;padding:12px 14px;border-radius:8px;background:var(--kia-control);border:1px solid var(--kia-line)}.battery-detail-highlights ha-icon{grid-row:1/3;color:var(--blue);--mdc-icon-size:26px}.battery-detail-highlights strong{font-size:17px}.battery-detail .good{color:var(--green)}
      .battery-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.battery-detail-title{display:flex;gap:12px;align-items:center;margin-bottom:20px}.battery-detail-title>ha-icon{color:var(--blue);--mdc-icon-size:28px}.battery-detail-title h3{margin:0 0 2px;font-size:20px}.battery-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.battery-detail-actions button{min-height:54px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid var(--green);border-radius:8px;background:color-mix(in srgb,var(--green) 12%,var(--kia-control));font-weight:800}.battery-detail-actions .stop{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 10%,var(--kia-control))}.battery-detail-notice{margin:12px 0 0;padding:10px 12px;border-radius:8px;background:var(--kia-control);border:1px solid var(--kia-line)}
      .battery-detail-limit+.battery-detail-limit{margin-top:18px}.battery-detail-limit>span{display:block;margin-bottom:7px;color:var(--kia-muted);font-size:13px}.battery-detail-limit .limit-control{grid-template-columns:minmax(90px,auto) minmax(120px,1fr)}.battery-detail-stat strong{display:block;font-size:clamp(28px,3vw,42px)}.battery-detail-progress{height:16px;margin-top:20px;padding:3px;border-radius:8px;background:var(--kia-recessed);border:1px solid var(--kia-line)}.battery-detail-progress span{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--red) 0 30%,var(--amber) 30% 55%,var(--green) 55% 100%)}
      .battery-detail-list{display:grid;gap:1px;border:1px solid var(--kia-line);border-radius:8px;overflow:hidden;background:var(--kia-line)}.battery-detail-list>div{display:flex;justify-content:space-between;gap:18px;padding:12px 14px;background:var(--kia-control)}.battery-detail-list span{color:var(--kia-muted)}.battery-detail-session{grid-column:1/-1}.battery-detail-session-body{display:grid;grid-template-columns:64px repeat(2,minmax(0,1fr));align-items:center;gap:20px}.battery-detail-session-body>ha-icon{width:58px;height:58px;padding:14px;box-sizing:border-box;border-radius:50%;color:var(--kia-muted);background:var(--kia-control);border:1px solid var(--kia-line)}.battery-detail-session-body>ha-icon.active{color:var(--green)}.battery-detail-session-body strong{display:block;margin-top:4px;font-size:20px}
      @media(max-width:1180px){.battery-detail-hero{grid-template-columns:1fr 1fr}.battery-detail-heading{grid-column:1/-1}}@media(max-width:760px){.battery-detail-hero,.battery-detail-grid{grid-template-columns:1fr}.battery-detail-heading,.battery-detail-session{grid-column:auto}.battery-detail-actions{grid-template-columns:1fr}.battery-detail-session-body{grid-template-columns:58px 1fr}.battery-detail-session-body>div:last-child{grid-column:2}.battery-detail-limit .limit-control{grid-template-columns:1fr}}
    `;
  }

  _vehicleTabStyles() {
    return "";
  }

  _climateTabStyles() {
    return "";
  }

  _energyTabStyles() {
    return "";
  }

  _locationTabStyles() {
    return "";
  }

  _settingsTabStyles() {
    return "";
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