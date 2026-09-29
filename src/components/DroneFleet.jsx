import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Minimal BufferGeometry merger (merges static sub-parts sharing a material) ─
function mergeGeometries(geometries) {
  let totalVerts = 0;
  let totalIndices = 0;

  const nonIndexed = geometries.map((g) => (g.index ? g.toNonIndexed() : g.clone()));
  for (const g of nonIndexed) {
    totalVerts += g.attributes.position.count;
    totalIndices += g.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  let offset = 0;

  for (const g of nonIndexed) {
    const pos = g.attributes.position.array;
    const norm = g.attributes.normal.array;
    positions.set(pos, offset);
    normals.set(norm, offset);
    offset += pos.length;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.computeBoundingSphere();
  return merged;
}

// ─── Arm offsets for 4 thruster rings ──────────────────────────────────────────
const ARM_OFFSETS = [
  [-0.8, 0, 0.6],
  [0.8, 0, 0.6],
  [-0.9, 0, -0.6],
  [0.9, 0, -0.6],
];

// ─── Pre-merged & pre-transformed geometries (created once at module load) ────
const DRONE_BODY_GEO = (() => {
  const parts = [];
  // Aerodynamic White Fuselage
  parts.push(new THREE.BoxGeometry(0.85, 0.26, 1.7));
  // 4 Thruster Struts + 4 Thruster Torus Shrouds
  for (const [rx, ry, rz] of ARM_OFFSETS) {
    const arm = new THREE.BoxGeometry(0.28, 0.06, 0.14);
    arm.translate(rx, ry, rz);
    parts.push(arm);

    const ring = new THREE.TorusGeometry(0.3, 0.05, 6, 12);
    ring.rotateX(Math.PI / 2);
    ring.translate(rx, ry, rz);
    parts.push(ring);
  }
  return mergeGeometries(parts);
})();

const DRONE_GLOW_DISCS_GEO = (() => {
  const parts = [];
  for (const [rx, ry, rz] of ARM_OFFSETS) {
    const disc = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12);
    disc.rotateX(Math.PI / 2);
    disc.translate(rx, ry, rz);
    parts.push(disc);
  }
  return mergeGeometries(parts);
})();

const VISOR_GEO = (() => {
  const g = new THREE.BoxGeometry(0.55, 0.16, 0.75);
  g.translate(0, 0.12, 0.32);
  return g;
})();

const TRAIL_GEO = (() => {
  const g = new THREE.ConeGeometry(0.16, 1.1, 6);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, -1.1);
  return g;
})();

const BEACON_GEO = new THREE.SphereGeometry(0.075, 6, 6);

// ─── Shared materials (created once across all 32 drones) ─────────────────────
const BODY_MAT = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.18,
  metalness: 0.8,
});
const RING_GLOW_MAT = new THREE.MeshStandardMaterial({
  color: "#06b6d4",
  emissive: "#22d3ee",
  emissiveIntensity: 3.5,
  toneMapped: false,
});
const VISOR_MAT = new THREE.MeshStandardMaterial({
  color: "#0ea5e9",
  roughness: 0.1,
  metalness: 0.9,
});
const TRAIL_MAT = new THREE.MeshBasicMaterial({
  color: "#22d3ee",
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});

