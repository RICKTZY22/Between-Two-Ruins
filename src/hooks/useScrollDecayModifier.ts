import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SET_STATE_THRESHOLD = 0.005;

/**
 * Returns a live scroll-based modifier (0 → MAX_MODIFIER) that is added on
 * top of a chapter's base `decayIntensity`. As the reader scrolls from the
 * top to the bottom of a chapter, the decay subtly intensifies.
 *
 * Performance notes:
 *  - GSAP's `onUpdate` can fire on every scroll event (60–120 Hz on modern
 *    devices). We coalesce updates through requestAnimationFrame so multiple
 *    scroll events in the same frame collapse to a single React render.
 *  - We only call setState when the value has changed by more than
 *    SET_STATE_THRESHOLD (~0.5% of the modifier range). Below that, the
 *    visual difference is imperceptible and a render is wasted work.
 *  - Across a full scroll, this caps re-renders at roughly 15–25 instead of
 *    hundreds — and the consumer (ChapterReader) keeps the filter / text
 *    color on baseDecay so a render here only re-paints the background
 *    layers, not the prose.
 *
 * The modifier resets to 0 on chapter change and waits 50ms before
 * installing a new ScrollTrigger to avoid the value jumping during the
 * AnimatePresence chapter-crossfade (400ms).
 */
export function useScrollDecayModifier(chapterNumber: number): number {
  const [modifier, setModifier] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingValueRef = useRef(0);
  const lastSetValueRef = useRef(0);

  // Chapters 1–5: subtle creep (0 → 0.08); 6–10: stronger (0 → 0.12).
  const maxModifier = chapterNumber <= 5 ? 0.08 : 0.12;

  useEffect(() => {
    // Reset immediately on chapter change so the crossfade sees clean decay.
    setModifier(0);
    lastSetValueRef.current = 0;
    pendingValueRef.current = 0;

    // Delay installation so we don't fight AnimatePresence's 400ms crossfade.
    const installTimer = setTimeout(() => {
      if (stRef.current) {
        stRef.current.kill();
        stRef.current = null;
      }

      stRef.current = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          pendingValueRef.current = self.progress * maxModifier;

          // Coalesce multiple scroll events per frame into a single rAF tick.
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null;
              const next = pendingValueRef.current;
              // Skip the render if the change is imperceptible.
              if (Math.abs(next - lastSetValueRef.current) > SET_STATE_THRESHOLD) {
                lastSetValueRef.current = next;
                setModifier(next);
              }
            });
          }
        },
      });
    }, 50);

    return () => {
      clearTimeout(installTimer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (stRef.current) {
        stRef.current.kill();
        stRef.current = null;
      }
    };
  }, [chapterNumber, maxModifier]);

  return modifier;
}
