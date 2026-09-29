import { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";

// Generates pseudo-random numbers with seed
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function InstancedTrees() {
  const canopyMeshRef = useRef();
  const trunkMeshRef = useRef();

  // Green palette for lush, vibrant biodiversity
  const greenPalette = useMemo(
    () => [
      new THREE.Color("#16a34a"),
      new THREE.Color("#22c55e"),
      new THREE.Color("#15803d"),
      new THREE.Color("#4ade80"),
      new THREE.Color("#10b981"),
      new THREE.Color("#059669"),
      new THREE.Color("#34d399"),
    ],
    []
  );

  const trunkColor = useMemo(() => new THREE.Color("#e2e8f0"), []); // Clean light birch/porcelain trunks

  // Generate 2,800 tree transforms distributed in green parks, lakeside, and districts
  const treeData = useMemo(() => {
    const rand = mulberry32(777);
    const list = [];
    const LAKE_RADIUS = 21.5;
    const ISLAND_RADIUS = 7.5;

    // Helper to check building exclusion zones
    const isExcluded = (x, z) => {
      const dist = Math.hypot(x, z);
      // In central lake water (between island and lake shore)
      if (dist > ISLAND_RADIUS + 0.5 && dist < LAKE_RADIUS + 0.5) return true;
      // In central spire foundation
      if (dist < 4.5) return true;
      return false;
    };

    // 1. Central Island Grove (around hydro-solar tower)
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2;
      const r = 4.8 + rand() * 2.4;
      list.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y: 0.1,
        scale: 0.6 + rand() * 0.5,
        rotY: rand() * Math.PI * 2,
        colorIdx: Math.floor(rand() * greenPalette.length),
      });
    }

    // 2. Lakeside Green Belt & Promenades (just outside lake: r 22 to 34)
    for (let i = 0; i < 950; i++) {
      const a = rand() * Math.PI * 2;
      const r = 22.5 + rand() * 11.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!isExcluded(x, z)) {
        list.push({
          x: x + (rand() - 0.5) * 1.5,
          z: z + (rand() - 0.5) * 1.5,
          y: 0.05,
          scale: 0.8 + rand() * 0.7,
          rotY: rand() * Math.PI * 2,
          colorIdx: Math.floor(rand() * greenPalette.length),
        });
      }
    }

    // 3. Dense Urban Forest Reserves & Botanical Parks (r 34 to 68)
    for (let i = 0; i < 1800; i++) {
      const a = rand() * Math.PI * 2;
      const r = 34 + rand() * 34;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      list.push({
        x: x + (rand() - 0.5) * 2,
        z: z + (rand() - 0.5) * 2,
        y: 0.05,
        scale: 0.9 + rand() * 0.85,
        rotY: rand() * Math.PI * 2,
        colorIdx: Math.floor(rand() * greenPalette.length),
      });
    }

    return list;
  }, [greenPalette]);

  useLayoutEffect(() => {
    if (!canopyMeshRef.current || !trunkMeshRef.current) return;

    const dummy = new THREE.Object3D();

    treeData.forEach((t, i) => {
      // Trunk transform
      dummy.position.set(t.x, t.y + 0.75 * t.scale, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunkMeshRef.current.setMatrixAt(i, dummy.matrix);
      trunkMeshRef.current.setColorAt(i, trunkColor);

      // Canopy transform (perched on trunk)
      dummy.position.set(t.x, t.y + 1.8 * t.scale, t.z);
      dummy.rotation.set(0, t.rotY + 0.5, 0);
      dummy.scale.set(t.scale, t.scale * 1.15, t.scale);
      dummy.updateMatrix();
      canopyMeshRef.current.setMatrixAt(i, dummy.matrix);
      canopyMeshRef.current.setColorAt(i, greenPalette[t.colorIdx]);
    });

    trunkMeshRef.current.instanceMatrix.needsUpdate = true;
    if (trunkMeshRef.current.instanceColor) trunkMeshRef.current.instanceColor.needsUpdate = true;

    canopyMeshRef.current.instanceMatrix.needsUpdate = true;
    if (canopyMeshRef.current.instanceColor) canopyMeshRef.current.instanceColor.needsUpdate = true;
  }, [treeData, greenPalette, trunkColor]);

  const count = treeData.length;

  return (
    <group>
      {/* Instanced White Architectural Trunks (occluded under canopies — no shadow pass needed) */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[null, null, count]}
      >
        <cylinderGeometry args={[0.1, 0.16, 1.5, 6]} />
        <meshStandardMaterial roughness={0.6} metalness={0.1} />
      </instancedMesh>

      {/* Instanced Lush Green Canopies */}
      <instancedMesh
        ref={canopyMeshRef}
        args={[null, null, count]}
        castShadow
      >
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.05} flatShading />
      </instancedMesh>
    </group>
  );
}

