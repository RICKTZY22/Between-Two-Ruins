import { useEffect, useMemo, useState } from 'react';

interface DecayBackgroundProps {
  /** Decay intensity 0..1. Drives every visual layer. */
  intensity: number;
}

type RGB = readonly [number, number, number];
type Stop = { at: number; color: RGB };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(stops: Stop[], t: number): RGB {
  const c = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (c >= a.at && c <= b.at) {
      const span = b.at - a.at || 1;
      const f = (c - a.at) / span;
      return [
        Math.round(lerp(a.color[0], b.color[0], f)),
        Math.round(lerp(a.color[1], b.color[1], f)),
        Math.round(lerp(a.color[2], b.color[2], f)),
      ];
    }
  }
  return stops[stops.length - 1].color;
}

const rgb = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

/** Layer 1 — background color shift, anchored to the spec stops. */
const BG_STOPS: Stop[] = [
  { at: 0.0, color: [245, 239, 230] }, // #F5EFE6  warm cream
  { at: 0.2, color: [232, 220, 190] }, // #E8DCBE  dirty yellow-cream
  { at: 0.4, color: [200, 179, 147] }, // #C8B393  aged brown-paper
  { at: 0.6, color: [140, 107, 74] },  // #8C6B4A  rust-brown
  { at: 0.8, color: [58, 42, 31] },    // #3A2A1F  rotten dark
  { at: 1.0, color: [26, 15, 10] },    // #1A0F0A  near-black, red undertone
];

/** Layer 2 — film grain via feTurbulence (baseFrequency 0.85, 4 octaves). */
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`;

/** Layer 4 — wall-rot: low-contrast stains, water marks, peeling vertical seams. */
const WALL_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
  <defs>
    <radialGradient id='stain' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#4a2a14' stop-opacity='0.55'/>
      <stop offset='55%' stop-color='#4a2a14' stop-opacity='0.18'/>
      <stop offset='100%' stop-color='#4a2a14' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='water' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#6b4a26' stop-opacity='0'/>
      <stop offset='68%' stop-color='#6b4a26' stop-opacity='0.2'/>
      <stop offset='88%' stop-color='#3a2010' stop-opacity='0.35'/>
      <stop offset='100%' stop-color='#6b4a26' stop-opacity='0'/>
    </radialGradient>
    <filter id='mottle'>
      <feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='5'/>
      <feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.45 0'/>
    </filter>
  </defs>
  <ellipse cx='110' cy='80'  rx='95'  ry='58' fill='url(#stain)'/>
  <ellipse cx='470' cy='200' rx='110' ry='70' fill='url(#stain)'/>
  <ellipse cx='240' cy='420' rx='100' ry='62' fill='url(#stain)'/>
  <ellipse cx='520' cy='510' rx='80'  ry='48' fill='url(#stain)'/>
  <ellipse cx='340' cy='150' rx='65'  ry='42' fill='url(#water)'/>
  <ellipse cx='90'  cy='340' rx='75'  ry='48' fill='url(#water)'/>
  <line x1='80'  y1='30' x2='102' y2='585' stroke='#3a2010' stroke-width='0.5'  stroke-opacity='0.22'/>
  <line x1='488' y1='10' x2='462' y2='592' stroke='#3a2010' stroke-width='0.5'  stroke-opacity='0.18'/>
  <line x1='250' y1='5'  x2='268' y2='595' stroke='#3a2010' stroke-width='0.4'  stroke-opacity='0.14'/>
  <line x1='380' y1='40' x2='402' y2='580' stroke='#3a2010' stroke-width='0.35' stroke-opacity='0.12'/>
  <rect width='100%' height='100%' filter='url(#mottle)' opacity='0.55'/>
</svg>`;

const grainUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`;
const wallUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(WALL_SVG)}")`;

// Per-layer transitions exist *only* to hide the bg color snap on chapter
// change (the article crossfade above us covers most of it anyway). They
// are intentionally short — long transitions stack up and restart on every
// scroll-driven update, costing Style/Layout/Paint on each frame.
//
// Parallax depth still reads because the underlying value math differs per
// layer (grain ramp vs vignette curve vs wall threshold), even at uniform
// transition speed.
const T_BG     = 'background-color 280ms ease-out';
const T_WALL   = 'opacity 240ms ease-out';
const T_BLEED  = 'background 240ms ease-out, opacity 240ms ease-out';
const T_VIG    = 'background 200ms ease-out';
const T_GRAIN  = 'opacity 160ms ease-out';

/**
 * Hook for Layer 8 — Flicker. Returns true briefly (~80ms) at randomized
 * 30–60s intervals, but only when decay >= 0.7. Consumers apply the resulting
 * boolean as a brief opacity dip on the page wrapper.
 */
