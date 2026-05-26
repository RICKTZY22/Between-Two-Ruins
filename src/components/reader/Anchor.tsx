import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnchorProps {
  /** The visible surface phrase, inline in the prose. */
  children: ReactNode;
  /** The hidden inner thought revealed beneath the phrase. */
  inner: ReactNode;
}

/**
 * Inline reveal — a surface phrase the reader can tap to expose the
 * character's hidden inner thought. Marginalia in feel: italic, dimmed, with
 * a thin accent line on the left.
 *
 * Implementation notes:
 *  - The button is a phrasing-content `<button>` so it's safe inside `<p>`.
 *  - The reveal is a `<motion.span>` with `display: block` so it wraps onto
 *    its own line while remaining a valid descendant of `<p>`.
 *  - State is local. Multiple anchors can be open simultaneously. It does
 *    NOT persist across reloads or chapter changes.
 */
export default function Anchor({ children, inner }: AnchorProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={
          'group cursor-pointer bg-transparent p-0 m-0 font-inherit text-inherit ' +
          'border-0 border-b border-dotted align-baseline ' +
          'transition-[border-color,border-style] duration-200 ' +
          (open
            ? 'border-solid border-human-accent/90 '
            : 'border-human-accent/25 hover:border-solid hover:border-human-accent/90 ')
        }
        style={{ font: 'inherit', color: 'inherit' }}
      >
        {children}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            id={id}
            key="reveal"
            variants={{
              open: {
                height: 'auto',
                opacity: 0.7,
                transition: {
                  // Opens heavy and reluctant — like cracking a wax seal.
                  height: { type: 'spring', stiffness: 280, damping: 24, mass: 0.8, restDelta: 0.001 },
                  // Text seeps in slightly after the space opens.
                  opacity: { duration: 0.35, ease: 'easeIn' },
                },
              },
              closed: {
                height: 0,
                opacity: 0,
                transition: {
                  // Snaps shut decisively — closing feels final.
                  height: { type: 'spring', stiffness: 340, damping: 32 },
                  opacity: { duration: 0.15, ease: 'easeOut' },
                },
              },
            }}
            initial="closed"
            animate="open"
            exit="closed"
            className="block italic text-[0.95em] my-3 pl-4 border-l-2 border-human-accent/40"
            style={{ overflow: 'hidden' }}
          >
            {inner}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}
