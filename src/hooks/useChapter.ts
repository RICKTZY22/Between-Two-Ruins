import { useMemo } from 'react';
import { chapters } from '@/content/chapters';
import type { Chapter } from '@/types';

interface UseChapterResult {
  chapter: Chapter | undefined;
  prev: Chapter | undefined;
  next: Chapter | undefined;
  total: number;
  progress: number;
}

/** Look up a chapter by its 1-based number and expose neighbors + progress. */
export function useChapter(number: number): UseChapterResult {
  return useMemo(() => {
    const total = chapters.length;
    const idx = chapters.findIndex((c) => c.number === number);
    const chapter = idx >= 0 ? chapters[idx] : undefined;
    return {
      chapter,
      prev: idx > 0 ? chapters[idx - 1] : undefined,
      next: idx >= 0 && idx < total - 1 ? chapters[idx + 1] : undefined,
      total,
      progress: idx >= 0 ? (idx + 1) / total : 0,
    };
  }, [number]);
}
