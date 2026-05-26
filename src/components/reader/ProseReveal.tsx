import { type ReactNode, useEffect, useRef } from 'react';

interface ProseRevealProps {
  children: ReactNode;
}

const STAGGER_MS = 60;
const MAX_STAGGER_MS = 600;

/**
 * Wraps chapter prose and staggers each paragraph and hr into view as the
 * reader scrolls. Elements start as `.prose-hidden` (opacity 0, translateY
 * 16px) and flip to `.prose-visible` when they enter the viewport.
 *
 * Uses IntersectionObserver (not Framer Motion whileInView) so that zero
 * chapter content files need to be touched — the observer queries the
 * rendered DOM children after mount.
 *
 * Stagger delay: elementIndex × 60ms, capped at 600ms so that paragraphs
 * deep in the document don't all wait a full second when the reader jumps
 * mid-chapter.
 */
export default function ProseReveal({ children }: ProseRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Target prose paragraphs, hr separators, and the tagline opening line.
    const targets = Array.from(
      container.querySelectorAll<HTMLElement>('p, hr'),
    );

    // Assign hidden class and per-element stagger delay before observation.
    targets.forEach((el, idx) => {
      el.classList.add('prose-hidden');
      const delay = Math.min(idx * STAGGER_MS, MAX_STAGGER_MS);
      el.style.transitionDelay = `${delay}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.remove('prose-hidden');
            el.classList.add('prose-visible');
            // Unobserve once revealed — each element only reveals once.
            observer.unobserve(el);
          }
        });
      },
      {
        // Trigger slightly before the element reaches the viewport bottom
        // so it's already animating when the eye arrives.
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      // Clean up classes if the component remounts (chapter change).
      targets.forEach((el) => {
        el.classList.remove('prose-hidden', 'prose-visible');
        el.style.transitionDelay = '';
      });
    };
  }, [children]); // Re-run when chapter content changes (key-based remount).

  return <div ref={ref}>{children}</div>;
}
