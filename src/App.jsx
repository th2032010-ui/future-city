import { useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import CentralEnergyTower from "./components/CentralEnergyTower";
import Skyscrapers from "./components/Skyscrapers";
import InstancedTrees from "./components/InstancedTrees";
import DroneFleet from "./components/DroneFleet";
import SkywayTransit from "./components/SkywayTransit";
import PlazaAndEnvironment from "./components/PlazaAndEnvironment";
import SkyAndAtmosphere from "./components/SkyAndAtmosphere";
import CameraController from "./components/CameraController";
import DistrictHotspots from "./components/DistrictHotspots";
import LandingUI from "./components/LandingUI";
import TelemetryDrawer from "./components/TelemetryDrawer";
import AIResearchDistrict from "./components/AIResearchDistrict";
import CleanEnergyDistrict from "./components/CleanEnergyDistrict";
import SkyGardens from "./components/SkyGardens";
import VisualEffects from "./components/VisualEffects";
import { ambientAudio } from "./utils/audioSynth";

export default function App() {
  // Navigation & View Modes
  const [viewMode, setViewMode] = useState("lake");

  // Lighting & Atmospheric simulation: 'noon', 'morning', 'blueHour'
  const [timeMode, setTimeMode] = useState("noon");

  // Layer toggles
  const [showTransit, setShowTransit] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // Modals & Panels
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  // Cinematic HUD state — current shot label shown in the overlay
  const [cinemaShot, setCinemaShot] = useState({ index: 0, label: "", progress: 0 });

  // Lead drone vectors for smooth chase cam
  const leadDronePosRef = useRef(new THREE.Vector3());
  const leadDroneDirRef = useRef(new THREE.Vector3(0, 0, 1));

  const handleLeadDroneMove = useCallback((pos, dir) => {
    leadDronePosRef.current.copy(pos);
    leadDroneDirRef.current.copy(dir);
  }, []);

  const handleToggleSound = useCallback(() => {
    const isPlaying = ambientAudio.toggle();
    setSoundActive(isPlaying);
  }, []);

  const handleSelectDistrict = useCallback((districtId) => {
    setViewMode(districtId);
  }, []);

  // When user grabs orbit controls, gracefully exit all locked camera modes
  const handleUserOrbit = useCallback(() => {
    if (viewMode === "cinematic" || viewMode === "drone" || viewMode === "orbit") {
      setViewMode("lake");
    }
  }, [viewMode]);

  const handleCinematicShotChange = useCallback((index, label, progress) => {
    const roundedProgress = Math.round(progress * 50) / 50; // Update at most in 2% steps
    setCinemaShot((prev) => {
      if (prev.index === index && prev.label === label && prev.progress === roundedProgress) {
        return prev;
      }
      return { index, label, progress: roundedProgress };
    });
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* 3D WebGL Canvas – High-DPI supersampling for crisp geometric clarity */}
      <Canvas
        shadows
        camera={{ position: [65, 40, 65], fov: 46, near: 0.1, far: 850 }}
        dpr={[1.5, 2]}
        gl={{
          antialias: false,           // SMAA handles AA inside EffectComposer
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,  // ToneMapping pass handles this
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* Dynamic bright animated sky with volumetric clouds */}
        <SkyAndAtmosphere timeMode={timeMode} />

        {/* Large central turquoise lake, eco-island, arched bridges, curved roads & vehicles */}
        <PlazaAndEnvironment />

        {/* Thousands of high-performance instanced trees and green parks */}
        <InstancedTrees />

        {/* White and blue futuristic architecture with vertical gardens & rooftop solar */}
        <Skyscrapers />

        {/* Central Hydro-Solar Energy Spire with levitating rings */}
        <CentralEnergyTower
          onSelect={() => setViewMode("tower")}
        />

        {/* Elevated Maglev skyway loop & autonomous bullet train */}
        <SkywayTransit enabled={showTransit} />

        {/* Flying eco-drones fleet with smooth navigation */}
        <DroneFleet onLeadDroneMove={handleLeadDroneMove} />

        {/* AI Research District – transparent labs, data spheres, holograms, robots */}
        <AIResearchDistrict position={[0, 0, -40]} />

        {/* Clean Energy District – solar towers, wind turbines, hydrogen, water purification */}
        <CleanEnergyDistrict position={[55, 0, 0]} />

        {/* Sky Gardens – floating parks, hanging gardens, waterfalls & rooftop terraces */}
        <SkyGardens />

        {/* Interactive 3D Ecological District Hotspots */}
        <DistrictHotspots
          onSelectDistrict={handleSelectDistrict}
          visible={showHotspots}
        />

        {/* Post-processing visual effects — bloom, DoF, vignette, tone mapping */}
        <VisualEffects viewMode={viewMode} timeMode={timeMode} />

        {/* Camera controller with smooth transitions, cinematic tour & drone chase */}
        <CameraController
          viewMode={viewMode}
          leadDronePosRef={leadDronePosRef}
          leadDroneDirRef={leadDroneDirRef}
          onUserOrbit={handleUserOrbit}
          onCinematicShotChange={handleCinematicShotChange}
        />
      </Canvas>

      {/* Modern UI Layer */}
      <LandingUI
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        soundActive={soundActive}
        onToggleSound={handleToggleSound}
        cinemaShot={cinemaShot}
      />

      {/* Telemetry and Settings Drawer */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        timeMode={timeMode}
        setTimeMode={setTimeMode}
        showTransit={showTransit}
        setShowTransit={setShowTransit}
        showHotspots={showHotspots}
        setShowHotspots={setShowHotspots}
        soundActive={soundActive}
        onToggleSound={handleToggleSound}
      />
    </div>
  );
}
