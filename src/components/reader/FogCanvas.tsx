import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  r: number;   // radius
  vx: number;
  vy: number;  // upward → negative
  a: number;   // baseline alpha
}

const PARTICLE_COUNT = 50;
const COLOR = '160, 130, 100';

/**
 * Drifting fog particles painted on a fixed full-viewport canvas. The
 * canvas itself fades in from decay 0.2 via CSS (var --decay), so this
 * component just keeps the simulation running — it doesn't need to know
 * about decay at all.
 *
 * Performance:
 *  - 50 particles, ~circle fill, single rAF loop. Trivial on the GPU.
 *  - Canvas drawn off the main React tree; React only mounts/unmounts it.
 *  - Honors `prefers-reduced-motion` by not starting the loop.
 *  - Resizes via ResizeObserver — no per-frame DPR cost.
 */
export default function FogCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced-motion users: skip the loop entirely.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Seed particles.
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.05 + Math.random() * 0.25),
      a: 0.2 + Math.random() * 0.5,
    }));

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Respawn at the bottom when a particle drifts off the top.
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${COLOR}, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="layer-fog-canvas" aria-hidden />;
}
