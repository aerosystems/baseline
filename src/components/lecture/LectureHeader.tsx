import { useTranslation } from 'react-i18next';
import { ModuleBadge } from '@/components/roadmap/ModuleBadge';

interface LectureHeaderProps {
  moduleTitle: string;
  lessonTitle: string;
  readingTime: number;
  isStub: boolean;
  onBack: () => void;
}

export function LectureHeader({
  moduleTitle,
  lessonTitle,
  readingTime,
  isStub,
  onBack,
}: LectureHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm mb-6 transition-colors hover:opacity-80"
        style={{ color: 'var(--red)' }}
      >
        {t('roadmap.backToRoadmap')}
      </button>

      {/* Module badge and reading time */}
      <div className="flex items-center gap-4 mb-4">
        <ModuleBadge title={moduleTitle} />
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {isStub
            ? t('roadmap.soon')
            : t('roadmap.readingTime', { minutes: readingTime })
          }
        </span>
      </div>

      {/* Lesson title */}
      <h1
        className="text-2xl font-semibold"
        style={{ color: 'var(--ink)' }}
      >
        {lessonTitle}
      </h1>
    </div>
  );
}
