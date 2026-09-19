import { useTranslation } from 'react-i18next';
import type { Lesson, LabFrontmatter } from '@/types/content';

interface LabNodeProps {
  lesson: Lesson;
  onClick: () => void;
}

export function LabNode({ lesson, onClick }: LabNodeProps) {
  const { t } = useTranslation();

  const title = lesson.frontmatter.shortTitle || lesson.frontmatter.title;
  // Роботи, передбачені лише окремими програмами, позначаються в роадмапі
  const audience = (lesson.frontmatter as LabFrontmatter).audience;

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
        aria-label={title}
      />

      {/* Content */}
      <div className="ml-4">
        <button
          onClick={onClick}
          className="text-left text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--muted)' }}
        >
          {title}
        </button>
        {audience?.map(program => (
          <span
            key={program}
            className="text-xs ml-2 px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{
              color: 'var(--muted)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {program}
          </span>
        ))}
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
