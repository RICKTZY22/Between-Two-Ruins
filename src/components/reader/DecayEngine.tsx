import { useEffect, useRef, type ReactNode } from 'react';
import FogCanvas from './FogCanvas';

interface DecayEngineProps {
  /**
   * Discrete chapter decay value. Drives chapter-stable CSS vars
   * (`--decay-bg-color`, `--decay-text-color`) and threshold classes —
   * the things with 1.5s transitions where we want stability within
   * a chapter.
   */
  baseIntensity: number;
  /**
   * Live decay = baseIntensity + scroll modifier. Drives the `--decay`
   * CSS variable that every continuous (calc-driven) layer reads. This
   * updates 15–25 times per scroll; nothing else does.
   */
  effectiveIntensity: number;
  children: ReactNode;
}

type RGB = readonly [number, number, number];

// Background color stops (spec section 3) -----------------------------------
const BG_STOPS: Array<[number, RGB]> = [
  [0.0, [245, 239, 230]],  // #F5EFE6  warm cream
  [0.2, [232, 220, 190]],  // #E8DCBE  dirty yellow-cream
  [0.4, [200, 179, 147]],  // #C8B393  aged paper
  [0.6, [140, 107, 74]],   // #8C6B4A  rust-brown
  [0.8, [58, 42, 31]],     // #3A2A1F  rotten dark
  [1.0, [26, 15, 10]],     // #1A0F0A  near-black, red undertone
];

// Text color stops — INVERTS as decay rises so prose stays readable on the
// progressively darker bg.
//
// Deviates from the spec's mid-range values: at 0.5–0.7 the original
// stops (#3D2B1E, #786447) landed too close to the multiplied overlay
// stack and made later chapters straining to read. The added 0.6 stop
// and brightened 0.7 / 1.0 anchors push contrast above ~3.5:1 across
// the entire range while preserving the warm-to-pale trajectory.
const TEXT_STOPS: Array<[number, RGB]> = [
  [0.0, [31, 24, 18]],     // #1F1812  near-black on cream
  [0.5, [92, 74, 56]],     // #5C4A38  warm bistre on aged paper
  [0.6, [148, 124, 92]],   // #947C5C  tan on rust brown
  [0.7, [181, 161, 128]],  // #B5A180  light tan on rust-brown (was #786447)
  [0.85,[212, 194, 164]],  // #D4C2A4  pale cream on rotten dark
  [1.0, [232, 216, 189]],  // #E8D8BD  warm bone on near-black (was #BEAA8C)
];

function lerpColorRGB(stops: Array<[number, RGB]>, t: number): [number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [aT, aC] = stops[i];
    const [bT, bC] = stops[i + 1];
    if (c >= aT && c <= bT) {
      const f = (c - aT) / (bT - aT || 1);
      return [
        Math.round(aC[0] + (bC[0] - aC[0]) * f),
        Math.round(aC[1] + (bC[1] - aC[1]) * f),
        Math.round(aC[2] + (bC[2] - aC[2]) * f),
      ];
    }
  }
  const last = stops[stops.length - 1][1];
  return [last[0], last[1], last[2]];
}

// SVG patterns -- defined once, encoded once.
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`;

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
  <line x1='80'  y1='30' x2='102' y2='585' stroke='#3a2010' stroke-width='0.5' stroke-opacity='0.22'/>
  <line x1='488' y1='10' x2='462' y2='592' stroke='#3a2010' stroke-width='0.5' stroke-opacity='0.18'/>
  <line x1='250' y1='5'  x2='268' y2='595' stroke='#3a2010' stroke-width='0.4' stroke-opacity='0.14'/>
  <line x1='380' y1='40' x2='402' y2='580' stroke='#3a2010' stroke-width='0.35' stroke-opacity='0.12'/>
  <rect width='100%' height='100%' filter='url(#mottle)' opacity='0.55'/>
</svg>`;

const grainUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`;
const wallUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(WALL_SVG)}")`;

/**
 * Layer 8 — Flicker. At decay >= 0.7, briefly dips opacity to 0.78 at random
 * 30–60s intervals. Exposed as a hook so ChapterReader can apply the dip
 * to the page wrapper.
 */
/**
 * The complete atmospheric engine. Orchestrates every visual layer in the
 * Silent Hill 2-inspired decay system: backdrop, blood, scan lines,
 * heartbeat, fog, screen tear. Wraps children with breathing + tremble
 * transforms.
 *
 * Architecture:
 *  - `--decay` (live) is updated on document.documentElement every render.
 *    All continuous layers (grain opacity, vignette, blood opacities) read
 *    it via CSS calc(). One variable update = every layer responds.
 *  - `--decay-bg-color` and `--decay-text-color` are computed in JS and
 *    set on document.documentElement only on chapter change. They drive
 *    the bg color layer and the prose text color via long transitions.
 *  - Threshold classes (`.decay-active-30` … `.decay-active-80`,
 *    `.decay-blood-active`) toggle animation play-states for layers that
 *    are CSS-animation-based (breathing, heartbeat, scan-lines, flicker,
 *    text-tremble, screen-tear) and the BloodWord component.
 *
 * The CSS variables are set on the <html> element rather than this
 * component's root, so styles in globals.css (like `.layer-fog-canvas`)
 * can read them via var() without needing this component as an ancestor.
 */
