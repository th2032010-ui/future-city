import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";

export default function SkyAndAtmosphere({ timeMode = "noon" }) {
  const sunLightRef = useRef();
  const orbitalRingRef = useRef();

  // Natural, realistic, comfortable daylight settings with clear shadow definition
  const lightSettings = {
    noon: {
      sunPosition: [48, 72, 42],
      sunColor: "#fffdf7",    // Natural warm daylight sun
      sunIntensity: 2.15,     // Balanced key light (no white-facade blowout)
      hemiSky: "#60a5fa",     // Soft natural azure sky bounce
      hemiGround: "#86efac",  // Subtle green foliage bounce
      hemiIntensity: 0.48,    // Reduced fill so shadows stay crisp and visible
      fogColor: "#cfe8fc",    // Soft aerial haze
      turbidity: 2.4,         // Softer atmospheric scattering (less blinding glare)
      rayleigh: 1.45,         // Deeper, calmer sky blue gradient
      cloudColor: "#f8fafc",
    },
    morning: {
      sunPosition: [68, 38, 48],
      sunColor: "#fff7ed",
      sunIntensity: 1.95,
      hemiSky: "#7dd3fc",
      hemiGround: "#bbf7d0",
      hemiIntensity: 0.44,
      fogColor: "#d8eafd",
      turbidity: 2.8,
      rayleigh: 1.7,
      cloudColor: "#fefce8",
    },
    blueHour: {
      sunPosition: [28, 24, 65],
      sunColor: "#bae6fd",
      sunIntensity: 1.65,
      hemiSky: "#38bdf8",
      hemiGround: "#6ee7b7",
      hemiIntensity: 0.42,
      fogColor: "#bfdbfe",
      turbidity: 3.2,
      rayleigh: 2.2,
      cloudColor: "#e0f2fe",
    },
  };

  const current = lightSettings[timeMode] || lightSettings.noon;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.z = t * 0.015;
    }
  });

  return (
    <>
      {/* Soft atmospheric aerial perspective fog */}
      <fog attach="fog" args={[current.fogColor, 130, 440]} />

      {/* Natural Soft Azure Sky (less overexposed horizon) */}
      <Sky
        distance={450000}
        sunPosition={current.sunPosition}
        turbidity={current.turbidity}
        rayleigh={current.rayleigh}
        mieCoefficient={0.004}
        mieDirectionalG={0.78}
      />

      {/* Realistic Daylight Sun – crisp, visible shadows ────────────────────── */}
      <directionalLight
        ref={sunLightRef}
        position={current.sunPosition}
        intensity={current.sunIntensity}
        color={current.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={10}
        shadow-camera-far={260}
        shadow-camera-left={-85}
        shadow-camera-right={85}
        shadow-camera-top={85}
        shadow-camera-bottom={-85}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
        shadow-radius={1.8}
      />

      {/* Subtle sky-scatter fill light – low intensity to preserve shadow depth */}
      <directionalLight
        position={[-current.sunPosition[0] * 0.4, current.sunPosition[1] * 0.6, -current.sunPosition[2] * 0.3]}
        intensity={current.sunIntensity * 0.08}
        color={current.hemiSky}
      />

      {/* Natural Sky and Canopy Bounce Light */}
      <hemisphereLight
        intensity={current.hemiIntensity}
        color={current.hemiSky}
        groundColor={current.hemiGround}
      />

      {/* Restrained ambient fill so shadow areas have realistic contrast */}
      <ambientLight intensity={0.18} color="#e2e8f0" />

      {/* Volumetric Clouds with Soft Daylight Shading */}
      <Clouds material={THREE.MeshLambertMaterial} limit={400}>
        <Cloud
          seed={1}
          position={[-45, 58, -40]}
          bounds={[60, 6, 32]}
          volume={14}
          segments={20}
          speed={0.4}
          opacity={0.5}
          fade={70}
          color={current.cloudColor}
        />
        <Cloud
          seed={4}
          position={[52, 62, -50]}
          bounds={[64, 7, 30]}
          volume={15}
          segments={18}
          speed={0.35}
          opacity={0.48}
          fade={75}
          color={current.cloudColor}
        />
        <Cloud
          seed={9}
          position={[-30, 64, 55]}
          bounds={[55, 6, 28]}
          volume={12}
          segments={18}
          speed={0.45}
          opacity={0.45}
          fade={65}
          color={current.cloudColor}
        />
        <Cloud
          seed={14}
          position={[40, 56, 45]}
          bounds={[58, 6, 26]}
          volume={13}
          segments={16}
          speed={0.4}
          opacity={0.48}
          fade={70}
          color={current.cloudColor}
        />
      </Clouds>

      {/* High-Altitude Orbital Solar Reflector Station */}
      <group
        ref={orbitalRingRef}
        position={[30, 150, -110]}
        rotation={[Math.PI / 3.2, Math.PI / 7, 0]}
      >
        <mesh>
          <torusGeometry args={[52, 0.4, 12, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        <mesh>
          <torusGeometry args={[52, 0.12, 8, 64]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
}
