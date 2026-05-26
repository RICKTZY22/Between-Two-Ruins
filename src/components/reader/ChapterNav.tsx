import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ChapterNavProps {
  current: number;
  total: number;
}

/**
 * Floating top header for the reader. Title on the left, progress on the
 * right. Transparent at the top of the page; gains a subtle backdrop-blur
 * once the reader has scrolled.
 */
export default function ChapterNav({ current, total }: ChapterNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      // No backdrop-blur — over an animated multi-layer composite, the GPU
      // has to recompute the blur every frame, which dominates scroll cost.
      // A flat semi-opaque overlay reads almost identically and is free.
      className={
        'fixed top-0 inset-x-0 z-50 transition-colors duration-500 ' +
        (scrolled ? 'bg-current/[0.08]' : '')
      }
    >
      <div className="mx-auto max-w-[42rem] px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-light text-base tracking-tightest hover:opacity-80 transition-opacity"
        >
          Between Two Ruins
        </Link>
        <span className="font-ui text-[0.65rem] uppercase tracking-[0.3em] opacity-60">
          {current} / {total}
        </span>
      </div>
    </header>
  );
}
