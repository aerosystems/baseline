import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Roadmap } from '@/components/roadmap/Roadmap';
import { LecturePage } from '@/components/lecture/LecturePage';
import { useHashRouter } from '@/hooks/useHashRouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildContentTree, getLessonWithFallback } from '@/lib/content';

export function App() {
  const { route, goToRoadmap, goToLesson, updateLanguage } = useHashRouter();
  const { language, setLanguage } = useLanguage();

  const contentTree = useMemo(() => buildContentTree(), []);

  const handleLanguageChange = (lang: 'uk' | 'en') => {
    setLanguage(lang);
    updateLanguage(lang);
  };

  // Get current course (assuming single course for now)
  const course = contentTree[language]?.[0] || contentTree['uk']?.[0];

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
          <Header onLanguageChange={handleLanguageChange} />
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
        <Header onLanguageChange={handleLanguageChange} />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>
          No content available
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header onLanguageChange={handleLanguageChange} />
      <Roadmap
        course={course}
        onLessonClick={(courseSlug, moduleSlug, lessonSlug) => {
          goToLesson(courseSlug, moduleSlug, lessonSlug);
        }}
      />
    </div>
  );
}
