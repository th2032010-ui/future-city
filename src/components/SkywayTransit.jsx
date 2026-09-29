import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Multi-car aerodynamic maglev trainset
function MaglevTrain({ curve, speed = 0.06, startOffset = 0, mats }) {
  const groupRef = useRef();

  const posLead = useMemo(() => new THREE.Vector3(), []);
  const lookLead = useMemo(() => new THREE.Vector3(), []);
  const posMid = useMemo(() => new THREE.Vector3(), []);
  const lookMid = useMemo(() => new THREE.Vector3(), []);
  const posRear = useMemo(() => new THREE.Vector3(), []);
  const lookRear = useMemo(() => new THREE.Vector3(), []);

  const leadRef = useRef();
  const midRef = useRef();
  const rearRef = useRef();

  useFrame(({ clock }) => {
    const tBase = (clock.elapsedTime * speed + startOffset) % 1;
    const t = tBase < 0 ? tBase + 1 : tBase;

    // Offsets along spline for the 3 connected cars
    const tLead = t;
    const tMid = (t - (speed > 0 ? 0.022 : -0.022) + 1) % 1;
    const tRear = (t - (speed > 0 ? 0.044 : -0.044) + 1) % 1;

    // Lead Car
    curve.getPointAt(tLead, posLead);
    curve.getPointAt((tLead + (speed > 0 ? 0.01 : -0.01) + 1) % 1, lookLead);
    if (leadRef.current) {
      leadRef.current.position.copy(posLead);
      leadRef.current.lookAt(lookLead);
    }

    // Mid Passenger Car
    curve.getPointAt(tMid, posMid);
    curve.getPointAt((tMid + (speed > 0 ? 0.01 : -0.01) + 1) % 1, lookMid);
    if (midRef.current) {
      midRef.current.position.copy(posMid);
      midRef.current.lookAt(lookMid);
    }

    // Rear Car
    curve.getPointAt(tRear, posRear);
    curve.getPointAt((tRear + (speed > 0 ? 0.01 : -0.01) + 1) % 1, lookRear);
    if (rearRef.current) {
      rearRef.current.position.copy(posRear);
      rearRef.current.lookAt(lookRear);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Lead Locomotive */}
      <group ref={leadRef}>
        <mesh position={[0, 0.4, 0]} material={mats.trainBodyMat}>
          <boxGeometry args={[1.3, 0.85, 3.2]} />
        </mesh>
        {/* Aerodynamic Wedge Nose */}
        <mesh position={[0, 0.4, 1.8]} rotation={[Math.PI / 2, 0, 0]} material={mats.trainBodyMat}>
          <coneGeometry args={[0.65, 1.3, 16]} />
        </mesh>
        {/* Panoramic Turquoise Glass Ribbon */}
        <mesh position={[0, 0.5, 0.2]} material={mats.trainTurquoiseMat}>
          <boxGeometry args={[1.32, 0.22, 2.6]} />
        </mesh>
        {/* Dual Bright Cyan Headlights */}
        <mesh position={[-0.35, 0.25, 2.2]} material={mats.headlightMat}>
          <sphereGeometry args={[0.12, 8, 8]} />
        </mesh>
        <mesh position={[0.35, 0.25, 2.2]} material={mats.headlightMat}>
          <sphereGeometry args={[0.12, 8, 8]} />
        </mesh>
        {/* Blue Under-glow Magnetic Hover Strip */}
        <mesh position={[0, -0.05, 0]} material={mats.railMat}>
          <boxGeometry args={[1.1, 0.08, 3.0]} />
        </mesh>
      </group>

      {/* 2. Mid Passenger Car */}
      <group ref={midRef}>
        <mesh position={[0, 0.4, 0]} material={mats.trainBodyMat}>
          <boxGeometry args={[1.3, 0.85, 3.0]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} material={mats.trainTurquoiseMat}>
          <boxGeometry args={[1.32, 0.22, 2.6]} />
        </mesh>
        <mesh position={[0, -0.05, 0]} material={mats.railMat}>
          <boxGeometry args={[1.1, 0.08, 2.8]} />
        </mesh>
      </group>

      {/* 3. Rear Car */}
      <group ref={rearRef}>
        <mesh position={[0, 0.4, 0]} material={mats.trainBodyMat}>
          <boxGeometry args={[1.3, 0.85, 3.0]} />
        </mesh>
        <mesh position={[0, 0.5, -0.1]} material={mats.trainTurquoiseMat}>
          <boxGeometry args={[1.32, 0.22, 2.4]} />
        </mesh>
        {/* Red Taillights */}
        <mesh position={[-0.35, 0.35, -1.55]} material={mats.taillightMat}>
          <sphereGeometry args={[0.1, 8, 8]} />
        </mesh>
        <mesh position={[0.35, 0.35, -1.55]} material={mats.taillightMat}>
          <sphereGeometry args={[0.1, 8, 8]} />
        </mesh>
        <mesh position={[0, -0.05, 0]} material={mats.railMat}>
          <boxGeometry args={[1.1, 0.08, 2.8]} />
        </mesh>
      </group>
    </group>
  );
}

// Elevated Skyway Station Terminal
function ElevatedStation({ position, rotation = 0, mats }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Station Support Concrete/White Pylons with Elevator Shaft */}
      <mesh position={[0, -6, 0]} material={mats.pylonMat} castShadow>
        <cylinderGeometry args={[1.4, 1.8, 12, 12]} />
      </mesh>
      <mesh position={[0, -6, 1.6]} material={mats.trainTurquoiseMat}>
        <boxGeometry args={[0.8, 11, 0.4]} />
      </mesh>

      {/* Main Curved Station Concourse Platform */}
      <mesh position={[0, 0.2, 0]} material={mats.pylonMat} castShadow>
        <boxGeometry args={[5.2, 0.5, 14]} />
      </mesh>
      {/* Platform Boarding Blue Glow Edges */}
      <mesh position={[-2.5, 0.45, 0]} material={mats.railMat}>
        <boxGeometry args={[0.15, 0.06, 13.6]} />
      </mesh>
      <mesh position={[2.5, 0.45, 0]} material={mats.railMat}>
        <boxGeometry args={[0.15, 0.06, 13.6]} />
      </mesh>

      {/* Curved Aerodynamic Glass Canopy Roof */}
      <mesh position={[0, 2.4, 0]} material={mats.stationCanopyMat}>
        <cylinderGeometry args={[3.2, 3.2, 14, 16, 1, false, -Math.PI / 2, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
      </mesh>

      {/* Rooftop Solar Glass Strip */}
      <mesh position={[0, 4.05, 0]} material={mats.stationSolarMat}>
        <boxGeometry args={[2.8, 0.05, 12]} />
      </mesh>

      {/* Station Name Hologram Beacon */}
      <mesh position={[0, 4.4, 0]} material={mats.headlightMat}>
        <sphereGeometry args={[0.25, 8, 8]} />
      </mesh>
    </group>
  );
}

export default function SkywayTransit({ enabled = true }) {
  // Smooth closed 3D CatmullRom spline loop weaving through the city
  const { curve, trackPoints } = useMemo(() => {
    const points = [
      new THREE.Vector3(34, 14, 10),
      new THREE.Vector3(24, 13, 28),
      new THREE.Vector3(-12, 15, 32),
      new THREE.Vector3(-32, 12, 12),
      new THREE.Vector3(-28, 14, -20),
      new THREE.Vector3(0, 16, -34),
      new THREE.Vector3(26, 13, -18),
    ];
    const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
    return { curve, trackPoints: points };
  }, []);

  const trackGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 200, 0.5, 12, true);
  }, [curve]);

  const mats = useMemo(() => {
    return {
      trackMat: new THREE.MeshPhysicalMaterial({
        color: "#cffafe",
        roughness: 0.08,
        metalness: 0.2,
        transparent: true,
        opacity: 0.72,
        clearcoat: 1.0,
      }),
      railMat: new THREE.MeshStandardMaterial({
        color: "#06b6d4",
        emissive: "#22d3ee",
        emissiveIntensity: 2.6,
        toneMapped: false,
      }),
      trainBodyMat: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.15,
        metalness: 0.85,
      }),
      trainTurquoiseMat: new THREE.MeshBasicMaterial({
        color: "#22d3ee",
      }),
      headlightMat: new THREE.MeshBasicMaterial({
        color: "#ffffff",
      }),
      taillightMat: new THREE.MeshBasicMaterial({
        color: "#ef4444",
      }),
      pylonMat: new THREE.MeshStandardMaterial({
        color: "#f8fafc",
        roughness: 0.3,
        metalness: 0.2,
      }),
      stationCanopyMat: new THREE.MeshPhysicalMaterial({
        color: "#bae6fd",
        roughness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.65,
        clearcoat: 1.0,
      }),
      stationSolarMat: new THREE.MeshStandardMaterial({
        color: "#0369a1",
        roughness: 0.12,
        metalness: 0.85,
      }),
    };
  }, []);

  if (!enabled) return null;

  return (
    <group>
      {/* Translucent Guide Tube */}
      <mesh geometry={trackGeo} material={mats.trackMat} />

      {/* Luminescent Magnetic Guide Rails (Dual Rail Strip) */}
      <mesh material={mats.railMat}>
        <tubeGeometry args={[curve, 200, 0.12, 8, true]} />
      </mesh>

      {/* Structural Support Pylons Anchored in the City */}
      {trackPoints.map((pt, i) => (
        <group key={i} position={[pt.x, 0, pt.z]}>
          <mesh position={[0, pt.y / 2, 0]} material={mats.pylonMat} castShadow>
            <cylinderGeometry args={[0.5, 0.85, pt.y, 10]} />
          </mesh>
          <mesh position={[0, pt.y - 0.2, 0]} material={mats.railMat}>
            <cylinderGeometry args={[0.9, 0.9, 0.25, 12]} />
          </mesh>
        </group>
      ))}

      {/* Elevated Maglev Skyway Station Hub */}
      <ElevatedStation position={[34, 14, 10]} rotation={0.35} mats={mats} />
      <ElevatedStation position={[-32, 12, 12]} rotation={-0.6} mats={mats} />

      {/* Train 1: Clockwise High-Speed Express */}
      <MaglevTrain curve={curve} speed={0.065} startOffset={0} mats={mats} />

      {/* Train 2: Counter-Clockwise Regional Commuter */}
      <MaglevTrain curve={curve} speed={-0.055} startOffset={0.52} mats={mats} />
    </group>
  );
}
