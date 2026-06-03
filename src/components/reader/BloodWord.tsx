import type { ReactNode } from 'react';

interface BloodWordProps {
  children: ReactNode;
}

/**
 * Marks a word or phrase as emotionally loaded — at low decay it reads as
 * normal prose; once decay >= 0.4 (controlled by `.decay-blood-active` on a
 * DecayEngine ancestor), it shifts to dried-blood color with a soft glow.
 *
 * Transition is 1.5s, so chapter changes that cross the 0.4 threshold feel
 * like the words themselves are bleeding through, not switching state.
 */
export default function BloodWord({ children }: BloodWordProps) {
  return <span className="blood-word">{children}</span>;
}