// ─── 32 Coordinated Autonomous Eco-Drones across Verdantis ────────────────────
const FLEET_CONFIGS = [
  // 1–6: Core Lakefront & Spire Patrol (Index 0 = Lead Drone tracked by Camera)
  { centerX: 0,  centerZ: 0,   radiusX: 18, radiusZ: 22, baseY: 18, speed: 0.32, phase: 0.0, direction:  1, wobbleFreq: 1.4, wobbleAmp: 1.6, isLead: true },
  { centerX: 0,  centerZ: 0,   radiusX: 24, radiusZ: 24, baseY: 12, speed: 0.26, phase: 1.4, direction: -1, wobbleFreq: 1.3, wobbleAmp: 1.2 },
  { centerX: 0,  centerZ: 0,   radiusX: 30, radiusZ: 36, baseY: 36, speed: 0.20, phase: 2.2, direction:  1, wobbleFreq: 1.1, wobbleAmp: 1.8 },
  { centerX: 0,  centerZ: 0,   radiusX: 11, radiusZ: 11, baseY: 26, speed: 0.42, phase: 3.1, direction: -1, wobbleFreq: 1.6, wobbleAmp: 1.1 },
  { centerX: 0,  centerZ: 0,   radiusX: 38, radiusZ: 32, baseY: 22, speed: 0.24, phase: 4.5, direction:  1, wobbleFreq: 1.2, wobbleAmp: 1.5 },
  { centerX: 0,  centerZ: 0,   radiusX: 26, radiusZ: 38, baseY: 28, speed: 0.30, phase: 5.2, direction: -1, wobbleFreq: 1.5, wobbleAmp: 1.4 },

  // 7–16: Sky Gardens & Inter-Tower Botanical Pollinator Drones
  { centerX: 0,  centerZ: 0,   radiusX: 22, radiusZ: 16, baseY: 24, speed: 0.29, phase: 0.7, direction:  1, wobbleFreq: 1.5, wobbleAmp: 1.3 },
  { centerX: 0,  centerZ: 0,   radiusX: 16, radiusZ: 28, baseY: 21, speed: 0.31, phase: 1.9, direction: -1, wobbleFreq: 1.3, wobbleAmp: 1.4 },
  { centerX: 0,  centerZ: 0,   radiusX: 34, radiusZ: 20, baseY: 27, speed: 0.23, phase: 2.8, direction:  1, wobbleFreq: 1.4, wobbleAmp: 1.6 },
  { centerX: 0,  centerZ: 0,   radiusX: 20, radiusZ: 34, baseY: 19, speed: 0.27, phase: 3.6, direction: -1, wobbleFreq: 1.2, wobbleAmp: 1.3 },
  { centerX: 0,  centerZ: 0,   radiusX: 29, radiusZ: 29, baseY: 31, speed: 0.22, phase: 4.1, direction:  1, wobbleFreq: 1.6, wobbleAmp: 1.5 },
  { centerX: 0,  centerZ: 0,   radiusX: 14, radiusZ: 19, baseY: 15, speed: 0.36, phase: 5.0, direction: -1, wobbleFreq: 1.7, wobbleAmp: 1.0 },
  { centerX: 0,  centerZ: 0,   radiusX: 42, radiusZ: 26, baseY: 25, speed: 0.21, phase: 0.4, direction:  1, wobbleFreq: 1.1, wobbleAmp: 1.7 },
  { centerX: 0,  centerZ: 0,   radiusX: 27, radiusZ: 42, baseY: 29, speed: 0.25, phase: 1.2, direction: -1, wobbleFreq: 1.3, wobbleAmp: 1.5 },
  { centerX: 0,  centerZ: 0,   radiusX: 33, radiusZ: 33, baseY: 16, speed: 0.28, phase: 2.5, direction:  1, wobbleFreq: 1.4, wobbleAmp: 1.2 },
  { centerX: 0,  centerZ: 0,   radiusX: 19, radiusZ: 25, baseY: 34, speed: 0.33, phase: 3.9, direction: -1, wobbleFreq: 1.5, wobbleAmp: 1.4 },

  // 17–22: AI Research District (North Sector) Data-Link & Lab Couriers
  { centerX: 0,  centerZ: -38, radiusX: 14, radiusZ: 14, baseY: 14, speed: 0.35, phase: 0.6, direction:  1, wobbleFreq: 1.6, wobbleAmp: 1.1 },
  { centerX: 0,  centerZ: -38, radiusX: 20, radiusZ: 16, baseY: 19, speed: 0.28, phase: 2.1, direction: -1, wobbleFreq: 1.4, wobbleAmp: 1.3 },
  { centerX: 0,  centerZ: -38, radiusX: 11, radiusZ: 17, baseY: 23, speed: 0.38, phase: 3.7, direction:  1, wobbleFreq: 1.5, wobbleAmp: 1.2 },
  { centerX: 0,  centerZ: -20, radiusX: 16, radiusZ: 24, baseY: 20, speed: 0.26, phase: 4.9, direction: -1, wobbleFreq: 1.3, wobbleAmp: 1.4 },
  { centerX: -8, centerZ: -28, radiusX: 18, radiusZ: 20, baseY: 17, speed: 0.30, phase: 1.5, direction:  1, wobbleFreq: 1.4, wobbleAmp: 1.2 },
  { centerX: 8,  centerZ: -28, radiusX: 18, radiusZ: 20, baseY: 22, speed: 0.29, phase: 4.2, direction: -1, wobbleFreq: 1.3, wobbleAmp: 1.3 },

  // 23–28: Clean Energy District (East Sector) Solar & Wind Inspection Drones
  { centerX: 52, centerZ: 0,   radiusX: 15, radiusZ: 18, baseY: 16, speed: 0.31, phase: 0.9, direction:  1, wobbleFreq: 1.5, wobbleAmp: 1.2 },
  { centerX: 52, centerZ: 0,   radiusX: 22, radiusZ: 16, baseY: 24, speed: 0.25, phase: 2.4, direction: -1, wobbleFreq: 1.2, wobbleAmp: 1.5 },
  { centerX: 52, centerZ: 0,   radiusX: 12, radiusZ: 14, baseY: 30, speed: 0.36, phase: 3.8, direction:  1, wobbleFreq: 1.6, wobbleAmp: 1.1 },
  { centerX: 32, centerZ: 4,   radiusX: 24, radiusZ: 18, baseY: 21, speed: 0.27, phase: 5.1, direction: -1, wobbleFreq: 1.4, wobbleAmp: 1.3 },
  { centerX: 44, centerZ: -10, radiusX: 16, radiusZ: 20, baseY: 19, speed: 0.32, phase: 1.7, direction:  1, wobbleFreq: 1.3, wobbleAmp: 1.2 },
  { centerX: 44, centerZ: 10,  radiusX: 16, radiusZ: 20, baseY: 26, speed: 0.28, phase: 4.6, direction: -1, wobbleFreq: 1.5, wobbleAmp: 1.4 },

  // 29–32: High-Altitude Skyline Air-Taxi Corridors
  { centerX: 0,  centerZ: 0,   radiusX: 46, radiusZ: 40, baseY: 38, speed: 0.19, phase: 0.3, direction:  1, wobbleFreq: 1.0, wobbleAmp: 1.8 },
  { centerX: 0,  centerZ: 0,   radiusX: 40, radiusZ: 46, baseY: 41, speed: 0.18, phase: 1.8, direction: -1, wobbleFreq: 1.1, wobbleAmp: 1.7 },
  { centerX: 0,  centerZ: 0,   radiusX: 50, radiusZ: 35, baseY: 33, speed: 0.21, phase: 3.3, direction:  1, wobbleFreq: 1.2, wobbleAmp: 1.6 },
  { centerX: 0,  centerZ: 0,   radiusX: 35, radiusZ: 50, baseY: 35, speed: 0.20, phase: 4.8, direction: -1, wobbleFreq: 1.1, wobbleAmp: 1.6 },
];

