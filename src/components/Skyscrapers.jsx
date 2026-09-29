import { useMemo } from "react";
import * as THREE from "three";

// Shared materials for sustainable white, blue, turquoise & green curved architecture
function useSustainableMaterials() {
  return useMemo(() => {
    // Crisp architectural white facade (bioclimatic ceramic/anodized aluminum)
    const whiteFacade = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.25,
      metalness: 0.15,
    });

    // Anodized silver-white structural ribs
    const silverTrim = new THREE.MeshStandardMaterial({
      color: "#f1f5f9",
      roughness: 0.2,
      metalness: 0.35,
    });

    // Sky blue crystalline solar glass
    const skyGlass = new THREE.MeshPhysicalMaterial({
      color: "#bae6fd",
      roughness: 0.05,
      metalness: 0.15,
      transmission: 0.55,
      thickness: 0.85,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.94,
    });

    // Turquoise reflective solar glass
    const turquoiseGlass = new THREE.MeshPhysicalMaterial({
      color: "#67e8f9",
      roughness: 0.05,
      metalness: 0.2,
      transmission: 0.58,
      thickness: 0.9,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1.0,
      reflectivity: 0.96,
    });

    // Deep solar photovoltaic cells (integrated into rooftops)
    const solarPanelMat = new THREE.MeshStandardMaterial({
      color: "#0369a1",
      roughness: 0.12,
      metalness: 0.85,
    });

    // Solar panel white frame
    const solarFrameMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.35,
      metalness: 0.2,
    });

    // Lush vertical garden foliage
    const foliageMat = new THREE.MeshStandardMaterial({
      color: "#16a34a",
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    // Light emerald ivy / hanging garden vines
    const vinesMat = new THREE.MeshStandardMaterial({
      color: "#22c55e",
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    // Blue accent luminescent lighting
    const blueAccentMat = new THREE.MeshStandardMaterial({
      color: "#00d2ff",
      emissive: "#00e5ff",
      emissiveIntensity: 2.8,
      toneMapped: false,
    });

    // Electric cyan/turquoise accent lighting
    const turquoiseAccentMat = new THREE.MeshStandardMaterial({
      color: "#06b6d4",
      emissive: "#22d3ee",
      emissiveIntensity: 2.5,
      toneMapped: false,
    });

    // Transparent skybridge glass
    const bridgeGlassMat = new THREE.MeshPhysicalMaterial({
      color: "#cffafe",
      roughness: 0.04,
      transmission: 0.78,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1.0,
    });

    return {
      whiteFacade,
      silverTrim,
      skyGlass,
      turquoiseGlass,
      solarPanelMat,
      solarFrameMat,
      foliageMat,
      vinesMat,
      blueAccentMat,
      turquoiseAccentMat,
      bridgeGlassMat,
    };
  }, []);
}

// -------------------------------------------------------------
// HELPER: Integrated Rooftop Solar Array
// -------------------------------------------------------------
function IntegratedSolarArray({ width = 3.6, length = 3.6, tilt = 0.45, mats }) {
  const cols = Math.max(2, Math.floor(width / 1.5));
  const rows = Math.max(2, Math.floor(length / 1.5));

  return (
    <group>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const px = (c - (cols - 1) / 2) * 1.4;
          const pz = (r - (rows - 1) / 2) * 1.4;

          return (
            <group key={`${r}-${c}`} position={[px, 0.25, pz]} rotation={[-tilt, 0, 0]}>
              <mesh position={[0, -0.12, 0]} material={mats.solarFrameMat}>
                <cylinderGeometry args={[0.04, 0.04, 0.25, 6]} />
              </mesh>
              <mesh material={mats.solarPanelMat}>
                <boxGeometry args={[1.2, 0.04, 1.2]} />
              </mesh>
              <mesh position={[0, 0.02, 0]} material={mats.solarFrameMat}>
                <boxGeometry args={[1.25, 0.02, 1.25]} />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

// -------------------------------------------------------------
// HELPER: Curved Skybridge Linking Neighboring Towers
// -------------------------------------------------------------
function CurvedSkybridge({ start, end, height, mats }) {
  const { midPoint, length } = useMemo(() => {
    const p1 = new THREE.Vector3(start[0], height, start[1]);
    const p2 = new THREE.Vector3(end[0], height, end[1]);
    const mid = new THREE.Vector3()
      .addVectors(p1, p2)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 0.6, 0)); // Subtle graceful arch
    return { midPoint: mid, length: p1.distanceTo(p2) };
  }, [start, end, height]);

  const p1 = new THREE.Vector3(start[0], height, start[1]);
  const p2 = new THREE.Vector3(end[0], height, end[1]);
  const rotY = Math.atan2(p2.x - p1.x, p2.z - p1.z);

  return (
    <group position={[midPoint.x, height, midPoint.z]} rotation={[0, rotY, 0]}>
      {/* White Arched Bridge Structural Deck */}
      <mesh position={[0, 0, 0]} material={mats.whiteFacade} castShadow>
        <boxGeometry args={[2.2, 0.45, length]} />
      </mesh>
      {/* Turquoise Panoramic Glass Walls */}
      <mesh position={[-1.05, 0.9, 0]} material={mats.bridgeGlassMat}>
        <boxGeometry args={[0.06, 1.4, length * 0.96]} />
      </mesh>
      <mesh position={[1.05, 0.9, 0]} material={mats.bridgeGlassMat}>
        <boxGeometry args={[0.06, 1.4, length * 0.96]} />
      </mesh>
      {/* White Roof Canopy with Integrated Solar Strip */}
      <mesh position={[0, 1.65, 0]} material={mats.whiteFacade}>
        <boxGeometry args={[2.2, 0.25, length]} />
      </mesh>
      <mesh position={[0, 1.8, 0]} material={mats.solarPanelMat}>
        <boxGeometry args={[1.6, 0.05, length * 0.9]} />
      </mesh>
      {/* Rooftop Hanging Garden Planter along Bridge */}
      <mesh position={[0, 2.0, 0]} material={mats.foliageMat}>
        <boxGeometry args={[0.8, 0.3, length * 0.8]} />
      </mesh>
      {/* Blue LED Underglow Line */}
      <mesh position={[0, -0.25, 0]} material={mats.blueAccentMat}>
        <boxGeometry args={[0.2, 0.08, length]} />
      </mesh>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 1: The Sail Spire (AeroSail Arcology)
// Sweeping aerodynamic curved sail with stepped vertical gardens
// =============================================================
function SailSpire({ position, height = 46, rotation = 0, mats }) {
  const floors = 14;
  const floorH = height / floors;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Central Curved Glass Core */}
      <mesh position={[0, height / 2, 0]} material={mats.skyGlass} castShadow>
        <cylinderGeometry args={[2.4, 4.2, height, 16]} />
      </mesh>

      {/* Sweeping White Aerodynamic Sail Ribs & Stepped Terraces */}
      {Array.from({ length: floors }).map((_, i) => {
        const t = i / floors;
        const y = (i + 0.5) * floorH;
        // Sail curve: parabolic forward taper
        const curveOffset = Math.sin(t * Math.PI * 0.85) * 2.8;
        const scale = 1 - t * 0.5;

        return (
          <group key={i} position={[0, y, curveOffset]}>
            {/* White Curved Cantilever Floor */}
            <mesh material={mats.whiteFacade} castShadow={i % 3 === 0}>
              <cylinderGeometry args={[3.2 * scale, 3.4 * scale, floorH * 0.8, 16, 1, false, 0, Math.PI * 1.5]} />
            </mesh>
            {/* Blue Luminescent Edge Trim */}
            <mesh position={[0, floorH * 0.4, 0]} material={mats.blueAccentMat}>
              <cylinderGeometry args={[3.25 * scale, 3.25 * scale, 0.08, 16, 1, true, 0, Math.PI * 1.5]} />
            </mesh>
            {/* Cascading Green Garden Terrace */}
            <mesh position={[1.5 * scale, 0.2, -1.0]} material={mats.foliageMat}>
              <dodecahedronGeometry args={[0.6 * scale, 0]} />
            </mesh>
            <mesh position={[-1.2 * scale, 0.15, -0.8]} material={mats.vinesMat}>
              <dodecahedronGeometry args={[0.5 * scale, 0]} />
            </mesh>
          </group>
        );
      })}

      {/* Soaring Curved Sail Fin at Apex */}
      <mesh position={[0, height + 3.5, 1.2]} rotation={[0.2, 0, 0]} material={mats.whiteFacade}>
        <coneGeometry args={[1.2, 8, 8]} />
      </mesh>
      <mesh position={[0, height + 5.5, 1.2]} material={mats.blueAccentMat}>
        <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
      </mesh>

      {/* Integrated Rooftop Solar Photovoltaic Array */}
      <group position={[0, height + 0.3, -1.0]}>
        <IntegratedSolarArray width={3.2} length={3.2} mats={mats} />
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 2: The Double Helix Spire (BioHelix Tower)
// Two intertwined spiraling white ribbons with vertical gardens
// =============================================================
function BioHelixTower({ position, height = 44, radius = 3.5, rotation = 0, mats }) {
  const steps = 24;
  const stepH = height / steps;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Central Cylindrical Turquoise Solar Glass Core */}
      <mesh position={[0, height / 2, 0]} material={mats.turquoiseGlass} castShadow>
        <cylinderGeometry args={[radius * 0.65, radius * 0.85, height, 20]} />
      </mesh>

      {/* Two Entwined Spiraling White Ribbons with Living Vertical Gardens */}
      {Array.from({ length: steps }).map((_, i) => {
        const t = i / steps;
        const y = (i + 0.5) * stepH;
        const angleA = t * Math.PI * 3.0;
        const angleB = angleA + Math.PI; // 180 deg opposite
        const currentR = radius * (1 - t * 0.28);

        return (
          <group key={i} position={[0, y, 0]}>
            {/* Spiral Strand A */}
            <group position={[Math.cos(angleA) * currentR, 0, Math.sin(angleA) * currentR]} rotation={[0, -angleA, 0]}>
              <mesh material={mats.whiteFacade} castShadow={i % 4 === 0}>
                <boxGeometry args={[1.6, stepH * 0.9, 1.8]} />
              </mesh>
              <mesh position={[0, stepH * 0.45, 0]} material={mats.blueAccentMat}>
                <boxGeometry args={[1.64, 0.08, 1.84]} />
              </mesh>
              <mesh position={[0.2, 0.3, 0]} material={mats.foliageMat}>
                <dodecahedronGeometry args={[0.55, 0]} />
              </mesh>
            </group>

            {/* Spiral Strand B */}
            <group position={[Math.cos(angleB) * currentR, 0, Math.sin(angleB) * currentR]} rotation={[0, -angleB, 0]}>
              <mesh material={mats.whiteFacade} castShadow={i % 4 === 0}>
                <boxGeometry args={[1.6, stepH * 0.9, 1.8]} />
              </mesh>
              <mesh position={[0, stepH * 0.45, 0]} material={mats.blueAccentMat}>
                <boxGeometry args={[1.64, 0.08, 1.84]} />
              </mesh>
              <mesh position={[-0.2, 0.3, 0]} material={mats.vinesMat}>
                <dodecahedronGeometry args={[0.55, 0]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Integrated Circular Rooftop Solar Crown */}
      <group position={[0, height + 1.2, 0]}>
        <mesh material={mats.whiteFacade}>
          <cylinderGeometry args={[radius * 0.75, radius * 0.65, 1.2, 16]} />
        </mesh>
        <mesh position={[0, 0.7, 0]} rotation={[-0.4, 0, 0]} material={mats.solarPanelMat}>
          <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.08, 16]} />
        </mesh>
        <mesh position={[0, 0.75, 0]} material={mats.blueAccentMat}>
          <torusGeometry args={[radius * 0.72, 0.06, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 3: The Elliptical Oculi (Torus Void Arcology)
// Curved oval tower with a circular aerodynamic sky portal
// =============================================================
function TorusVoidTower({ position, height = 42, rotation = 0, mats }) {
  const voidY = height * 0.72;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Lower Curved Monolith Base */}
      <mesh position={[0, voidY * 0.45, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[4.2, 5.2, voidY * 0.9, 20]} />
      </mesh>
      {/* Sky Blue Glass Curtain Inset */}
      <mesh position={[0, voidY * 0.45, 0]} material={mats.skyGlass}>
        <cylinderGeometry args={[4.25, 5.25, voidY * 0.75, 20]} />
      </mesh>

      {/* Mid-Tower Hanging Gardens */}
      <group position={[0, voidY * 0.85, 0]}>
        <mesh position={[0, 0, 4.4]} material={mats.foliageMat}>
          <boxGeometry args={[4.8, 0.6, 1.2]} />
        </mesh>
        <mesh position={[0, 0, -4.4]} material={mats.vinesMat}>
          <boxGeometry args={[4.8, 0.6, 1.2]} />
        </mesh>
      </group>

      {/* THE AERODYNAMIC SKY PORTAL (VOID) */}
      <group position={[0, voidY, 0]}>
        {/* Left Pylon */}
        <mesh position={[-3.2, 0, 0]} material={mats.whiteFacade} castShadow>
          <boxGeometry args={[1.8, 8.5, 3.6]} />
        </mesh>
        {/* Right Pylon */}
        <mesh position={[3.2, 0, 0]} material={mats.whiteFacade} castShadow>
          <boxGeometry args={[1.8, 8.5, 3.6]} />
        </mesh>
        {/* Upper Arch Bridge spanning over the void */}
        <mesh position={[0, 4.4, 0]} material={mats.whiteFacade} castShadow>
          <boxGeometry args={[7.8, 1.6, 3.8]} />
        </mesh>
        {/* Luminous Blue Circular Ring framing the void */}
        <mesh material={mats.blueAccentMat}>
          <torusGeometry args={[2.5, 0.14, 12, 32]} />
        </mesh>
        {/* Hanging Ivy Cascading into the Void */}
        <mesh position={[0, 3.4, 0]} material={mats.foliageMat}>
          <boxGeometry args={[3.6, 0.5, 1.8]} />
        </mesh>
      </group>

      {/* Curved Rooftop with Integrated Solar Pergola */}
      <group position={[0, height + 1.2, 0]}>
        <mesh material={mats.whiteFacade} castShadow>
          <cylinderGeometry args={[3.6, 4.0, 1.0, 16]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} material={mats.blueAccentMat}>
          <torusGeometry args={[3.65, 0.08, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <IntegratedSolarArray width={4.2} length={3.2} mats={mats} />
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 4: Petal Bloom Towers (Lotus Bio-Cluster)
// 3 curved petal towers arching outward with skybridge linkage
// =============================================================
function PetalBloomTowers({ position, height = 38, rotation = 0, mats }) {
  const petals = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Central Botanical Base */}
      <mesh position={[0, 2, 0]} material={mats.whiteFacade} castShadow>
        <cylinderGeometry args={[4.2, 5.0, 4, 18]} />
      </mesh>
      <mesh position={[0, 4.2, 0]} material={mats.foliageMat}>
        <cylinderGeometry args={[4.0, 4.0, 0.6, 18]} />
      </mesh>

      {/* 3 Outward-Arching Petal Towers */}
      {petals.map((angle, idx) => {
        const px = Math.cos(angle) * 3.4;
        const pz = Math.sin(angle) * 3.4;

        return (
          <group key={idx} position={[px, 0, pz]} rotation={[0, -angle, 0]}>
            {/* Curved Petal Body */}
            <mesh position={[0, height * 0.48, 0]} material={mats.whiteFacade} castShadow receiveShadow>
              <cylinderGeometry args={[1.8, 2.4, height * 0.95, 12]} />
            </mesh>
            {/* Turquoise Glass Recess */}
            <mesh position={[0, height * 0.48, 0.6]} material={mats.turquoiseGlass}>
              <boxGeometry args={[2.2, height * 0.85, 1.8]} />
            </mesh>
            {/* Terraced Hanging Gardens on each Petal */}
            {[0.3, 0.55, 0.8].map((yt, gi) => (
              <group key={gi} position={[0, height * yt, 1.4]}>
                <mesh material={mats.whiteFacade}>
                  <boxGeometry args={[2.5, 0.3, 1.0]} />
                </mesh>
                <mesh position={[0, 0.25, 0]} material={mats.foliageMat}>
                  <dodecahedronGeometry args={[0.55, 0]} />
                </mesh>
                <mesh position={[0, -0.1, 0]} material={mats.blueAccentMat}>
                  <boxGeometry args={[2.54, 0.06, 1.04]} />
                </mesh>
              </group>
            ))}

            {/* Petal Crown Angled Solar Array */}
            <group position={[0, height + 0.2, 0]}>
              <mesh position={[0, 0.8, 0]} rotation={[0.45, 0, 0]} material={mats.solarPanelMat}>
                <boxGeometry args={[2.2, 0.06, 2.4]} />
              </mesh>
              <mesh position={[0, 1.6, 0]} material={mats.blueAccentMat}>
                <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Circular Curved Glass Skybridge connecting the 3 Petals */}
      <group position={[0, height * 0.65, 0]}>
        <mesh material={mats.whiteFacade} castShadow>
          <torusGeometry args={[3.4, 0.45, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <mesh material={mats.bridgeGlassMat}>
          <torusGeometry args={[3.4, 0.7, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
        <mesh material={mats.blueAccentMat}>
          <torusGeometry args={[3.85, 0.08, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 5: The Hyperboloid Hourglass (Vortex Nexus)
// Flared base & crown with a slender waist and ring gardens
// =============================================================
function VortexHourglass({ position, height = 40, rotation = 0, mats }) {
  const tiers = 10;
  const tierH = height / tiers;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Central Glass Core */}
      <mesh position={[0, height / 2, 0]} material={mats.turquoiseGlass} castShadow>
        <cylinderGeometry args={[2.8, 3.8, height, 18]} />
      </mesh>

      {/* Sweeping Hyperboloid Curved Floor Rings with Living Gardens */}
      {Array.from({ length: tiers }).map((_, i) => {
        const t = i / tiers;
        const y = (i + 0.5) * tierH;
        // Hyperboloid equation: wide at bottom (1.0), narrow at mid (0.65), flares at top (1.0)
        const rad = 4.2 * (0.65 + 0.35 * Math.pow(2 * t - 1, 2));

        return (
          <group key={i} position={[0, y, 0]}>
            {/* White Curved Disc */}
            <mesh material={mats.whiteFacade} castShadow={i % 3 === 0}>
              <cylinderGeometry args={[rad, rad * 1.02, tierH * 0.75, 20]} />
            </mesh>
            {/* Cyan/Blue Neon Accent Ring */}
            <mesh position={[0, tierH * 0.38, 0]} material={mats.blueAccentMat}>
              <torusGeometry args={[rad + 0.04, 0.06, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            {/* Alternating Garden Perimeter Ring */}
            {i % 2 === 0 && (
              <mesh position={[0, tierH * 0.42, 0]} material={mats.foliageMat}>
                <torusGeometry args={[rad - 0.25, 0.22, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Flared Rooftop Parabolic Solar Collector */}
      <group position={[0, height + 0.4, 0]}>
        <mesh material={mats.whiteFacade}>
          <cylinderGeometry args={[4.4, 4.0, 1.2, 20]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation={[-0.35, 0, 0]} material={mats.solarPanelMat}>
          <cylinderGeometry args={[4.1, 4.1, 0.08, 20]} />
        </mesh>
        <mesh position={[0, 1.2, 0]} material={mats.blueAccentMat}>
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 6: The Aerodynamic Teardrop (AeroPod Pinnacle)
// Teardrop profile with curved white ribs and stepped terraces
// =============================================================
function AeroTeardrop({ position, height = 44, rotation = 0, mats }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Tapered Curved White Pod Shell */}
      <mesh position={[0, height * 0.48, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 4.4, height * 0.96, 20]} />
      </mesh>
      {/* Continuous Sky Blue Solar Glass Ribbon */}
      <mesh position={[0, height * 0.48, 0]} material={mats.skyGlass}>
        <cylinderGeometry args={[2.55, 4.45, height * 0.8, 20]} />
      </mesh>

      {/* Curved Vertical Exoskeleton Ribs */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <group key={i} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh position={[0, height * 0.5, 3.4]} material={mats.whiteFacade}>
            <boxGeometry args={[0.45, height * 0.9, 0.6]} />
          </mesh>
          <mesh position={[0, height * 0.5, 3.75]} material={mats.blueAccentMat}>
            <boxGeometry args={[0.1, height * 0.9, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Stepped South-facing Green Terraces */}
      {[0.25, 0.5, 0.72].map((ty, idx) => (
        <group key={idx} position={[0, height * ty, 3.0]}>
          <mesh material={mats.whiteFacade}>
            <boxGeometry args={[3.2, 0.35, 1.6]} />
          </mesh>
          <mesh position={[0, 0.35, 0]} material={mats.foliageMat}>
            <dodecahedronGeometry args={[0.75, 0]} />
          </mesh>
        </group>
      ))}

      {/* Slanted Blade Solar Array & Apex Beacon */}
      <group position={[0, height + 1.2, 0]}>
        <mesh rotation={[-0.45, 0, 0]} material={mats.solarPanelMat}>
          <boxGeometry args={[3.2, 0.06, 3.6]} />
        </mesh>
        <mesh position={[0, 2.5, 0]} material={mats.blueAccentMat}>
          <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 7: The Skybridge Triad (Curved Triad Arcology)
// 3 curved leaning towers linked by 2 dramatic curved skybridges
// =============================================================
function SkybridgeTriad({ position, height = 38, rotation = 0, mats }) {
  const triadSpread = 4.8;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Tower 1 (West) */}
      <group position={[-triadSpread, 0, 0]}>
        <mesh position={[0, height / 2, 0]} material={mats.whiteFacade} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.8, height, 16]} />
        </mesh>
        <mesh position={[0, height / 2, 0]} material={mats.skyGlass}>
          <cylinderGeometry args={[2.25, 2.85, height * 0.8, 16]} />
        </mesh>
        <mesh position={[0, height * 0.6, 2.2]} material={mats.foliageMat}>
          <boxGeometry args={[2.2, 4, 0.6]} />
        </mesh>
        <group position={[0, height + 0.2, 0]}>
          <IntegratedSolarArray width={2.8} length={2.8} mats={mats} />
        </group>
      </group>

      {/* Tower 2 (North - Taller Center Pinnacle) */}
      <group position={[0, 0, triadSpread]}>
        <mesh position={[0, (height + 6) / 2, 0]} material={mats.whiteFacade} castShadow receiveShadow>
          <cylinderGeometry args={[2.4, 3.0, height + 6, 16]} />
        </mesh>
        <mesh position={[0, (height + 6) / 2, 0]} material={mats.turquoiseGlass}>
          <cylinderGeometry args={[2.45, 3.05, (height + 6) * 0.8, 16]} />
        </mesh>
        <mesh position={[0, (height + 6) * 0.55, 2.4]} material={mats.foliageMat}>
          <boxGeometry args={[2.4, 6, 0.6]} />
        </mesh>
        <group position={[0, height + 6.2, 0]}>
          <IntegratedSolarArray width={3.2} length={3.2} mats={mats} />
        </group>
      </group>

      {/* Tower 3 (East) */}
      <group position={[triadSpread, 0, 0]}>
        <mesh position={[0, height / 2, 0]} material={mats.whiteFacade} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.8, height, 16]} />
        </mesh>
        <mesh position={[0, height / 2, 0]} material={mats.skyGlass}>
          <cylinderGeometry args={[2.25, 2.85, height * 0.8, 16]} />
        </mesh>
        <mesh position={[0, height * 0.6, -2.2]} material={mats.vinesMat}>
          <boxGeometry args={[2.2, 4, 0.6]} />
        </mesh>
        <group position={[0, height + 0.2, 0]}>
          <IntegratedSolarArray width={2.8} length={2.8} mats={mats} />
        </group>
      </group>

      {/* Curved Skybridge 1: Tower 1 (West) -> Tower 2 (North) */}
      <CurvedSkybridge start={[-triadSpread, 0]} end={[0, triadSpread]} height={height * 0.68} mats={mats} />

      {/* Curved Skybridge 2: Tower 2 (North) -> Tower 3 (East) */}
      <CurvedSkybridge start={[0, triadSpread]} end={[triadSpread, 0]} height={height * 0.76} mats={mats} />
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 8: The Stepped Wave (BioWave High-Rise)
// Cascading organic wave terraces with photovoltaic pergolas
// =============================================================
function BioWaveTower({ position, height = 36, rotation = 0, mats }) {
  const steps = 4;
  const stepW = 8.5;
  const stepD = 8.5;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: steps }).map((_, i) => {
        const t = i / steps;
        const curH = height * (1 - t * 0.55);
        const curW = stepW * (1 - t * 0.2);
        const curD = stepD * (1 - t * 0.2);
        const shiftZ = i * 1.5;

        return (
          <group key={i} position={[0, 0, shiftZ]}>
            {/* White Curved Tier Body */}
            <mesh position={[0, curH / 2, 0]} material={mats.whiteFacade} castShadow receiveShadow>
              <cylinderGeometry args={[curW * 0.42, curW * 0.48, curH, 16]} />
            </mesh>
            {/* Turquoise Solar Glass Window Band */}
            <mesh position={[0, curH * 0.6, 0]} material={mats.turquoiseGlass}>
              <cylinderGeometry args={[curW * 0.43, curW * 0.47, curH * 0.5, 16]} />
            </mesh>
            {/* Blue Luminescent Edge Trim */}
            <mesh position={[0, curH, 0]} material={mats.blueAccentMat}>
              <torusGeometry args={[curW * 0.43, 0.08, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            {/* Lush Rooftop Wave Garden */}
            <mesh position={[0, curH + 0.3, 0]} material={mats.foliageMat}>
              <cylinderGeometry args={[curW * 0.38, curW * 0.38, 0.4, 16]} />
            </mesh>
            {/* Photovoltaic Solar Wave Pergola */}
            <mesh position={[0, curH + 1.2, 0]} rotation={[-0.35, 0, 0]} material={mats.solarPanelMat}>
              <boxGeometry args={[curW * 0.65, 0.06, curD * 0.65]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 9: The Crescent Moon (Lunar Canopy Arcology)
// C-shaped curved monolith embracing a central vertical atrium
// =============================================================
function CrescentCanopy({ position, height = 40, rotation = 0, mats }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* C-shaped Curved White Body (Arc angle 4.2 rad) */}
      <mesh position={[0, height / 2, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[4.4, 4.8, height, 24, 1, false, 0, Math.PI * 1.4]} />
      </mesh>
      {/* Sky Blue Glass Inner Curtain */}
      <mesh position={[0, height / 2, 0]} material={mats.skyGlass}>
        <cylinderGeometry args={[4.45, 4.85, height * 0.85, 24, 1, false, 0.2, Math.PI * 1.2]} />
      </mesh>

      {/* Vertical Green Atrium inside the C-Shape */}
      <mesh position={[0, height / 2, 0]} material={mats.foliageMat}>
        <cylinderGeometry args={[2.2, 2.5, height * 0.75, 12, 1, true]} />
      </mesh>

      {/* Blue LED Spine Lines running up the crescent tips */}
      <mesh position={[4.4, height / 2, 0]} material={mats.blueAccentMat}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>
      <mesh position={[-2.4, height / 2, 3.8]} material={mats.blueAccentMat}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>

      {/* Integrated Crescent Rooftop Solar Array */}
      <group position={[0, height + 0.3, 0]}>
        <mesh rotation={[-0.4, 0, 0]} material={mats.solarPanelMat}>
          <cylinderGeometry args={[4.0, 4.0, 0.08, 16, 1, false, 0, Math.PI * 1.4]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 10: The Twisted Prism (PrismTwist Obelisk)
// 3-lobed rounded triangular cross-section twisting 120 degrees
// =============================================================
function PrismTwist({ position, height = 42, rotation = 0, mats }) {
  const tiers = 12;
  const tierH = height / tiers;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: tiers }).map((_, i) => {
        const t = i / tiers;
        const y = (i + 0.5) * tierH;
        const twistAngle = t * (Math.PI * 0.75); // 135 deg twist
        const scale = 1 - t * 0.35;

        return (
          <group key={i} position={[0, y, 0]} rotation={[0, twistAngle, 0]}>
            {/* Rounded Triangular Floor Plate */}
            <mesh material={mats.whiteFacade} castShadow={i % 2 === 0}>
              <cylinderGeometry args={[3.2 * scale, 3.4 * scale, tierH * 0.8, 3]} />
            </mesh>
            {/* Turquoise Glass Ribbon */}
            <mesh position={[0, 0, 0]} material={mats.turquoiseGlass}>
              <cylinderGeometry args={[3.25 * scale, 3.45 * scale, tierH * 0.6, 3]} />
            </mesh>
            {/* Blue Luminescent Edge Guide */}
            <mesh position={[0, tierH * 0.4, 0]} material={mats.blueAccentMat}>
              <cylinderGeometry args={[3.3 * scale, 3.3 * scale, 0.08, 3, 1, true]} />
            </mesh>
            {/* Cascading Green Garden Pocket on Vertex */}
            <mesh position={[2.2 * scale, 0.2, 0]} material={mats.foliageMat}>
              <dodecahedronGeometry args={[0.55 * scale, 0]} />
            </mesh>
          </group>
        );
      })}

      {/* Triangular Photovoltaic Solar Farm at Crown */}
      <group position={[0, height + 0.2, 0]}>
        <mesh position={[0, 0.6, 0]} rotation={[-0.4, 0, 0]} material={mats.solarPanelMat}>
          <cylinderGeometry args={[2.2, 2.2, 0.08, 3]} />
        </mesh>
        <mesh position={[0, 1.6, 0]} material={mats.blueAccentMat}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 11: The Infinity Arch (Mobius Sky-Gate)
// Monumental curved twin legs joining into a high-altitude arch
// =============================================================
function MobiusArch({ position, height = 38, span = 7.5, rotation = 0, mats }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left Curved Leg */}
      <mesh position={[-span / 2, height * 0.45, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.4, height * 0.9, 16]} />
      </mesh>
      <mesh position={[-span / 2, height * 0.45, 0]} material={mats.skyGlass}>
        <cylinderGeometry args={[1.85, 2.45, height * 0.75, 16]} />
      </mesh>

      {/* Right Curved Leg */}
      <mesh position={[span / 2, height * 0.45, 0]} material={mats.whiteFacade} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.4, height * 0.9, 16]} />
      </mesh>
      <mesh position={[span / 2, height * 0.45, 0]} material={mats.skyGlass}>
        <cylinderGeometry args={[1.85, 2.45, height * 0.75, 16]} />
      </mesh>

      {/* Monumental Arched Crown linking both legs */}
      <group position={[0, height, 0]}>
        <mesh material={mats.whiteFacade} castShadow>
          <boxGeometry args={[span + 3.6, 1.8, 4.0]} />
        </mesh>
        {/* Sky Atrium Glass Center */}
        <mesh position={[0, 0, 0]} material={mats.turquoiseGlass}>
          <boxGeometry args={[span - 1.0, 1.2, 3.8]} />
        </mesh>
        {/* Continuous Integrated Solar Ribbon Roof */}
        <mesh position={[0, 1.0, 0]} material={mats.solarPanelMat}>
          <boxGeometry args={[span + 3.0, 0.08, 3.6]} />
        </mesh>
        {/* Blue Under-glow Arch Trim */}
        <mesh position={[0, -0.95, 0]} material={mats.blueAccentMat}>
          <boxGeometry args={[span - 0.5, 0.08, 0.3]} />
        </mesh>
        {/* Hanging Vertical Garden under the Arch */}
        <mesh position={[0, -1.3, 0]} material={mats.vinesMat}>
          <boxGeometry args={[span - 1.5, 0.6, 1.8]} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================
// UNIQUE SILHOUETTE 12: The Fluid S-Curve (Verdant Ribbon)
// Sinuous double-curved white facade with cantilevered green bays
// =============================================================
function VerdantRibbon({ position, height = 40, rotation = 0, mats }) {
  const floors = 10;
  const floorH = height / floors;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: floors }).map((_, i) => {
        const t = i / floors;
        const y = (i + 0.5) * floorH;
        // S-curve lateral displacement
        const curveX = Math.sin(t * Math.PI * 2) * 1.8;

        return (
          <group key={i} position={[curveX, y, 0]}>
            {/* White Organic Ellipse Floor */}
            <mesh material={mats.whiteFacade} castShadow={i % 2 === 0}>
              <cylinderGeometry args={[2.8, 3.0, floorH * 0.8, 16]} />
            </mesh>
            {/* Turquoise Solar Glass Window Band */}
            <mesh position={[0, 0, 0]} material={mats.turquoiseGlass}>
              <cylinderGeometry args={[2.85, 3.05, floorH * 0.6, 16]} />
            </mesh>
            {/* Cantilevered Green Garden Pod */}
            <mesh position={[2.6, 0.2, 0]} material={mats.foliageMat}>
              <dodecahedronGeometry args={[0.7, 0]} />
            </mesh>
            {/* Blue Luminescent Edge Trim */}
            <mesh position={[0, floorH * 0.38, 0]} material={mats.blueAccentMat}>
              <torusGeometry args={[2.9, 0.07, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
          </group>
        );
      })}

      {/* Sinuous Rooftop Solar Farm */}
      <group position={[0, height + 0.2, 0]}>
        <IntegratedSolarArray width={3.6} length={3.6} mats={mats} />
      </group>
    </group>
  );
}

// =============================================================
// MASTER SKYSCRAPERS EXPORT
// Rings the central turquoise lake with 18 uniquely sculpted,
// curved, vertical-garden covered skyscrapers linked by skybridges!
// =============================================================
export default function Skyscrapers() {
  const mats = useSustainableMaterials();

  // Curated layout of 18 landmark curved skyscrapers around the lake (R 27 to 56)
  const skylineLayout = useMemo(() => {
    return [
      // 1. Lakefront East Promontory
      { type: "sail", position: [28, 0, -8], height: 46, rotation: -0.5 },
      // 2. Lakefront North-East Bio-Cluster
      { type: "biohelix", position: [20, 0, 22], height: 44, radius: 3.6, rotation: 0.8 },
      // 3. Lakefront North Oculi
      { type: "torus", position: [-4, 0, 30], height: 42, rotation: 1.57 },
      // 4. Lakefront North-West Petal Bloom
      { type: "petals", position: [-26, 0, 16], height: 38, rotation: 0.4 },
      // 5. Lakefront West Hourglass
      { type: "vortex", position: [-30, 0, -6], height: 40, rotation: 0 },
      // 6. Lakefront South-West Teardrop
      { type: "teardrop", position: [-20, 0, -22], height: 44, rotation: -0.7 },
      // 7. Lakefront South Arching Skybridge Triad
      { type: "triad", position: [6, 0, -28], height: 38, rotation: 0.3 },

      // Mid-Ring Iconic Landmarks (R ~ 36 - 45)
      // 8. Mid-Ring Cascading Bio-Wave
      { type: "biowave", position: [36, 0, 10], height: 36, rotation: -1.2 },
      // 9. Mid-Ring Crescent Canopy
      { type: "crescent", position: [28, 0, -26], height: 40, rotation: 0.9 },
      // 10. Mid-Ring Twisted Prism
      { type: "prism", position: [-12, 0, -38], height: 42, rotation: -0.4 },
      // 11. Mid-Ring Infinity Arch Gateway
      { type: "mobius", position: [-38, 0, -24], height: 38, span: 7.6, rotation: 0.6 },
      // 12. Mid-Ring Fluid S-Curve Ribbon
      { type: "ribbon", position: [-40, 0, 8], height: 40, rotation: 1.1 },
      // 13. Mid-Ring Second Sail Spire
      { type: "sail", position: [-28, 0, 32], height: 48, rotation: 2.3 },
      // 14. Mid-Ring Second Bio-Helix
      { type: "biohelix", position: [14, 0, 38], height: 46, radius: 3.5, rotation: -0.9 },

      // Outer Skyline Pinnacles (R ~ 48 - 56)
      // 15. Outer East Hourglass Pinnacle
      { type: "vortex", position: [48, 0, -12], height: 45, rotation: 0.5 },
      // 16. Outer North-East Teardrop Needle
      { type: "teardrop", position: [38, 0, 34], height: 50, rotation: -1.4 },
      // 17. Outer North-West Bio-Wave
      { type: "biowave", position: [-36, 0, 40], height: 38, rotation: 1.8 },
      // 18. Outer West Crescent Arcology
      { type: "crescent", position: [-48, 0, -4], height: 44, rotation: -0.8 },
    ];
  }, []);

  return (
    <group>
      {/* 18 Uniquely Sculpted Curved Skyscrapers */}
      {skylineLayout.map((tower, idx) => {
        switch (tower.type) {
          case "sail":
            return <SailSpire key={idx} mats={mats} {...tower} />;
          case "biohelix":
            return <BioHelixTower key={idx} mats={mats} {...tower} />;
          case "torus":
            return <TorusVoidTower key={idx} mats={mats} {...tower} />;
          case "petals":
            return <PetalBloomTowers key={idx} mats={mats} {...tower} />;
          case "vortex":
            return <VortexHourglass key={idx} mats={mats} {...tower} />;
          case "teardrop":
            return <AeroTeardrop key={idx} mats={mats} {...tower} />;
          case "triad":
            return <SkybridgeTriad key={idx} mats={mats} {...tower} />;
          case "biowave":
            return <BioWaveTower key={idx} mats={mats} {...tower} />;
          case "crescent":
            return <CrescentCanopy key={idx} mats={mats} {...tower} />;
          case "prism":
            return <PrismTwist key={idx} mats={mats} {...tower} />;
          case "mobius":
            return <MobiusArch key={idx} mats={mats} {...tower} />;
          case "ribbon":
            return <VerdantRibbon key={idx} mats={mats} {...tower} />;
          default:
            return null;
        }
      })}

      {/* High-Altitude Inter-District Curved Skybridges */}
      {/* Skybridge 1: Linking Sail Spire (Lakefront East) & BioWave Tower */}
      <CurvedSkybridge start={[28, -8]} end={[36, 10]} height={26} mats={mats} />

      {/* Skybridge 2: Linking BioHelix (North-East) & Outer Teardrop */}
      <CurvedSkybridge start={[20, 22]} end={[14, 38]} height={30} mats={mats} />

      {/* Skybridge 3: Linking Torus Void (North) & Petal Bloom Towers */}
      <CurvedSkybridge start={[-4, 30]} end={[-26, 16]} height={28} mats={mats} />

      {/* Skybridge 4: Linking Vortex Hourglass (West) & Mobius Arch Gateway */}
      <CurvedSkybridge start={[-30, -6]} end={[-38, -24]} height={25} mats={mats} />

      {/* Skybridge 5: Linking Teardrop (South-West) & Crescent Canopy */}
      <CurvedSkybridge start={[-20, -22]} end={[-12, -38]} height={29} mats={mats} />
    </group>
  );
}
