export type LessonType = 'lecture' | 'lab' | 'seminar' | 'test' | 'final' | 'grading' | 'self-study' | 'control-work';

export type Subject = 'os' | 'pmzi';

export interface LessonFrontmatter {
  title: string;           // офіційне формулювання з РНП — заголовок .docx
  shortTitle?: string;     // коротка назва для роадмапи та імені .docx
  type: LessonType;
  order: number;
  preview: string;
}

/** Ідентифікатор програми, якій призначено модуль (див. _programs.json) */
export type Audience = string;

/**
 * Навчальна програма конкретної групи. Одна дисципліна викладається за кількома
 * програмами одночасно, і вони відрізняються не змістом, а номерами лабораторних,
 * годинами та формою подачі теми (лекція чи самостійне опрацювання).
 */
export interface Program {
  id: string;         // pz-24, kmp-23 …
  title: string;      // як група зветься в розкладі
  semester: number;
  students?: number;
}

/** Те, чим програма відрізняється для конкретного матеріалу */
export interface ProgramItem {
  delivery?: 'lecture' | 'self-study';
  labNumber?: number;
  hours?: number;
  theme?: string;     // номер теми в РНП
}

export interface ProgramsJson {
  programs: Program[];
  lessons: Record<string, Record<string, ProgramItem>>;
}

export interface LabFrontmatter extends LessonFrontmatter {
  type: 'lab';
  labNumber?: number;  // Номер лабораторної для .docx (якщо відрізняється від order)
  duration?: string;
  equipment?: string[];
  subject?: Subject;
}

export interface Lesson {
  slug: string;
  path: string;
  frontmatter: LessonFrontmatter;
  content: string;
  readingTime: number;
  isStub: boolean;
  /** Дані з РНП по програмах; матеріалу немає в програмі, якщо ключа немає */
  byProgram?: Record<string, ProgramItem>;
}

export interface ModuleJson {
  title: string;
  order: number;
  audience?: Audience[];  // Модуль передбачений лише окремими програмами
}

export interface Module {
  slug: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseJson {
  title: string;
  description?: string;
}

export interface Course {
  slug: string;
  title: string;
  description?: string;
  programs?: Program[];
  modules: Module[];
  labs?: Lesson[];  // Лабораторні роботи з labs/ директорії
  grading?: Lesson;  // Критерії оцінювання курсу (_grading.md)
}

export interface ContentTree {
  [lang: string]: Course[];
}

export type Theme = 'day' | 'night';
export type Language = 'uk' | 'en';
