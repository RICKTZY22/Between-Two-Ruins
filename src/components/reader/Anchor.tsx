import { useId, useState, type ReactNode, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnchorProps {
  children: ReactNode;
  inner: ReactNode;
}

/**
 * Inline reveal — a surface phrase the reader taps to expose the
 * character's hidden inner thought. Marginalia in feel.
 *
 * On open: spawns a blood-tinted ripple at the click coordinates and a
 * decay-spike overlay across the viewport, both via brief CSS animations.
 * The animations are removed from the DOM after they finish, so memory
 * stays bounded even if the reader keeps opening anchors.
 */
export default function Anchor({ children, inner }: AnchorProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) spawnEffects(e.clientX, e.clientY);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    // The button's native click handler covers mouse; we only need this for
    // keyboard activation so the ripple has sane coordinates (center of the
    // button rect).
    if (!open) {
      const rect = e.currentTarget.getBoundingClientRect();
      spawnEffects(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls={id}
        className="anchor-trigger"
      >
        {children}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            id={id}
            key="reveal"
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 200, opacity: 1 }}
            exit={{ maxHeight: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="anchor-reveal"
          >
            {inner}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}

/** Spawn the ripple + decay-spike overlays at the given viewport coords. */
function spawnEffects(x: number, y: number) {
  // Ripple — radial gradient, 200×200, scale 0 → 1, opacity 1 → 0 over 700ms.
  const ripple = document.createElement('div');
  ripple.className = 'anchor-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  // Safety net in case animationend is missed (e.g., tab backgrounded).
  setTimeout(() => ripple.remove(), 1200);

  // Decay spike — viewport-wide blood-tinted veil, 2s, opacity 0→1→0.
  const spike = document.createElement('div');
  spike.className = 'anchor-spike';
  document.body.appendChild(spike);
  spike.addEventListener('animationend', () => spike.remove(), { once: true });
  setTimeout(() => spike.remove(), 2500);
}
