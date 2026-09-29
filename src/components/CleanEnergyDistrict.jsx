import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Shared Material Hook ──────────────────────────────────────────────────
function useEnergyMaterials() {
  return useMemo(() => {
    const whiteFacade = new THREE.MeshStandardMaterial({
      color: "#ffffff", roughness: 0.22, metalness: 0.18,
    });
    const silverMet = new THREE.MeshStandardMaterial({
      color: "#e2e8f0", roughness: 0.15, metalness: 0.55,
    });
    const solarBlue = new THREE.MeshStandardMaterial({
      color: "#0369a1", roughness: 0.1, metalness: 0.88,
    });
    const solarFrame = new THREE.MeshStandardMaterial({
      color: "#f1f5f9", roughness: 0.3, metalness: 0.25,
    });
    const skyGlass = new THREE.MeshPhysicalMaterial({
      color: "#bae6fd", roughness: 0.04, metalness: 0.1,
      transmission: 0.72, transparent: true, opacity: 0.88,
      clearcoat: 1.0, reflectivity: 0.95,
    });
    const turquoiseGlass = new THREE.MeshPhysicalMaterial({
      color: "#67e8f9", roughness: 0.04, metalness: 0.15,
      transmission: 0.65, transparent: true, opacity: 0.85,
      clearcoat: 1.0,
    });
    const hydroGreen = new THREE.MeshStandardMaterial({
      color: "#d1fae5", roughness: 0.2, metalness: 0.25,
    });
    const glowBlue = new THREE.MeshStandardMaterial({
      color: "#00d2ff", emissive: "#00e5ff",
      emissiveIntensity: 2.8, toneMapped: false,
    });
    const glowGreen = new THREE.MeshStandardMaterial({
      color: "#22c55e", emissive: "#4ade80",
      emissiveIntensity: 2.2, toneMapped: false,
    });
    const glowYellow = new THREE.MeshStandardMaterial({
      color: "#fbbf24", emissive: "#fcd34d",
      emissiveIntensity: 2.0, toneMapped: false,
    });
    const foliage = new THREE.MeshStandardMaterial({
      color: "#16a34a", roughness: 0.85, metalness: 0.04, flatShading: true,
    });
    const concrete = new THREE.MeshStandardMaterial({
      color: "#f0f9ff", roughness: 0.72, metalness: 0.04,
    });
    const pipeMat = new THREE.MeshStandardMaterial({
      color: "#cbd5e1", roughness: 0.2, metalness: 0.6,
    });
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: "#38bdf8", roughness: 0.02, metalness: 0.05,
      transmission: 0.6, transparent: true, opacity: 0.82,
      clearcoat: 1.0,
    });

    return {
      whiteFacade, silverMet, solarBlue, solarFrame, skyGlass,
      turquoiseGlass, hydroGreen, glowBlue, glowGreen, glowYellow,
      foliage, concrete, pipeMat, waterMat,
    };
  }, []);
}

