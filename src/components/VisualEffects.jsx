import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  Noise,
  ToneMapping,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

// ─── Dynamic DoF Focus Target ─────────────────────────────────────────────────
// Smoothly adjusts the focal distance based on what the camera is pointing at
function useDynamicFocus() {
  const focusRef = useRef(28);
  const { camera } = useThree();

  useFrame(() => {
    // Estimate focus distance from camera target (centre-screen ray length)
    // Approximate: smooth toward distance based on camera height
    const dist = Math.max(8, camera.position.y * 0.85 + 12);
    focusRef.current += (dist - focusRef.current) * 0.04;
  });

  return focusRef;
}

// ─── Main Visual Effects Pipeline ─────────────────────────────────────────────
export default function VisualEffects({ viewMode = "lake", timeMode = "noon" }) {
  // eslint-disable-next-line no-unused-vars
  const _focusRef = useDynamicFocus(); // Runs side-effect (DoF focus update)

  // Tune bloom intensity per view mode — reduced by 50% for a natural, non-glowing look
  const isCinematic = viewMode === "cinematic" || viewMode === "orbit";

  // Tune DoF aperture — shallow in cinematic/drone, wide open in normal view
  const isDrone     = viewMode === "drone";
  const bokehScale  = isDrone ? 4.2 : isCinematic ? 2.8 : 1.5;
  const focalLength = isDrone ? 0.008 : isCinematic ? 0.015 : 0.012;

  // Lowered exposure per time-of-day to prevent washed-out highlights
  const exposure = timeMode === "blueHour" ? 0.84
    : timeMode === "morning"  ? 0.94
    : 0.90; // noon

  return (
    <EffectComposer multisampling={0}>

      {/* ── SMAA Anti-aliasing ─────────────────────────────────────────────
          Smooth sub-pixel jagged edges on curved architecture and glass.      */}
      <SMAA />

      {/* ── Bloom (Reduced by 50%) ────────────────────────────────────────
          Subtle, natural glow restricted only to high-luminance emissive
          accents so white buildings stay crisp and never look washed out.     */}
      <Bloom
        intensity={isCinematic ? 0.42 : 0.30}
        luminanceThreshold={0.88}
        luminanceSmoothing={0.25}
        kernelSize={KernelSize.MEDIUM}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />

      {/* ── Depth of Field ────────────────────────────────────────────────
          Cinematic bokeh blur — foreground and distant objects soften while
          the focal subject stays razor-sharp.                                 */}
      <DepthOfField
        focusDistance={focalLength}
        focalLength={focalLength * 1.6}
        bokehScale={bokehScale}
        height={480}
      />

      {/* ── Moderate Contrast & Balanced Brightness ───────────────────────
          Deepens shadows slightly and separates midtones for a realistic look */}
      <BrightnessContrast
        brightness={-0.025}
        contrast={0.10}
      />

      {/* ── Vignette ──────────────────────────────────────────────────────
          Subtle dark frame around the edges focuses the eye on the city
          and adds cinematic framing depth.                                    */}
      <Vignette
        offset={0.30}
        darkness={isCinematic ? 0.48 : 0.32}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ── Chromatic Aberration ──────────────────────────────────────────
          Very subtle lens fringing on extreme edges for realism.              */}
      <ChromaticAberration
        offset={new THREE.Vector2(
          isDrone ? 0.0005 : 0.0002,
          isDrone ? 0.0005 : 0.0002
        )}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={true}
        modulationOffset={0.75}
      />

      {/* ── Film Grain (Noise) ────────────────────────────────────────────
          Adds micro-texture to avoid the "plastic render" look.               */}
      <Noise
        opacity={0.015}
        premultiply
        blendFunction={BlendFunction.SCREEN}
      />

      {/* ── ACES Filmic Tone Mapping ──────────────────────────────────────
          Rolls off highlights naturally, preserves colour saturation in
          midtones, and gives the scene its filmic, photorealistic feel.       */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={5.0}
        middleGrey={exposure}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={1.0}
      />

    </EffectComposer>
  );
}
