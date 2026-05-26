import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReaderStore } from '@/store/readerStore';

const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

export default function CoverPage() {
  const lastChapter = useReaderStore((s) => s.lastChapter);
  const ctaPath = lastChapter ? `/read/${lastChapter}` : '/read/1';
  const ctaLabel = lastChapter ? 'Continue Reading' : 'Begin Reading';

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden text-demon-text"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* Ambient warm glow — barely visible, coalesces behind the title
          as if something is breathing behind the dark. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.0, delay: 0.6, ease: 'easeOut' }}
        style={{
          background:
            'radial-gradient(ellipse 60% 30% at 50% 42%, rgba(168,127,50,0.07) 0%, transparent 70%)',
        }}
      />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
        <div className="max-w-2xl w-full">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 1.2, delay: 0.0, ease: EASE_OUT_CUBIC }}
            className="font-ui text-[0.65rem] uppercase tracking-[0.3em] text-demon-muted mb-10"
          >
            A Novel
          </motion.p>

          {/* Title materializes from darkness: blur → sharp, rise, fade-in.
              "Two Ruins" follows 150ms after "Between" — assembled from parts. */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.4, delay: 0.4, ease: EASE_OUT_CUBIC }}
            className="font-display font-light text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] mb-8 tracking-tightest"
          >
            Between
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE_OUT_CUBIC }}
              className="italic font-extralight inline-block"
            >
              Two Ruins
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: EASE_OUT_CUBIC }}
            className="font-body italic text-[clamp(1rem,2vw,1.25rem)] text-demon-muted max-w-md mx-auto mb-14 leading-relaxed"
          >
            Some ghosts are born from loss.
            <br />
            Others from the things we cannot forgive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 1.2, ease: EASE_OUT_CUBIC }}
          >
            <Link
              to={ctaPath}
              className="inline-flex items-center gap-3 font-ui text-[0.7rem] uppercase tracking-[0.3em] px-8 py-4 border border-demon-text/30 text-demon-text/85 hover:border-demon-text/80 hover:text-demon-text transition-colors duration-500"
            >
              {ctaLabel}
              <span aria-hidden className="text-[1rem] -translate-y-px">
                &rarr;
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 1.8, ease: EASE_OUT_CUBIC }}
          className="font-ui text-[0.65rem] uppercase tracking-[0.3em] absolute bottom-8 text-demon-muted"
        >
          Act One &nbsp;·&nbsp; Josef
        </motion.p>
      </main>
    </div>
  );
}
