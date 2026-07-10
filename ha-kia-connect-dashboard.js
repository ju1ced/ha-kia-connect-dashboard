class KiaDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._notice = "";
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

  _trackerCoords() {
    const obj = this._obj("location");
    const lat = Number.parseFloat(obj?.attributes?.latitude);
    const lon = Number.parseFloat(obj?.attributes?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  }

  _tileUrl() {
    const coords = this._trackerCoords();
    if (!coords) return "";
    const zoom = 15;
    const x = Math.floor(((coords.lon + 180) / 360) * 2 ** zoom);
    const y = Math.floor(
      ((1 - Math.log(Math.tan((coords.lat * Math.PI) / 180) + 1 / Math.cos((coords.lat * Math.PI) / 180)) / Math.PI) / 2) *
        2 ** zoom,
    );
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
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
    const current = window.location.pathname.replace(/\/$/, "");
    const base = current.split("/").slice(0, -1).join("/") || current || "/";
    window.history.pushState(null, "", `${base}/${section}`.replace(/\/+/g, "/"));
    window.dispatchEvent(new Event("location-changed"));
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
    return `<button class="nav-tile" data-nav="${section}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></button>`;
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

  _render() {
    if (!this.shadowRoot) return;

    const title = this._config.title || "Kia EV6";
    const battery = this._number("battery_level", 0);
    const batteryPct = Math.max(0, Math.min(100, Number(battery) || 0));
    const range = `${this._number("battery_range")} ${this._unit("battery_range", "km")}`;
    const odometer = `${this._number("odometer")} ${this._unit("odometer", "km")}`;
    const location = this._state("location", "Home");
    const lastUpdated = this._state("last_updated", "--");
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
    const tileUrl = this._tileUrl();
    const mapStyle = tileUrl ? ` style="background-image:linear-gradient(rgba(9,16,24,.38),rgba(9,16,24,.68)),url('${tileUrl}')"` : "";

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
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
            ${this._nav("mdi:battery-charging", "Battery", "battery")}
            ${this._nav("mdi:car", "Vehicle", "vehicle")}
            ${this._nav("mdi:fan", "Climate", "climate")}
            ${this._nav("mdi:chart-line", "Energy", "energy")}
            ${this._nav("mdi:map-marker-outline", "Location", "location")}
            ${this._nav("mdi:tune", "Settings", "settings")}
          </div>
        </nav>

        <main class="grid">
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
            <div class="location-layout"><div class="map"${mapStyle}><i></i></div><div><span>Last parked</span><b>${this._safe(location)}</b><span>Odometer</span><b>${odometer}</b></div></div>
          </section>

          <section class="panel tire-panel">
            <div class="panel-title"><ha-icon icon="mdi:car-tire-alert"></ha-icon><h2>Tire Status</h2><button data-nav="vehicle"><ha-icon icon="mdi:chevron-right"></ha-icon></button></div>
            <div class="tires"><div class="tire-side"><b>${this._state("tire_front_left", "OK")}</b><span>Front left</span><b>${this._state("tire_rear_left", "OK")}</b><span>Rear left</span></div><img src="/local/vehicles/ev6_top.png" alt="Top view"><div class="tire-side"><b>${this._state("tire_front_right", "OK")}</b><span>Front right</span><b>${this._state("tire_rear_right", "OK")}</b><span>Rear right</span></div></div>
          </section>

          <section class="panel health-panel"><ha-icon class="shield" icon="mdi:shield-check-outline"></ha-icon><div><h2>All systems normal</h2><p>No active dashboard warnings. Review Vehicle and Settings after each Home Assistant update.</p></div><ha-icon class="ghost" icon="mdi:shield-check-outline"></ha-icon></section>
        </main>

        <footer class="footer card"><span><ha-icon icon="mdi:information-outline"></ha-icon>Data provided by Kia Connect</span><span>Updated ${lastUpdated}</span><button data-action="refresh"><ha-icon icon="mdi:refresh"></ha-icon></button></footer>
      </ha-card>`;

    this.shadowRoot.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => this._navigate(el.dataset.nav)));
    this.shadowRoot.querySelectorAll("[data-info]").forEach((el) => el.addEventListener("click", () => this._moreInfo(el.dataset.info)));
    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => this._handleAction(el.dataset.action)));
    this.shadowRoot.querySelectorAll("[data-number]").forEach((el) => el.addEventListener("change", () => this._setNumber(el.dataset.number, el.value)));
  }

  _styles() {
    return `
      :host { display:block; --bg:#080d13; --card:#141b24; --line:#21384b; --text:#f5f8fb; --muted:#aab7c5; --blue:#42c8ff; --green:#64f276; --amber:#ffd15a; --red:#ff5252; font-family:var(--primary-font-family, Inter, system-ui, sans-serif); }
      ha-card.kia-shell { background:radial-gradient(circle at 44% 0%, rgba(55,85,108,.18), transparent 34%), var(--bg); color:var(--text); border:0; box-shadow:none; padding:clamp(10px,1.1vw,18px); }
      .card,.panel { background:linear-gradient(145deg, rgba(27,34,45,.96), rgba(13,20,28,.98)); border:1px solid var(--line); border-radius:8px; box-shadow:inset 0 1px 0 rgba(255,255,255,.035), 0 14px 34px rgba(0,0,0,.22); }
      button { font:inherit; color:inherit; cursor:pointer; } h2,p { margin:0; } .good-text { color:var(--green) !important; }
      .hero { min-height:clamp(230px,23vw,330px); display:grid; grid-template-columns:minmax(420px,1.05fr) 1px minmax(460px,.88fr) minmax(172px,210px); align-items:center; gap:clamp(18px,2.4vw,40px); padding:22px clamp(28px,4.5vw,88px); overflow:hidden; }
      .car-stage { min-width:0; display:flex; justify-content:flex-start; align-items:center; } .car-stage img { width:min(760px,100%); height:clamp(190px,22vw,300px); object-fit:contain; object-position:left center; filter:drop-shadow(0 22px 18px rgba(0,0,0,.34)); }
      .divider { height:70%; background:rgba(170,183,197,.18); } .hero-data { justify-self:start; width:min(640px,100%); display:grid; grid-template-columns:1fr 1fr; gap:30px 48px; } .metric { display:grid; grid-template-columns:42px 1fr; gap:12px; align-items:center; min-width:0; } .metric ha-icon { color:#b9c6d6; --mdc-icon-size:34px; } .metric span,.battery-facts span,.location-layout span,.tire-side span { color:var(--muted); font-size:14px; line-height:1.2; } .metric strong { display:block; font-size:clamp(16px,1.1vw,20px); line-height:1.16; overflow-wrap:anywhere; }
      .section-nav { margin-top:10px; padding:10px 18px 16px; border-bottom:3px solid rgba(66,200,255,.7); } .nav-items { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:14px; } .status-stack { display:grid; grid-template-columns:1fr; gap:8px; align-self:center; justify-self:end; width:100%; }
      .nav-tile,.actions button { min-height:84px; border-radius:8px; border:1px solid #25384a; background:linear-gradient(145deg,#1b2430,#121922); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; font-weight:700; } .nav-tile ha-icon { color:var(--blue); --mdc-icon-size:32px; }
      .chip { min-height:40px; padding:0 12px; border-radius:8px; border:1px solid var(--line); background:#152638; display:grid; grid-template-columns:22px 1fr auto; align-items:center; gap:8px; font-weight:700; font-size:13px; text-align:left; } .chip ha-icon { color:var(--blue); --mdc-icon-size:18px; } .chip span { color:var(--muted); } .chip.online { background:#143022; } .chip.online strong { color:var(--green); }
      .grid { margin-top:12px; display:grid; grid-template-columns:1fr 1fr 1.28fr; grid-template-areas:"battery actions vehicle" "location tires health"; gap:12px; } .panel { min-height:160px; padding:18px 22px; position:relative; overflow:hidden; } .battery-panel{grid-area:battery}.actions-panel{grid-area:actions}.vehicle-panel{grid-area:vehicle}.location-panel{grid-area:location}.tire-panel{grid-area:tires}.health-panel{grid-area:health}
      .panel-title { display:flex; align-items:center; gap:12px; margin-bottom:12px; } .panel-title h2 { flex:1; font-size:20px; } .panel-title ha-icon { color:var(--blue); } .panel-title button,.footer button { border:0; background:transparent; padding:0; color:var(--muted); }
      .battery-gauge { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:18px; margin:4px 0 18px; } .battery-gauge strong { font-size:clamp(28px,2.25vw,40px); line-height:1; white-space:nowrap; } .battery-gauge small { font-size:.48em; margin-left:4px; } .battery-bar { height:34px; border-radius:8px; padding:5px; background:#0b121b; border:1px solid #25384a; overflow:hidden; } .battery-bar span { display:block; height:100%; border-radius:6px; background:linear-gradient(90deg,var(--red) 0 30%,var(--amber) 30% 55%,var(--green) 55% 100%); box-shadow:0 0 24px rgba(66,200,255,.25); }
      .battery-facts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 18px; } .battery-facts div { min-width:0; } .battery-facts .wide { grid-column:1 / -1; } .battery-facts b { display:block; font-size:clamp(15px,1.1vw,19px); line-height:1.1; overflow-wrap:anywhere; } .limit-control { display:grid; grid-template-columns:auto minmax(120px,1fr); gap:14px; align-items:center; } .limit-control small { display:block; color:var(--muted); font-size:12px; margin-top:2px; } .limit-control input { width:100%; accent-color:var(--blue); }
      .actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; } .actions ha-icon { color:var(--blue); --mdc-icon-size:34px; } .actions .warm { color:var(--amber); } .actions .good { color:var(--green); } .notice { margin-top:12px; color:var(--muted); font-size:13px; line-height:1.35; }
      .vehicle-list { display:grid; gap:13px; padding-inline:8px; } .status-row { display:grid; grid-template-columns:30px 1fr auto 28px; align-items:center; gap:12px; color:var(--muted); } .status-row strong { color:var(--text); } .status-row ha-icon { color:#b9c6d6; } .status-row .ok { color:var(--green); } .status-row .warn { color:var(--amber); }
      .location-layout { display:grid; grid-template-columns:minmax(260px,1.15fr) minmax(135px,.7fr); gap:20px; align-items:center; } .map { min-height:168px; border-radius:8px; background-color:#142330; background-size:cover; background-position:center; display:grid; place-items:center; position:relative; overflow:hidden; } .map:before { content:""; position:absolute; inset:0; background:linear-gradient(45deg,rgba(38,95,67,.32),transparent 55%); } .map i { width:30px; aspect-ratio:1; border-radius:50%; background:var(--blue); box-shadow:0 0 0 12px rgba(66,200,255,.22),0 0 28px rgba(66,200,255,.5); z-index:1; } .location-layout b { display:block; font-size:20px; margin:2px 0 12px; }
      .tires { display:grid; grid-template-columns:1fr 86px 1fr; align-items:center; gap:18px; } .tires img { width:86px; height:136px; object-fit:contain; justify-self:center; } .tire-side { display:grid; gap:3px; } .tire-side b { font-size:18px; } .tire-side b:before { content:""; display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--green); margin-right:8px; box-shadow:0 0 7px var(--green); } .tire-side:first-child { text-align:right; }
      .health-panel { display:flex; align-items:center; gap:26px; } .shield { color:var(--green); --mdc-icon-size:56px; } .health-panel h2 { font-size:22px; } .health-panel p { color:var(--muted); margin-top:6px; } .ghost { position:absolute; right:28px; bottom:18px; opacity:.12; --mdc-icon-size:72px; }
      .footer { margin-top:12px; min-height:44px; padding:0 16px; display:flex; align-items:center; justify-content:space-between; color:var(--muted); } .footer span { display:flex; align-items:center; gap:8px; }
      @media (max-width:1180px){.hero{grid-template-columns:1fr;gap:16px}.divider{display:none}.hero-data{grid-template-columns:repeat(2,minmax(0,1fr))}.status-stack{grid-template-columns:repeat(3,minmax(0,1fr));justify-self:stretch}.grid{grid-template-columns:1fr 1fr;grid-template-areas:"battery actions" "vehicle vehicle" "location tires" "health health"}.nav-items{grid-template-columns:repeat(3,1fr)}}
      @media (max-width:760px){ha-card.kia-shell{padding:10px}.chip{min-height:36px;padding:0 10px;font-size:12px}.hero{padding:18px;min-height:0}.car-stage img{height:210px;object-position:center}.hero-data,.grid,.location-layout{grid-template-columns:1fr}.grid{grid-template-areas:"battery" "actions" "vehicle" "location" "tires" "health"}.nav-items{grid-template-columns:repeat(2,1fr)}.status-stack{grid-template-columns:1fr}.battery-gauge,.battery-facts,.limit-control{grid-template-columns:1fr}.footer{flex-direction:column;align-items:flex-start;padding:12px 16px;gap:8px}}
    `;
  }
}

customElements.define("kia-dashboard-card", KiaDashboardCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "kia-dashboard-card", name: "Kia Dashboard Card", description: "Responsive Kia EV6 overview card for Home Assistant." });
