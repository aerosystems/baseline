import type {
  Course,
  Module,
  Lesson,
  LessonFrontmatter,
  CourseJson,
  ModuleJson,
  ContentTree,
  Language,
} from '@/types/content';
import { calculateReadingTime, isStubContent } from './readingTime';

// Simple frontmatter parser (browser-compatible, no gray-matter)
function parseFrontmatter(markdown: string): { data: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: markdown };
  }

  const yamlString = match[1];
  const content = match[2];

  // Simple YAML parser for our use case
  const data: Record<string, unknown> = {};
  const lines = yamlString.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: string | number = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse numbers
    if (/^\d+$/.test(value)) {
      data[key] = parseInt(value, 10);
    } else {
      data[key] = value;
    }
  }

  return { data, content };
}

// Import all markdown files as raw text
const markdownFiles = import.meta.glob('/content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Import all JSON files
const jsonFiles = import.meta.glob('/content/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, CourseJson | ModuleJson>;

function getJsonContent<T>(path: string): T | null {
  const file = jsonFiles[path];
  if (!file) return null;
  return file as T;
}

function parseLessonPath(filePath: string): {
  lang: Language;
  course: string;
  module: string;
  slug: string;
} | null {
  // /content/uk/01-os-course/01-module/01-lecture-intro.md
  const match = filePath.match(/\/content\/(\w+)\/([^/]+)\/([^/]+)\/([^/]+)\.md$/);
  if (!match) return null;

  return {
    lang: match[1] as Language,
    course: match[2],
    module: match[3],
    slug: match[4],
  };
}

function parseLesson(filePath: string, rawContent: string): Lesson | null {
  const pathInfo = parseLessonPath(filePath);
  if (!pathInfo) return null;

  const { data, content } = parseFrontmatter(rawContent);
  const frontmatter = data as LessonFrontmatter;

  if (!frontmatter.title || !frontmatter.type || frontmatter.order === undefined) {
    console.warn(`Invalid frontmatter in ${filePath}`);
    return null;
  }

  const isStub = isStubContent(rawContent);

  return {
    slug: pathInfo.slug,
    path: `${pathInfo.lang}/${pathInfo.course}/${pathInfo.module}/${pathInfo.slug}`,
    frontmatter,
    content,
    readingTime: calculateReadingTime(content),
    isStub,
  };
}

export function buildContentTree(): ContentTree {
  const tree: ContentTree = {};

  // Group files by language/course/module
  const structure: Record<string, Record<string, Record<string, Lesson[]>>> = {};

  for (const [filePath, rawContent] of Object.entries(markdownFiles)) {
    const pathInfo = parseLessonPath(filePath);
    if (!pathInfo) continue;

    const lesson = parseLesson(filePath, rawContent);
    if (!lesson) continue;

    const { lang, course, module: moduleName } = pathInfo;

    if (!structure[lang]) structure[lang] = {};
    if (!structure[lang][course]) structure[lang][course] = {};
    if (!structure[lang][course][moduleName]) structure[lang][course][moduleName] = [];

    structure[lang][course][moduleName].push(lesson);
  }

  // Build the tree
  for (const [lang, courses] of Object.entries(structure)) {
    tree[lang] = [];

    for (const [courseSlug, modules] of Object.entries(courses)) {
      const courseJson = getJsonContent<CourseJson>(`/content/${lang}/${courseSlug}/course.json`);

      const course: Course = {
        slug: courseSlug,
        title: courseJson?.title || courseSlug,
        subtitle: courseJson?.subtitle || '',
        modules: [],
      };

      for (const [moduleSlug, lessons] of Object.entries(modules)) {
        const moduleJson = getJsonContent<ModuleJson>(`content/${lang}/${courseSlug}/${moduleSlug}/module.json`);

        const module: Module = {
          slug: moduleSlug,
          title: moduleJson?.title || moduleSlug,
          order: moduleJson?.order || 0,
          lessons: lessons.sort((a, b) => a.frontmatter.order - b.frontmatter.order),
        };

        course.modules.push(module);
      }

      course.modules.sort((a, b) => a.order - b.order);
      tree[lang].push(course);
    }
  }

  return tree;
}

export function getLesson(
  tree: ContentTree,
  lang: Language,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): { lesson: Lesson; module: Module; course: Course } | null {
  const courses = tree[lang];
  if (!courses) return null;

  const course = courses.find(c => c.slug === courseSlug);
  if (!course) return null;

  const module = course.modules.find(m => m.slug === moduleSlug);
  if (!module) return null;

  const lesson = module.lessons.find(l => l.slug === lessonSlug);
  if (!lesson) return null;

  return { lesson, module, course };
}

export function getLessonWithFallback(
  tree: ContentTree,
  lang: Language,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): { lesson: Lesson; module: Module; course: Course; isFallback: boolean } | null {
  // Try requested language first
  const result = getLesson(tree, lang, courseSlug, moduleSlug, lessonSlug);
  if (result) {
    return { ...result, isFallback: false };
  }

  // Fallback to Ukrainian
  if (lang !== 'uk') {
    const fallback = getLesson(tree, 'uk', courseSlug, moduleSlug, lessonSlug);
    if (fallback) {
      return { ...fallback, isFallback: true };
    }
  }

  return null;
}
