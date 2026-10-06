import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Shared materials ────────────────────────────────────────────────────────
function useResearchMaterials() {
  return useMemo(() => {
    // Ultra-transparent glass facade for labs
    const labGlass = new THREE.MeshStandardMaterial({
      color: "#e0f7ff",
      roughness: 0.04,
      metalness: 0.15,
      transparent: true,
      opacity: 0.72,
    });

    // White structural frame
    const whiteFacade = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.22,
      metalness: 0.18,
    });

    // Floating data sphere – emissive turquoise
    const dataSphere = new THREE.MeshStandardMaterial({
      color: "#06b6d4",
      emissive: "#06b6d4",
      emissiveIntensity: 1.6,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });

    // Hologram plane – additive glow
    const hologramMat = new THREE.MeshBasicMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Hologram grid lines (brighter)
    const hologramGridMat = new THREE.MeshBasicMaterial({
      color: "#7dd3fc",
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      wireframe: true,
      depthWrite: false,
    });

    // Robot chassis – metallic white
    const robotBody = new THREE.MeshStandardMaterial({
      color: "#f0f9ff",
      roughness: 0.18,
      metalness: 0.55,
    });

    // Robot sensor/accent – glowing cyan
    const robotAccent = new THREE.MeshStandardMaterial({
      color: "#06b6d4",
      emissive: "#22d3ee",
      emissiveIntensity: 2.2,
      toneMapped: false,
    });

    // AI garden foliage – vivid green
    const smartFoliage = new THREE.MeshStandardMaterial({
      color: "#22c55e",
      roughness: 0.82,
      metalness: 0.04,
      flatShading: true,
    });

    // Solar panels on lab rooftops
    const solarMat = new THREE.MeshStandardMaterial({
      color: "#0369a1",
      roughness: 0.12,
      metalness: 0.85,
    });

    // Blue accent glow strips
    const accentMat = new THREE.MeshStandardMaterial({
      color: "#00d2ff",
      emissive: "#00e5ff",
      emissiveIntensity: 2.6,
      toneMapped: false,
    });

    // Ground plaza
    const plazaMat = new THREE.MeshStandardMaterial({
      color: "#f0f9ff",
      roughness: 0.7,
      metalness: 0.05,
    });

    return {
      labGlass, whiteFacade, dataSphere, hologramMat, hologramGridMat,
      robotBody, robotAccent, smartFoliage, solarMat, accentMat, plazaMat,
    };
  }, []);
}

// ─── Floating Data Spheres (instanced, sinusoidal drift) ─────────────────────
function FloatingDataSpheres({ count = 28, mats }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initial sphere configs: position + phase offset
  const spheres = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const layer = Math.floor(i / 9);
      const radius = 12 + layer * 5;
      const baseY = 18 + layer * 6 + (i % 3) * 2.5;
      const phase = i * 0.8;
      const speed = 0.3 + (i % 5) * 0.08;
      const size = 0.28 + (i % 4) * 0.12;
      return { angle, radius, baseY, phase, speed, size };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    spheres.forEach((s, i) => {
      const orbitAngle = s.angle + t * s.speed * 0.12;
      const x = Math.cos(orbitAngle) * s.radius;
      const z = Math.sin(orbitAngle) * s.radius;
      const y = s.baseY + Math.sin(t * s.speed + s.phase) * 1.4;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(s.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <primitive object={mats.dataSphere} />
    </instancedMesh>
  );
}

// ─── Hologram Display Panel ───────────────────────────────────────────────────
function HologramPanel({ position, rotation = [0, 0, 0], width = 2.4, height = 3.2, mats }) {
  const panelRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (panelRef.current) {
      panelRef.current.material.opacity = 0.38 + Math.sin(t * 1.4) * 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.6;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Glow backdrop */}
      <mesh ref={panelRef} material={mats.hologramMat}>
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Grid wireframe overlay */}
      <mesh position={[0, 0, 0.01]} material={mats.hologramGridMat}>
        <planeGeometry args={[width, height, 6, 8]} />
      </mesh>

      {/* Floating data-ring around panel */}
      <group ref={ringRef} position={[0, 0, 0]}>
        <mesh material={mats.accentMat}>
          <torusGeometry args={[width * 0.62, 0.04, 8, 32]} />
        </mesh>
      </group>

      {/* Base pedestal */}
      <mesh position={[0, -height / 2 - 0.4, 0]} material={mats.whiteFacade}>
        <cylinderGeometry args={[0.18, 0.24, 0.8, 8]} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.85, 0]} material={mats.accentMat}>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
      </mesh>
    </group>
  );
}

