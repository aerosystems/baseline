import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadingProgressBar } from '@/components/layout/ReadingProgressBar';
import { LectureHeader } from './LectureHeader';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LabMetadata } from '@/components/lab/LabMetadata';
import { readSelectedProgram } from '@/lib/selectedProgram';
import type { Lesson, Module, LabFrontmatter } from '@/types/content';

interface LecturePageProps {
  lesson: Lesson;
  module: Module;
  isFallback: boolean;
  anchor?: string;
  onBack: () => void;
}

// Course directory to subject code mapping
const SUBJECT_MAP: Record<string, string> = {
  '01-operating-systems': 'os',
  '02-software-security-methods': 'pmzi'
};

// Subject codes to Ukrainian abbreviations for filenames
const SUBJECT_NAMES: Record<string, string> = {
  'os': 'ОС',
  'pmzi': 'ПМЗІ'
};

// Generates path to the .docx file for a lab or for the grading criteria.
// Guides are generated as a separate set per group, because the lab number and
// the hours differ between curricula.
function generateDocxPath(lesson: Lesson, courseSlug?: string, programId?: string | null): string | undefined {
  const subject = courseSlug ? SUBJECT_MAP[courseSlug] : undefined;
  if (!subject) return undefined;

  const subjectName = SUBJECT_NAMES[subject];

  if (lesson.frontmatter.type === 'grading') {
    return `/labs/${subject}/Критерії_оцінювання_${subjectName}.docx`;
  }

  if (lesson.frontmatter.type !== 'lab') return undefined;
  const labFm = lesson.frontmatter as LabFrontmatter;

  // The curriculum is picked in the roadmap; with none picked, take the first one that has this lab
  const programs = lesson.byProgram;
  const program = programs
    ? (programId && programs[programId] ? programId : Object.keys(programs)[0])
    : undefined;

  const labNum = (program ? programs?.[program]?.labNumber : undefined)
    ?? labFm.labNumber
    ?? lesson.frontmatter.order;

  const title = (lesson.frontmatter.shortTitle || lesson.frontmatter.title)
    .replace(/[^\wа-яіїєґА-ЯІЇЄҐ\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  const folder = program ? `${subject}/${program}` : subject;
  return `/labs/${folder}/ЛР${labNum}_${subjectName}_${title}.docx`;
}

export function LecturePage({ lesson, module, isFallback, anchor, onBack }: LecturePageProps) {
  const { t } = useTranslation();

  const isLab = lesson.frontmatter.type === 'lab';
  const isGrading = lesson.frontmatter.type === 'grading';

  // Extract course slug from lesson path
  const courseSlug = useMemo(() => {
    const parts = lesson.path.split('/');
    return parts.length >= 2 ? parts[1] : undefined;
  }, [lesson.path]);

  const programId = useMemo(
    () => (courseSlug ? readSelectedProgram(courseSlug) : null),
    [courseSlug]
  );

  // Hours come from the group's curriculum: the same lab can be 4 or 2 hours
  const programHours = useMemo(() => {
    const hours = programId ? lesson.byProgram?.[programId]?.hours : undefined;
    if (!hours) return undefined;
    return `${hours} ${hours >= 5 ? 'академічних годин' : 'академічні години'}`;
  }, [lesson.byProgram, programId]);

  // Generate path to .docx file
  const docxPath = useMemo(() => {
    if (!isLab && !isGrading) return undefined;
    return generateDocxPath(lesson, courseSlug, programId);
  }, [isLab, isGrading, lesson, courseSlug, programId]);

  // Get lab-specific frontmatter
  const labFrontmatter = isLab ? lesson.frontmatter as LabFrontmatter : undefined;

  // Scroll to top when lesson changes, or to anchor if specified
  useEffect(() => {
    if (anchor) {
      // Delay to ensure content is fully rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Scroll to top when navigating to a new lesson without anchor
      window.scrollTo(0, 0);
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

        {/* Lab metadata block with download button */}
        {(isGrading || (isLab && !lesson.isStub)) && (
          <LabMetadata
            duration={programHours ?? labFrontmatter?.duration}
            equipment={labFrontmatter?.equipment}
            docxPath={docxPath}
          />
        )}

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
