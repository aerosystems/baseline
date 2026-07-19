import { useTranslation } from 'react-i18next';
import type { Lesson } from '@/types/content';

interface LectureNodeProps {
  lesson: Lesson;
  onClick: () => void;
}

export function LectureNode({ lesson, onClick }: LectureNodeProps) {
  const { t } = useTranslation();
  const hasContent = !lesson.isStub;

  return (
    <div className="relative" style={{ paddingLeft: '0' }}>
      {/* Node circle - centered on rail (rail center at 11.5px, circle 16px) */}
      <button
        onClick={onClick}
        className="absolute w-4 h-4 rounded-full transition-colors hover:border-[var(--red)] cursor-pointer"
        style={{
          left: '-36px',
          top: '2px',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: 'var(--rail)',
          backgroundColor: 'var(--bg)',
        }}
        aria-label={lesson.frontmatter.title}
      />

      {/* Content */}
      <div>
        <button
          onClick={onClick}
          className="text-left transition-colors hover:opacity-80"
        >
          <span
            className="font-medium"
            style={{
              color: 'var(--ink)',
              borderBottom: hasContent ? '2px solid var(--red)' : 'none',
            }}
          >
            {lesson.frontmatter.title}
          </span>
        </button>

        {/* Reading time */}
        <div
          className="text-sm mt-1"
          style={{ color: 'var(--muted)' }}
        >
          {hasContent
            ? t('roadmap.readingTime', { minutes: lesson.readingTime })
            : t('roadmap.soon')
          }
        </div>
      </div>
    </div>
  );
}
