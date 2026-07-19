import type { Lesson } from '@/types/content';

interface EventNodeProps {
  lesson: Lesson;
  onClick: () => void;
}

export function EventNode({ lesson, onClick }: EventNodeProps) {
  return (
    <div className="relative">
      {/* Diamond node - centered on rail (rail center at 11.5px, diamond 12px) */}
      <button
        onClick={onClick}
        className="absolute w-3 h-3 rotate-45 transition-colors hover:opacity-80 cursor-pointer"
        style={{
          left: '-34px',
          top: '4px',
          backgroundColor: 'var(--red)',
        }}
        aria-label={lesson.frontmatter.title}
      />

      {/* Content */}
      <div>
        <button
          onClick={onClick}
          className="text-left font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--ink)' }}
        >
          {lesson.frontmatter.title}
        </button>
      </div>
    </div>
  );
}
