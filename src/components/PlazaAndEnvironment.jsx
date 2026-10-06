import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// High-resolution procedural grass & park meadow texture
function createParkLandscapeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Rich vibrant green base
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, 0, 512, 512);

  // Soft organic grass tone speckling
  const shades = ["#16a34a", "#15803d", "#4ade80", "#34d399", "#86efac"];
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
    ctx.globalAlpha = 0.25;
    const r = 4 + Math.random() * 24;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);
  texture.anisotropy = 16;
  return texture;
}

// Single Arched Pedestrian Eco-Bridge
function PedestrianBridge({ angle, innerR = 7.5, outerR = 22, mats }) {
  const bridgeLength = outerR - innerR;
  const midR = (innerR + outerR) / 2;

  return (
    <group rotation={[0, angle, 0]}>
      <group position={[0, 0, midR]}>
        {/* Arched White Bridge Deck */}
        <mesh position={[0, 0.9, 0]} material={mats.whiteMat} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.35, bridgeLength + 0.4]} />
        </mesh>
        {/* Arch Rise Center Accent */}
        <mesh position={[0, 1.1, 0]} material={mats.bridgeWalkwayMat}>
          <boxGeometry args={[2.1, 0.08, bridgeLength]} />
        </mesh>
        {/* Turquoise Glass Safety Railings Left & Right */}
        <mesh position={[-1.15, 1.5, 0]} material={mats.bridgeGlassMat}>
          <boxGeometry args={[0.08, 0.8, bridgeLength]} />
        </mesh>
        <mesh position={[1.15, 1.5, 0]} material={mats.bridgeGlassMat}>
          <boxGeometry args={[0.08, 0.8, bridgeLength]} />
        </mesh>
        {/* LED Luminescent Handrails */}
        <mesh position={[-1.15, 1.9, 0]} material={mats.ledTurquoiseMat}>
          <boxGeometry args={[0.06, 0.06, bridgeLength]} />
        </mesh>
        <mesh position={[1.15, 1.9, 0]} material={mats.ledTurquoiseMat}>
          <boxGeometry args={[0.06, 0.06, bridgeLength]} />
        </mesh>
        {/* Support Pier Anchors into Lake Bed */}
        <mesh position={[0, 0.2, -bridgeLength * 0.28]} material={mats.whiteMat}>
          <cylinderGeometry args={[0.3, 0.45, 1.6, 8]} />
        </mesh>
        <mesh position={[0, 0.2, bridgeLength * 0.28]} material={mats.whiteMat}>
          <cylinderGeometry args={[0.3, 0.45, 1.6, 8]} />
        </mesh>
      </group>
    </group>
  );
}

