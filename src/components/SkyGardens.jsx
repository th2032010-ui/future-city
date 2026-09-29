import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Shared geometry singletons ────────────────────────────────────────────────
const SKY_TRUNK_GEO  = new THREE.CylinderGeometry(0.1, 0.16, 1.5, 5);
const SKY_CANOPY_GEO = new THREE.DodecahedronGeometry(0.9, 0);

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
    const waterFall = new THREE.MeshPhysicalMaterial({
      color: "#7dd3fc", roughness: 0.02, metalness: 0.0,
      transmission: 0.78, transparent: true, opacity: 0.72,
      clearcoat: 1.0, depthWrite: false,
    });
    const waterPool = new THREE.MeshPhysicalMaterial({
      color: "#38bdf8", roughness: 0.02, metalness: 0.05,
      transmission: 0.65, transparent: true, opacity: 0.82,
      clearcoat: 1.0,
    });
    const glowBlue = new THREE.MeshStandardMaterial({
      color: "#00d2ff", emissive: "#00e5ff",
      emissiveIntensity: 2.4, toneMapped: false,
    });
    const glowGreen = new THREE.MeshStandardMaterial({
      color: "#22c55e", emissive: "#4ade80",
      emissiveIntensity: 2.0, toneMapped: false,
    });
    const skyGlass = new THREE.MeshPhysicalMaterial({
      color: "#cffafe", roughness: 0.04, metalness: 0.1,
      transmission: 0.74, transparent: true, opacity: 0.82,
      clearcoat: 1.0,
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

// ─── Sky Tree (tall canopy tree growing at altitude) ──────────────────────────
const FLOWER_GEO = new THREE.SphereGeometry(0.35, 6, 6);

const SkyTree = memo(function SkyTree({ position, trunkH = 3.5, canopyR = 2.2, variant = 0, mats }) {
  const mat = variant % 3 === 0 ? mats.lushGreen
    : variant % 3 === 1 ? mats.brightGreen
    : mats.mossGreen;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh
        position={[0, trunkH / 2, 0]}
        scale={[1.5, trunkH / 1.5, 1.5]}
        geometry={SKY_TRUNK_GEO}
        material={mats.trunkMat}
      />
      {/* Main canopy blob */}
      <mesh
        position={[0, trunkH + canopyR * 0.65, 0]}
        scale={canopyR / 0.9}
        geometry={SKY_CANOPY_GEO}
        material={mat}
      />
      {/* Secondary canopy layer */}
      <mesh
        position={[0.4, trunkH + canopyR * 0.9, 0.3]}
        scale={(canopyR * 0.65) / 0.9}
        geometry={SKY_CANOPY_GEO}
        material={mat}
      />
      {/* Accent flower blossom */}
      {variant % 5 === 0 && (
        <mesh
          position={[0.6, trunkH + canopyR * 0.5, 0.5]}
          geometry={FLOWER_GEO}
          material={variant % 2 === 0 ? mats.flowerPink : mats.flowerYellow}
        />
      )}
    </group>
  );
});


// ─── Hanging Garden Pod ────────────────────────────────────────────────────────
// A round planter basket suspended by cables from above
function HangingGardenPod({ position, radius = 2.8, mats }) {
  const swayRef = useRef();
  const phase = useMemo(() => position[0] * 0.3 + position[2] * 0.2, [position]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (swayRef.current) {
      swayRef.current.rotation.z = Math.sin(t * 0.4 + phase) * 0.04;
      swayRef.current.rotation.x = Math.cos(t * 0.3 + phase) * 0.03;
    }
  });

  // Pre-seeded plant positions for this pod
  const plants = useMemo(() => [
    { x: -0.8, z: -0.6, s: 1.1, v: 0 },
    { x:  0.7, z: -0.9, s: 0.9, v: 1 },
    { x: -0.3, z:  0.8, s: 1.2, v: 2 },
    { x:  0.9, z:  0.5, s: 0.8, v: 3 },
    { x:  0.0, z: -0.2, s: 1.0, v: 4 },
    { x: -1.0, z:  0.2, s: 0.7, v: 5 },
    { x:  0.4, z:  1.0, s: 0.9, v: 6 },
  ], []);

  return (
    <group position={position}>
      {/* Suspension cables */}
      {[-1.2, 0, 1.2].map((xOff, i) => (
        <mesh key={i} position={[xOff, 3.5, 0]} material={mats.whiteFacade}>
          <cylinderGeometry args={[0.03, 0.03, 7, 4]} />
        </mesh>
      ))}

      {/* Swaying basket group */}
      <group ref={swayRef}>
        {/* Woven planter basket */}
        <mesh position={[0, 0, 0]} material={mats.whiteFacade}>
          <cylinderGeometry args={[radius, radius * 0.85, 1.0, 20]} />
        </mesh>
        {/* Soil bed */}
        <mesh position={[0, 0.55, 0]} material={mats.soil}>
          <cylinderGeometry args={[radius - 0.15, radius - 0.15, 0.2, 20]} />
        </mesh>
        {/* Blue accent ring */}
        <mesh position={[0, 0.52, 0]} material={mats.glowBlue}>
          <torusGeometry args={[radius - 0.1, 0.04, 8, 32]} />
        </mesh>
        {/* Hanging ivy curtain */}
        <mesh position={[0, -0.3, 0]} material={mats.mossGreen}>
          <cylinderGeometry args={[radius - 0.1, radius + 0.4, 1.8, 20, 1, true]} />
        </mesh>

        {/* Sky trees in the basket */}
        {plants.map((p, i) => (
          <SkyTree
            key={i}
            position={[p.x * (radius * 0.65), 0.68, p.z * (radius * 0.65)]}
            trunkH={1.4 * p.s}
            canopyR={0.7 * p.s}
            variant={p.v}
            mats={mats}
          />
        ))}
      </group>
    </group>
  );
}

