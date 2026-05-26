import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReaderState {
  /** Last chapter number the reader visited, for the cover's Continue link */
  lastChapter: number | null;
  setLastChapter: (n: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      lastChapter: null,
      setLastChapter: (lastChapter) => set({ lastChapter }),
    }),
    { name: 'between-two-ruins-reader' },
  ),
);
