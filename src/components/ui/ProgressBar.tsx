interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      {label && (
        <span className="font-ui text-[0.6rem] uppercase tracking-[0.25em] text-current/70">
          {label}
        </span>
      )}
      <div className="relative w-24 h-px bg-current/20">
        <div
          className="absolute top-0 left-0 h-px bg-current transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  );
}