// ─── Autonomous Research Robot ────────────────────────────────────────────────
function ResearchRobot({ startAngle, orbitRadius, speed = 0.18, mats }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const sensorRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const angle = startAngle + t * speed;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0.55, z);
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    // Oscillating sensor arms
    if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2.5) * 0.35;
    if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2.5) * 0.35;
    if (sensorRef.current) sensorRef.current.rotation.y = t * 1.8;
  });

  return (
    <group ref={groupRef}>
      {/* Body chassis */}
      <mesh position={[0, 0.3, 0]} material={mats.robotBody}>
        <boxGeometry args={[0.55, 0.45, 0.7]} />
      </mesh>
      {/* Head sensor dome */}
      <mesh position={[0, 0.65, 0]} material={mats.robotBody}>
        <sphereGeometry args={[0.22, 12, 12]} />
      </mesh>
      {/* Glowing sensor eye */}
      <mesh ref={sensorRef} position={[0, 0.67, 0.18]} material={mats.robotAccent}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
      </mesh>

      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.38, 0.32, 0]}>
        <mesh material={mats.robotBody}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} material={mats.robotAccent}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      </group>

      {/* Right arm */}
      <group ref={rightArmRef} position={[0.38, 0.32, 0]}>
        <mesh material={mats.robotBody}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
        </mesh>
        <mesh position={[0.22, 0, 0]} material={mats.robotAccent}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      </group>

      {/* Wheel pods */}
      {[-0.22, 0.22].map((xOff, i) =>
        [-0.28, 0.28].map((zOff, j) => (
          <mesh key={`${i}-${j}`} position={[xOff, 0.1, zOff]} rotation={[0, 0, Math.PI / 2]} material={mats.robotAccent}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
          </mesh>
        ))
      )}

      {/* Blue underglow */}
      <mesh position={[0, 0.06, 0]} material={mats.accentMat}>
        <boxGeometry args={[0.52, 0.04, 0.65]} />
      </mesh>
    </group>
  );
}

