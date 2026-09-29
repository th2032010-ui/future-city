import { useState } from "react";
import { VIEWPOINTS } from "../constants/viewpoints";

export default function LandingUI({
  viewMode,
  setViewMode,
  onOpenTelemetry,
  soundActive,
  onToggleSound,
  cinemaShot = { index: 0, label: "", progress: 0 },
}) {
  const [heroVisible, setHeroVisible] = useState(true);

  return (
    <div className="landing-ui-container">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="brand-group">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L19 9L12 16L5 9L12 2Z" fill="#06b6d4" />
              <circle cx="12" cy="12" r="3" fill="#22c55e" />
              <path d="M12 16V22" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">VERDANTIS</span>
            <span className="brand-tag">BIOPHILIC METROPOLIS</span>
          </div>
        </div>

        {/* Live Ecological Status Ticker */}
        <div className="nav-ticker">
          <span className="ticker-dot" />
          <span className="ticker-text">
            <strong>HYDRO-SOLAR:</strong> 52 GW • <strong>URBAN TREES:</strong> 2,800+ • <strong>AIR:</strong> 10 AQI
          </span>
        </div>

        {/* Viewpoint Quick Switcher */}
        <div className="viewpoint-nav">
          {Object.entries(VIEWPOINTS).map(([key, item]) => (
            <button
              key={key}
              className={`vp-btn ${viewMode === key ? "active" : ""}`}
              onClick={() => setViewMode(key)}
              title={item.desc}
            >
              {key === "lake" && "🌊 "}
              {key === "tower" && "⚡ "}
              {key === "forest" && "🌿 "}
              {key === "bridges" && "🌉 "}
              {key === "drone" && "🛸 "}
              {key === "cinematic" && "🎬 "}
              {key === "research" && "🔬 "}
              {key === "energy" && "🌞 "}
              {key === "skygardens" && "🌸 "}
              {key === "orbit" && "🔵 "}
              {item.name}
            </button>
          ))}
        </div>

        {/* Header Right Actions */}
        <div className="nav-actions">
          <button
            className={`icon-btn ${soundActive ? "active" : ""}`}
            onClick={onToggleSound}
            title={soundActive ? "Mute Harmonic Soundscape" : "Play Harmonic Soundscape"}
            aria-label="Toggle sound"
          >
            {soundActive ? "🔊" : "🔈"}
          </button>

          <button
            className="telemetry-cta-btn"
            onClick={onOpenTelemetry}
          >
            <span className="btn-icon">🌿</span>
            <span>Eco Telemetry</span>
          </button>
        </div>
      </header>

      {/* Hero Section Banner */}
      {heroVisible && (
        <section className="hero-card">
          <div className="hero-close-bar">
            <span className="hero-badge">
              <span className="pulse-circle" />
              100% SUSTAINABLE • CARBON NEGATIVE
            </span>
            <button
              className="minimize-btn"
              onClick={() => setHeroVisible(false)}
              title="Minimize banner for full 3D view"
            >
              ✕
            </button>
          </div>

          <h1 className="hero-title">
            The Green Sustainable <br />
            <span className="hero-gradient-text">Future City.</span>
          </h1>

          <p className="hero-description">
            Welcome to <strong>Verdantis</strong> — an optimistic bioclimatic metropolis
            harmonizing white organic architecture, vertical cascading gardens, integrated
            rooftop solar farms, and a pristine central turquoise lake.
          </p>

          <div className="hero-action-row">
            <button
              className="primary-hero-btn"
              onClick={() => setViewMode("cinematic")}
            >
              <span className="play-triangle">▶</span> Cinematic Green Tour
            </button>
            <button
              className="secondary-hero-btn"
              onClick={() => setViewMode("orbit")}
            >
              🔵 Orbit E-Sphere Core
            </button>
            <button
              className="ghost-hero-btn"
              onClick={onOpenTelemetry}
            >
              Biosphere Metrics →
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-metrics">
            <div className="metric-box">
              <span className="m-val">100%</span>
              <span className="m-lbl">Clean Solar &amp; Hydro</span>
            </div>
            <div className="metric-box">
              <span className="m-val">2,800+</span>
              <span className="m-lbl">Urban Canopy Trees</span>
            </div>
            <div className="metric-box">
              <span className="m-val">-42%</span>
              <span className="m-lbl">Net Carbon Absorption</span>
            </div>
            <div className="metric-box">
              <span className="m-val">0.00</span>
              <span className="m-lbl">Mobility Emissions</span>
            </div>
          </div>
        </section>
      )}

      {/* Restore Hero Button if Minimized */}
      {!heroVisible && (
        <button
          className="restore-hero-btn"
          onClick={() => setHeroVisible(true)}
        >
          🌿 City Overview
        </button>
      )}

      {/* ── Cinematic Tour Full-Screen Overlay ─────────────────────────────── */}
      {viewMode === "cinematic" && (
        <div className="cinematic-overlay">
          {/* Letterbox bars */}
          <div className="cinema-bar cinema-bar-top" />
          <div className="cinema-bar cinema-bar-bottom" />

          {/* Top-left: shot counter + scene label */}
          <div className="cinema-shot-info">
            <div className="cinema-shot-num">
              SHOT {String(cinemaShot.index + 1).padStart(2, "0")} / 10
            </div>
            <div className="cinema-shot-label">{cinemaShot.label}</div>
          </div>

          {/* Bottom: progress bar + controls */}
          <div className="cinema-controls">
            <div className="cinema-progress-track">
              <div
                className="cinema-progress-fill"
                style={{ width: `${Math.round(cinemaShot.progress * 100)}%` }}
              />
            </div>
            <div className="cinema-action-row">
              <span className="rec-dot" />
              <span className="cinema-status-text">CINEMATIC TOUR ACTIVE</span>
              <button className="cinema-orbit-btn" onClick={() => setViewMode("orbit")}>
                🔵 Switch to Orbit
              </button>
              <button className="cinema-skip-btn" onClick={() => setViewMode("lake")}>
                ✕ Exit Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Orbit Mode HUD ─────────────────────────────────────────────────── */}
      {viewMode === "orbit" && (
        <div className="orbit-hud">
          <div className="orbit-hud-inner">
            <span className="orbit-ring-icon">🔵</span>
            <div className="orbit-hud-text">
              <div className="orbit-hud-title">E-SPHERE CORE ORBIT</div>
              <div className="orbit-hud-sub">Smooth 360° aerial circumnavigation active</div>
            </div>
            <button className="orbit-exit-btn" onClick={() => setViewMode("lake")}>
              ✕ Exit Orbit
            </button>
          </div>
        </div>
      )}

      {/* ── Drone Chase HUD ────────────────────────────────────────────────── */}
      {viewMode === "drone" && (
        <div className="drone-tracking-hud">
          <span className="tracking-pulse" />
          <span>FOLLOWING AUTONOMOUS ECO-DRONE [CANOPY HEALTH: 100%]</span>
          <button className="exit-drone-btn" onClick={() => setViewMode("lake")}>
            Exit Chase
          </button>
        </div>
      )}

      {/* Controls hint — hidden during cinematic to reduce clutter */}
      {viewMode !== "cinematic" && (
        <footer className="bottom-hud">
          <div className="controls-hint">
            <span className="hint-chip">🖱️ Left Drag to Orbit</span>
            <span className="hint-chip">🔍 Scroll to Zoom</span>
            <span className="hint-chip">🖱️ Right Drag to Pan</span>
            <span className="hint-chip">✨ Click 3D Badges to Inspect</span>
          </div>
        </footer>
      )}
    </div>
  );
}