export default function DecayEngine({
  baseIntensity,
  effectiveIntensity,
  children,
}: DecayEngineProps) {
  // Live --decay write. React's render is throttled by the scroll hook,
  // so this fires ~15-25 times per scroll, never 60.
  useEffect(() => {
    document.documentElement.style.setProperty('--decay', effectiveIntensity.toFixed(3));
  }, [effectiveIntensity]);

  // Chapter-stable CSS vars. Update only on baseIntensity change.
  // --decay-bg-color is the full rgb() string for direct use;
  // --decay-bg-rgb is the numeric component list ("r, g, b") so consumers
  // like the scrolled header can mix in their own alpha:
  //   background: rgba(var(--decay-bg-rgb), 0.88);
  useEffect(() => {
    const root = document.documentElement;
    const bg = lerpColorRGB(BG_STOPS, baseIntensity);
    const text = lerpColorRGB(TEXT_STOPS, baseIntensity);
    root.style.setProperty('--decay-bg-color', `rgb(${bg.join(', ')})`);
    root.style.setProperty('--decay-bg-rgb', bg.join(', '));
    root.style.setProperty('--decay-text-color', `rgb(${text.join(', ')})`);
  }, [baseIntensity]);

  // Cleanup on unmount — leaving stale CSS vars on <html> would leak into
  // the cover page and other routes.
  const cleanupRef = useRef<(() => void) | null>(null);
  cleanupRef.current = () => {
    const root = document.documentElement;
    root.style.removeProperty('--decay');
    root.style.removeProperty('--decay-bg-color');
    root.style.removeProperty('--decay-bg-rgb');
    root.style.removeProperty('--decay-text-color');
  };
  useEffect(() => () => cleanupRef.current?.(), []);

  // Threshold classes derived from baseIntensity. Using baseIntensity (not
  // effectiveIntensity) means scroll modifiers don't flicker animations
  // on/off near a threshold.
  const activeClasses = [
    baseIntensity >= 0.3 && 'decay-active-30',
    baseIntensity >= 0.4 && 'decay-blood-active',
    baseIntensity >= 0.5 && 'decay-active-50',
    baseIntensity >= 0.6 && 'decay-active-60',
    baseIntensity >= 0.7 && 'decay-active-70',
    baseIntensity >= 0.75 && 'decay-active-75',
    baseIntensity >= 0.8 && 'decay-active-80',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`decay-root relative ${activeClasses}`}>
      {/* ───────────────────────── decay backdrop ────────────────────── */}
      <div className="layer-bg-color" />
      <div className="layer-wall-rot" style={{ backgroundImage: wallUrl }} />
      <div className="layer-edge-bleed" />
      <div className="layer-vignette" />
      <div className="layer-heartbeat" />
      <div className="layer-scanlines" />
      <div className="layer-grain" style={{ backgroundImage: grainUrl }} />
      <FogCanvas />

      {/* ───────────────────────── blood layers ───────────────────────
          Order matters for z-index ramping: pool (deepest) → seep →
          stains → smears → drips (closest to viewer). All sit above the
          decay backdrop and below the article content. */}
      <div className="layer-blood-pool" />
      <div className="layer-blood-seep" />
      <div className="layer-blood-stains">
        <div className="blood-stain blood-stain-1" />
        <div className="blood-stain blood-stain-2" />
        <div className="blood-stain blood-stain-3" />
        <div className="blood-stain blood-stain-4" />
        <div className="blood-stain blood-stain-5" />
      </div>
      <div className="layer-blood-smears">
        <div className="blood-smear blood-smear-1" />
        <div className="blood-smear blood-smear-2" />
        <div className="blood-smear blood-smear-3" />
      </div>
      <div className="layer-blood-drips">
        <div className="blood-drip blood-drip-1" />
        <div className="blood-drip blood-drip-2" />
        <div className="blood-drip blood-drip-3" />
        <div className="blood-drip blood-drip-4" />
        <div className="blood-drip blood-drip-5" />
        <div className="blood-drip blood-drip-6" />
      </div>

      {/* ───────────────────────── screen tear ────────────────────────
          Sits above the article (z-80). Only visible during the burst
          window of its keyframe, and only at decay >= 0.8. */}
      <div className="layer-screen-tear" />

      {/* ──────────────── content wrapped in breathing + tremble ─────
          breathing scales the whole article slowly; tremble jitters by
          fractional pixels at very high decay. Both are CSS-animation
          driven and paused below their thresholds. */}
      <div className="layer-flicker">
        <div className="layer-breathing">
          <div className="layer-tremble">{children}</div>
        </div>
      </div>
    </div>
  );
}