const DRONE_COUNT = FLEET_CONFIGS.length; // 32 drones

// ─── Instanced Drone Fleet (5 draw calls total for all 32 drones) ─────────────
const DroneFleet = memo(function DroneFleet({ onLeadDroneMove }) {
  const bodyMeshRef   = useRef();
  const visorMeshRef  = useRef();
  const glowMeshRef   = useRef();
  const trailMeshRef  = useRef();
  const beaconMeshRef = useRef();

  // Reusable scratch objects — zero per-frame allocations
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      nextPos: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      leadPos: new THREE.Vector3(),
      leadDir: new THREE.Vector3(),
      euler: new THREE.Euler(0, 0, 0, "XYZ"),
      quat: new THREE.Quaternion(),
      scaleOne: new THREE.Vector3(1, 1, 1),
      droneMat: new THREE.Matrix4(),
      beaconLocalMat: new THREE.Matrix4(),
      beaconWorldMat: new THREE.Matrix4(),
      beaconPos: new THREE.Vector3(0, 0.02, 0.9),
      beaconQuat: new THREE.Quaternion(),
      beaconScale: new THREE.Vector3(),
    }),
    []
  );

  useFrame(({ clock }) => {
    const bodyMesh   = bodyMeshRef.current;
    const visorMesh  = visorMeshRef.current;
    const glowMesh   = glowMeshRef.current;
    const trailMesh  = trailMeshRef.current;
    const beaconMesh = beaconMeshRef.current;
    if (!bodyMesh || !visorMesh || !glowMesh || !trailMesh || !beaconMesh) return;

    const t = clock.elapsedTime;
    const {
      pos, nextPos, dir, leadPos, leadDir,
      euler, quat, scaleOne, droneMat,
      beaconLocalMat, beaconWorldMat, beaconPos, beaconQuat, beaconScale,
    } = scratch;

    for (let i = 0; i < DRONE_COUNT; i++) {
      const cfg = FLEET_CONFIGS[i];
      const angle = (t * cfg.speed * cfg.direction + cfg.phase) % (Math.PI * 2);

      const x = cfg.centerX + Math.cos(angle) * cfg.radiusX + Math.sin(angle * 2) * 2.5;
      const z = cfg.centerZ + Math.sin(angle) * cfg.radiusZ + Math.cos(angle * 3) * 2.0;
      const y = cfg.baseY + Math.sin(t * cfg.wobbleFreq + cfg.phase) * cfg.wobbleAmp;
      pos.set(x, y, z);

      const fa = angle + 0.05 * cfg.direction;
      const nx = cfg.centerX + Math.cos(fa) * cfg.radiusX + Math.sin(fa * 2) * 2.5;
      const nz = cfg.centerZ + Math.sin(fa) * cfg.radiusZ + Math.cos(fa * 3) * 2.0;
      const ny = cfg.baseY + Math.sin((t + 0.05) * cfg.wobbleFreq + cfg.phase) * cfg.wobbleAmp;
      nextPos.set(nx, ny, nz);

      dir.subVectors(nextPos, pos).normalize();
      const heading = Math.atan2(dir.x, dir.z);
      const bankZ = -Math.sin(angle * 2) * 0.22 * cfg.direction;
      const pitchX = dir.y * 0.45;

      euler.set(pitchX, heading, bankZ);
      quat.setFromEuler(euler);
      droneMat.compose(pos, quat, scaleOne);

      bodyMesh.setMatrixAt(i, droneMat);
      visorMesh.setMatrixAt(i, droneMat);
      glowMesh.setMatrixAt(i, droneMat);
      trailMesh.setMatrixAt(i, droneMat);

      // Pulsing scanner beacon at front of drone
      const bScale = 0.85 + Math.sin(t * 7 + cfg.phase) * 0.3;
      beaconScale.setScalar(bScale);
      beaconLocalMat.compose(beaconPos, beaconQuat, beaconScale);
      beaconWorldMat.multiplyMatrices(droneMat, beaconLocalMat);
      beaconMesh.setMatrixAt(i, beaconWorldMat);

      if (cfg.isLead && onLeadDroneMove) {
        leadPos.copy(pos);
        leadDir.copy(dir);
        onLeadDroneMove(leadPos, leadDir);
      }
    }

    bodyMesh.instanceMatrix.needsUpdate   = true;
    visorMesh.instanceMatrix.needsUpdate  = true;
    glowMesh.instanceMatrix.needsUpdate   = true;
    trailMesh.instanceMatrix.needsUpdate  = true;
    beaconMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyMeshRef}   args={[DRONE_BODY_GEO,       BODY_MAT,      DRONE_COUNT]} frustumCulled={false} />
      <instancedMesh ref={visorMeshRef}  args={[VISOR_GEO,            VISOR_MAT,     DRONE_COUNT]} frustumCulled={false} />
      <instancedMesh ref={glowMeshRef}   args={[DRONE_GLOW_DISCS_GEO, RING_GLOW_MAT, DRONE_COUNT]} frustumCulled={false} />
      <instancedMesh ref={beaconMeshRef} args={[BEACON_GEO,           RING_GLOW_MAT, DRONE_COUNT]} frustumCulled={false} />
      <instancedMesh ref={trailMeshRef}  args={[TRAIL_GEO,            TRAIL_MAT,     DRONE_COUNT]} frustumCulled={false} />
    </group>
  );
});

export default DroneFleet;
