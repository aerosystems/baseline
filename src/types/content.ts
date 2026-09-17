export type LessonType = 'lecture' | 'lab' | 'seminar' | 'test' | 'final' | 'grading' | 'self-study' | 'control-work';

export type Subject = 'os' | 'pmzi';

export interface LessonFrontmatter {
  title: string;
  type: LessonType;
  order: number;
  preview: string;
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
}

export interface ModuleJson {
  title: string;
  order: number;
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
  modules: Module[];
  labs?: Lesson[];  // Лабораторні роботи з labs/ директорії
  grading?: Lesson;  // Критерії оцінювання курсу (_grading.md)
}

export interface ContentTree {
  [lang: string]: Course[];
}

export type Theme = 'day' | 'night';
export type Language = 'uk' | 'en';