// ─── Smart AI Garden Bed ──────────────────────────────────────────────────────
const SmartGardenBed = memo(function SmartGardenBed({ position, width = 4, depth = 2, mats }) {
  const plants = useMemo(() => {
    const seed = [
      0.12, 0.74, 0.33, 0.91, 0.55, 0.27, 0.68, 0.43, 0.82, 0.16, 0.59, 0.38,
    ];
    const seed2 = [
      0.71, 0.28, 0.85, 0.14, 0.62, 0.49, 0.93, 0.07, 0.36, 0.77, 0.51, 0.22,
    ];
    const seed3 = [
      0.45, 0.88, 0.19, 0.64, 0.31, 0.72, 0.53, 0.96, 0.08, 0.41, 0.67, 0.29,
    ];
    const seed4 = [
      1.8,  4.2,  0.7,  3.5,  5.1,  2.3,  0.4,  4.8,  1.2,  3.9,  2.7,  5.6,
    ];
    const pts = [];
    for (let i = 0; i < 12; i++) {
      pts.push({
        x: (seed[i] - 0.5) * (width - 0.6),
        z: (seed2[i] - 0.5) * (depth - 0.4),
        size: 0.28 + seed3[i] * 0.22,
        phase: seed4[i],
      });
    }
    return pts;
  }, [width, depth]);

  return (
    <group position={position}>
      {/* Planter box */}
      <mesh position={[0, 0.12, 0]} material={mats.whiteFacade}>
        <boxGeometry args={[width, 0.24, depth]} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.26, 0]} material={mats.smartFoliage}>
        <boxGeometry args={[width - 0.1, 0.08, depth - 0.1]} />
      </mesh>
      {/* AI sensor strip */}
      <mesh position={[0, 0.26, depth / 2 - 0.05]} material={mats.accentMat}>
        <boxGeometry args={[width * 0.6, 0.04, 0.06]} />
      </mesh>

      {/* Individual plants with static natural orientation */}
      {plants.map((p, i) => (
        <group
          key={i}
          position={[p.x, 0.3 + p.size * 0.5, p.z]}
          rotation={[p.phase * 0.2, p.phase, 0]}
        >
          <mesh material={mats.smartFoliage}>
            <dodecahedronGeometry args={[p.size, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// ─── Transparent Research Lab Building ───────────────────────────────────────
function ResearchLab({
  position,
  width = 7,
  depth = 6,
  height = 14,
  rotation = 0,
  mats,
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Transparent glass body */}
      <mesh position={[0, height / 2, 0]} material={mats.labGlass} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* White structural exoskeleton frame – vertical */}
      {[-width / 2, 0, width / 2].map((xOff, i) =>
        [-depth / 2, depth / 2].map((zOff, j) => (
          <mesh key={`v-${i}-${j}`} position={[xOff, height / 2, zOff]} material={mats.whiteFacade}>
            <boxGeometry args={[0.28, height, 0.28]} />
          </mesh>
        ))
      )}

      {/* White horizontal belt beams every 3.5 units */}
      {Array.from({ length: Math.floor(height / 3.5) }).map((_, i) => {
        const y = (i + 1) * 3.5;
        return (
          <mesh key={`h-${i}`} position={[0, y, 0]} material={mats.whiteFacade}>
            <boxGeometry args={[width + 0.06, 0.22, depth + 0.06]} />
          </mesh>
        );
      })}

      {/* Blue accent glow strips at each floor belt */}
      {Array.from({ length: Math.floor(height / 3.5) }).map((_, i) => {
        const y = (i + 1) * 3.5;
        return (
          <mesh key={`glow-${i}`} position={[0, y + 0.12, 0]} material={mats.accentMat}>
            <boxGeometry args={[width + 0.1, 0.06, depth + 0.1]} />
          </mesh>
        );
      })}

      {/* Roof: white parapet + solar panels */}
      <mesh position={[0, height + 0.15, 0]} material={mats.whiteFacade}>
        <boxGeometry args={[width + 0.3, 0.3, depth + 0.3]} />
      </mesh>
      <mesh position={[0, height + 0.35, 0]} rotation={[-0.3, 0, 0]} material={mats.solarMat}>
        <boxGeometry args={[width * 0.75, 0.05, depth * 0.75]} />
      </mesh>

      {/* Roof blue accent ring */}
      <mesh position={[0, height + 0.5, 0]} material={mats.accentMat}>
        <boxGeometry args={[width + 0.12, 0.06, depth + 0.12]} />
      </mesh>

      {/* Vertical garden strip on one face */}
      <mesh position={[0, height * 0.55, depth / 2 + 0.15]} material={mats.smartFoliage}>
        <boxGeometry args={[width * 0.6, height * 0.5, 0.18]} />
      </mesh>
    </group>
  );
}

// ─── Curved Connector Bridge between labs ────────────────────────────────────
function LabConnectorBridge({ start, end, elevation, mats }) {
  const { mid, len, rotY } = useMemo(() => {
    const p1 = new THREE.Vector3(start[0], elevation, start[1]);
    const p2 = new THREE.Vector3(end[0], elevation, end[1]);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const len = p1.distanceTo(p2);
    const rotY = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    return { mid, len, rotY };
  }, [start, end, elevation]);

  return (
    <group position={[mid.x, elevation, mid.z]} rotation={[0, rotY, 0]}>
      {/* Deck */}
      <mesh position={[0, 0, 0]} material={mats.whiteFacade} castShadow>
        <boxGeometry args={[1.8, 0.3, len]} />
      </mesh>
      {/* Glass walls */}
      {[-0.9, 0.9].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.7, 0]} material={mats.labGlass}>
          <boxGeometry args={[0.05, 1.1, len * 0.96]} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 1.3, 0]} material={mats.whiteFacade}>
        <boxGeometry args={[1.85, 0.18, len]} />
      </mesh>
      {/* Blue underglow */}
      <mesh position={[0, -0.18, 0]} material={mats.accentMat}>
        <boxGeometry args={[0.15, 0.06, len]} />
      </mesh>
      {/* Solar strip on roof */}
      <mesh position={[0, 1.42, 0]} material={mats.solarMat}>
        <boxGeometry args={[1.2, 0.04, len * 0.85]} />
      </mesh>
    </group>
  );
}

// ─── Central AI Nexus Dome ────────────────────────────────────────────────────
function AIHubDome({ position, mats }) {
  const ringA = useRef();
  const ringB = useRef();
  const ringC = useRef();
  const pulseRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringA.current) ringA.current.rotation.y = t * 0.4;
    if (ringB.current) ringB.current.rotation.x = t * 0.28;
    if (ringC.current) ringC.current.rotation.z = t * 0.2;
    if (pulseRef.current) {
      const s = 1 + Math.sin(t * 1.8) * 0.06;
      pulseRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      {/* White base platform */}
      <mesh position={[0, 0.2, 0]} material={mats.whiteFacade} receiveShadow>
        <cylinderGeometry args={[6.5, 7, 0.4, 32]} />
      </mesh>
      {/* Blue accent ring on platform edge */}
      <mesh position={[0, 0.42, 0]} material={mats.accentMat}>
        <torusGeometry args={[6.5, 0.08, 8, 48]} />
      </mesh>

      {/* Glass dome shell */}
      <mesh position={[0, 5.5, 0]} material={mats.labGlass} castShadow>
        <sphereGeometry args={[5.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>

      {/* White structural ribs */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <group key={i} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh position={[0, 5.5, 0]} rotation={[0, 0, Math.PI / 12]} material={mats.whiteFacade}>
            <boxGeometry args={[0.18, 11, 0.18]} />
          </mesh>
        </group>
      ))}

      {/* Central AI core column */}
      <mesh position={[0, 3, 0]} material={mats.whiteFacade}>
        <cylinderGeometry args={[0.6, 0.8, 6, 16]} />
      </mesh>

      {/* Pulsing energy sphere at apex */}
      <group ref={pulseRef} position={[0, 9.2, 0]}>
        <mesh material={mats.dataSphere}>
          <sphereGeometry args={[0.9, 20, 20]} />
        </mesh>
      </group>

      {/* Orbiting data rings */}
      <group ref={ringA} position={[0, 6.5, 0]}>
        <mesh material={mats.accentMat}>
          <torusGeometry args={[2.8, 0.05, 8, 48]} />
        </mesh>
      </group>
      <group ref={ringB} position={[0, 6.5, 0]}>
        <mesh material={mats.accentMat}>
          <torusGeometry args={[3.6, 0.04, 8, 48]} />
        </mesh>
      </group>
      <group ref={ringC} position={[0, 6.5, 0]}>
        <mesh material={mats.accentMat}>
          <torusGeometry args={[4.4, 0.035, 8, 48]} />
        </mesh>
      </group>

      {/* Smart garden beds around dome base */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <SmartGardenBed
            key={i}
            position={[Math.cos(rad) * 6.2, 0.4, Math.sin(rad) * 6.2]}
            width={3.5}
            depth={1.4}
            mats={mats}
          />
        );
      })}
    </group>
  );
}

