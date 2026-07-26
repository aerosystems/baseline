export type LessonType = 'lecture' | 'lab' | 'seminar' | 'test' | 'final';

export interface LessonFrontmatter {
  title: string;
  type: LessonType;
  order: number;
  preview: string;
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
}

export interface ContentTree {
  [lang: string]: Course[];
}

export type Theme = 'day' | 'night';
export type Language = 'uk' | 'en';