// Autonomous Electric Ground Vehicles cruising along the curved road
function AutonomousVehicles({ mats }) {
  const podsRef = useRef([]);

  const pods = useMemo(
    () => [
      { speed: 0.14, offset: 0, radius: 25.5 },
      { speed: 0.16, offset: 1.5, radius: 25.5 },
      { speed: -0.15, offset: 3.1, radius: 26.8 },
      { speed: -0.13, offset: 4.8, radius: 26.8 },
    ],
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    podsRef.current.forEach((podGroup, idx) => {
      if (!podGroup) return;
      const config = pods[idx];
      const angle = t * config.speed + config.offset;
      const x = Math.cos(angle) * config.radius;
      const z = Math.sin(angle) * config.radius;

      podGroup.position.set(x, 0.45, z);
      podGroup.rotation.y = angle + (config.speed > 0 ? -Math.PI / 2 : Math.PI / 2);
    });
  });

  return (
    <group>
      {pods.map((_, i) => (
        <group key={i} ref={(el) => (podsRef.current[i] = el)}>
          {/* Aerodynamic White Electric Shuttle Body */}
          <mesh material={mats.whiteMat}>
            <boxGeometry args={[1.2, 0.6, 2.2]} />
          </mesh>
          {/* Panoramic Turquoise Glass Dome */}
          <mesh position={[0, 0.32, 0]} material={mats.bridgeGlassMat}>
            <boxGeometry args={[1.05, 0.35, 1.6]} />
          </mesh>
          {/* Turquoise Under-glow LED Strip */}
          <mesh position={[0, -0.22, 0]} material={mats.ledTurquoiseMat}>
            <boxGeometry args={[1.1, 0.06, 2.0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function PlazaAndEnvironment() {
  const parkTex = useMemo(() => createParkLandscapeTexture(), []);
  const waterRef = useRef();

  const mats = useMemo(() => {
    // Sparkling turquoise lake water with realistic reflections
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: "#06b6d4",
      roughness: 0.03,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95,
      ior: 1.333,
    });

    const groundMat = new THREE.MeshStandardMaterial({
      map: parkTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.25,
      metalness: 0.15,
    });

    const promenadeMat = new THREE.MeshStandardMaterial({
      color: "#f1f5f9",
      roughness: 0.35,
      metalness: 0.1,
    });

    const roadMat = new THREE.MeshStandardMaterial({
      color: "#e2e8f0",
      roughness: 0.4,
      metalness: 0.15,
    });

    const bridgeWalkwayMat = new THREE.MeshStandardMaterial({
      color: "#e0f2fe",
      roughness: 0.3,
      metalness: 0.2,
    });

    const bridgeGlassMat = new THREE.MeshPhysicalMaterial({
      color: "#22d3ee",
      roughness: 0.05,
      transmission: 0.75,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1.0,
    });

    const ledTurquoiseMat = new THREE.MeshStandardMaterial({
      color: "#06b6d4",
      emissive: "#22d3ee",
      emissiveIntensity: 2.8,
      toneMapped: false,
    });

    return {
      waterMat,
      groundMat,
      whiteMat,
      promenadeMat,
      roadMat,
      bridgeWalkwayMat,
      bridgeGlassMat,
      ledTurquoiseMat,
    };
  }, [parkTex]);

  useFrame(({ clock }) => {
    // Gentle aquatic water shimmer
    if (waterRef.current) {
      const t = clock.elapsedTime;
      waterRef.current.material.opacity = 0.88 + Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group>
      {/* Expansive Lush Green Park Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mats.groundMat}>
        <planeGeometry args={[480, 480]} />
      </mesh>

      {/* LARGE TURQUOISE LAKE IN THE CENTER (Radius 22 units) */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.08, 0]}
        receiveShadow
        material={mats.waterMat}
      >
        <ringGeometry args={[7.5, 22, 64]} />
      </mesh>

      {/* Central Eco-Island (Radius 7.5 units) where the Spire Rests */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow material={mats.groundMat}>
        <circleGeometry args={[7.48, 48]} />
      </mesh>
      {/* Central Island White Retaining Wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]} material={mats.whiteMat}>
        <ringGeometry args={[7.3, 7.6, 48]} />
      </mesh>
      {/* Central Island Turquoise LED Waterline Trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} material={mats.ledTurquoiseMat}>
        <ringGeometry args={[7.5, 7.62, 48]} />
      </mesh>

      {/* Lakeside White Promenade & Boardwalk (Radius 22 to 24 units) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} receiveShadow material={mats.promenadeMat}>
        <ringGeometry args={[21.9, 24.2, 64]} />
      </mesh>
      {/* Outer Lake Embankment Turquoise Accent Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} material={mats.ledTurquoiseMat}>
        <ringGeometry args={[21.85, 22.0, 64]} />
      </mesh>

      {/* CURVED ROAD FOR AUTONOMOUS TRANSIT (Radius 24.5 to 27.8 units) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]} receiveShadow material={mats.roadMat}>
        <ringGeometry args={[24.4, 27.8, 64]} />
      </mesh>
      {/* Curved Road Lane Dividers in Clean Turquoise */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]} material={mats.ledTurquoiseMat}>
        <ringGeometry args={[26.05, 26.15, 64]} />
      </mesh>

      {/* 3 ARCHED WHITE PEDESTRIAN BRIDGES CONNECTING TO ISLAND */}
      <PedestrianBridge angle={0} mats={mats} />
      <PedestrianBridge angle={(Math.PI * 2) / 3} mats={mats} />
      <PedestrianBridge angle={(Math.PI * 4) / 3} mats={mats} />

      {/* AUTONOMOUS ELECTRIC GROUND SHUTTLES */}
      <AutonomousVehicles mats={mats} />

      {/* Clean Lake Aeration Fountains in Central Basin */}
      {[
        [14, 0, 8],
        [-13, 0, 9],
        [-2, 0, -15],
      ].map(([fx, fy, fz], idx) => (
        <group key={idx} position={[fx, fy, fz]}>
          <mesh position={[0, 0.25, 0]} material={mats.whiteMat}>
            <cylinderGeometry args={[0.8, 0.9, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.45, 0]} material={mats.ledTurquoiseMat}>
            <torusGeometry args={[0.8, 0.08, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
          </mesh>
          {/* Subtle water jet cone */}
          <mesh position={[0, 1.2, 0]} material={mats.waterMat}>
            <coneGeometry args={[0.4, 1.8, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