// ─── Suspended Walkway ─────────────────────────────────────────────────────────
// Glass-floored walkway with cable suspension and living railings
function SuspendedWalkway({ start, end, elevation, arcHeight = 1.5, mats }) {
  const { midPos, length, rotY } = useMemo(() => {
    const p1 = new THREE.Vector3(start[0], elevation, start[1]);
    const p2 = new THREE.Vector3(end[0], elevation, end[1]);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const length = p1.distanceTo(p2);
    const rotY = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    return { midPos: mid, length, rotY };
  }, [start, end, elevation]);

  const cableCount = Math.max(3, Math.floor(length / 3));

  return (
    <group position={[midPos.x, elevation, midPos.z]} rotation={[0, rotY, 0]}>
      {/* Glass floor deck */}
      <mesh position={[0, 0, 0]} material={mats.skyGlass} castShadow receiveShadow>
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
            {/* Left cable */}
            <mesh position={[-1.2, catenary, zPos]} material={mats.whiteFacade}>
              <cylinderGeometry args={[0.025, 0.025, catenary * 2 + 0.3, 4]} />
            </mesh>
            {/* Right cable */}
            <mesh position={[1.2, catenary, zPos]} material={mats.whiteFacade}>
              <cylinderGeometry args={[0.025, 0.025, catenary * 2 + 0.3, 4]} />
            </mesh>
          </group>
        );
      })}
      {/* Small hanging garden baskets along the walkway */}
      {Array.from({ length: Math.max(1, Math.floor(cableCount / 2)) }).map((_, i) => {
        const t = (i + 1) / (Math.floor(cableCount / 2) + 1);
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
}

// ─── Floating Sky Park ─────────────────────────────────────────────────────────
// A large green platform island floating at rooftop level
function FloatingSkyPark({ position, radius = 9, mats }) {
  const fountainRef = useRef();
  const glowRingRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (fountainRef.current) {
      fountainRef.current.scale.y = 0.8 + Math.sin(t * 1.6) * 0.25;
      fountainRef.current.position.y = 1.2 + Math.sin(t * 1.6) * 0.1;
    }
    if (glowRingRef.current) {
      glowRingRef.current.material.emissiveIntensity = 1.6 + Math.sin(t * 0.9) * 0.5;
    }
  });

  // Pre-seeded tree positions on the park
  const parkTrees = useMemo(() => [
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
  ], []);

  // Winding path points
  const pathPoints = useMemo(() => [
    [-5, 0], [-2.5, 2.5], [0, 3.5], [2.5, 2.0],
    [4.5, 0], [3.0, -3.0], [0, -4.5], [-3.5, -2.5],
  ], []);

  return (
    <group position={position}>
      {/* Park platform base */}
      <mesh position={[0, -0.4, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.05, 0.8, 32]} />
      </mesh>
      {/* Soil layer */}
      <mesh position={[0, 0.06, 0]} material={mats.soil}>
        <cylinderGeometry args={[radius - 0.2, radius - 0.2, 0.2, 32]} />
      </mesh>
      {/* Grass surface */}
      <mesh position={[0, 0.18, 0]} material={mats.lushGreen} receiveShadow>
        <cylinderGeometry args={[radius - 0.3, radius - 0.2, 0.15, 32]} />
      </mesh>
      {/* Blue LED rim on underside */}
      <mesh ref={glowRingRef} position={[0, -0.82, 0]} material={mats.glowBlue}>
        <torusGeometry args={[radius * 0.92, 0.08, 8, 48]} />
      </mesh>
      {/* Green accent rim on top edge */}
      <mesh position={[0, 0.28, 0]} material={mats.glowGreen}>
        <torusGeometry args={[radius - 0.22, 0.05, 8, 48]} />
      </mesh>

      {/* Winding stone path */}
      {pathPoints.map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.28, pz]} material={mats.stoneMat}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 8]} />
        </mesh>
      ))}

      {/* Sky trees */}
      {parkTrees.map((t, i) => (
        <SkyTree
          key={i}
          position={[t.x, 0.3, t.z]}
          trunkH={t.h}
          canopyR={t.r}
          variant={t.v}
          mats={mats}
        />
      ))}

      {/* Central fountain */}
      <mesh position={[0, 0.28, 0]} material={mats.stoneMat}>
        <cylinderGeometry args={[1.4, 1.6, 0.3, 16]} />
      </mesh>
      <mesh position={[0, 0.48, 0]} material={mats.waterPool}>
        <cylinderGeometry args={[1.25, 1.25, 0.12, 16]} />
      </mesh>
      {/* Fountain jet */}
      <mesh ref={fountainRef} position={[0, 1.2, 0]} material={mats.waterFall}>
        <cylinderGeometry args={[0.08, 0.18, 1.8, 10]} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#38bdf8" intensity={2.0} distance={10} decay={2} />

      {/* Flower beds around fountain */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.5, 0.3, Math.sin(a) * 2.5]}
            material={i % 2 === 0 ? mats.flowerPink : mats.flowerYellow}>
            <sphereGeometry args={[0.28, 8, 8]} />
          </mesh>
        );
      })}

      {/* Pergola structure on one edge */}
      <group position={[0, 0, radius - 2.5]}>
        {[-3, 3].map((xOff, i) => (
          <mesh key={i} position={[xOff, 1.8, 0]} material={mats.whiteFacade}>
            <cylinderGeometry args={[0.18, 0.22, 3.6, 8]} />
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
}

// ─── Animated Waterfall ────────────────────────────────────────────────────────
// A vertical cascade of water sheets flowing down between two altitude levels
function Waterfall({ position, height = 18, width = 2.2, rotation = 0, mats }) {
  const fallRef = useRef();
  const mistRef = useRef();
  const poolRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Scroll the waterfall texture via UV offset simulation (position flicker)
    if (fallRef.current) {
      fallRef.current.position.y = -height / 2 + ((t * 1.8) % 1.0) * 0.2;
      fallRef.current.material.opacity = 0.58 + Math.sin(t * 2.2) * 0.12;
    }
    // Mist at the base
    if (mistRef.current) {
      mistRef.current.scale.x = 1 + Math.sin(t * 1.1) * 0.08;
      mistRef.current.scale.z = 1 + Math.cos(t * 0.9) * 0.08;
      mistRef.current.material.opacity = 0.25 + Math.sin(t * 1.4) * 0.12;
    }
    // Pool ripple
    if (poolRef.current) {
      poolRef.current.scale.x = 1 + Math.sin(t * 0.7) * 0.04;
      poolRef.current.scale.z = 1 + Math.cos(t * 0.6) * 0.04;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left & right stone channel walls */}
      {[-width / 2 - 0.18, width / 2 + 0.18].map((xOff, i) => (
        <mesh key={i} position={[xOff, -height / 2, 0]} material={mats.stoneMat}>
          <boxGeometry args={[0.36, height, 0.55]} />
        </mesh>
      ))}
      {/* Top lip / weir */}
      <mesh position={[0, 0.3, 0]} material={mats.stoneMat}>
        <boxGeometry args={[width + 0.75, 0.45, 0.55]} />
      </mesh>
      {/* Moss on walls */}
      <mesh position={[0, -height / 2, 0.3]} material={mats.mossGreen}>
        <boxGeometry args={[width + 0.2, height * 0.8, 0.12]} />
      </mesh>

      {/* Main water sheet cascade */}
      <mesh ref={fallRef} position={[0, -height / 2, 0]} material={mats.waterFall}>
        <boxGeometry args={[width, height, 0.18]} />
      </mesh>

      {/* Secondary thinner sheet with slight offset */}
      <mesh position={[0, -height / 2, 0.1]} material={mats.waterFall}>
        <boxGeometry args={[width * 0.7, height * 0.85, 0.09]} />
      </mesh>

      {/* Blue glow at the crest */}
      <mesh position={[0, 0.05, 0.1]} material={mats.glowBlue}>
        <boxGeometry args={[width + 0.1, 0.07, 0.1]} />
      </mesh>

      {/* Mist cloud at base */}
      <mesh ref={mistRef} position={[0, -height + 1.2, 0.4]} material={
        new THREE.MeshBasicMaterial({
          color: "#e0f7ff", transparent: true, opacity: 0.3,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      }>
        <sphereGeometry args={[width * 0.85, 12, 8]} />
      </mesh>

      {/* Collecting pool at base */}
      <mesh ref={poolRef} position={[0, -height + 0.14, 0]} material={mats.waterPool}>
        <cylinderGeometry args={[width * 1.0, width * 1.1, 0.28, 20]} />
      </mesh>
      {/* Pool rim */}
      <mesh position={[0, -height + 0.05, 0]} material={mats.stoneMat}>
        <torusGeometry args={[width * 1.05, 0.2, 8, 24]} />
      </mesh>
      {/* Pool glow */}
      <pointLight
        position={[0, -height + 0.8, 0]}
        color="#38bdf8" intensity={2.5} distance={8} decay={2}
      />
    </group>
  );
}

// ─── Rooftop Terrace Garden ────────────────────────────────────────────────────
// A smaller garden terrace planted directly on a skyscraper roof
function RooftopTerrace({ position, width = 5, depth = 5, mats }) {
  const terraceItems = useMemo(() => [
    { x: -1.5, z: -1.5, h: 2.4, r: 1.2, v: 0 },
    { x:  1.5, z: -1.2, h: 2.0, r: 1.0, v: 2 },
    { x: -1.2, z:  1.5, h: 2.8, r: 1.4, v: 1 },
    { x:  1.5, z:  1.5, h: 2.2, r: 1.1, v: 3 },
    { x:  0.0, z:  0.0, h: 3.0, r: 1.6, v: 5 },
  ], []);

  return (
    <group position={position}>
      {/* Terrace slab */}
      <mesh position={[0, 0.15, 0]} material={mats.stoneMat} castShadow receiveShadow>
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
      {/* Trees */}
      {terraceItems.map((t, i) => (
        <SkyTree
          key={i}
          position={[t.x, 0.5, t.z]}
          trunkH={t.h}
          canopyR={t.r}
          variant={t.v}
          mats={mats}
        />
      ))}
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
}

// ─── Master Sky Gardens ────────────────────────────────────────────────────────
export default function SkyGardens() {
  const mats = useSkyGardenMaterials();

  return (
    <group>
      {/* ══════════════════════════════════════════════════
          FLOATING SKY PARKS — hovering between towers
         ══════════════════════════════════════════════════ */}

      {/* Park 1 – Between Sail Spire [28,-8] & BioHelix [20,22] */}
      <FloatingSkyPark position={[24, 22, 7]} radius={8} mats={mats} />

      {/* Park 2 – Between Torus Void [-4,30] & BioHelix [14,38] */}
      <FloatingSkyPark position={[5, 26, 34]} radius={7} mats={mats} />

      {/* Park 3 – Between Petal Bloom [-26,16] & Vortex [-30,-6] */}
      <FloatingSkyPark position={[-28, 20, 5]} radius={6.5} mats={mats} />

      {/* Park 4 – Between Teardrop [-20,-22] & Triad [6,-28] */}
      <FloatingSkyPark position={[-7, 19, -26]} radius={7} mats={mats} />

      {/* Park 5 – Between BioWave [36,10] & Outer Vortex [48,-12] */}
      <FloatingSkyPark position={[42, 18, -2]} radius={6} mats={mats} />

      {/* ══════════════════════════════════════════════════
          SUSPENDED WALKWAYS — glass bridges with hanging gardens
         ══════════════════════════════════════════════════ */}

      {/* Walkway 1: Sail Spire → Park 1 */}
      <SuspendedWalkway
        start={[28, -8]} end={[24, 7]}
        elevation={24} arcHeight={2.0} mats={mats}
      />
      {/* Walkway 2: BioHelix NE → Park 1 */}
      <SuspendedWalkway
        start={[20, 22]} end={[24, 7]}
        elevation={24} arcHeight={1.8} mats={mats}
      />
      {/* Walkway 3: Torus Void → Park 2 */}
      <SuspendedWalkway
        start={[-4, 30]} end={[5, 34]}
        elevation={26} arcHeight={1.5} mats={mats}
      />
      {/* Walkway 4: BioHelix NE → Park 2 */}
      <SuspendedWalkway
        start={[14, 38]} end={[5, 34]}
        elevation={26} arcHeight={1.6} mats={mats}
      />
      {/* Walkway 5: Petal Bloom → Park 3 */}
      <SuspendedWalkway
        start={[-26, 16]} end={[-28, 5]}
        elevation={20} arcHeight={1.4} mats={mats}
      />
      {/* Walkway 6: Vortex → Park 3 */}
      <SuspendedWalkway
        start={[-30, -6]} end={[-28, 5]}
        elevation={20} arcHeight={1.6} mats={mats}
      />
      {/* Walkway 7: Teardrop SW → Park 4 */}
      <SuspendedWalkway
        start={[-20, -22]} end={[-7, -26]}
        elevation={19} arcHeight={1.8} mats={mats}
      />
      {/* Walkway 8: BioWave → Park 5 */}
      <SuspendedWalkway
        start={[36, 10]} end={[42, -2]}
        elevation={18} arcHeight={1.5} mats={mats}
      />
      {/* Walkway 9: Cross-city link – Sail Spire East → Crescent [28,-26] */}
      <SuspendedWalkway
        start={[28, -8]} end={[28, -26]}
        elevation={22} arcHeight={2.2} mats={mats}
      />

      {/* ══════════════════════════════════════════════════
          HANGING GARDEN PODS — suspended between towers
         ══════════════════════════════════════════════════ */}

      {/* Cluster between Sail Spire and BioWave */}
      <HangingGardenPod position={[32, 14, 1]}  radius={2.4} mats={mats} />
      <HangingGardenPod position={[30, 17, 5]}  radius={2.0} mats={mats} />
      <HangingGardenPod position={[34, 11, -3]} radius={2.2} mats={mats} />

      {/* Cluster north – between BioHelix & Torus Void */}
      <HangingGardenPod position={[8, 16, 26]}  radius={2.6} mats={mats} />
      <HangingGardenPod position={[2, 19, 28]}  radius={2.0} mats={mats} />
      <HangingGardenPod position={[14, 20, 30]} radius={2.2} mats={mats} />

      {/* Cluster west – between Vortex & Ribbon */}
      <HangingGardenPod position={[-35, 15, 0]}  radius={2.4} mats={mats} />
      <HangingGardenPod position={[-38, 18, 4]}  radius={2.0} mats={mats} />
      <HangingGardenPod position={[-32, 13, -2]} radius={2.2} mats={mats} />

      {/* Cluster south – between Triad & Teardrop */}
      <HangingGardenPod position={[-6, 14, -28]}  radius={2.3} mats={mats} />
      <HangingGardenPod position={[-12, 17, -26]} radius={2.0} mats={mats} />
      <HangingGardenPod position={[0, 15, -30]}   radius={2.1} mats={mats} />

      {/* ══════════════════════════════════════════════════
          WATERFALLS — cascading between tower levels
         ══════════════════════════════════════════════════ */}

      {/* Waterfall 1: From Park 1 down east face of Sail Spire */}
      <Waterfall position={[26, 20, 0]}  height={16} width={2.0} rotation={0.3}  mats={mats} />

      {/* Waterfall 2: North face, from Torus Void terrace */}
      <Waterfall position={[-3, 26, 29]} height={14} width={2.4} rotation={1.6}  mats={mats} />

      {/* Waterfall 3: West side, from Vortex Hourglass */}
      <Waterfall position={[-29, 22, 0]} height={18} width={2.2} rotation={-0.1} mats={mats} />

      {/* Waterfall 4: South, from Crescent Canopy */}
      <Waterfall position={[28, 18, -24]} height={15} width={2.0} rotation={0.9} mats={mats} />

      {/* Waterfall 5: East outer – from Outer Vortex */}
      <Waterfall position={[47, 14, -10]} height={12} width={1.8} rotation={0.5} mats={mats} />

      {/* ══════════════════════════════════════════════════
          ROOFTOP TERRACE GARDENS — on tower crowns
         ══════════════════════════════════════════════════ */}

      {/* On Sail Spire [28,-8] roof (~46m) */}
      <RooftopTerrace position={[28, 47, -8]} width={5} depth={5} mats={mats} />
      {/* On Torus Void [-4,30] roof (~42m) */}
      <RooftopTerrace position={[-4, 43, 30]} width={5.5} depth={5.5} mats={mats} />
      {/* On Vortex West [-30,-6] roof (~40m) */}
      <RooftopTerrace position={[-30, 41, -6]} width={5} depth={5} mats={mats} />
      {/* On BioWave [36,10] roof (~36m) */}
      <RooftopTerrace position={[36, 37, 10]} width={4.5} depth={4.5} mats={mats} />
      {/* On Outer Teardrop [38,34] roof (~50m) */}
      <RooftopTerrace position={[38, 51, 34]} width={5} depth={5} mats={mats} />
      {/* On Outer Crescent [-48,-4] roof (~44m) */}
      <RooftopTerrace position={[-48, 45, -4]} width={4.5} depth={4.5} mats={mats} />
    </group>
  );
}
