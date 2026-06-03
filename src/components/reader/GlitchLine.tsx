import type { ReactNode } from 'react';

export type GlitchType = 'chromatic' | 'tear' | 'ghost' | 'scramble' | 'shift';

interface GlitchLineProps {
  type: GlitchType;
  /** Animation-delay in seconds (negative to start mid-cycle). Default 0. */
  delay?: number;
  /**
   * Run the glitch even when ambient decay is below the 0.3 threshold.
   * Use for individually-haunted lines in otherwise-clean chapters.
   */
  force?: boolean;
  children: ReactNode;
}

/**
 * Inline span that runs one of the 5 glitch keyframe animations on its text.
 * The `::after` pseudo carries the red ghost-text (via `data-text`).
 *
 * Animation runs continuously but the glitch *burst* lives in a narrow band
 * of the keyframe (e.g. 90–94%), so the line reads cleanly most of the time
 * and "interferes" briefly. Pause is controlled globally by the
 * `.decay-active-30` class on a DecayEngine ancestor — once decay >= 0.3
 * the animations resume; below that they're paused mid-frame and invisible.
 *
 * `delay` lets callers stagger multiple lines so the bursts don't line up.
 */
export default function GlitchLine({ type, delay = 0, force = false, children }: GlitchLineProps) {
  // The ghost layer reads `data-text` to render the same string. Only string
  // children get a meaningful ghost; if a caller passes JSX, we still apply
  // the main animation but skip the ghost text.
  const text = typeof children === 'string' ? children : undefined;

  return (
    <span
      className={`glitch active ${type}${force ? ' glitch-force' : ''}`}
      data-text={text}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}
