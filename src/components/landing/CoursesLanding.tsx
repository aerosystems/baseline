import type { Course } from '@/types/content';

interface CoursesLandingProps {
  courses: Course[];
  onCourseClick: (courseSlug: string) => void;
}

export function CoursesLanding({ courses, onCourseClick }: CoursesLandingProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Courses list with rail */}
      <div className="relative" style={{ paddingLeft: '40px' }}>
        {/* Vertical rail */}
        <div
          className="absolute"
          style={{
            left: '10px',
            top: '8px',
            bottom: '8px',
            width: '3px',
            backgroundColor: 'var(--rail)'
          }}
        />

        {/* Courses */}
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course.slug} className="relative">
              {/* Node circle - same style as lecture nodes */}
              <button
                onClick={() => onCourseClick(course.slug)}
                className="absolute w-4 h-4 rounded-full transition-colors hover:border-[var(--red)] cursor-pointer"
                style={{
                  left: '-36px',
                  top: '2px',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: 'var(--rail)',
                  backgroundColor: 'var(--bg)',
                }}
                aria-label={course.title}
              />

              {/* Course title and description */}
              <div>
                <button
                  onClick={() => onCourseClick(course.slug)}
                  className="text-left transition-colors hover:opacity-80"
                >
                  <span
                    className="font-medium text-lg"
                    style={{ color: 'var(--ink)' }}
                  >
                    {course.title}
                  </span>
                </button>
                {course.description && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--muted)' }}
                  >
                    {course.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
