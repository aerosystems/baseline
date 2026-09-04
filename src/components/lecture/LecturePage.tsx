import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingProgressBar } from '@/components/layout/ReadingProgressBar';
import { LectureHeader } from './LectureHeader';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { Lesson, Module } from '@/types/content';

interface LecturePageProps {
  lesson: Lesson;
  module: Module;
  isFallback: boolean;
  anchor?: string;
  onBack: () => void;
}

export function LecturePage({ lesson, module, isFallback, anchor, onBack }: LecturePageProps) {
  const { t } = useTranslation();

  // Scroll to anchor when page loads or anchor changes
  useEffect(() => {
    if (anchor) {
      // Delay to ensure content is fully rendered (especially on initial page load)
      const timer = setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [anchor, lesson.slug]);

  return (
    <>
      <ReadingProgressBar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <LectureHeader
          moduleTitle={module.title}
          lessonTitle={lesson.frontmatter.title}
          readingTime={lesson.readingTime}
          isStub={lesson.isStub}
          onBack={onBack}
        />

        {/* Fallback notice */}
        {isFallback && (
          <div
            className="mb-6 px-4 py-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
            }}
          >
            {t('lecture.noTranslation')}
          </div>
        )}

        {/* Content */}
        {lesson.isStub ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--muted)' }}
          >
            <p className="text-lg">{t('lecture.stubMessage')}</p>
          </div>
        ) : (
          <MarkdownRenderer content={lesson.content} />
        )}
      </div>
    </>
  );
}
