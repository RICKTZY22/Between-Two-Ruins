import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ---------------------------------------------------------------------------
 * PhotoCover — a Silent Hill 2-style poster cover.
 *
 * A single full-bleed cover photo is pushed toward a sickly, desaturated
 * green and then buried under grunge: vignette, film grain, horizontal
 * smear/scanlines, and a torn bone-white band carrying a heavy distressed
 * title.
 *
 * The artwork is loaded from `public/cover-art.jpg`. Drop your own image at
 * that path and it appears automatically — no code change needed. Until then
 * a styled placeholder stands in.
 * ------------------------------------------------------------------------- */

/** Replace this file in /public to swap the cover art. */
const COVER_IMG = '/cover-art.jpg';

const EASE = [0.33, 1, 0.68, 1] as const;

export default function PhotoCover() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#070b07' }}>
      {/* Soft outer glow so the poster doesn't sit on dead black. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 45%, rgba(60,80,45,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Cover frame — portrait 2:3, centered, the whole "poster". */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="relative h-[94vh] max-h-[94vh] overflow-hidden"
          style={{
            aspectRatio: '2 / 3',
            maxWidth: '94vw',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* ── Layer 0: the photo (or placeholder) ───────────────────────
              The filter stack drains saturation, sepia-shifts, then rotates
              hue into the sickly Silent Hill green. */}
          {imgOk ? (
            <img
              src={COVER_IMG}
              alt=""
              onError={() => setImgOk(false)}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter:
                  'grayscale(0.35) sepia(0.55) hue-rotate(40deg) saturate(0.85) contrast(1.12) brightness(0.92)',
              }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-center"
              style={{
                background:
                  'radial-gradient(ellipse 72% 46% at 50% 36%, #4a5c38 0%, #283520 42%, #0d140a 100%)',
              }}
            >
              <div
                className="font-ui uppercase"
                style={{ color: 'rgba(205,222,185,0.4)', letterSpacing: '0.32em' }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '1rem', opacity: 0.5 }}>▢</div>
                <div style={{ fontSize: '0.72rem' }}>Cover image placeholder</div>
                <div style={{ fontSize: '0.58rem', opacity: 0.6, marginTop: '0.6rem' }}>
                  drop your art at public/cover-art.jpg
                </div>
              </div>
            </div>
          )}

          {/* ── Layer 1: sickly green colour wash (multiply) ─────────────── */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              mixBlendMode: 'multiply',
              background:
                'linear-gradient(160deg, rgba(70,92,48,0.55) 0%, rgba(40,58,32,0.45) 45%, rgba(18,28,14,0.75) 100%)',
            }}
          />

          {/* ── Layer 2: green light-leak / lift (screen) ────────────────── */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              mixBlendMode: 'screen',
              background:
                'radial-gradient(ellipse 55% 38% at 50% 34%, rgba(150,170,90,0.22) 0%, transparent 65%)',
            }}
          />

          {/* ── Layer 3: vignette ────────────────────────────────────────── */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 80% at 50% 45%, transparent 40%, rgba(6,10,6,0.55) 78%, rgba(4,7,4,0.9) 100%)',
            }}
          />

          {/* ── Layer 4: horizontal smear / scanlines ────────────────────── */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.5,
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 2px, transparent 5px)',
            }}
          />
          {/* A few brighter horizontal tear-streaks. */}
          <div
            aria-hidden
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: '9%',
              height: '2px',
              background:
                'linear-gradient(90deg, transparent, rgba(220,225,190,0.35) 30%, rgba(220,225,190,0.1) 60%, transparent)',
            }}
          />
          <div
            aria-hidden
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: '63%',
              height: '3px',
              background:
                'linear-gradient(90deg, transparent, rgba(40,50,28,0.6) 20%, rgba(180,190,150,0.18) 55%, transparent)',
            }}
          />

          {/* ── Layer 5: film grain ──────────────────────────────────────── */}
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: 'overlay', opacity: 0.4 }}
          >
            <filter id="cover-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.8 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#cover-grain)" />
          </svg>

          {/* ── Title block — torn band + heavy distressed type ──────────── */}
          <div className="absolute inset-x-0" style={{ bottom: '11%' }}>
            {/* Torn bone-white band behind the title. */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scaleX: 0.9 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: EASE }}
              className="absolute inset-x-[-2%]"
              style={{
                top: '-8%',
                bottom: '-8%',
                background:
                  'linear-gradient(180deg, rgba(214,210,188,0.0) 0%, rgba(214,210,188,0.86) 18%, rgba(224,220,198,0.9) 50%, rgba(206,202,180,0.84) 82%, rgba(214,210,188,0.0) 100%)',
                clipPath:
                  'polygon(0% 22%, 6% 14%, 14% 20%, 23% 11%, 34% 19%, 45% 10%, 57% 18%, 68% 9%, 79% 17%, 89% 11%, 96% 19%, 100% 14%, 100% 84%, 92% 90%, 83% 82%, 72% 91%, 61% 83%, 50% 92%, 39% 84%, 28% 91%, 18% 83%, 9% 90%, 0% 84%)',
                mixBlendMode: 'screen',
              }}
            />
            {/* Title text — heavy, condensed, near-black. */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1.3, ease: EASE }}
              className="relative font-display uppercase text-center leading-[0.82]"
              style={{
                fontWeight: 900,
                color: '#15140f',
                letterSpacing: '-0.02em',
                fontVariationSettings: "'opsz' 144, 'wght' 900, 'SOFT' 0",
                textShadow: '0 1px 0 rgba(255,255,255,0.15)',
                fontSize: 'clamp(1.9rem, 9.5vmin, 4.2rem)',
              }}
            >
              Between
              <br />
              Two Ruins
            </motion.h1>
          </div>

          {/* ── Top label ────────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.2, ease: EASE }}
            className="absolute left-1/2 -translate-x-1/2 font-ui uppercase whitespace-nowrap text-center"
            style={{
              top: '6%',
              color: 'rgba(210,225,190,0.5)',
              fontSize: 'clamp(0.5rem,1.3vmin,0.65rem)',
              letterSpacing: '0.34em',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}
          >
            A Novel in Two Worlds
          </motion.p>

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 1.0, ease: EASE }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '4%' }}
          >
            <Link
              to="/read"
              className="cover-cta inline-flex items-center gap-3 font-ui uppercase px-8 py-3"
              style={{
                fontSize: 'clamp(0.6rem,1.4vmin,0.7rem)',
                letterSpacing: '0.26em',
              }}
            >
              Begin Reading
              <span aria-hidden>&rarr;</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
