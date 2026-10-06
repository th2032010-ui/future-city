import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  Vignette,
  ToneMapping,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize, ToneMappingMode } from "postprocessing";

// ─── Main Visual Effects Pipeline ─────────────────────────────────────────────
// Calibrated for razor-sharp clarity, natural lighting, and zero whole-screen blur.
export default function VisualEffects({ viewMode = "lake", timeMode = "noon" }) {
  const isCinematic = viewMode === "cinematic" || viewMode === "orbit";

  // Exposure calibrated per time-of-day for natural, rich daylight
  const exposure = timeMode === "blueHour" ? 0.76
    : timeMode === "morning"  ? 0.84
    : 0.80; // noon

  return (
    <EffectComposer multisampling={0}>

      {/* ── SMAA Anti-aliasing ─────────────────────────────────────────────
          Sub-pixel anti-aliasing without blurring high-frequency texture detail. */}
      <SMAA />

      {/* ── Bloom (Reduced by 50%) ────────────────────────────────────────
          Subtle, crisp glow restricted only to intense emissive sources
          (lasers, core rings, beacons) so buildings never look washed out or hazy. */}
      <Bloom
        intensity={isCinematic ? 0.20 : 0.15}
        luminanceThreshold={0.90}
        luminanceSmoothing={0.20}
        kernelSize={KernelSize.MEDIUM}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />

      {/* ── High-Clarity Contrast & Dynamic Separation ─────────────────────
          Deepens blacks, brings out architectural edges, and eliminates washed-out look. */}
      <BrightnessContrast
        brightness={-0.015}
        contrast={0.16}
      />

      {/* ── Subtle Vignette ───────────────────────────────────────────────
          Very light edge framing that guides the eye without darkening textures. */}
      <Vignette
        offset={0.32}
        darkness={isCinematic ? 0.40 : 0.26}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ── ACES Filmic Tone Mapping ──────────────────────────────────────
          Natural highlight roll-off and rich shadow contrast for crisp realism. */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.2}
        middleGrey={exposure}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={1.0}
      />

    </EffectComposer>
  );
}

