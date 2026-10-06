import { useRef, useMemo, useLayoutEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Shared geometry singletons ────────────────────────────────────────────────
const SKY_TRUNK_GEO  = new THREE.CylinderGeometry(0.1, 0.16, 1.5, 6);
const SKY_CANOPY_GEO = new THREE.DodecahedronGeometry(0.9, 0);

// Pre-defined color palette for sky canopy biodiversity
const PALETTE = [
  new THREE.Color("#16a34a"),
  new THREE.Color("#22c55e"),
  new THREE.Color("#4ade80"),
];

// ─── Shared sky-garden materials ─────────────────────────────────────────────
function useSkyGardenMaterials() {
  return useMemo(() => {
    const lushGreen = new THREE.MeshStandardMaterial({
      color: "#16a34a", roughness: 0.85, metalness: 0.04, flatShading: true,
    });
    const brightGreen = new THREE.MeshStandardMaterial({
      color: "#22c55e", roughness: 0.88, metalness: 0.02, flatShading: true,
    });
    const mossGreen = new THREE.MeshStandardMaterial({
      color: "#4ade80", roughness: 0.9, metalness: 0.0, flatShading: true,
    });
    const flowerPink = new THREE.MeshStandardMaterial({
      color: "#f9a8d4", roughness: 0.8, metalness: 0.0,
    });
    const flowerYellow = new THREE.MeshStandardMaterial({
      color: "#fde68a", roughness: 0.8, metalness: 0.0,
    });
    const whiteFacade = new THREE.MeshStandardMaterial({
      color: "#ffffff", roughness: 0.22, metalness: 0.18,
    });
    // Optimized standard materials — zero transmission render target copy passes
    const waterFall = new THREE.MeshStandardMaterial({
      color: "#7dd3fc", roughness: 0.04, metalness: 0.15,
      transparent: true, opacity: 0.76, depthWrite: false,
    });
    const waterPool = new THREE.MeshStandardMaterial({
      color: "#38bdf8", roughness: 0.04, metalness: 0.25,
      transparent: true, opacity: 0.85,
    });
    const glowBlue = new THREE.MeshStandardMaterial({
      color: "#00d2ff", emissive: "#00e5ff",
      emissiveIntensity: 2.4, toneMapped: false,
    });
    const glowGreen = new THREE.MeshStandardMaterial({
      color: "#22c55e", emissive: "#4ade80",
      emissiveIntensity: 2.0, toneMapped: false,
    });
    const skyGlass = new THREE.MeshStandardMaterial({
      color: "#cffafe", roughness: 0.05, metalness: 0.2,
      transparent: true, opacity: 0.8,
    });
    const soil = new THREE.MeshStandardMaterial({
      color: "#92400e", roughness: 0.95, metalness: 0.0,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: "#f1f5f9", roughness: 0.65, metalness: 0.1,
    });
    const trunkMat = new THREE.MeshStandardMaterial({
      color: "#78716c", roughness: 0.9, metalness: 0.0,
    });

    return {
      lushGreen, brightGreen, mossGreen, flowerPink, flowerYellow,
      whiteFacade, waterFall, waterPool, glowBlue, glowGreen,
      skyGlass, soil, stoneMat, trunkMat,
    };
  }, []);
}

// ─── Static configurations ───────────────────────────────────────────────────
const FLOATING_PARKS = [
  { pos: [24, 22, 7], radius: 8 },
  { pos: [5, 26, 34], radius: 7 },
  { pos: [-28, 20, 5], radius: 6.5 },
  { pos: [-7, 19, -26], radius: 7 },
  { pos: [42, 18, -2], radius: 6 },
];

const PARK_TREE_CONFIGS = [
  { x: -4.5, z: -3.0, h: 3.0, r: 1.8, v: 0 },
  { x:  3.5, z: -4.0, h: 3.5, r: 2.0, v: 1 },
  { x: -3.0, z:  4.5, h: 2.8, r: 1.6, v: 2 },
  { x:  4.5, z:  3.0, h: 4.0, r: 2.2, v: 3 },
  { x: -6.5, z:  0.5, h: 2.5, r: 1.4, v: 4 },
  { x:  6.0, z: -1.0, h: 3.2, r: 1.9, v: 5 },
  { x:  0.5, z:  6.5, h: 2.6, r: 1.5, v: 6 },
  { x: -1.0, z: -6.0, h: 3.8, r: 2.1, v: 7 },
  { x:  2.0, z:  2.0, h: 2.4, r: 1.3, v: 0 },
  { x: -2.5, z: -1.5, h: 3.0, r: 1.7, v: 2 },
];

const ROOFTOP_TERRACES = [
  { pos: [28, 47, -8], width: 5, depth: 5 },
  { pos: [-4, 43, 30], width: 5.5, depth: 5.5 },
  { pos: [-30, 41, -6], width: 5, depth: 5 },
  { pos: [36, 37, 10], width: 4.5, depth: 4.5 },
  { pos: [38, 51, 34], width: 5, depth: 5 },
  { pos: [-48, 45, -4], width: 4.5, depth: 4.5 },
];

const TERRACE_TREE_CONFIGS = [
  { x: -1.5, z: -1.5, h: 2.4, r: 1.2, v: 0 },
  { x:  1.5, z: -1.2, h: 2.0, r: 1.0, v: 2 },
  { x: -1.2, z:  1.5, h: 2.8, r: 1.4, v: 1 },
  { x:  1.5, z:  1.5, h: 2.2, r: 1.1, v: 3 },
  { x:  0.0, z:  0.0, h: 3.0, r: 1.6, v: 5 },
];

const HANGING_PODS = [
  { pos: [32, 14, 1],   radius: 2.4 },
  { pos: [30, 17, 5],   radius: 2.0 },
  { pos: [34, 11, -3],  radius: 2.2 },
  { pos: [8, 16, 26],   radius: 2.6 },
  { pos: [2, 19, 28],   radius: 2.0 },
  { pos: [14, 20, 30],  radius: 2.2 },
  { pos: [-35, 15, 0],  radius: 2.4 },
  { pos: [-38, 18, 4],  radius: 2.0 },
  { pos: [-32, 13, -2], radius: 2.2 },
  { pos: [-6, 14, -28], radius: 2.3 },
  { pos: [-12, 17, -26],radius: 2.0 },
  { pos: [0, 15, -30],  radius: 2.1 },
];

const POD_PLANT_CONFIGS = [
  { x: -0.8, z: -0.6, s: 1.1, v: 0 },
  { x:  0.7, z: -0.9, s: 0.9, v: 1 },
  { x: -0.3, z:  0.8, s: 1.2, v: 2 },
  { x:  0.9, z:  0.5, s: 0.8, v: 3 },
  { x:  0.0, z: -0.2, s: 1.0, v: 4 },
  { x: -1.0, z:  0.2, s: 0.7, v: 5 },
  { x:  0.4, z:  1.0, s: 0.9, v: 6 },
];

const WALKWAYS = [
  { start: [28, -8],   end: [24, 7],   elevation: 24, arcHeight: 2.0 },
  { start: [20, 22],   end: [24, 7],   elevation: 24, arcHeight: 1.8 },
  { start: [-4, 30],   end: [5, 34],   elevation: 26, arcHeight: 1.5 },
  { start: [14, 38],   end: [5, 34],   elevation: 26, arcHeight: 1.6 },
  { start: [-26, 16],  end: [-28, 5],  elevation: 20, arcHeight: 1.4 },
  { start: [-30, -6],  end: [-28, 5],  elevation: 20, arcHeight: 1.6 },
  { start: [-20, -22], end: [-7, -26], elevation: 19, arcHeight: 1.8 },
  { start: [36, 10],   end: [42, -2],  elevation: 18, arcHeight: 1.5 },
  { start: [28, -8],   end: [28, -26], elevation: 22, arcHeight: 2.2 },
];

// ─── Central Instanced Sky Trees ──────────────────────────────────────────────
// Replaces ~1,200 individual meshes with 3 unified instanced meshes
const InstancedSkyTrees = memo(function InstancedSkyTrees({ mats }) {
  const trunkRef = useRef();
  const primaryCanopyRef = useRef();
  const secondaryCanopyRef = useRef();

  const allTrees = useMemo(() => {
    const list = [];

    // 1. Floating Sky Parks (5 parks x 10 trees = 50 trees)
    FLOATING_PARKS.forEach((park) => {
      PARK_TREE_CONFIGS.forEach((t) => {
        list.push({
          x: park.pos[0] + t.x,
          y: park.pos[1] + 0.3,
          z: park.pos[2] + t.z,
          trunkH: t.h,
          canopyR: t.r,
          variant: t.v,
        });
      });
    });

    // 2. Rooftop Terraces (6 terraces x 5 trees = 30 trees)
    ROOFTOP_TERRACES.forEach((terrace) => {
      TERRACE_TREE_CONFIGS.forEach((t) => {
        list.push({
          x: terrace.pos[0] + t.x,
          y: terrace.pos[1] + 0.5,
          z: terrace.pos[2] + t.z,
          trunkH: t.h,
          canopyR: t.r,
          variant: t.v,
        });
      });
    });

    // 3. Standalone Hanging Garden Pods (12 pods x 7 plants = 84 trees)
    HANGING_PODS.forEach((pod) => {
      POD_PLANT_CONFIGS.forEach((p) => {
        list.push({
          x: pod.pos[0] + p.x * (pod.radius * 0.65),
          y: pod.pos[1] + 0.68,
          z: pod.pos[2] + p.z * (pod.radius * 0.65),
          trunkH: 1.4 * p.s,
          canopyR: 0.7 * p.s,
          variant: p.v,
        });
      });
    });

    // 4. Walkway Hanging Pods
    WALKWAYS.forEach((w) => {
      const p1 = new THREE.Vector3(w.start[0], w.elevation, w.start[1]);
      const p2 = new THREE.Vector3(w.end[0], w.elevation, w.end[1]);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const length = p1.distanceTo(p2);
      const rotY = Math.atan2(p2.x - p1.x, p2.z - p1.z);
      const cableCount = Math.max(3, Math.floor(length / 3));
      const podCount = Math.max(1, Math.floor(cableCount / 2));

      for (let i = 0; i < podCount; i++) {
        const t = (i + 1) / (podCount + 1);
        const zRel = (t - 0.5) * length;
        const localPos = new THREE.Vector3(0, -3.2, zRel).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        const podPos = new THREE.Vector3().addVectors(mid, localPos);

        POD_PLANT_CONFIGS.forEach((p) => {
          list.push({
            x: podPos.x + p.x * 0.7,
            y: podPos.y + 0.68,
            z: podPos.z + p.z * 0.7,
            trunkH: 1.2 * p.s,
            canopyR: 0.6 * p.s,
            variant: p.v,
          });
        });
      }
    });

    return list;
  }, []);

  useLayoutEffect(() => {
    if (!trunkRef.current || !primaryCanopyRef.current || !secondaryCanopyRef.current) return;

    const dummy = new THREE.Object3D();

    allTrees.forEach((t, i) => {
      // 1. Trunk
      dummy.position.set(t.x, t.y + t.trunkH / 2, t.z);
      dummy.rotation.set(0, (i * 0.7) % Math.PI, 0);
      dummy.scale.set(1.4, t.trunkH / 1.5, 1.4);
      dummy.updateMatrix();
      trunkRef.current.setMatrixAt(i, dummy.matrix);

      // 2. Primary Canopy
      const col = PALETTE[t.variant % 3];
      dummy.position.set(t.x, t.y + t.trunkH + t.canopyR * 0.65, t.z);
      dummy.scale.setScalar(t.canopyR / 0.9);
      dummy.updateMatrix();
      primaryCanopyRef.current.setMatrixAt(i, dummy.matrix);
      primaryCanopyRef.current.setColorAt(i, col);

      // 3. Secondary Canopy
      dummy.position.set(t.x + 0.35, t.y + t.trunkH + t.canopyR * 0.9, t.z + 0.25);
      dummy.scale.setScalar((t.canopyR * 0.65) / 0.9);
      dummy.updateMatrix();
      secondaryCanopyRef.current.setMatrixAt(i, dummy.matrix);
      secondaryCanopyRef.current.setColorAt(i, col);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;

    primaryCanopyRef.current.instanceMatrix.needsUpdate = true;
    if (primaryCanopyRef.current.instanceColor) primaryCanopyRef.current.instanceColor.needsUpdate = true;

    secondaryCanopyRef.current.instanceMatrix.needsUpdate = true;
    if (secondaryCanopyRef.current.instanceColor) secondaryCanopyRef.current.instanceColor.needsUpdate = true;
  }, [allTrees]);

  const count = allTrees.length;

  return (
    <group>
      {/* Unified Instanced Trunks */}
      <instancedMesh ref={trunkRef} args={[SKY_TRUNK_GEO, mats.trunkMat, count]} />

      {/* Unified Primary Canopies */}
      <instancedMesh ref={primaryCanopyRef} args={[SKY_CANOPY_GEO, null, count]}>
        <meshStandardMaterial roughness={0.85} metalness={0.03} flatShading />
      </instancedMesh>

      {/* Unified Secondary Canopies */}
      <instancedMesh ref={secondaryCanopyRef} args={[SKY_CANOPY_GEO, null, count]}>
        <meshStandardMaterial roughness={0.88} metalness={0.03} flatShading />
      </instancedMesh>
    </group>
  );
});

// ─── Hanging Garden Pod Basket ───────────────────────────────────────────────
const HangingGardenPod = memo(function HangingGardenPod({ position, radius = 2.8, mats }) {
  return (
    <group position={position}>
      {/* Suspension cables */}
      {[-1.2, 0, 1.2].map((xOff, i) => (
        <mesh key={i} position={[xOff, 3.5, 0]} material={mats.whiteFacade}>
          <cylinderGeometry args={[0.03, 0.03, 7, 4]} />
        </mesh>
      ))}

      {/* Basket group */}
      <group>
        {/* Woven planter basket */}
        <mesh position={[0, 0, 0]} material={mats.whiteFacade}>
          <cylinderGeometry args={[radius, radius * 0.85, 1.0, 16]} />
        </mesh>
        {/* Soil bed */}
        <mesh position={[0, 0.55, 0]} material={mats.soil}>
          <cylinderGeometry args={[radius - 0.15, radius - 0.15, 0.2, 16]} />
        </mesh>
        {/* Blue accent ring */}
        <mesh position={[0, 0.52, 0]} material={mats.glowBlue}>
          <torusGeometry args={[radius - 0.1, 0.04, 6, 24]} />
        </mesh>
        {/* Hanging ivy curtain */}
        <mesh position={[0, -0.3, 0]} material={mats.mossGreen}>
          <cylinderGeometry args={[radius - 0.1, radius + 0.4, 1.8, 16, 1, true]} />
        </mesh>
      </group>
    </group>
  );
});

// ─── Suspended Walkway ─────────────────────────────────────────────────────────
const SuspendedWalkway = memo(function SuspendedWalkway({ start, end, elevation, arcHeight = 1.5, mats }) {
  const { midPos, length, rotY } = useMemo(() => {
    const p1 = new THREE.Vector3(start[0], elevation, start[1]);
    const p2 = new THREE.Vector3(end[0], elevation, end[1]);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const len = p1.distanceTo(p2);
    const rot = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    return { midPos: mid, length: len, rotY: rot };
  }, [start, end, elevation]);

  const cableCount = Math.max(3, Math.floor(length / 3));
  const podCount = Math.max(1, Math.floor(cableCount / 2));

  return (
    <group position={[midPos.x, elevation, midPos.z]} rotation={[0, rotY, 0]}>
      {/* Glass floor deck */}
      <mesh position={[0, 0, 0]} material={mats.skyGlass}>
        <boxGeometry args={[2.4, 0.18, length]} />
      </mesh>
      {/* White structural edge beams */}
      {[-1.2, 1.2].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0, 0]} material={mats.whiteFacade}>
          <boxGeometry args={[0.22, 0.32, length]} />
        </mesh>
      ))}
      {/* Living green railing strips */}
      {[-1.05, 1.05].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.35, 0]} material={mats.lushGreen}>
          <boxGeometry args={[0.22, 0.38, length * 0.92]} />
        </mesh>
      ))}
      {/* Blue underglow strip */}
      <mesh position={[0, -0.12, 0]} material={mats.glowBlue}>
        <boxGeometry args={[2.4, 0.05, length]} />
      </mesh>
      {/* Suspension cables at intervals */}
      {Array.from({ length: cableCount }).map((_, i) => {
        const t = (i + 0.5) / cableCount;
        const zPos = (t - 0.5) * length;
        const catenary = 0.5 + Math.sin(t * Math.PI) * arcHeight;
        return (
          <group key={i}>
            <mesh position={[-1.2, catenary, zPos]} material={mats.whiteFacade}>
              <cylinderGeometry args={[0.025, 0.025, catenary * 2 + 0.3, 4]} />
            </mesh>
            <mesh position={[1.2, catenary, zPos]} material={mats.whiteFacade}>
              <cylinderGeometry args={[0.025, 0.025, catenary * 2 + 0.3, 4]} />
            </mesh>
          </group>
        );
      })}
      {/* Small hanging garden baskets along the walkway */}
      {Array.from({ length: podCount }).map((_, i) => {
        const t = (i + 1) / (podCount + 1);
        const zPos = (t - 0.5) * length;
        return (
          <HangingGardenPod
            key={i}
            position={[0, -3.2, zPos]}
            radius={1.1}
            mats={mats}
          />
        );
      })}
    </group>
  );
});

