import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------
 * Stable geometry stored in refs and generated ONCE on first mount.
 * Stored in normalized coords (xNorm = 0..1 across the paper rectangle)
 * so resize doesn't re-randomize the rip or the drips — they restretch
 * with the paper.
 * ----------------------------------------------------------------------- */
interface TearPoint {
  xNorm: number;
  yOffset: number;
}
interface Drip {
  xNorm: number;
  targetLength: number;
  width: number;
  startDelay: number;
  growDuration: number;
  hasPool: boolean;
}
interface CoverRect {
  /** Top-left + size in viewport pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
}

const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);
const STAGGER_DELAYS = [0.5, 1.2, 2.1, 3.4, 4.0, 5.5] as const;

/** Book cover aspect ratio (width / height). 2/3 = standard trade paperback. */
const COVER_ASPECT = 2 / 3;

/** Fraction of viewport the cover may occupy. */
const COVER_MAX_W_RATIO = 0.85;
const COVER_MAX_H_RATIO = 0.92;

const C = {
  bg:          '#0A0806',
  paper:       'rgba(232, 220, 190, 0.07)',
  tear:        'rgba(100, 12, 12, 0.65)',
  seepTop:     'rgba(100, 12, 12, 0)',
  seepBottom:  'rgba(100, 12, 12, 0.18)',
  dripTop:     'rgba(120, 15, 15, 0.7)',
  dripMid:     'rgba(80, 8, 8, 0.2)',
  dripEnd:     'rgba(80, 8, 8, 0)',
  dripTipFill: 'rgba(80, 8, 8, 0.45)',
};

/** Compute a book-cover-proportioned rect centered in the viewport. */
function computeCover(vw: number, vh: number): CoverRect {
  const maxW = vw * COVER_MAX_W_RATIO;
  const maxH = vh * COVER_MAX_H_RATIO;
  // The cover is portrait — height is the longer dimension. We pick the
  // largest box that satisfies BOTH max-w and max-h while staying 2:3.
  const widthFromHeight = maxH * COVER_ASPECT;
  const w = Math.min(maxW, widthFromHeight);
  const h = w / COVER_ASPECT;
  const x = (vw - w) / 2;
  const y = (vh - h) / 2;
  return { x, y, w, h };
}

export default function WoundCover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tearPointsRef = useRef<TearPoint[]>([]);
  const dripsRef = useRef<Drip[]>([]);
  const startTimeRef = useRef<number>(0);

  // React state for cover rect — drives both the canvas (via coverRef) and
  // the wrapper div around the text DOM elements.
  const [cover, setCover] = useState<CoverRect>(() =>
    computeCover(
      typeof window !== 'undefined' ? window.innerWidth : 1024,
      typeof window !== 'undefined' ? window.innerHeight : 768,
    ),
  );

  // A ref mirror of `cover` so the rAF loop doesn't get a stale closure.
  const coverRef = useRef(cover);
  useEffect(() => {
    coverRef.current = cover;
  }, [cover]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-derive cover dims for the new viewport.
      setCover(computeCover(w, h));
    };
    resize();
    window.addEventListener('resize', resize);

    // Stable geometry generated exactly once. Resize doesn't wipe these.
    if (tearPointsRef.current.length === 0) {
      const numPoints = 50;
      const pts: TearPoint[] = [];
      for (let i = 0; i <= numPoints; i++) {
        pts.push({
          xNorm: i / numPoints,
          yOffset: (Math.random() - 0.5) * 12,
        });
      }
      tearPointsRef.current = pts;
    }

    if (dripsRef.current.length === 0) {
      const isMobile = window.innerWidth < 768;
      const dripCount = isMobile ? 3 : 5;
      const drips: Drip[] = [];
      for (let i = 0; i < dripCount; i++) {
        drips.push({
          xNorm: 0.1 + Math.random() * 0.8,
          targetLength: 40 + Math.random() * 100,
          width: 1.5 + Math.random() * 1.0,
          startDelay: STAGGER_DELAYS[i] ?? 5.5,
          growDuration: 6 + Math.random() * 6,
          hasPool: i < 3 && Math.random() > 0.35,
        });
      }
      dripsRef.current = drips;
    }

    startTimeRef.current = performance.now();
    let rafId = 0;

    const draw = () => {
      const now = performance.now();
      const t = reduceMotion ? 999 : (now - startTimeRef.current) / 1000;

      const cv = coverRef.current;
      const paperX = cv.x;
      const paperY = cv.y;
      const paperW = cv.w;
      const paperH = cv.h;

      // ── Background ──
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);

      // ── Paper rectangle (book cover) ──
      ctx.fillStyle = C.paper;
      ctx.fillRect(paperX, paperY, paperW, paperH);

      // ── The Tear (jagged path across the cover at 52% height) ──
      const tearY = paperY + paperH * 0.52;
      ctx.beginPath();
      const pts = tearPointsRef.current;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x = paperX + p.xNorm * paperW;
        const y = tearY + p.yOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.tear;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Blood seep above the tear ──
      const seepProgress = EASE_OUT_CUBIC(Math.min(1, t / 4));
      const seepHeight = seepProgress * 80;
      if (seepHeight > 0) {
        const seepGrad = ctx.createLinearGradient(0, tearY - seepHeight, 0, tearY);
        seepGrad.addColorStop(0, C.seepTop);
        seepGrad.addColorStop(1, C.seepBottom);
        ctx.fillStyle = seepGrad;
        ctx.fillRect(paperX, tearY - seepHeight, paperW, seepHeight);
      }

