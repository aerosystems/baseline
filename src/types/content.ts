export type LessonType = 'lecture' | 'lab' | 'seminar' | 'test' | 'final' | 'grading' | 'self-study' | 'control-work';

export type Subject = 'os' | 'pmzi';

export interface LessonFrontmatter {
  title: string;           // official wording from the curriculum — .docx heading
  shortTitle?: string;     // short name for the roadmap and the .docx file name
  type: LessonType;
  order: number;
  preview: string;
}

/** Id of the program a module belongs to (see _programs.json) */
export type Audience = string;

/**
 * Curriculum of a single group. One subject is taught under several curricula at
 * once; they differ not in content but in lab numbers, hours and how a topic is
 * delivered (a lecture or self-study).
 */
export interface Program {
  id: string;         // pz-24, kmp-23 …
  title: string;      // group name as it appears in the timetable
  semester: number;
  students?: number;
}

/** What a curriculum changes for one particular material */
export interface ProgramItem {
  delivery?: 'lecture' | 'self-study';
  labNumber?: number;
  hours?: number;
  theme?: string;     // topic number in the curriculum
}

export interface ProgramsJson {
  programs: Program[];
  lessons: Record<string, Record<string, ProgramItem>>;
}

export interface LabFrontmatter extends LessonFrontmatter {
  type: 'lab';
  labNumber?: number;  // lab number for the .docx (when it differs from order)
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
  /** Per-curriculum data; a missing key means the material is not in that curriculum */
  byProgram?: Record<string, ProgramItem>;
}

export interface ModuleJson {
  title: string;
  order: number;
  audience?: Audience[];  // module belongs to certain curricula only
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
  labs?: Lesson[];  // labs from the labs/ directory
  grading?: Lesson;  // course grading criteria (_grading.md)
}

export interface ContentTree {
  [lang: string]: Course[];
}

export type Theme = 'day' | 'night';
export type Language = 'uk' | 'en';