// ─── Floating Sky Park ─────────────────────────────────────────────────────────
const FloatingSkyPark = memo(function FloatingSkyPark({ position, radius = 9, mats }) {
  const fountainRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (fountainRef.current) {
      fountainRef.current.scale.y = 0.8 + Math.sin(t * 1.6) * 0.25;
      fountainRef.current.position.y = 1.2 + Math.sin(t * 1.6) * 0.1;
    }
  });

  const pathPoints = useMemo(() => [
    [-5, 0], [-2.5, 2.5], [0, 3.5], [2.5, 2.0],
    [4.5, 0], [3.0, -3.0], [0, -4.5], [-3.5, -2.5],
  ], []);

  return (
    <group position={position}>
      {/* Park platform base */}
      <mesh position={[0, -0.4, 0]} material={mats.whiteFacade}>
        <cylinderGeometry args={[radius, radius * 1.05, 0.8, 24]} />
      </mesh>
      {/* Soil layer */}
      <mesh position={[0, 0.06, 0]} material={mats.soil}>
        <cylinderGeometry args={[radius - 0.2, radius - 0.2, 0.2, 24]} />
      </mesh>
      {/* Grass surface */}
      <mesh position={[0, 0.18, 0]} material={mats.lushGreen}>
        <cylinderGeometry args={[radius - 0.3, radius - 0.2, 0.15, 24]} />
      </mesh>
      {/* Blue LED rim on underside */}
      <mesh position={[0, -0.82, 0]} material={mats.glowBlue}>
        <torusGeometry args={[radius * 0.92, 0.08, 6, 32]} />
      </mesh>
      {/* Green accent rim on top edge */}
      <mesh position={[0, 0.28, 0]} material={mats.glowGreen}>
        <torusGeometry args={[radius - 0.22, 0.05, 6, 32]} />
      </mesh>

      {/* Winding stone path */}
      {pathPoints.map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.28, pz]} material={mats.stoneMat}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 6]} />
        </mesh>
      ))}

      {/* Central fountain */}
      <mesh position={[0, 0.28, 0]} material={mats.stoneMat}>
        <cylinderGeometry args={[1.4, 1.6, 0.3, 14]} />
      </mesh>
      <mesh position={[0, 0.48, 0]} material={mats.waterPool}>
        <cylinderGeometry args={[1.25, 1.25, 0.12, 14]} />
      </mesh>
      {/* Fountain jet */}
      <mesh ref={fountainRef} position={[0, 1.2, 0]} material={mats.waterFall}>
        <cylinderGeometry args={[0.08, 0.18, 1.8, 8]} />
      </mesh>

      {/* Flower beds around fountain */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.5, 0.3, Math.sin(a) * 2.5]}
            material={i % 2 === 0 ? mats.flowerPink : mats.flowerYellow}>
            <sphereGeometry args={[0.28, 6, 6]} />
          </mesh>
        );
      })}

      {/* Pergola structure on one edge */}
      <group position={[0, 0, radius - 2.5]}>
        {[-3, 3].map((xOff, i) => (
          <mesh key={i} position={[xOff, 1.8, 0]} material={mats.whiteFacade}>
            <cylinderGeometry args={[0.18, 0.22, 3.6, 6]} />
          </mesh>
        ))}
        <mesh position={[0, 3.7, 0]} material={mats.whiteFacade}>
          <boxGeometry args={[7, 0.18, 1.4]} />
        </mesh>
        <mesh position={[0, 3.85, 0]} material={mats.lushGreen}>
          <boxGeometry args={[6.6, 0.22, 1.2]} />
        </mesh>
        <mesh position={[0, 3.96, 0]} material={mats.glowGreen}>
          <boxGeometry args={[6.8, 0.05, 1.3]} />
        </mesh>
      </group>
    </group>
  );
});

