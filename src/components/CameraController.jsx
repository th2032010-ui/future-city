import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { VIEWPOINTS } from "../constants/viewpoints";

// ─── Cinematic Keyframe Sequence ─────────────────────────────────────────────
// Each shot defines: camera position, look-at target, hold duration (seconds),
// easing function label, and a human-readable scene label for the HUD.
const CINEMATIC_SHOTS = [
  // Shot 1 – Grand aerial overview of Verdantis
  {
    pos:    [90, 55, 90],
    target: [0, 8, 0],
    hold:   6,
    label:  "VERDANTIS — Biophilic Metropolis",
  },
  // Shot 2 – Swoop toward Central Hydro-Solar Spire
  {
    pos:    [0, 48, 22],
    target: [0, 30, 0],
    hold:   5,
    label:  "Central Hydro-Solar Energy Spire",
  },
  // Shot 3 – Tight orbit around the E-Sphere Core (low angle)
  {
    pos:    [12, 18, 12],
    target: [0, 22, 0],
    hold:   5,
    label:  "E-Sphere Core Orbit",
    orbit:  true,          // activates special orbit behaviour
    orbitRadius: 14,
    orbitY: 20,
    orbitSpeed: 0.55,
  },
  // Shot 4 – Fly over Central Turquoise Lake
  {
    pos:    [0, 12, 28],
    target: [0, 4, 0],
    hold:   5,
    label:  "Central Lake & Eco-Island",
  },
  // Shot 5 – Aerial pull-back over vertical forests (north-west)
  {
    pos:    [-40, 38, 28],
    target: [-28, 16, 16],
    hold:   5,
    label:  "Living Vertical Forest Towers",
  },
  // Shot 6 – Sky Gardens flythrough (east cluster)
  {
    pos:    [18, 30, 2],
    target: [24, 22, 7],
    hold:   5,
    label:  "Floating Sky Gardens & Waterfalls",
  },
  // Shot 7 – AI Research District approach (north)
  {
    pos:    [18, 28, -18],
    target: [0, 10, -38],
    hold:   5,
    label:  "AI Research District",
  },
  // Shot 8 – Clean Energy District panorama (east)
  {
    pos:    [28, 32, 28],
    target: [55, 8, 0],
    hold:   5,
    label:  "Clean Energy District",
  },
  // Shot 9 – Low-altitude fly-through between skyscrapers (south)
  {
    pos:    [14, 8, -18],
    target: [0, 14, -12],
    hold:   5,
    label:  "Street-Level Canyon Flight",
  },
  // Shot 10 – Final wide orbit to close the tour
  {
    pos:    [75, 42, 0],
    target: [0, 12, 0],
    hold:   6,
    label:  "City of Tomorrow — Verdantis",
    orbit:  true,
    orbitRadius: 75,
    orbitY: 42,
    orbitSpeed: 0.25,
  },
];