// ─── Master AI Research District ─────────────────────────────────────────────
function AIResearchDistrict({ position = [0, 0, -38] }) {
  const mats = useResearchMaterials();

  // Lab layout: 6 labs arranged around the central dome
  const labs = [
    { pos: [-16, 0, -6],  w: 8,  d: 6,  h: 15, rot: 0.3  },
    { pos: [16,  0, -6],  w: 8,  d: 6,  h: 13, rot: -0.3 },
    { pos: [-14, 0, 12],  w: 7,  d: 6,  h: 16, rot: 0.1  },
    { pos: [14,  0, 12],  w: 7,  d: 6,  h: 14, rot: -0.1 },
    { pos: [-5,  0, -16], w: 9,  d: 5,  h: 12, rot: 0.05 },
    { pos: [5,   0, -16], w: 9,  d: 5,  h: 12, rot: -0.05},
  ];

  // Hologram panels placed between labs
  const holograms = [
    { pos: [-8.5, 6.5, -6],  rot: [0, 0.5, 0]  },
    { pos: [8.5,  6.5, -6],  rot: [0, -0.5, 0] },
    { pos: [0,    8,   -16], rot: [0, 0, 0]    },
    { pos: [-6,   7,    12], rot: [0, 0.8, 0]  },
    { pos: [6,    7,    12], rot: [0, -0.8, 0] },
  ];

  // Robots patrolling between labs
  const robots = [
    { startAngle: 0,               orbitRadius: 9,  speed: 0.14 },
    { startAngle: Math.PI * 0.5,   orbitRadius: 9,  speed: 0.12 },
    { startAngle: Math.PI,         orbitRadius: 13, speed: 0.10 },
    { startAngle: Math.PI * 1.5,   orbitRadius: 13, speed: 0.11 },
    { startAngle: Math.PI * 0.25,  orbitRadius: 6,  speed: 0.18 },
    { startAngle: Math.PI * 0.75,  orbitRadius: 6,  speed: 0.16 },
  ];

  return (
    <group position={position}>
      {/* --- Ground Plaza --- */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.plazaMat} receiveShadow>
        <circleGeometry args={[26, 48]} />
      </mesh>

      {/* Blue accent ring on plaza edge */}
      <mesh position={[0, 0.02, 0]} material={mats.accentMat}>
        <torusGeometry args={[25.8, 0.12, 8, 64]} />
      </mesh>

      {/* --- Central AI Hub Dome --- */}
      <AIHubDome position={[0, 0.4, 0]} mats={mats} />

      {/* --- Research Labs --- */}
      {labs.map((lab, i) => (
        <ResearchLab
          key={i}
          position={[lab.pos[0], lab.pos[1], lab.pos[2]]}
          width={lab.w}
          depth={lab.d}
          height={lab.h}
          rotation={lab.rot}
          mats={mats}
        />
      ))}

      {/* --- Sky Bridges connecting labs to central dome --- */}
      <LabConnectorBridge start={[-16, -6]} end={[-6, 0]}  elevation={8} mats={mats} />
      <LabConnectorBridge start={[16,  -6]} end={[6,  0]}  elevation={7} mats={mats} />
      <LabConnectorBridge start={[-5, -16]} end={[0, -7]}  elevation={6} mats={mats} />
      <LabConnectorBridge start={[5,  -16]} end={[0, -7]}  elevation={6} mats={mats} />

      {/* --- Hologram Displays --- */}
      {holograms.map((h, i) => (
        <HologramPanel
          key={i}
          position={h.pos}
          rotation={h.rot}
          mats={mats}
        />
      ))}

      {/* --- Floating Data Spheres (50% particle reduction) --- */}
      <FloatingDataSpheres count={14} mats={mats} />

      {/* --- Autonomous Research Robots --- */}
      {robots.map((r, i) => (
        <ResearchRobot
          key={i}
          startAngle={r.startAngle}
          orbitRadius={r.orbitRadius}
          speed={r.speed}
          mats={mats}
        />
      ))}

      {/* --- Smart AI Garden Beds between labs --- */}
      <SmartGardenBed position={[-11, 0.4,  3]}  width={5} depth={1.6} mats={mats} />
      <SmartGardenBed position={[11,  0.4,  3]}  width={5} depth={1.6} mats={mats} />
      <SmartGardenBed position={[0,   0.4, -11]} width={6} depth={1.6} mats={mats} />
      <SmartGardenBed position={[-8,  0.4,  18]} width={5} depth={1.6} mats={mats} />
      <SmartGardenBed position={[8,   0.4,  18]} width={5} depth={1.6} mats={mats} />

      {/* District ambient fill light */}
      <pointLight position={[0, 12, 0]} color="#e0f7ff" intensity={1.8} distance={40} decay={2} />
    </group>
  );
}

export default memo(AIResearchDistrict);
