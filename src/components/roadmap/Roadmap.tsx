import { useEffect, useState } from 'react';
import type { Course, Lesson } from '@/types/content';
import { ModuleBadge } from './ModuleBadge';
import { ProgramSelector } from './ProgramSelector';
import { readSelectedProgram, writeSelectedProgram } from '@/lib/selectedProgram';
import { LectureNode } from './LectureNode';
import { LabNode } from './LabNode';
import { EventNode } from './EventNode';
import { Legend } from './Legend';

interface RoadmapProps {
  course: Course;
  onLessonClick: (courseSlug: string, moduleSlug: string, lessonSlug: string) => void;
  onGradingClick?: () => void;
}

export function Roadmap({ course, onLessonClick, onGradingClick }: RoadmapProps) {
  const programs = course.programs ?? [];
  const [programId, setProgramId] = useState<string | null>(null);

  useEffect(() => {
    const saved = readSelectedProgram(course.slug);
    if (saved && programs.some(program => program.id === saved)) setProgramId(saved);
  }, [course.slug, programs]);

  const selectProgram = (next: string | null) => {
    setProgramId(next);
    writeSelectedProgram(course.slug, next);
  };

  // No entry for the curriculum means the group does not have this material
  const inProgram = (lesson: Lesson) =>
    !programId || !lesson.byProgram || Boolean(lesson.byProgram[programId]);

  // A lab that not every curriculum includes: in the "all materials" mode it is
  // worth seeing which groups actually get it
  const restrictedTo = (lesson: Lesson) => {
    if (programId || !lesson.byProgram || programs.length < 2) return undefined;

    const ids = Object.keys(lesson.byProgram);
    if (ids.length === programs.length) return undefined;

    return programs.filter(program => ids.includes(program.id)).map(program => program.title);
  };

  const modules = course.modules
    .map(module => ({ ...module, lessons: module.lessons.filter(inProgram) }))
    .filter(module => module.lessons.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProgramSelector programs={programs} selected={programId} onSelect={selectProgram} />

      {/* Roadmap with rail */}
      <div className="relative" style={{ paddingLeft: '40px' }}>
        {/* Vertical rail - starts and ends at module badge dots */}
        <div
          className="absolute"
          style={{
            left: '10px',
            top: '0',
            bottom: '0',
            width: '3px',
            backgroundColor: 'var(--rail)'
          }}
        />

        {/* Modules */}
        {modules.map((module, moduleIndex) => (
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
                const program = programId ? lesson.byProgram?.[programId] : undefined;

                if (lesson.frontmatter.type === 'lecture') {
                  return (
                    <LectureNode
                      key={lesson.slug}
                      lesson={lesson}
                      program={program}
                      onClick={handleClick}
                    />
                  );
                }

                if (lesson.frontmatter.type === 'lab') {
                  return (
                    <LabNode
                      key={lesson.slug}
                      lesson={lesson}
                      program={program}
                      restrictedTo={restrictedTo(lesson)}
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

      {/* Course grading criteria */}
      {course.grading && onGradingClick && (
        <button
          onClick={onGradingClick}
          className="mt-10 w-full text-left px-4 py-3 rounded-lg border transition-colors"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--ink)',
          }}
        >
          <span className="text-sm font-semibold">{course.grading.frontmatter.title}</span>
          <span className="block text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {course.grading.frontmatter.preview}
          </span>
        </button>
      )}

      {/* Legend */}
      <Legend />
    </div>
  );
}