// ─── Smooth easing helpers ────────────────────────────────────────────────────
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Main Camera Controller ───────────────────────────────────────────────────
export default function CameraController({
  viewMode = "lake",
  leadDronePosRef,
  leadDroneDirRef,
  onUserOrbit,
  onCinematicShotChange,   // callback(shotIndex, label, progress)
}) {
  const controlsRef = useRef();
  const { camera } = useThree();

  // Current desired camera state for smooth viewpoint transitions
  const desiredPos    = useRef(new THREE.Vector3(...VIEWPOINTS.lake.pos));
  const desiredTarget = useRef(new THREE.Vector3(...VIEWPOINTS.lake.target));

  // Cinematic state
  const shotIndex     = useRef(0);
  const shotStartTime = useRef(null);
  const transitioning = useRef(false);
  const transitionStart     = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const transitionEnd       = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const transitionDuration  = useRef(2.5); // seconds for camera to travel between shots
  const transitionProgress  = useRef(0);

  // Orbit-mode state (for E-Sphere core orbit and final tour orbit)
  const orbitAngle = useRef(0);

  // ── Update desired viewpoint whenever viewMode changes ───────────────────
  useEffect(() => {
    const vp = VIEWPOINTS[viewMode];
    if (vp && viewMode !== "drone" && viewMode !== "cinematic" && viewMode !== "orbit") {
      desiredPos.current.set(...vp.pos);
      desiredTarget.current.set(...vp.target);
    }
    // Reset cinematic sequence when entering cinematic mode
    if (viewMode === "cinematic") {
      shotIndex.current = 0;
      shotStartTime.current = null;
      transitioning.current = false;
      orbitAngle.current = 0;
    }
  }, [viewMode]);

  // ── Per-frame camera update ───────────────────────────────────────────────
  useFrame(({ clock }) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const t = clock.elapsedTime;

    // ── 1. DRONE CHASE CAM ──────────────────────────────────────────────────
    if (viewMode === "drone") {
      const dronePos = leadDronePosRef?.current;
      const droneDir = leadDroneDirRef?.current;
      if (dronePos && droneDir) {
        const chasePos = dronePos
          .clone()
          .sub(droneDir.clone().multiplyScalar(6.5))
          .add(new THREE.Vector3(0, 2.4, 0));
        const lookPos = dronePos.clone().add(droneDir.clone().multiplyScalar(9));
        camera.position.lerp(chasePos, 0.08);
        controls.target.lerp(lookPos, 0.1);
        controls.update();
      }
      return;
    }

    // ── 2. CINEMATIC TOUR ───────────────────────────────────────────────────
    if (viewMode === "cinematic") {
      const shot = CINEMATIC_SHOTS[shotIndex.current];

      // --- Initialize first shot ---
      if (shotStartTime.current === null) {
        shotStartTime.current = t;
        // Snap camera to start of first transition
        transitionStart.current.pos.copy(camera.position);
        transitionStart.current.target.copy(controls.target);
        transitionEnd.current.pos.set(...shot.pos);
        transitionEnd.current.target.set(...shot.target);
        transitioning.current = true;
        transitionProgress.current = 0;
        orbitAngle.current = 0;
        onCinematicShotChange?.(shotIndex.current, shot.label, 0);
      }

      // --- Transition phase: smoothly move camera to shot position ---
      if (transitioning.current) {
        const elapsed = t - shotStartTime.current;
        const rawP = Math.min(elapsed / transitionDuration.current, 1);
        const p = easeInOutCubic(rawP);
        transitionProgress.current = rawP;

        camera.position.lerpVectors(
          transitionStart.current.pos,
          transitionEnd.current.pos,
          p
        );
        controls.target.lerpVectors(
          transitionStart.current.target,
          transitionEnd.current.target,
          p
        );
        controls.update();

        if (rawP >= 1) {
          transitioning.current = false;
          shotStartTime.current = t;
          orbitAngle.current = Math.atan2(
            camera.position.x - transitionEnd.current.target.x,
            camera.position.z - transitionEnd.current.target.z
          );
        }
        onCinematicShotChange?.(shotIndex.current, shot.label, rawP * 0.5);
        return;
      }

      // --- Hold phase: orbit / breathe while the shot plays ---
      const holdElapsed = t - shotStartTime.current;
      const holdProgress = Math.min(holdElapsed / shot.hold, 1);

      if (shot.orbit) {
        // Smooth orbit around the shot's target point
        const speed = (shot.orbitSpeed ?? 0.4) * 0.016;
        orbitAngle.current += speed;
        const r = shot.orbitRadius ?? 14;
        const oy = shot.orbitY ?? 20;
        const tx = transitionEnd.current.target.x;
        const tz = transitionEnd.current.target.z;
        const nx = tx + Math.cos(orbitAngle.current) * r;
        const nz = tz + Math.sin(orbitAngle.current) * r;
        camera.position.lerp(new THREE.Vector3(nx, oy, nz), 0.04);
      } else {
        // Gentle breathing bob to keep the scene alive during a static shot
        const breathe = Math.sin(t * 0.35) * 0.8;
        const nx = transitionEnd.current.pos.x;
        const ny = transitionEnd.current.pos.y + breathe;
        const nz = transitionEnd.current.pos.z;
        camera.position.lerp(new THREE.Vector3(nx, ny, nz), 0.035);
      }

      // Soft target drift
      const baseTgt = transitionEnd.current.target;
      const tgtDrift = new THREE.Vector3(
        baseTgt.x + Math.sin(t * 0.2) * 1.2,
        baseTgt.y + Math.sin(t * 0.15) * 0.8,
        baseTgt.z + Math.cos(t * 0.18) * 1.0
      );
      controls.target.lerp(tgtDrift, 0.02);
      controls.update();

      onCinematicShotChange?.(shotIndex.current, shot.label, 0.5 + holdProgress * 0.5);

      // --- Advance to next shot when hold finishes ---
      if (holdProgress >= 1) {
        const nextIndex = (shotIndex.current + 1) % CINEMATIC_SHOTS.length;
        const nextShot  = CINEMATIC_SHOTS[nextIndex];

        shotIndex.current = nextIndex;
        transitionStart.current.pos.copy(camera.position);
        transitionStart.current.target.copy(controls.target);
        transitionEnd.current.pos.set(...nextShot.pos);
        transitionEnd.current.target.set(...nextShot.target);

        // Scale transition duration by camera travel distance
        const dist = camera.position.distanceTo(transitionEnd.current.pos);
        transitionDuration.current = THREE.MathUtils.clamp(dist * 0.045, 2.0, 4.5);

        transitioning.current = true;
        shotStartTime.current = t;
        transitionProgress.current = 0;
        onCinematicShotChange?.(nextIndex, nextShot.label, 0);
      }
      return;
    }

    // ── 3. ORBIT MODE — smooth 360° orbit around E-Sphere Core ─────────────
    if (viewMode === "orbit") {
      orbitAngle.current += 0.004;
      const r = 22;
      const y = 26 + Math.sin(t * 0.3) * 5;
      const nx = Math.cos(orbitAngle.current) * r;
      const nz = Math.sin(orbitAngle.current) * r;
      camera.position.lerp(new THREE.Vector3(nx, y, nz), 0.04);
      controls.target.lerp(new THREE.Vector3(0, 20, 0), 0.04);
      controls.update();
      return;
    }

    // ── 4. STANDARD VIEWPOINT LERP ──────────────────────────────────────────
    if (camera.position.distanceTo(desiredPos.current) > 0.05) {
      camera.position.lerp(desiredPos.current, 0.05);
    }
    if (controls.target.distanceTo(desiredTarget.current) > 0.05) {
      controls.target.lerp(desiredTarget.current, 0.05);
      controls.update();
    }
  });

  // Disable orbit controls during automated modes
  const isAutoMode = viewMode === "cinematic" || viewMode === "orbit";

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.055}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={6}
      maxDistance={200}
      enableZoom={!isAutoMode}
      enableRotate={!isAutoMode}
      enablePan={!isAutoMode}
      onStart={() => {
        // Exit auto modes when user grabs the scene
        if (isAutoMode || viewMode === "drone") {
          onUserOrbit?.();
        }
      }}
    />
  );
}
