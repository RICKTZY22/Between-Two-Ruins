import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ChapterNavProps {
  current: number;
  total: number;
}

/**
 * Floating top header. Sits at z-80 (above all decay/blood layers) and
 * inherits color from the live `--decay-text-color` variable so the title
 * stays legible as the page rots.
 *
 * Background goes from fully transparent to a translucent veil after the
 * reader has scrolled past the first 40px. No backdrop-filter: the
 * recompute cost over an animated multi-layer composite would dominate.
 */
export default function ChapterNav({ current, total }: ChapterNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      aria-hidden={scrolled}
      className="fixed top-0 inset-x-0 z-[80]"
      style={{
        color: 'var(--decay-text-color, #1F1812)',
        backgroundColor: 'transparent',
        // Title only shows at the top of the page. The moment the reader
        // begins to read (scroll > 40px) we slide it up out of view so the
        // prose has the whole viewport.
        transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
        opacity: scrolled ? 0 : 1,
        pointerEvents: scrolled ? 'none' : 'auto',
        transition: 'transform 500ms ease, opacity 400ms ease',
      }}
    >
      <div className="mx-auto max-w-[42rem] px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-light text-[0.9rem] tracking-tightest hover:opacity-80 transition-opacity"
        >
          Between Two Ruins
        </Link>
        <span className="font-ui text-[0.6rem] uppercase tracking-[0.3em] opacity-60">
          {current} / {total}
        </span>
      </div>
    </header>
  );
}
