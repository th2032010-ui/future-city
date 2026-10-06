import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CentralEnergyTower({ onSelect, isHovered, onHover }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const beamRef = useRef();
  const lightRef = useRef();

  // White, Turquoise, Sky Blue, and Green sustainable materials
  const { whiteArchMat, turquoiseCoreMat, ringMat, beamMat, foliageMat, solarPetalMat } = useMemo(() => {
    return {
      whiteArchMat: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.25,
        metalness: 0.15,
      }),
      turquoiseCoreMat: new THREE.MeshStandardMaterial({
        color: "#06b6d4",
        emissive: "#22d3ee",
        emissiveIntensity: 2.2,
        roughness: 0.08,
        metalness: 0.2,
        transparent: true,
        opacity: 0.88,
      }),
      ringMat: new THREE.MeshStandardMaterial({
        color: "#f0fdf4",
        emissive: "#22d3ee",
        emissiveIntensity: 2.6,
        roughness: 0.2,
        metalness: 0.8,
      }),
      beamMat: new THREE.MeshBasicMaterial({
        color: "#22d3ee",
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      foliageMat: new THREE.MeshStandardMaterial({
        color: "#16a34a",
        roughness: 0.85,
        metalness: 0.0,
        flatShading: true,
      }),
      solarPetalMat: new THREE.MeshStandardMaterial({
        color: "#0369a1",
        roughness: 0.1,
        metalness: 0.85,
      }),
    };
  }, []);

  const ringsData = useMemo(
    () => [
      { y: 22, radius: 4.6, tube: 0.16 },
      { y: 35, radius: 3.5, tube: 0.14 },
      { y: 46, radius: 2.3, tube: 0.11 },
    ],
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Pulse turquoise core
    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 2.5) * 0.3;
    }

    // Levitating magnetic energy rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y = t * 0.45;
      ring1Ref.current.position.y = 22 + Math.sin(t * 1.4) * 0.35;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.65;
      ring2Ref.current.position.y = 35 + Math.cos(t * 1.7) * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.85;
      ring3Ref.current.position.y = 46 + Math.sin(t * 2.0) * 0.28;
    }

    // Vertical clean energy beam
    if (beamRef.current) {
      beamRef.current.rotation.y = -t * 0.2;
      beamRef.current.material.opacity = 0.22 + Math.sin(t * 3.5) * 0.06;
    }

    // Dynamic light pulsation (restrained so surrounding white facades aren't washed out)
    if (lightRef.current) {
      lightRef.current.intensity = 45 + Math.sin(t * 4) * 10;
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      onClick={onSelect}
      onPointerOver={() => onHover && onHover(true)}
      onPointerOut={() => onHover && onHover(false)}
      cursor="pointer"
    >
      {/* Tiered White Bio-Foundation on Central Island */}
      <mesh position={[0, 0.6, 0]} material={whiteArchMat} receiveShadow castShadow>
        <cylinderGeometry args={[5.8, 6.8, 1.2, 8]} />
      </mesh>
      <mesh position={[0, 1.6, 0]} material={whiteArchMat} receiveShadow castShadow>
        <cylinderGeometry args={[4.5, 5.5, 1.0, 8]} />
      </mesh>

      {/* Cascading Terrace Hanging Gardens on Spire Base */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <group key={i} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh position={[0, 1.4, 5.2]} material={foliageMat}>
            <dodecahedronGeometry args={[0.7, 0]} />
          </mesh>
        </group>
      ))}

      {/* 6 Biophilic Curved White Buttresses */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <group key={`buttress-${i}`} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh position={[0, 12, 4.2]} rotation={[-0.12, 0, 0]} material={whiteArchMat} castShadow>
            <boxGeometry args={[1.2, 22, 1.4]} />
          </mesh>
          <mesh position={[0, 28, 3.1]} rotation={[-0.07, 0, 0]} material={whiteArchMat}>
            <boxGeometry args={[0.95, 18, 1.1]} />
          </mesh>
          <mesh position={[0, 42, 2.0]} rotation={[-0.04, 0, 0]} material={whiteArchMat}>
            <boxGeometry args={[0.7, 14, 0.8]} />
          </mesh>
        </group>
      ))}

      {/* Central Crystalline Turquoise Solar-Hydro Core */}
      <mesh ref={coreRef} position={[0, 26, 0]} material={turquoiseCoreMat} castShadow>
        <cylinderGeometry args={[2.5, 3.4, 48, 16]} />
      </mesh>

      {/* Inner Quantum Hydro-Matrix Lattice */}
      <mesh position={[0, 26, 0]}>
        <cylinderGeometry args={[1.3, 1.6, 44, 8]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.65} />
      </mesh>

      {/* Levitating Magnetic Energy Rings (Turquoise Luminescence) */}
      <group ref={ring1Ref} position={[0, 22, 0]}>
        <mesh material={ringMat}>
          <torusGeometry args={[ringsData[0].radius, ringsData[0].tube, 16, 48]} />
        </mesh>
      </group>
      <group ref={ring2Ref} position={[0, 35, 0]}>
        <mesh material={ringMat}>
          <torusGeometry args={[ringsData[1].radius, ringsData[1].tube, 16, 48]} />
        </mesh>
      </group>
      <group ref={ring3Ref} position={[0, 46, 0]}>
        <mesh material={ringMat}>
          <torusGeometry args={[ringsData[2].radius, ringsData[2].tube, 16, 48]} />
        </mesh>
      </group>

      {/* Crown Spire & Integrated Solar Petal Canopy */}
      <group position={[0, 52, 0]}>
        <mesh material={whiteArchMat}>
          <coneGeometry args={[1.4, 6, 8]} />
        </mesh>
        {/* Angled Solar Petals Opening to the Sun */}
        {[0, 90, 180, 270].map((deg, i) => (
          <group key={i} rotation={[0, (deg * Math.PI) / 180, 0]}>
            <mesh position={[0, 1.2, 1.5]} rotation={[0.5, 0, 0]} material={solarPetalMat}>
              <boxGeometry args={[1.2, 0.08, 1.8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Apex Energy Spire Rod */}
      <mesh position={[0, 56.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4.5, 8]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#22d3ee"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Upward Clean Energy Beam to Sky */}
      <group position={[0, 58, 0]}>
        <mesh ref={beamRef} material={beamMat}>
          <cylinderGeometry args={[0.7, 0.2, 130, 16, 1, true]} />
        </mesh>
        <mesh position={[0, 25, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 130, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
      </group>

      {/* Subtle Turquoise Point Light */}
      <pointLight
        ref={lightRef}
        position={[0, 53, 0]}
        color="#22d3ee"
        intensity={45}
        distance={75}
        decay={2}
      />

      {/* Selection Glow Indicator */}
      {isHovered && (
        <mesh position={[0, 27, 0]}>
          <cylinderGeometry args={[6.5, 6.5, 54, 16, 1, true]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export default memo(CentralEnergyTower);