      // ── Drips ──
      for (const drip of dripsRef.current) {
        if (t < drip.startDelay) continue;
        const dt = t - drip.startDelay;
        const dp = Math.min(1, dt / drip.growDuration);
        const dripLen = EASE_OUT_CUBIC(dp) * drip.targetLength;
        if (dripLen <= 0) continue;

        const dripX = paperX + drip.xNorm * paperW;
        const halfW = drip.width / 2;
        const tipY = tearY + dripLen;

        const grad = ctx.createLinearGradient(0, tearY, 0, tipY);
        grad.addColorStop(0, C.dripTop);
        grad.addColorStop(0.7, C.dripMid);
        grad.addColorStop(1, C.dripEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(dripX - halfW, tearY, drip.width, dripLen);

        if (dripLen > 5) {
          ctx.fillStyle = C.dripTipFill;
          ctx.beginPath();
          ctx.ellipse(dripX, tipY, drip.width * 0.55, drip.width * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (drip.hasPool && dp > 0.9) {
          const poolSecs = dt - drip.growDuration * 0.9;
          const poolP = Math.min(1, poolSecs / 1);
          const poolAlpha = poolP * 0.15;
          const poolGrad = ctx.createRadialGradient(dripX, tipY, 0, dripX, tipY, 12);
          poolGrad.addColorStop(0, `rgba(80, 8, 8, ${poolAlpha})`);
          poolGrad.addColorStop(1, 'rgba(80, 8, 8, 0)');
          ctx.fillStyle = poolGrad;
          ctx.beginPath();
          ctx.arc(dripX, tipY, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Ember glow at the tear's two ends (4s slow pulse) ──
      const emberAlpha = 0.06 + 0.04 * (0.5 + 0.5 * Math.sin((t * Math.PI) / 2));
      for (const xEnd of [paperX, paperX + paperW]) {
        const emberGrad = ctx.createRadialGradient(xEnd, tearY, 0, xEnd, tearY, 80);
        emberGrad.addColorStop(0, `rgba(140, 40, 10, ${emberAlpha})`);
        emberGrad.addColorStop(1, 'rgba(140, 40, 10, 0)');
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(xEnd, tearY, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    if (reduceMotion) draw();
    else rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const ease = [0.33, 1, 0.68, 1] as const;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Canvas — paper, tear, blood, embers. z-0 */}
      <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-0" />

      {/* Film grain — static SVG noise overlay. z-1 */}
      <svg
        aria-hidden
        className="fixed inset-0 z-[1] pointer-events-none w-full h-full"
        style={{ mixBlendMode: 'multiply', opacity: 0.25 }}
      >
        <filter id="wound-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#wound-grain)" />
      </svg>

      {/* Cover frame — text positioned inside the book-cover area so it
          stays anchored to the artifact on any screen size. */}
      <div
        className="absolute z-10"
        style={{
          left: cover.x,
          top: cover.y,
          width: cover.w,
          height: cover.h,
        }}
      >
        {/* Book label — 14% from cover top */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease }}
          className="absolute left-1/2 -translate-x-1/2 font-ui text-[clamp(0.55rem,1.4vw,0.7rem)] uppercase whitespace-nowrap"
          style={{
            top: '14%',
            color: 'rgba(180, 160, 130, 0.4)',
            fontWeight: 500,
            letterSpacing: '0.3em',
          }}
        >
          A Novel in Two Worlds
        </motion.p>

        {/* Title — 26% from cover top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center w-full"
          style={{ top: '26%' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1.4, ease }}
            className="font-display leading-[0.9]"
            style={{
              fontSize: 'clamp(2.5rem, 11vmin, 5.5rem)',
              fontWeight: 300,
              color: 'rgba(220, 205, 185, 0.92)',
              letterSpacing: '-0.04em',
              fontVariationSettings: "'opsz' 144, 'SOFT' 80",
            }}
          >
            Between
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 1.4, ease }}
            className="font-display italic leading-[0.9]"
            style={{
              fontSize: 'clamp(2.5rem, 11vmin, 5.5rem)',
              fontWeight: 200,
              color: 'rgba(200, 185, 160, 0.88)',
              letterSpacing: '-0.04em',
              fontVariationSettings: "'opsz' 144, 'SOFT' 80",
            }}
          >
            Two Ruins
          </motion.h1>
        </div>

        {/* Tagline — 68% from cover top */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1.0, ease }}
          className="absolute left-1/2 -translate-x-1/2 text-center font-body italic"
          style={{
            top: '68%',
            fontSize: 'clamp(0.9rem, 2.2vmin, 1.05rem)',
            color: 'rgba(160, 140, 115, 0.6)',
            lineHeight: 1.8,
            maxWidth: '90%',
            width: 'max-content',
          }}
        >
          Some ghosts are born from loss.<br />
          Others from the things we cannot forgive.
        </motion.p>

        {/* CTA — 82% from cover top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.8, ease }}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '82%' }}
        >
          <Link
            to="/read"
            className="wound-cta inline-flex items-center gap-3 font-ui text-[clamp(0.6rem,1.4vmin,0.7rem)] uppercase px-8 py-3"
            style={{ letterSpacing: '0.25em' }}
          >
            Begin Reading
            <span aria-hidden>&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