// ─── Animated Waterfall ────────────────────────────────────────────────────────
const Waterfall = memo(function Waterfall({ position, height = 18, width = 2.2, rotation = 0, mats }) {
  const fallRef = useRef();
  const poolRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (fallRef.current) {
      fallRef.current.position.y = -height / 2 + ((t * 1.8) % 1.0) * 0.2;
    }
    if (poolRef.current) {
      poolRef.current.scale.x = 1 + Math.sin(t * 0.7) * 0.04;
      poolRef.current.scale.z = 1 + Math.cos(t * 0.6) * 0.04;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Channel walls */}
      {[-width / 2 - 0.18, width / 2 + 0.18].map((xOff, i) => (
        <mesh key={i} position={[xOff, -height / 2, 0]} material={mats.stoneMat}>
          <boxGeometry args={[0.36, height, 0.55]} />
        </mesh>
      ))}
      {/* Top lip */}
      <mesh position={[0, 0.3, 0]} material={mats.stoneMat}>
        <boxGeometry args={[width + 0.75, 0.45, 0.55]} />
      </mesh>
      {/* Moss on walls */}
      <mesh position={[0, -height / 2, 0.3]} material={mats.mossGreen}>
        <boxGeometry args={[width + 0.2, height * 0.8, 0.12]} />
      </mesh>

      {/* Main water sheet */}
      <mesh ref={fallRef} position={[0, -height / 2, 0]} material={mats.waterFall}>
        <boxGeometry args={[width, height, 0.18]} />
      </mesh>

      {/* Blue glow at the crest */}
      <mesh position={[0, 0.05, 0.1]} material={mats.glowBlue}>
        <boxGeometry args={[width + 0.1, 0.07, 0.1]} />
      </mesh>

      {/* Collecting pool at base */}
      <mesh ref={poolRef} position={[0, -height + 0.14, 0]} material={mats.waterPool}>
        <cylinderGeometry args={[width * 1.0, width * 1.1, 0.28, 16]} />
      </mesh>
      {/* Pool rim */}
      <mesh position={[0, -height + 0.05, 0]} material={mats.stoneMat}>
        <torusGeometry args={[width * 1.05, 0.2, 6, 20]} />
      </mesh>
    </group>
  );
});

