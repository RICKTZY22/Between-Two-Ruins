import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useChapter } from '@/hooks/useChapter';
import { useReaderStore } from '@/store/readerStore';
import { useScrollDecayModifier } from '@/hooks/useScrollDecayModifier';
import DecayEngine from './DecayEngine';
import ChapterNav from './ChapterNav';
import ProseReveal from './ProseReveal';

export default function ChapterReader() {
  const { ch } = useParams<{ ch: string }>();
  const navigate = useNavigate();
  const setLastChapter = useReaderStore((s) => s.setLastChapter);

  const number = ch ? parseInt(ch, 10) : 1;
  const { chapter, prev, next, total } = useChapter(number);

  useEffect(() => {
    if (!chapter) {
      navigate('/', { replace: true });
      return;
    }
    setLastChapter(chapter.number);
  }, [chapter, navigate, setLastChapter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [number]);

  // baseDecay is the chapter's discrete value; effectiveDecay adds a small
  // GSAP-driven scroll modifier (capped at +0.12). Only DecayEngine sees
  // both; everything else just consumes the CSS vars DecayEngine writes.
  const baseDecay = chapter?.decayIntensity ?? 0;
  const scrollModifier = useScrollDecayModifier(chapter?.number ?? 0);
  const effectiveDecay = Math.min(1, baseDecay + scrollModifier);

  if (!chapter) return null;

  return (
    <>
      {/* Header sits outside DecayEngine so it isn't subject to the
          breathing scale + tremble jitter applied to article content. */}
      <ChapterNav current={chapter.number} total={total} />

      <DecayEngine baseIntensity={baseDecay} effectiveIntensity={effectiveDecay}>
        <main className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={chapter.id}
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 1.006 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-[42rem] px-6 sm:px-10 pt-24 pb-20 md:pt-28 md:pb-24"
              style={{
                color: 'var(--decay-text-color, #1F1812)',
                position: 'relative',
                zIndex: 40,
                transition: 'color 1.5s ease-in-out',
              }}
            >
              <header className="mb-12">
                <p className="font-ui text-[0.65rem] uppercase tracking-[0.3em] mb-3 opacity-50">
                  Chapter {chapter.number}
                </p>
                <h1 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-light leading-tight tracking-tightest">
                  {chapter.title}
                </h1>
              </header>

              <div className="prose-chapter">
                <ProseReveal key={chapter.id}>{chapter.content}</ProseReveal>
              </div>

              <nav
                className="mt-24 flex items-center justify-between gap-6 font-ui text-[0.65rem] uppercase tracking-[0.3em] opacity-70"
                aria-label="Chapter navigation"
              >
                <div className="min-w-[1ch]">
                  {prev && (
                    <Link
                      to={`/read/${prev.number}`}
                      className="hover:opacity-100 transition-opacity"
                    >
                      <span aria-hidden>&larr; </span>Previous Chapter
                    </Link>
                  )}
                </div>
                <div className="min-w-[1ch] text-right">
                  {next && (
                    <Link
                      to={`/read/${next.number}`}
                      className="hover:opacity-100 transition-opacity"
                    >
                      Next Chapter<span aria-hidden> &rarr;</span>
                    </Link>
                  )}
                </div>
              </nav>
            </motion.article>
          </AnimatePresence>
        </main>
      </DecayEngine>
    </>
  );
}
