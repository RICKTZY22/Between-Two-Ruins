import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useChapter } from '@/hooks/useChapter';
import { useReaderStore } from '@/store/readerStore';
import { useScrollDecayModifier } from '@/hooks/useScrollDecayModifier';
import DecayBackground, { useDecayFlicker } from './DecayBackground';
import ChapterNav from './ChapterNav';
import ProseReveal from './ProseReveal';

/**
 * Interpolate text color for Layer 7 across three stops:
 *   0.0  → #1F1812 (31, 24, 18)
 *   0.5  → #3D2B1E (61, 43, 30)
 *   1.0  → #2A1810 (42, 24, 16)
 */
function decayedTextColor(decay: number): string {
  const d = Math.max(0, Math.min(1, decay));
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [31, 24, 18]],
    [0.5, [61, 43, 30]],
    [1.0, [42, 24, 16]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [aT, aC] = stops[i];
    const [bT, bC] = stops[i + 1];
    if (d >= aT && d <= bT) {
      const f = (d - aT) / (bT - aT || 1);
      const r = Math.round(aC[0] + (bC[0] - aC[0]) * f);
      const g = Math.round(aC[1] + (bC[1] - aC[1]) * f);
      const b = Math.round(aC[2] + (bC[2] - aC[2]) * f);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return `rgb(42, 24, 16)`;
}

export default function ChapterReader() {
  const { ch } = useParams<{ ch: string }>();
  const navigate = useNavigate();
  const setLastChapter = useReaderStore((s) => s.setLastChapter);

  const number = ch ? parseInt(ch, 10) : 1;
  const { chapter, prev, next, total } = useChapter(number);

  useEffect(() => {
    if (!chapter) {
      navigate('/', { replace: true });
      return;
    }
    setLastChapter(chapter.number);
  }, [chapter, navigate, setLastChapter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [number]);

  // Two decay values:
  //   - baseDecay: discrete chapter value. Drives the *expensive* effects —
  //     the pane-wide CSS filter (Layer 6) and the text color on the prose
  //     ancestor (Layer 7). These force re-rasterization of the entire
  //     scrolling article when they change, so we keep them stable within
  //     a chapter and let them transition only on chapter change.
  //   - effectiveDecay: baseDecay + GSAP scroll modifier (0–0.12). Drives
  //     only the DecayBackground layers (grain, vignette, wall, bleed, bg).
  //     Those are fixed full-viewport elements painted independently of
  //     the article, so updating them per scroll frame is cheap.
  const baseDecay = chapter?.decayIntensity ?? 0;
  const scrollModifier = useScrollDecayModifier(chapter?.number ?? 0);
  const effectiveDecay = Math.min(1, baseDecay + scrollModifier);
  const flickering = useDecayFlicker(baseDecay);

  if (!chapter) return null;

  // Layer 6 — pane-wide desaturation + hue shift (from baseDecay only)
  const sat = (1 - 0.4 * baseDecay).toFixed(3);
  const hue = (-15 * baseDecay).toFixed(2);
  const filter = `saturate(${sat}) hue-rotate(${hue}deg)`;

  // Layer 7 — text aging color (from baseDecay only)
  const textColor = decayedTextColor(baseDecay);

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        filter,
        opacity: flickering ? 0.75 : 1,
        // Filter transitions smoothly between chapters; opacity is instant
        // for the flicker, and 1.5s when the flicker releases (matches the
        // overall decay rhythm without feeling like a hard cut).
        transition: flickering
          ? 'opacity 0ms linear, filter 1.5s ease-in-out'
          : 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out',
      }}
    >
      <DecayBackground intensity={effectiveDecay} />

      <div
        className="relative z-10"
        style={{ color: textColor, transition: 'color 1.5s ease-in-out' }}
      >
        <ChapterNav current={chapter.number} total={total} />

        <main className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={chapter.id}
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 1.006 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-[42rem] px-6 sm:px-10 pt-24 pb-20 md:pt-28 md:pb-24"
            >
              <header className="mb-12">
                <p className="font-ui text-[0.65rem] uppercase tracking-[0.3em] mb-3 opacity-60">
                  Chapter {chapter.number}
                </p>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight tracking-tightest">
                  {chapter.title}
                </h1>
              </header>

              <div className="prose-chapter">
                <ProseReveal key={chapter.id}>{chapter.content}</ProseReveal>
              </div>

              <nav
                className="mt-24 flex items-center justify-between gap-6 font-ui text-[0.65rem] uppercase tracking-[0.3em] opacity-70"
                aria-label="Chapter navigation"
              >
                <div className="min-w-[1ch]">
                  {prev && (
                    <Link
                      to={`/read/${prev.number}`}
                      className="hover:opacity-100 transition-opacity"
                    >
                      <span aria-hidden>&larr; </span>Previous Chapter
                    </Link>
                  )}
                </div>
                <div className="min-w-[1ch] text-right">
                  {next && (
                    <Link
                      to={`/read/${next.number}`}
                      className="hover:opacity-100 transition-opacity"
                    >
                      Next Chapter<span aria-hidden> &rarr;</span>
                    </Link>
                  )}
                </div>
              </nav>
            </motion.article>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
