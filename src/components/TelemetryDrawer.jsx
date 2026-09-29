export default function TelemetryDrawer({
  isOpen,
  onClose,
  timeMode,
  setTimeMode,
  showTransit,
  setShowTransit,
  showHotspots,
  setShowHotspots,
  soundActive,
  onToggleSound,
}) {
  if (!isOpen) return null;

  return (
    <div className="telemetry-overlay" onClick={onClose}>
      <aside className="telemetry-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-badge">VERDANTIS // BIOSPHERE TELEMETRY</span>
            <h2>Green City Ecological Dashboard</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close telemetry panel">
            ✕
          </button>
        </div>

        <div className="drawer-content">
          {/* Section 1: 100% Clean Hydro-Solar Matrix */}
          <div className="telemetry-card">
            <div className="card-header">
              <span className="card-icon">⚡</span>
              <h3>100% Clean Energy Grid</h3>
              <span className="card-status-pill green">ZERO EMISSIONS</span>
            </div>
            <div className="metric-row">
              <div className="metric-item">
                <span className="metric-val">52.4 <small>GW</small></span>
                <span className="metric-lbl">Total Clean Generation</span>
              </div>
              <div className="metric-item">
                <span className="metric-val text-emerald">100<small>%</small></span>
                <span className="metric-lbl">Renewable Mix</span>
              </div>
            </div>
            {/* Energy Distribution Bars */}
            <div className="progress-group">
              <div className="progress-label">
                <span>Rooftop Integrated Solar Photovoltaics</span>
                <span>46% (24.1 GW)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: "46%", backgroundColor: "#0284c7" }} />
              </div>
            </div>
            <div className="progress-group">
              <div className="progress-label">
                <span>Central Hydro-Solar Energy Spire</span>
                <span>40% (21.0 GW)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: "40%", backgroundColor: "#06b6d4" }} />
              </div>
            </div>
            <div className="progress-group">
              <div className="progress-label">
                <span>Aquatic Floating Lake Collectors</span>
                <span>14% (7.3 GW)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: "14%", backgroundColor: "#22c55e" }} />
              </div>
            </div>
          </div>

          {/* Section 2: Urban Forest & Living Vertical Gardens */}
          <div className="telemetry-card">
            <div className="card-header">
              <span className="card-icon">🌿</span>
              <h3>Urban Forest & Vertical Biodiversity</h3>
              <span className="card-status-pill green">CARBON NEGATIVE</span>
            </div>
            <div className="metric-grid">
              <div className="metric-tile">
                <span className="tile-number text-emerald">2,800+</span>
                <span className="tile-desc">Instanced Forest Trees</span>
              </div>
              <div className="metric-tile">
                <span className="tile-number">48,200 m²</span>
                <span className="tile-desc">Vertical Living Facades</span>
              </div>
              <div className="metric-tile">
                <span className="tile-number text-emerald">-42%</span>
                <span className="tile-desc">Carbon Absorption Index</span>
              </div>
              <div className="metric-tile">
                <span className="tile-number">10 AQI</span>
                <span className="tile-desc">Alpine Air Standard</span>
              </div>
            </div>
            <p className="biosphere-note" style={{ marginTop: "12px" }}>
              Every skyscraper is engineered with automatic rainwater retention channels that irrigate the cascading vertical gardens and feed natural moisture back into the microclimate.
            </p>
          </div>

          {/* Section 3: Central Turquoise Lake & Aquatic Ecosystem */}
          <div className="telemetry-card">
            <div className="card-header">
              <span className="card-icon">🌊</span>
              <h3>Central Lake & Water Conservation</h3>
              <span className="card-status-pill">CLOSED-LOOP</span>
            </div>
            <div className="metric-row">
              <div className="metric-item">
                <span className="metric-val text-cyan">99.8<small>%</small></span>
                <span className="metric-lbl">Water Purity Level</span>
              </div>
              <div className="metric-item">
                <span className="metric-val">3 Fountains</span>
                <span className="metric-lbl">Active Biological Aerators</span>
              </div>
            </div>
            <p className="biosphere-note">
              The central turquoise lake acts as a massive thermal heat sink and natural reservoir, cooling the surrounding city promenades by 3.5°C during peak midday sun.
            </p>
          </div>

          {/* Section 4: Atmospheric & View Controls */}
          <div className="telemetry-card controls-card">
            <div className="card-header">
              <span className="card-icon">⚙️</span>
              <h3>Atmospheric & Simulation Controls</h3>
            </div>

            <div className="control-group">
              <label>Sunlight & Volumetric Clouds</label>
              <div className="btn-segmented">
                <button
                  className={timeMode === "noon" ? "active" : ""}
                  onClick={() => setTimeMode("noon")}
                >
                  ☀️ High Noon
                </button>
                <button
                  className={timeMode === "morning" ? "active" : ""}
                  onClick={() => setTimeMode("morning")}
                >
                  🌅 Morning
                </button>
                <button
                  className={timeMode === "blueHour" ? "active" : ""}
                  onClick={() => setTimeMode("blueHour")}
                >
                  ✨ Blue Hour
                </button>
              </div>
            </div>

            <div className="toggles-grid">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showTransit}
                  onChange={(e) => setShowTransit(e.target.checked)}
                />
                <span className="toggle-label">Elevated Maglev Transit Loop</span>
              </label>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                />
                <span className="toggle-label">3D Ecological Landmark Badges</span>
              </label>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={soundActive}
                  onChange={onToggleSound}
                />
                <span className="toggle-label">Harmonic Ambient Soundscape</span>
              </label>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