// ─── Rooftop Terrace Garden ────────────────────────────────────────────────────
const RooftopTerrace = memo(function RooftopTerrace({ position, width = 5, depth = 5, mats }) {
  return (
    <group position={position}>
      {/* Terrace slab */}
      <mesh position={[0, 0.15, 0]} material={mats.stoneMat}>
        <boxGeometry args={[width, 0.3, depth]} />
      </mesh>
      {/* Soil bed */}
      <mesh position={[0, 0.35, 0]} material={mats.soil}>
        <boxGeometry args={[width - 0.3, 0.15, depth - 0.3]} />
      </mesh>
      {/* Green surface */}
      <mesh position={[0, 0.46, 0]} material={mats.lushGreen}>
        <boxGeometry args={[width - 0.35, 0.12, depth - 0.35]} />
      </mesh>
      {/* Low railing */}
      {[
        [0, 0, -depth / 2], [0, 0, depth / 2],
        [-width / 2, 0, 0], [width / 2, 0, 0],
      ].map(([rx, _ry, rz], i) => (
        <mesh key={i} position={[rx, 0.85, rz]} material={mats.whiteFacade}>
          <boxGeometry args={[
            i < 2 ? width : 0.12,
            0.55,
            i < 2 ? 0.12 : depth,
          ]} />
        </mesh>
      ))}
      {/* Accent glow on railing top */}
      <mesh position={[0, 1.15, 0]} material={mats.glowGreen}>
        <boxGeometry args={[width + 0.06, 0.05, depth + 0.06]} />
      </mesh>
    </group>
  );
});