export function useDecayFlicker(intensity: number): boolean {
  const [flickering, setFlickering] = useState(false);

  useEffect(() => {
    if (intensity < 0.7) {
      setFlickering(false);
      return;
    }

    let scheduleId: ReturnType<typeof setTimeout> | undefined;
    let activeId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const waitMs = 30_000 + Math.random() * 30_000;
      scheduleId = setTimeout(() => {
        if (cancelled) return;
        setFlickering(true);
        activeId = setTimeout(() => {
          if (cancelled) return;
          setFlickering(false);
          schedule();
        }, 80);
      }, waitMs);
    };
    schedule();

    return () => {
      cancelled = true;
      if (scheduleId) clearTimeout(scheduleId);
      if (activeId) clearTimeout(activeId);
    };
  }, [intensity]);

  return flickering;
}

/**
 * The atmospheric decay backdrop. Six visual layers stack here (1, 4, 5, 3, 2
 * in render order = bottom-up). Layer 6 (pane-wide filter), Layer 7 (text
 * aging), and Layer 8 (flicker) are applied by the consuming ChapterReader.
 *
 * Fixed to the viewport so it stays put while the chapter scrolls past it.
 */
export default function DecayBackground({ intensity }: DecayBackgroundProps) {
  const v = useMemo(() => {
    const i = Math.max(0, Math.min(1, intensity));

    const bg = lerpColor(BG_STOPS, i);
    const grainOpacity = i * 0.35;

    // Layer 3 — vignette: invisible at 0; ~12% edges at 0.5; ~60% at 1.0.
    const vignetteAlpha =
      i <= 0.5 ? (i / 0.5) * 0.12 : 0.12 + ((i - 0.5) / 0.5) * 0.48;

    // Layer 4 — wall rot: hidden until 0.35; max 0.35 at 1.0.
    const wallOpacity = i < 0.35 ? 0 : ((i - 0.35) / 0.65) * 0.35;

    // Layer 5 — edge bleed: hidden until 0.45; opacity ramps to 1 at 1.0.
    // (Spread is baked into the static gradient at its max value; opacity
    // carries the intensity, so the layer never repaints.)
    const bleedOpacity = i < 0.45 ? 0 : (i - 0.45) / 0.55;

    return { bg, grainOpacity, vignetteAlpha, wallOpacity, bleedOpacity };
  }, [intensity]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      // CSS containment + GPU composite hint. `contain` tells the browser
      // nothing inside this subtree affects outside layout/paint, unlocking
      // aggressive isolation. translateZ(0) keeps the stack on the GPU.
      style={{
        transform: 'translateZ(0)',
        contain: 'layout style paint',
      }}
    >
      {/* Layer 1 — background color shift (far wall — slowest).
          Color changes only on chapter transitions; cheap to leave as-is. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: rgb(v.bg),
          transition: T_BG,
          transform: 'translateZ(0)',
        }}
      />

      {/* Layer 4 — wallpaper / wall-rot (mid-wall).
          Static SVG bg, opacity-only animation = compositor-only update. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: wallUrl,
          backgroundSize: '600px 600px',
          backgroundRepeat: 'repeat',
          opacity: v.wallOpacity,
          mixBlendMode: 'multiply',
          transition: T_WALL,
          transform: 'translateZ(0)',
          willChange: 'opacity',
        }}
      />

      {/* Layer 5 — edge bleed (near atmosphere).
          Gradient painted ONCE at max alpha + max spread. Opacity ramps
          0→1 as decay crosses 0.45→1.0. Visual is near-identical to the
          previous dynamic-spread variant but the layer never re-paints. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 0% 0%,    rgba(38, 22, 12, 0.85) 0%, transparent 60%),
            radial-gradient(circle at 100% 0%,  rgba(45, 26, 14, 0.85) 0%, transparent 60%),
            radial-gradient(circle at 0% 100%,  rgba(38, 22, 12, 0.85) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(45, 26, 14, 0.85) 0%, transparent 60%)
          `,
          opacity: v.bleedOpacity,
          mixBlendMode: 'multiply',
          transition: T_BLEED,
          transform: 'translateZ(0)',
          willChange: 'opacity',
        }}
      />

      {/* Layer 3 — vignette (air / depth field).
          Gradient painted ONCE at full edge alpha. Opacity carries the
          intensity ramp — pure compositor work, no per-frame re-paint. */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,1) 100%)',
          opacity: v.vignetteAlpha,
          transition: T_VIG,
          transform: 'translateZ(0)',
          willChange: 'opacity',
        }}
      />

      {/* Layer 2 — film grain (screen / lens — fastest, closest to the eye).
          Static SVG noise; opacity carries the ramp. GPU-composite layer. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: grainUrl,
          backgroundRepeat: 'repeat',
          opacity: v.grainOpacity,
          mixBlendMode: 'multiply',
          transition: T_GRAIN,
          transform: 'translateZ(0)',
          willChange: 'opacity',
        }}
      />
    </div>
  );
}