// ─── Solar Collector Tower ─────────────────────────────────────────────────
// Tall white mast with a heliostat dish at the top + animated glow ring
function SolarTower({ position, height = 32, rotation = 0, mats }) {
  const dishRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Slow azimuth tracking
    if (dishRef.current) {
      dishRef.current.rotation.y = Math.sin(t * 0.08) * 0.4;
      dishRef.current.rotation.x = -0.5 + Math.sin(t * 0.05) * 0.12;
    }
    if (glowRef.current) {
      glowRef.current.material.emissiveIntensity = 1.8 + Math.sin(t * 1.2) * 0.6;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Foundation pad */}
      <mesh position={[0, 0.15, 0]} material={mats.concrete} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.3, 16]} />
      </mesh>
      {/* Main mast */}
      <mesh position={[0, height / 2, 0]} material={mats.whiteFacade} castShadow>
        <cylinderGeometry args={[0.38, 0.65, height, 12]} />
      </mesh>
      {/* Tapered upper neck */}
      <mesh position={[0, height - 1, 0]} material={mats.silverMet}>
        <cylinderGeometry args={[0.55, 0.38, 2, 12]} />
      </mesh>
      {/* Heliostat dish */}
      <group ref={dishRef} position={[0, height + 1.5, 0]}>
        <mesh material={mats.solarBlue} castShadow>
          <cylinderGeometry args={[2.8, 2.8, 0.18, 24, 1, false, 0, Math.PI * 2]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={mats.solarBlue}>
          <sphereGeometry args={[2.8, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} material={mats.solarFrame}>
          <torusGeometry args={[2.82, 0.09, 8, 32]} />
        </mesh>
        {/* Focal point glow */}
        <mesh ref={glowRef} position={[0, 0.5, 0]} material={mats.glowYellow}>
          <sphereGeometry args={[0.28, 16, 16]} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} color="#fbbf24" intensity={3.5} distance={14} decay={2} />
      </group>
      {/* Blue accent ring on mast mid-point */}
      <mesh position={[0, height * 0.5, 0]} material={mats.glowBlue}>
        <torusGeometry args={[0.7, 0.04, 8, 24]} />
      </mesh>
      {/* Heliostat field – mirror tiles on ground */}
      {[
        [3, 0], [-3, 0], [0, 3], [0, -3],
        [2.5, 2.5], [-2.5, 2.5], [2.5, -2.5], [-2.5, -2.5],
      ].map(([mx, mz], i) => (
        <mesh key={i} position={[mx, 0.35, mz]} rotation={[-0.55, 0, 0]} material={mats.solarBlue}>
          <boxGeometry args={[1.1, 0.04, 1.1]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Wind Turbine ──────────────────────────────────────────────────────────
function WindTurbine({ position, height = 28, bladeLen = 10, rotation = 0, speed = 0.6, mats }) {
  const rotorRef = useRef();

  useFrame(() => {
    if (rotorRef.current) rotorRef.current.rotation.z += speed * 0.016;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Tower */}
      <mesh position={[0, height / 2, 0]} material={mats.whiteFacade} castShadow>
        <cylinderGeometry args={[0.28, 0.65, height, 10]} />
      </mesh>
      {/* Nacelle housing */}
      <mesh position={[0, height + 0.6, 0]} material={mats.whiteFacade}>
        <boxGeometry args={[1.4, 1.0, 2.2]} />
      </mesh>
      {/* Spinner hub */}
      <mesh position={[0, height + 0.6, 1.2]} material={mats.silverMet}>
        <sphereGeometry args={[0.45, 12, 12]} />
      </mesh>
      {/* Rotor (3 blades) */}
      <group ref={rotorRef} position={[0, height + 0.6, 1.2]}>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, 0, angle]}>
              <mesh position={[0, bladeLen / 2, 0.06]} material={mats.whiteFacade} castShadow>
                <boxGeometry args={[0.55, bladeLen, 0.12]} />
              </mesh>
              {/* Leading edge accent */}
              <mesh position={[-0.25, bladeLen / 2, 0.06]} material={mats.glowBlue}>
                <boxGeometry args={[0.04, bladeLen * 0.9, 0.04]} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* Glow ring at base of nacelle */}
      <mesh position={[0, height, 0]} material={mats.glowBlue}>
        <torusGeometry args={[0.72, 0.04, 8, 24]} />
      </mesh>
    </group>
  );
}

// ─── Hydrogen Energy Facility ──────────────────────────────────────────────
// Large cylindrical tank + electrolyser building + pipe network
function HydrogenFacility({ position, rotation = 0, mats }) {
  const bubbleRefs = useRef([]);
  // Pre-computed bubble offsets
  const bubbles = useMemo(() => [
    { x: 0.4,  y: 1.2, z: 0.3,  speed: 0.55, amp: 1.8 },
    { x: -0.3, y: 0.8, z: -0.2, speed: 0.42, amp: 2.1 },
    { x: 0.1,  y: 1.6, z: 0.5,  speed: 0.68, amp: 1.5 },
    { x: -0.5, y: 1.0, z: 0.1,  speed: 0.38, amp: 1.9 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    bubbleRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const b = bubbles[i];
      ref.position.y = b.y + ((t * b.speed) % b.amp);
      ref.material.opacity = 0.5 - (((t * b.speed) % b.amp) / b.amp) * 0.5;
    });
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* --- Main Storage Tank (large sphere) --- */}
      <mesh position={[0, 5.5, 0]} material={mats.whiteFacade} castShadow>
        <sphereGeometry args={[4.8, 28, 20]} />
      </mesh>
      <mesh position={[0, 5.5, 0]} material={mats.skyGlass}>
        <sphereGeometry args={[4.85, 28, 20]} />
      </mesh>
      {/* H₂ glow ring */}
      <mesh position={[0, 5.5, 0]} material={mats.glowGreen}>
        <torusGeometry args={[4.9, 0.07, 8, 48]} />
      </mesh>
      <pointLight position={[0, 5.5, 0]} color="#22c55e" intensity={2.2} distance={20} decay={2} />

      {/* Tank legs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.2, 1.5, Math.sin(a) * 3.2]}
            material={mats.silverMet}>
            <cylinderGeometry args={[0.22, 0.28, 3, 8]} />
          </mesh>
        );
      })}

      {/* --- Electrolyser Building --- */}
      <group position={[8, 0, 0]}>
        <mesh position={[0, 4, 0]} material={mats.whiteFacade} castShadow receiveShadow>
          <boxGeometry args={[7, 8, 6]} />
        </mesh>
        <mesh position={[0, 4, 0]} material={mats.turquoiseGlass}>
          <boxGeometry args={[7.05, 7, 5.8]} />
        </mesh>
        {/* Roof solar array */}
        <mesh position={[0, 8.12, 0]} rotation={[-0.25, 0, 0]} material={mats.solarBlue}>
          <boxGeometry args={[5.5, 0.05, 4.8]} />
        </mesh>
        {/* Blue accent strips */}
        {[2, 4, 6].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={mats.glowBlue}>
            <boxGeometry args={[7.08, 0.05, 6.08]} />
          </mesh>
        ))}
        {/* Signage glow – green H2 */}
        <mesh position={[0, 7.2, 3.08]} material={mats.glowGreen}>
          <boxGeometry args={[3.5, 0.7, 0.06]} />
        </mesh>

        {/* Rising bubble particles */}
        {bubbles.map((b, i) => (
          <mesh
            key={i}
            ref={(el) => (bubbleRefs.current[i] = el)}
            position={[b.x, b.y, b.z + 3.1]}
            material={
              new THREE.MeshBasicMaterial({
                color: "#67e8f9", transparent: true, opacity: 0.5,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            }
          >
            <sphereGeometry args={[0.12, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* --- Pipe network connecting tank to building --- */}
      {/* Horizontal connector pipe */}
      <mesh position={[4.8, 4, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.pipeMat}>
        <cylinderGeometry args={[0.18, 0.18, 6.5, 10]} />
      </mesh>
      {/* Vertical risers */}
      {[-1.5, 1.5].map((zOff, i) => (
        <mesh key={i} position={[8, 2, zOff]} material={mats.pipeMat}>
          <cylinderGeometry args={[0.14, 0.14, 4, 8]} />
        </mesh>
      ))}
      {/* Green glow valve indicator */}
      <mesh position={[4.8, 4, 0]} material={mats.glowGreen}>
        <torusGeometry args={[0.22, 0.04, 8, 16]} />
      </mesh>
    </group>
  );
}

// ─── Water Purification System ─────────────────────────────────────────────
function WaterPurification({ position, rotation = 0, mats }) {
  const waterRef = useRef();
  const spinRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (waterRef.current) {
      waterRef.current.rotation.z = t * 0.08;
    }
    if (spinRef.current) {
      spinRef.current.rotation.y = t * 0.35;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Primary circular clarifier basin */}
      <mesh position={[0, 0.18, 0]} material={mats.concrete} receiveShadow>
        <cylinderGeometry args={[6, 6.3, 0.36, 32]} />
      </mesh>
      {/* Water surface */}
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.waterMat}>
        <circleGeometry args={[5.85, 32]} />
      </mesh>
      {/* Rotating skimmer arm */}
      <group ref={waterRef} position={[0, 0.46, 0]}>
        <mesh material={mats.whiteFacade}>
          <boxGeometry args={[11.6, 0.12, 0.22]} />
        </mesh>
        <mesh position={[5.6, 0, 0]} material={mats.glowBlue}>
          <sphereGeometry args={[0.18, 10, 10]} />
        </mesh>
      </group>
      {/* Basin wall accent ring */}
      <mesh position={[0, 0.56, 0]} material={mats.glowBlue}>
        <torusGeometry args={[6.0, 0.05, 8, 48]} />
      </mesh>

      {/* Central UV treatment column */}
      <mesh position={[0, 2.5, 0]} material={mats.whiteFacade}>
        <cylinderGeometry args={[0.55, 0.65, 5, 12]} />
      </mesh>
      <mesh position={[0, 2.5, 0]} material={mats.turquoiseGlass}>
        <cylinderGeometry args={[0.58, 0.68, 4.2, 12]} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} color="#38bdf8" intensity={3.0} distance={12} decay={2} />
      <mesh position={[0, 5.1, 0]} material={mats.glowBlue}>
        <sphereGeometry args={[0.32, 14, 14]} />
      </mesh>

      {/* Secondary filter tanks – row of 3 */}
      {[-5.5, 0, 5.5].map((xOff, i) => (
        <group key={i} position={[xOff, 0, 8.5]}>
          <mesh position={[0, 1.6, 0]} material={mats.whiteFacade}>
            <cylinderGeometry args={[1.2, 1.35, 3.2, 16]} />
          </mesh>
          <mesh position={[0, 1.6, 0]} material={mats.skyGlass}>
            <cylinderGeometry args={[1.22, 1.37, 2.6, 16]} />
          </mesh>
          {/* Level indicator */}
          <mesh position={[0, 0.6 + i * 0.25, 1.38]} material={mats.glowBlue}>
            <boxGeometry args={[0.3, 0.06, 0.06]} />
          </mesh>
          {/* Overflow pipe */}
          <mesh position={[1.38, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.pipeMat}>
            <cylinderGeometry args={[0.09, 0.09, 1.2, 8]} />
          </mesh>
        </group>
      ))}

      {/* Rotating monitoring drone arm */}
      <group ref={spinRef} position={[0, 6, 0]}>
        <mesh material={mats.silverMet}>
          <boxGeometry args={[8, 0.08, 0.14]} />
        </mesh>
        <mesh position={[4, -0.3, 0]} material={mats.glowGreen}>
          <sphereGeometry args={[0.16, 10, 10]} />
        </mesh>
      </group>

      {/* Control building */}
      <group position={[-9, 0, 0]}>
        <mesh position={[0, 2.5, 0]} material={mats.whiteFacade} castShadow receiveShadow>
          <boxGeometry args={[4.5, 5, 4]} />
        </mesh>
        <mesh position={[0, 2.5, 0]} material={mats.skyGlass}>
          <boxGeometry args={[4.55, 4, 3.8]} />
        </mesh>
        <mesh position={[0, 5.12, 0]} rotation={[-0.3, 0, 0]} material={mats.solarBlue}>
          <boxGeometry args={[3.6, 0.04, 3.2]} />
        </mesh>
        {[1.5, 3, 4.5].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={mats.glowBlue}>
            <boxGeometry args={[4.56, 0.05, 4.06]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Green Technology Showcase Area ───────────────────────────────────────
// Open pavilion with interactive demo pods and living wall
function GreenTechShowcase({ position, rotation = 0, mats }) {
  const displayRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    displayRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.rotation.y = t * 0.3 + i * (Math.PI * 2 / 4);
        ref.material.emissiveIntensity = 1.4 + Math.sin(t * 1.1 + i) * 0.5;
      }
    });
  });

  // Pod configs: [x, z, color label]
  const pods = [
    { x: -5, z: -5, mat: "glowBlue",   label: "Solar" },
    { x:  5, z: -5, mat: "glowGreen",  label: "Wind"  },
    { x:  5, z:  5, mat: "glowYellow", label: "H₂"    },
    { x: -5, z:  5, mat: "glowBlue",   label: "Water" },
  ];

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Hexagonal showcase plaza */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.concrete} receiveShadow>
        <circleGeometry args={[11, 6]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={mats.glowBlue}>
        <torusGeometry args={[11, 0.08, 8, 6]} />
      </mesh>

      {/* Central rotating display globe */}
      <group position={[0, 2.8, 0]}>
        <mesh material={mats.turquoiseGlass}>
          <sphereGeometry args={[1.8, 28, 20]} />
        </mesh>
        <mesh material={mats.glowBlue}>
          <torusGeometry args={[1.85, 0.05, 8, 48]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.glowGreen}>
          <torusGeometry args={[1.85, 0.04, 8, 48]} />
        </mesh>
        <pointLight color="#06b6d4" intensity={3.0} distance={16} decay={2} />
      </group>
      {/* Central pedestal */}
      <mesh position={[0, 1.2, 0]} material={mats.whiteFacade}>
        <cylinderGeometry args={[0.45, 0.6, 2.4, 12]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={mats.glowBlue}>
        <cylinderGeometry args={[0.65, 0.65, 0.06, 16]} />
      </mesh>

      {/* 4 Technology Demo Pods */}
      {pods.map((pod, i) => (
        <group key={i} position={[pod.x, 0, pod.z]}>
          {/* Pod plinth */}
          <mesh position={[0, 0.6, 0]} material={mats.whiteFacade}>
            <cylinderGeometry args={[1.1, 1.2, 1.2, 10]} />
          </mesh>
          {/* Rotating display prism */}
          <mesh
            ref={(el) => (displayRefs.current[i] = el)}
            position={[0, 1.85, 0]}
            material={mats[pod.mat]}
          >
            <octahedronGeometry args={[0.65, 0]} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 3.2, 0]} material={mats.skyGlass}>
            <coneGeometry args={[1.6, 1.2, 6]} />
          </mesh>
          <mesh position={[0, 2.6, 0]} material={mats.whiteFacade}>
            <cylinderGeometry args={[0.12, 0.12, 1.8, 8]} />
          </mesh>
          {/* LED base ring */}
          <mesh position={[0, 0.06, 0]} material={mats[pod.mat]}>
            <torusGeometry args={[1.12, 0.05, 8, 24]} />
          </mesh>
        </group>
      ))}

      {/* Canopy structure – 4 large shade sails */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group key={i} position={[Math.cos(a) * 8, 5.5, Math.sin(a) * 8]}>
            <mesh position={[0, 0, 0]} rotation={[0.3, a + Math.PI, 0]} material={mats.whiteFacade} castShadow>
              <coneGeometry args={[3.5, 1.0, 3]} />
            </mesh>
            {/* Support mast */}
            <mesh position={[0, -2.8, 0]} material={mats.silverMet}>
              <cylinderGeometry args={[0.12, 0.16, 5.5, 8]} />
            </mesh>
            {/* Solar panel on top */}
            <mesh position={[0, 0.6, 0]} rotation={[-0.3, 0, 0]} material={mats.solarBlue}>
              <boxGeometry args={[2.4, 0.05, 2.4]} />
            </mesh>
          </group>
        );
      })}

      {/* Living wall on back side */}
      <mesh position={[0, 2.5, 11.2]} material={mats.foliage} castShadow>
        <boxGeometry args={[12, 5, 0.4]} />
      </mesh>
      {/* Living wall frame */}
      <mesh position={[0, 2.5, 11.0]} material={mats.whiteFacade}>
        <boxGeometry args={[12.4, 5.4, 0.2]} />
      </mesh>
      {/* Wall accent glow strip */}
      <mesh position={[0, 5.1, 11.22]} material={mats.glowGreen}>
        <boxGeometry args={[12, 0.06, 0.06]} />
      </mesh>

      {/* Info label panels between pods */}
      {[-8, 8].map((xOff, i) => (
        <group key={i} position={[xOff, 1.5, 0]}>
          <mesh position={[0, 0, 0]} material={mats.whiteFacade} castShadow>
            <boxGeometry args={[0.2, 2.5, 1.8]} />
          </mesh>
          <mesh position={[i === 0 ? -0.12 : 0.12, 0, 0]} material={mats.skyGlass}>
            <boxGeometry args={[0.05, 2.2, 1.5]} />
          </mesh>
          <mesh position={[0, 1.28, 0]} material={mats.glowBlue}>
            <boxGeometry args={[0.22, 0.05, 1.85]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Wind Farm Cluster ─────────────────────────────────────────────────────
function WindFarmCluster({ position, mats }) {
  // Pre-defined turbine layout to avoid random() in render
  const turbines = [
    { x: 0,    z: 0,    h: 28, s: 0.62, r: 0    },
    { x: 7,    z: 3,    h: 26, s: 0.55, r: 0.3  },
    { x: -7,   z: 4,   h: 30, s: 0.68, r: -0.2 },
    { x: 3.5,  z: -7,  h: 25, s: 0.58, r: 0.15 },
    { x: -3.5, z: -7,  h: 27, s: 0.64, r: -0.1 },
    { x: 12,   z: -2,  h: 24, s: 0.52, r: 0.4  },
  ];

  return (
    <group position={position}>
      {/* Low grass ground cover */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.foliage} receiveShadow>
        <circleGeometry args={[18, 32]} />
      </mesh>
      {turbines.map((t, i) => (
        <WindTurbine
          key={i}
          position={[t.x, 0, t.z]}
          height={t.h}
          bladeLen={9 + i * 0.3}
          rotation={t.r}
          speed={t.s}
          mats={mats}
        />
      ))}
    </group>
  );
}

// ─── Solar Tower Farm ──────────────────────────────────────────────────────
function SolarTowerFarm({ position, mats }) {
  const towers = [
    { x: 0,  z: 0,  h: 34, r: 0    },
    { x: 8,  z: 5,  h: 28, r: 0.5  },
    { x: -8, z: 5,  h: 30, r: -0.4 },
    { x: 4,  z: -9, h: 26, r: 0.2  },
    { x: -4, z: -9, h: 32, r: -0.2 },
  ];

  return (
    <group position={position}>
      {/* Concrete pad */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.concrete} receiveShadow>
        <circleGeometry args={[16, 32]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={mats.glowYellow}>
        <torusGeometry args={[16, 0.08, 8, 48]} />
      </mesh>
      {towers.map((t, i) => (
        <SolarTower key={i} position={[t.x, 0.1, t.z]} height={t.h} rotation={t.r} mats={mats} />
      ))}
    </group>
  );
}

// ─── Master Clean Energy District ─────────────────────────────────────────
export default function CleanEnergyDistrict({ position = [55, 0, 0] }) {
  const mats = useEnergyMaterials();

  return (
    <group position={position}>
      {/* ── District ground plaza ── */}
      <mesh position={[0, 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.concrete} receiveShadow>
        <circleGeometry args={[38, 48]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} material={mats.glowBlue}>
        <torusGeometry args={[37.8, 0.14, 8, 64]} />
      </mesh>

      {/* ── Solar Tower Farm – NW cluster ── */}
      <SolarTowerFarm position={[-14, 0, -14]} mats={mats} />

      {/* ── Wind Farm – NE cluster ── */}
      <WindFarmCluster position={[16, 0, -12]} mats={mats} />

      {/* ── Hydrogen Facility – East ── */}
      <HydrogenFacility position={[14, 0, 10]} rotation={-0.3} mats={mats} />

      {/* ── Water Purification – West ── */}
      <WaterPurification position={[-16, 0, 10]} rotation={0.2} mats={mats} />

      {/* ── Green Tech Showcase – South center ── */}
      <GreenTechShowcase position={[0, 0, 22]} rotation={Math.PI} mats={mats} />

      {/* ── District perimeter green strip ── */}
      <mesh position={[0, 0.06, 0]} material={mats.foliage}>
        <torusGeometry args={[37.5, 1.2, 6, 64]} />
      </mesh>

      {/* Ambient district lighting */}
      <pointLight position={[0, 18, 0]} color="#e0f7ff" intensity={2.0} distance={55} decay={2} />
      <pointLight position={[-14, 8, -14]} color="#fcd34d" intensity={1.5} distance={28} decay={2} />
      <pointLight position={[16, 8, -12]} color="#bae6fd" intensity={1.2} distance={28} decay={2} />
      <pointLight position={[14, 6, 10]}  color="#86efac" intensity={1.4} distance={24} decay={2} />
      <pointLight position={[-16, 6, 10]} color="#38bdf8" intensity={1.4} distance={24} decay={2} />
    </group>
  );
}