// ─── Master Sky Gardens Component ─────────────────────────────────────────────
function SkyGardens() {
  const mats = useSkyGardenMaterials();

  return (
    <group>
      {/* ── All ~350 Sky Trees rendered in 3 instanced draw calls ── */}
      <InstancedSkyTrees mats={mats} />

      {/* ── 5 Floating Sky Parks ── */}
      {FLOATING_PARKS.map((park, i) => (
        <FloatingSkyPark key={i} position={park.pos} radius={park.radius} mats={mats} />
      ))}

      {/* ── 9 Suspended Walkways with Hanging Baskets ── */}
      {WALKWAYS.map((w, i) => (
        <SuspendedWalkway
          key={i}
          start={w.start}
          end={w.end}
          elevation={w.elevation}
          arcHeight={w.arcHeight}
          mats={mats}
        />
      ))}

      {/* ── 12 Standalone Hanging Garden Pods ── */}
      {HANGING_PODS.map((pod, i) => (
        <HangingGardenPod key={i} position={pod.pos} radius={pod.radius} mats={mats} />
      ))}

      {/* ── 5 Cascading Waterfalls ── */}
      <Waterfall position={[26, 20, 0]}   height={16} width={2.0} rotation={0.3}  mats={mats} />
      <Waterfall position={[-3, 26, 29]}  height={14} width={2.4} rotation={1.6}  mats={mats} />
      <Waterfall position={[-29, 22, 0]}  height={18} width={2.2} rotation={-0.1} mats={mats} />
      <Waterfall position={[28, 18, -24]} height={15} width={2.0} rotation={0.9}  mats={mats} />
      <Waterfall position={[47, 14, -10]} height={12} width={1.8} rotation={0.5}  mats={mats} />

      {/* ── 6 Rooftop Terrace Gardens ── */}
      {ROOFTOP_TERRACES.map((terrace, i) => (
        <RooftopTerrace
          key={i}
          position={terrace.pos}
          width={terrace.width}
          depth={terrace.depth}
          mats={mats}
        />
      ))}
    </group>
  );
}

export default memo(SkyGardens);
