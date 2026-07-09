class KiaDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = undefined;
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

  _stateObj(key) {
    const entityId = this._entity(key);
    return entityId && this._hass ? this._hass.states[entityId] : undefined;
  }

  _state(key, fallback = "--") {
    const obj = this._stateObj(key);
    if (!obj || obj.state === "unknown" || obj.state === "unavailable") {
      return fallback;
    }
    return obj.state;
  }

  _number(key, fallback = "--") {
    const value = Number.parseFloat(this._state(key, ""));
    return Number.isFinite(value) ? Math.round(value * 10) / 10 : fallback;
  }

  _unit(key) {
    return this._stateObj(key)?.attributes?.unit_of_measurement || "";
  }

  _friendly(key, fallback) {
    return this._stateObj(key)?.attributes?.friendly_name || fallback;
  }

  _isOn(key) {
    return ["on", "open", "unlocked", "charging", "connected", "heat_cool", "heat", "cool", "dry", "fan_only"]
      .includes(String(this._state(key, "off")).toLowerCase());
  }

  _isCharging() {
    return this._isOn("charging_state") || String(this._state("charging_state", "")).toLowerCase().includes("charging");
  }

  _isClimateOn() {
    const value = String(this._state("climate", "off")).toLowerCase();
    return value && !["off", "idle", "unknown", "unavailable", "--"].includes(value);
  }

  _asset(name) {
    if (!name) return "";
    if (name.startsWith("/")) return name;
    return `${this._config.asset_base || "/local/vehicles/"}${name}`;
  }

  _image() {
    const images = this._config.images || {};
    if (this._isCharging()) return this._asset(images.charging || "ev6_charging.png");
    if (this._isClimateOn()) return this._asset(images.climate || "ev6_climate.png");
    return this._asset(images.normal || "ev6_front_right.png");
  }

  _labelFor(key, onLabel, offLabel) {
    return this._isOn(key) ? onLabel : offLabel;
  }

  _navigate(section) {
    const current = window.location.pathname.replace(/\/$/, "");
    const base = current.split("/").slice(0, -1).join("/") || current || "/";
    const path = `${base}/${section}`.replace(/\/+/g, "/");
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
  }

  _moreInfo(key) {
    const entityId = this._entity(key);
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId }
    }));
  }

  _pressRefresh() {
    const entityId = this._entity("refresh");
    if (!entityId || !this._hass) return;
    if (entityId.startsWith("button.")) {
      this._hass.callService("button", "press", { entity_id: entityId });
      return;
    }
    this._moreInfo("refresh");
  }

  _navTile(icon, label, section) {
    return `<button class="nav-tile" data-nav="${section}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></button>`;
  }

  _metric(icon, label, value, status = "") {
    return `<div class="hero-metric"><ha-icon icon="${icon}"></ha-icon><div><span>${label}</span><strong class="${status}">${value}</strong></div></div>`;
  }

  _vehicleRow(icon, label, key, goodWhenOff = true) {
    const on = this._isOn(key);
    const text = goodWhenOff ? (on ? "open" : "closed") : (on ? "on" : "off");
    const ok = goodWhenOff ? !on : true;
    return `<div class="status-row"><ha-icon icon="${icon}"></ha-icon><span>${label}</span><strong>${text}</strong><ha-icon class="${ok ? "ok" : "warn"}" icon="${ok ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}"></ha-icon></div>`;
  }

  _render() {
    if (!this.shadowRoot) return;
    const title = this._config.title || "Kia EV6";
    const subtitle = this._config.subtitle || "GT-Line RWD";
    const battery = this._number("battery_level", 0);
    const range = `${this._number("battery_range")} ${this._unit("battery_range") || "km"}`;
    const odometer = `${this._number("odometer")} ${this._unit("odometer") || "km"}`;
    const chargingText = this._isCharging() ? "Charging" : "Not charging";
    const plugText = this._labelFor("plug_connected", "Yes", "No");
    const location = this._state("location", "Home");
    const lastUpdated = this._state("last_updated", "--");
    const climate = this._isClimateOn() ? "On" : "Off";
    const chargeLimit = `${this._number("charging_limit", 100)} %`;
    const image = this._image();

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card class="kia-shell">
        <section class="topbar">
          <div class="breadcrumb"><span>Home</span><span>/</span><strong>${title}</strong></div>
          <div class="identity"><ha-icon icon="mdi:car-electric"></ha-icon><div><h1>${title}</h1><p>${subtitle}</p></div></div>
          <div class="chips">
            <button class="chip" data-info="door_lock"><ha-icon icon="mdi:lock"></ha-icon>${this._labelFor("door_lock", "Locked", "Unlocked")}</button>
            <span class="chip good"><ha-icon icon="mdi:wifi"></ha-icon>Online</span>
            <span class="chip"><ha-icon icon="mdi:battery"></ha-icon>${battery} % Battery</span>
          </div>
        </section>

        <section class="hero card">
          <div class="hero-car"><img src="${image}" alt="${title}" onerror="this.src='/local/vehicles/ev6_side.png'"></div>
          <div class="hero-divider"></div>
          <div class="hero-data">
            ${this._metric("mdi:speedometer", "Odometer", odometer)}
            ${this._metric("mdi:ev-plug-type2", "Charging state", chargingText, this._isCharging() ? "good-text" : "")}
            ${this._metric("mdi:calendar-clock", "Last updated", lastUpdated)}
            ${this._metric("mdi:thermometer", "Climate", climate)}
          </div>
        </section>

        <nav class="section-nav card">
          ${this._navTile("mdi:battery-charging", "Battery", "battery")}
          ${this._navTile("mdi:car", "Vehicle", "vehicle")}
          ${this._navTile("mdi:fan", "Climate", "climate")}
          ${this._navTile("mdi:chart-line", "Energy", "energy")}
          ${this._navTile("mdi:map-marker-outline", "Location", "location")}
          ${this._navTile("mdi:tune", "Settings", "settings")}
        </nav>

        <main class="overview-grid">
          <section class="panel battery-panel">
            <header><ha-icon icon="mdi:battery-charging"></ha-icon><h2>Battery</h2><button data-nav="battery"><ha-icon icon="mdi:chevron-right"></ha-icon></button></header>
            <div class="battery-content">
              <div class="ring" style="--pct:${battery};"><span>${battery}<small>%</small></span><em>Battery level</em></div>
              <div class="battery-facts"><span>Range</span><strong>${range}</strong><span>Est. range AC on</span><strong>${range}</strong><span>AC charging limit</span><strong>${chargeLimit}</strong><span>Charging</span><strong class="${this._isCharging() ? "good-text" : ""}">${chargingText}</strong><span>Plugged in</span><strong>${plugText}</strong></div>
            </div>
          </section>

          <section class="panel actions-panel">
            <header><ha-icon icon="mdi:flash"></ha-icon><h2>Quick Actions</h2><button data-nav="settings"><ha-icon icon="mdi:chevron-right"></ha-icon></button></header>
            <div class="action-grid">
              <button data-refresh="true"><ha-icon icon="mdi:refresh"></ha-icon><span>Refresh Data</span></button>
              <button data-info="climate"><ha-icon icon="mdi:fan"></ha-icon><span>Start Climate</span></button>
              <button data-info="climate"><ha-icon class="warm" icon="mdi:fan-off"></ha-icon><span>Stop Climate</span></button>
              <button data-info="start_charging"><ha-icon class="good" icon="mdi:ev-plug-type2"></ha-icon><span>Start Charging</span></button>
            </div>
          </section>

          <section class="panel vehicle-panel">
            <header><ha-icon icon="mdi:car-estate"></ha-icon><h2>Vehicle Status</h2><button data-nav="vehicle"><ha-icon icon="mdi:chevron-right"></ha-icon></button></header>
            <div class="vehicle-list">
              ${this._vehicleRow("mdi:lock-outline", "Doors", "door_lock", false)}
              ${this._vehicleRow("mdi:car-door", "Windows", "windows")}
              ${this._vehicleRow("mdi:car-back", "Trunk", "trunk")}
              ${this._vehicleRow("mdi:car-cog", "Hood", "hood")}
              ${this._vehicleRow("mdi:car-light-high", "Lights", "lights", false)}
              ${this._vehicleRow("mdi:ev-plug-type2", "Charge port", "charge_port")}
            </div>
          </section>

          <section class="panel location-panel">
            <header><ha-icon icon="mdi:map-marker-outline"></ha-icon><h2>Location</h2><button data-nav="location"><ha-icon icon="mdi:chevron-right"></ha-icon></button></header>
            <div class="location-content"><div class="mini-map"><span></span></div><div><span>Last parked</span><strong>${location}</strong><span>Odometer</span><strong>${odometer}</strong></div></div>
          </section>

          <section class="panel tire-panel">
            <header><ha-icon icon="mdi:car-tire-alert"></ha-icon><h2>Tire Status</h2><button data-nav="vehicle"><ha-icon icon="mdi:chevron-right"></ha-icon></button></header>
            <div class="tire-content">
              <div class="tire-values left"><strong>${this._state("tire_front_left", "OK")}</strong><span>Front left</span><strong>${this._state("tire_rear_left", "OK")}</strong><span>Rear left</span></div>
              <img src="/local/vehicles/ev6_top.png" alt="Top view">
              <div class="tire-values"><strong>${this._state("tire_front_right", "OK")}</strong><span>Front right</span><strong>${this._state("tire_rear_right", "OK")}</strong><span>Rear right</span></div>
            </div>
          </section>

          <section class="panel health-panel">
            <ha-icon class="health-icon" icon="mdi:shield-check-outline"></ha-icon>
            <div><h2>All systems normal</h2><p>No active dashboard warnings. Review Vehicle and Settings after each Home Assistant update.</p></div>
            <ha-icon class="ghost" icon="mdi:shield-check-outline"></ha-icon>
          </section>
        </main>

        <footer class="footer card"><span><ha-icon icon="mdi:information-outline"></ha-icon>Data provided by Kia Connect</span><span>Updated ${lastUpdated}</span><button data-refresh="true"><ha-icon icon="mdi:refresh"></ha-icon></button></footer>
      </ha-card>`;

    this.shadowRoot.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => this._navigate(el.dataset.nav)));
    this.shadowRoot.querySelectorAll("[data-info]").forEach((el) => el.addEventListener("click", () => this._moreInfo(el.dataset.info)));
    this.shadowRoot.querySelectorAll("[data-refresh]").forEach((el) => el.addEventListener("click", () => this._pressRefresh()));
  }

  _styles() {
    return `
      :host { display:block; --bg:#080d13; --card:#141b24; --card2:#101720; --line:#20384b; --text:#f5f8fb; --muted:#a8b7c7; --blue:#42c8ff; --green:#63f276; --amber:#ffd058; font-family: var(--primary-font-family, Inter, system-ui, sans-serif); }
      ha-card.kia-shell { background: radial-gradient(circle at 46% 0%, rgba(50,77,98,.18), transparent 34%), var(--bg); color: var(--text); border:0; box-shadow:none; padding: clamp(10px, 1.1vw, 18px); }
      .card, .panel { background: linear-gradient(145deg, rgba(27,34,45,.96), rgba(14,21,29,.98)); border:1px solid var(--line); border-radius: 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 14px 34px rgba(0,0,0,.22); }
      .topbar { display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; gap:16px; margin:0 0 14px; }
      .breadcrumb { color:var(--muted); display:flex; gap:9px; font-size:13px; align-self:start; }
      .breadcrumb span:first-child { color:var(--blue); }
      .identity { display:flex; align-items:center; gap:18px; justify-self:start; }
      .identity ha-icon { --mdc-icon-size:46px; color:#e8f0f8; }
      h1,h2,p { margin:0; }
      h1 { font-size: clamp(30px, 2.5vw, 46px); line-height:1; font-weight:800; letter-spacing:0; }
      .identity p { color:var(--muted); font-size: clamp(15px, 1.1vw, 19px); margin-top:6px; }
      .chips { display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap; }
      .chip { border:1px solid var(--line); background:#152638; color:var(--text); border-radius: 8px; min-height:42px; padding:0 16px; display:inline-flex; gap:9px; align-items:center; font-weight:700; font-size:15px; }
      .chip ha-icon { color:var(--blue); --mdc-icon-size:18px; } .chip.good { background:#143022; color:var(--green); }
      button { font:inherit; color:inherit; cursor:pointer; }
      .hero { min-height: clamp(220px, 23vw, 320px); display:grid; grid-template-columns: minmax(360px, 1.25fr) 1px minmax(340px, .95fr); align-items:center; gap: clamp(24px, 4vw, 70px); padding: 22px clamp(26px, 5vw, 92px); overflow:hidden; }
      .hero-car { min-width:0; display:flex; align-items:center; justify-content:flex-start; }
      .hero-car img { width:min(760px, 100%); height: clamp(180px, 21vw, 280px); object-fit:contain; object-position:left center; filter: drop-shadow(0 22px 18px rgba(0,0,0,.34)); }
      .hero-divider { height:70%; background:rgba(168,183,199,.18); }
      .hero-data { display:grid; grid-template-columns: 1fr 1fr; gap:30px 48px; }
      .hero-metric { display:grid; grid-template-columns:42px 1fr; gap:12px; align-items:center; min-width:0; }
      .hero-metric ha-icon { color:#b9c6d6; --mdc-icon-size:34px; } .hero-metric span, .battery-facts span, .location-content span, .tire-values span { color:var(--muted); font-size:14px; line-height:1.2; }
      .hero-metric strong { display:block; font-size: clamp(16px, 1.1vw, 20px); line-height:1.16; white-space:normal; overflow-wrap:anywhere; }
      .good-text { color:var(--green) !important; }
      .section-nav { margin-top:10px; padding:10px 18px 16px; display:grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap:14px; border-bottom:3px solid rgba(66,200,255,.7); }
      .nav-tile, .action-grid button { min-height:84px; border-radius:8px; border:1px solid #25384a; background:linear-gradient(145deg, #1b2430, #121922); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; font-weight:700; }
      .nav-tile ha-icon { color:var(--blue); --mdc-icon-size:32px; }
      .overview-grid { margin-top:12px; display:grid; grid-template-columns: 1fr 1fr 1.28fr; grid-template-areas: "battery actions vehicle" "location tires health"; gap:12px; }
      .panel { min-height:160px; padding:18px 22px; position:relative; overflow:hidden; }
      .panel header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
      .panel header h2 { font-size:20px; flex:1; } .panel header ha-icon { color:var(--blue); } .panel header button, .footer button { background:transparent; border:0; color:var(--muted); padding:0; }
      .battery-panel { grid-area:battery; } .actions-panel { grid-area:actions; } .vehicle-panel { grid-area:vehicle; } .location-panel { grid-area:location; } .tire-panel { grid-area:tires; } .health-panel { grid-area:health; }
      .battery-content { display:grid; grid-template-columns: minmax(130px, .85fr) minmax(150px, 1fr); align-items:center; gap:22px; }
      .ring { width: clamp(130px, 10vw, 180px); aspect-ratio:1; border-radius:50%; background:conic-gradient(var(--blue) calc(var(--pct)*1%), rgba(66,200,255,.18) 0); display:grid; place-items:center; position:relative; justify-self:center; }
      .ring:before { content:""; position:absolute; inset:22%; border-radius:50%; background:#0b121b; } .ring span,.ring em { position:relative; z-index:1; } .ring span { font-size: clamp(30px, 2.5vw, 48px); font-weight:800; } .ring small { font-size:.45em; margin-left:2px; } .ring em { align-self:start; margin-top:58%; font-size:13px; color:var(--muted); font-style:normal; }
      .battery-facts { display:grid; gap:3px; } .battery-facts strong { font-size: clamp(15px, 1.1vw, 19px); line-height:1.1; }
      .action-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; } .action-grid ha-icon { color:var(--blue); --mdc-icon-size:34px; } .action-grid .warm { color:var(--amber); } .action-grid .good { color:var(--green); }
      .vehicle-list { display:grid; gap:13px; padding-inline:8px; } .status-row { display:grid; grid-template-columns:30px 1fr auto 28px; align-items:center; gap:12px; color:var(--muted); } .status-row strong { color:var(--text); } .status-row ha-icon { color:#b9c6d6; } .status-row .ok { color:var(--green); } .status-row .warn { color:var(--amber); }
      .location-content { display:grid; grid-template-columns:minmax(170px, .95fr) minmax(135px, .7fr); gap:20px; align-items:center; } .mini-map { min-height:112px; border-radius:8px; background:linear-gradient(135deg, rgba(35,75,60,.7), rgba(20,31,43,.85)), repeating-linear-gradient(30deg, transparent 0 28px, rgba(255,255,255,.04) 29px 30px); display:grid; place-items:center; } .mini-map span { width:32px; aspect-ratio:1; border-radius:50%; background:var(--blue); box-shadow:0 0 0 12px rgba(66,200,255,.22); }
      .location-content strong { display:block; font-size:20px; margin:2px 0 12px; }
      .tire-content { display:grid; grid-template-columns:1fr 82px 1fr; align-items:center; gap:18px; text-align:left; } .tire-content img { width:82px; height:132px; object-fit:contain; justify-self:center; } .tire-values { display:grid; gap:3px; } .tire-values strong { color:var(--text); font-size:18px; } .tire-values strong:before { content:""; display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--green); margin-right:8px; box-shadow:0 0 7px var(--green); } .tire-values.left { text-align:right; }
      .health-panel { display:flex; align-items:center; gap:26px; } .health-icon { color:var(--green); --mdc-icon-size:56px; } .health-panel h2 { font-size:22px; } .health-panel p { color:var(--muted); margin-top:6px; } .ghost { position:absolute; right:28px; bottom:18px; opacity:.12; --mdc-icon-size:72px; }
      .footer { margin-top:12px; min-height:44px; padding:0 16px; display:flex; align-items:center; justify-content:space-between; color:var(--muted); } .footer span { display:flex; align-items:center; gap:8px; }
      @media (max-width: 1180px) { .topbar { grid-template-columns:1fr; } .identity,.chips,.breadcrumb { justify-self:start; } .hero { grid-template-columns:1fr; gap:16px; } .hero-divider { display:none; } .hero-data { grid-template-columns:repeat(2,minmax(0,1fr)); } .overview-grid { grid-template-columns:1fr 1fr; grid-template-areas:"battery actions" "vehicle vehicle" "location tires" "health health"; } .section-nav { grid-template-columns:repeat(3,1fr); } }
      @media (max-width: 760px) { ha-card.kia-shell { padding:10px; } .chips { gap:8px; } .chip { min-height:36px; padding:0 10px; font-size:13px; } .hero { padding:18px; min-height:0; } .hero-car img { height:210px; object-position:center; } .hero-data, .overview-grid, .battery-content, .location-content { grid-template-columns:1fr; } .overview-grid { grid-template-areas:"battery" "actions" "vehicle" "location" "tires" "health"; } .section-nav { grid-template-columns:repeat(2,1fr); } .nav-tile { min-height:76px; } .footer { flex-direction:column; align-items:flex-start; padding:12px 16px; gap:8px; } }
    `;
  }
}

customElements.define("kia-dashboard-card", KiaDashboardCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "kia-dashboard-card",
  name: "Kia Dashboard Card",
  description: "Responsive Kia EV6 overview card for Home Assistant."
});
