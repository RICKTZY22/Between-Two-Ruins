import type { Chapter } from '@/types';
import { ch01Josef } from './ch01-josef';
import { ch02Josef } from './ch02-josef';
import { ch03Josef } from './ch03-josef';
import { ch04Josef } from './ch04-josef';
import { ch05Josef } from './ch05-josef';
import { ch06Josef } from './ch06-josef';
import { ch07Josef } from './ch07-josef';
import { ch08Josef } from './ch08-josef';
import { ch09Josef } from './ch09-josef';
import { ch10Josef } from './ch10-josef';

/**
 * Ordered chapter manifest for Act 1 (Josef). Index 0 is Chapter 1.
 * Decay intensity ramps 0.0 → 1.0 across the act, with the deliberate jump
 * at Chapter 5 (Reyna) where the story digs into the sister's death.
 */
export const chapters: Chapter[] = [
  ch01Josef,
  ch02Josef,
  ch03Josef,
  ch04Josef,
  ch05Josef,
  ch06Josef,
  ch07Josef,
  ch08Josef,
  ch09Josef,
  ch10Josef,
];
