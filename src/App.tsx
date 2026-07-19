import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Roadmap } from '@/components/roadmap/Roadmap';
import { LecturePage } from '@/components/lecture/LecturePage';
import { useHashRouter } from '@/hooks/useHashRouter';
import { buildContentTree, getLessonWithFallback } from '@/lib/content';

export function App() {
  const { route, goToRoadmap, goToLesson } = useHashRouter();

  const contentTree = useMemo(() => buildContentTree(), []);

  // Always use Ukrainian
  const language = 'uk';

  // Get current course
  const course = contentTree[language]?.[0];

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
          <Header />
          <LecturePage
            lesson={lessonData.lesson}
            module={lessonData.module}
            isFallback={lessonData.isFallback}
            onBack={() => goToRoadmap()}
          />
        </div>
      );
    }
  }

  // Render roadmap
  if (!course) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>
          No content available
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header />
      <Roadmap
        course={course}
        onLessonClick={(courseSlug, moduleSlug, lessonSlug) => {
          goToLesson(courseSlug, moduleSlug, lessonSlug);
        }}
      />
    </div>
  );
}
