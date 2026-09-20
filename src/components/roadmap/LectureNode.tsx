import { useTranslation } from 'react-i18next';
import type { Lesson, ProgramItem } from '@/types/content';

interface LectureNodeProps {
  lesson: Lesson;
  program?: ProgramItem;
  onClick: () => void;
}

export function LectureNode({ lesson, program, onClick }: LectureNodeProps) {
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
        aria-label={lesson.frontmatter.shortTitle || lesson.frontmatter.title}
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
            {lesson.frontmatter.shortTitle || lesson.frontmatter.title}
          </span>
        </button>

        {/* How the topic is delivered in the selected curriculum: the same topic
            can be a lecture for one group and self-study for another */}
        {program?.delivery && (
          <span
            className="text-xs ml-2 px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            {program.delivery === 'lecture' ? 'лекція' : 'самостійно'}
            {program.hours ? ` · ${program.hours} год` : ''}
          </span>
        )}

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
