import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { CoursesLanding } from '@/components/landing/CoursesLanding';
import { Roadmap } from '@/components/roadmap/Roadmap';
import { LecturePage } from '@/components/lecture/LecturePage';
import { useHashRouter } from '@/hooks/useHashRouter';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buildContentTree, getLessonWithFallback } from '@/lib/content';

export function App() {
  const { route, goToLanding, goToCourse, goToLesson, goToGrading } = useHashRouter();

  const contentTree = useMemo(() => buildContentTree(), []);

  // Always use Ukrainian
  const language = 'uk';
  const courses = contentTree[language] || [];

  // Compute document title based on current route
  const documentTitle = useMemo(() => {
    if (route.type === 'lesson' && route.course && route.module && route.slug) {
      const lessonData = getLessonWithFallback(
        contentTree,
        language,
        route.course,
        route.module,
        route.slug
      );
      if (lessonData) {
        const course = courses.find(c => c.slug === route.course);
        const courseTitle = course?.title || route.course;
        return `${lessonData.lesson.frontmatter.title} — ${courseTitle} — Baseline`;
      }
    }

    if (route.type === 'grading' && route.course) {
      const course = courses.find(c => c.slug === route.course);
      if (course?.grading) {
        return `${course.grading.frontmatter.title} — ${course.title} — Baseline`;
      }
    }

    if (route.type === 'course' && route.course) {
      const course = courses.find(c => c.slug === route.course);
      if (course) {
        return `${course.title} — Baseline`;
      }
    }

    return 'Baseline';
  }, [route, contentTree, courses, language]);

  useDocumentTitle(documentTitle);

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
            anchor={route.anchor}
            onBack={() => goToCourse(route.course!)}
          />
        </div>
      );
    }
  }

  // Render course grading criteria
  if (route.type === 'grading' && route.course) {
    const course = courses.find(c => c.slug === route.course);

    if (course?.grading) {
      return (
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
          <Header showBack onBackClick={() => goToCourse(route.course!)} />
          <LecturePage
            lesson={course.grading}
            module={{ slug: 'grading', title: course.title, order: 0, lessons: [] }}
            isFallback={false}
            anchor={route.anchor}
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
            onGradingClick={() => goToGrading(course.slug)}
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
