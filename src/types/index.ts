import type { ReactNode } from 'react';

export interface Chapter {
  /** Stable id, e.g. "ch01-josef" */
  id: string;
  /** Sequential number within Act 1, 1..10 */
  number: number;
  /** Display title */
  title: string;
  /** Atmospheric decay 0..1 (Silent Hill 2 style — drives DecayBackground + text aging) */
  decayIntensity: number;
  /** The chapter prose (JSX) */
  content: ReactNode;
}
