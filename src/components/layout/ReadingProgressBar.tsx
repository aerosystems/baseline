import { useReadingProgress } from '@/hooks/useReadingProgress';

export function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div
        className="h-full transition-all duration-100"
        style={{
          width: `${progress}%`,
          backgroundColor: 'var(--red)',
        }}
      />
    </div>
  );
}
