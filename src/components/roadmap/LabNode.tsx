import { useTranslation } from 'react-i18next';
import type { Lesson, LabFrontmatter, ProgramItem } from '@/types/content';

interface LabNodeProps {
  lesson: Lesson;
  program?: ProgramItem;
  restrictedTo?: string[];
  onClick: () => void;
}

export function LabNode({ lesson, program, restrictedTo, onClick }: LabNodeProps) {
  const { t } = useTranslation();

  const title = lesson.frontmatter.shortTitle || lesson.frontmatter.title;
  // Номер і години беруться з обраної програми: та сама робота має різний
  // номер у різних групах (№11 у ПЗ, №5 у КМП-23, №12 у КМП-24)
  const labNumber = program?.labNumber ?? (lesson.frontmatter as LabFrontmatter).labNumber;

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
          {labNumber ? `ЛР №${labNumber}. ` : ''}{title}
        </button>
        {program?.hours && (
          <span
            className="text-xs ml-2 px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            {program.hours} год
          </span>
        )}
        {restrictedTo?.map(badge => (
          <span
            key={badge}
            className="text-xs ml-2 px-1.5 py-0.5 rounded"
            style={{
              color: 'var(--muted)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {badge}
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
