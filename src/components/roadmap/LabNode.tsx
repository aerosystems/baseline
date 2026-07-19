import { useTranslation } from 'react-i18next';
import type { Lesson } from '@/types/content';

interface LabNodeProps {
  lesson: Lesson;
  onClick: () => void;
}

export function LabNode({ lesson, onClick }: LabNodeProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex items-center">
      {/* Horizontal branch line from rail */}
      <div
        className="absolute h-0.5"
        style={{
          left: '-28px',
          width: '28px',
          backgroundColor: 'var(--faint)'
        }}
      />

      {/* Small node circle at end of branch */}
      <button
        onClick={onClick}
        className="absolute w-3 h-3 rounded-full border-2 transition-colors hover:border-[var(--red)] cursor-pointer"
        style={{
          left: '-4px',
          borderColor: 'var(--faint)',
          backgroundColor: 'var(--bg)',
        }}
        aria-label={lesson.frontmatter.title}
      />

      {/* Content */}
      <div className="ml-4">
        <button
          onClick={onClick}
          className="text-left text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--muted)' }}
        >
          {lesson.frontmatter.title}
        </button>
        {!lesson.isStub && (
          <span
            className="text-xs ml-2"
            style={{ color: 'var(--faint)' }}
          >
            {t('roadmap.readingTime', { minutes: lesson.readingTime })}
          </span>
        )}
      </div>
    </div>
  );
}
