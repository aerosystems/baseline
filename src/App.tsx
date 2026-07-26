import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { CoursesLanding } from '@/components/landing/CoursesLanding';
import { Roadmap } from '@/components/roadmap/Roadmap';
import { LecturePage } from '@/components/lecture/LecturePage';
import { useHashRouter } from '@/hooks/useHashRouter';
import { buildContentTree, getLessonWithFallback } from '@/lib/content';

export function App() {
  const { route, goToLanding, goToCourse, goToLesson } = useHashRouter();

  const contentTree = useMemo(() => buildContentTree(), []);

  // Always use Ukrainian
  const language = 'uk';
  const courses = contentTree[language] || [];

  // Render lesson page
  if (route.type === 'lesson' && route.course && route.module && route.slug) {
    const lessonData = getLessonWithFallback(
      contentTree,
      language,
      route.course,
      route.module,
      route.slug
    );

    if (lessonData) {
      return (
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
          <Header showBack onBackClick={() => goToCourse(route.course!)} />
          <LecturePage
            lesson={lessonData.lesson}
            module={lessonData.module}
            isFallback={lessonData.isFallback}
            onBack={() => goToCourse(route.course!)}
          />
        </div>
      );
    }
  }

  // Render course roadmap
  if (route.type === 'course' && route.course) {
    const course = courses.find(c => c.slug === route.course);

    if (course) {
      return (
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
          <Header showBack onBackClick={goToLanding} />
          <Roadmap
            course={course}
            onLessonClick={(courseSlug, moduleSlug, lessonSlug) => {
              goToLesson(courseSlug, moduleSlug, lessonSlug);
            }}
          />
        </div>
      );
    }
  }

  // Render landing page with courses list
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header />
      {courses.length > 0 ? (
        <CoursesLanding
          courses={courses}
          onCourseClick={goToCourse}
        />
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>
          No courses available
        </div>
      )}
    </div>
  );
}
