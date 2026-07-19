import type { Course } from '@/types/content';
import { ModuleBadge } from './ModuleBadge';
import { LectureNode } from './LectureNode';
import { LabNode } from './LabNode';
import { EventNode } from './EventNode';
import { Legend } from './Legend';

interface RoadmapProps {
  course: Course;
  onLessonClick: (courseSlug: string, moduleSlug: string, lessonSlug: string) => void;
}

export function Roadmap({ course, onLessonClick }: RoadmapProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Course header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {course.subtitle}
          </p>
        )}
      </div>

      {/* Roadmap with rail */}
      <div className="relative" style={{ paddingLeft: '40px' }}>
        {/* Vertical rail - centered at 12px from left edge */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: '10px',
            width: '3px',
            backgroundColor: 'var(--rail)'
          }}
        />

        {/* Modules */}
        {course.modules.map((module, moduleIndex) => (
          <div key={module.slug} className={moduleIndex > 0 ? 'mt-12' : ''}>
            {/* Module badge - dot centered on rail */}
            <div className="relative mb-6">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                style={{
                  left: '-34px',
                  backgroundColor: 'var(--rail)'
                }}
              />
              <ModuleBadge title={module.title} />
            </div>

            {/* Lessons */}
            <div className="space-y-4">
              {module.lessons.map(lesson => {
                const handleClick = () => onLessonClick(course.slug, module.slug, lesson.slug);

                if (lesson.frontmatter.type === 'lecture') {
                  return (
                    <LectureNode
                      key={lesson.slug}
                      lesson={lesson}
                      onClick={handleClick}
                    />
                  );
                }

                if (lesson.frontmatter.type === 'lab') {
                  return (
                    <LabNode
                      key={lesson.slug}
                      lesson={lesson}
                      onClick={handleClick}
                    />
                  );
                }

                // seminar, test, final
                return (
                  <EventNode
                    key={lesson.slug}
                    lesson={lesson}
                    onClick={handleClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <Legend />
    </div>
  );
}
