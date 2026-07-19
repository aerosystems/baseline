const WORDS_PER_MINUTE = 180;
const MIN_READING_TIME = 1;
const STUB_THRESHOLD = 100; // words

export function calculateReadingTime(markdown: string): number {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Remove markdown syntax
  text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // images
  text = text.replace(/\[.*?\]\(.*?\)/g, ''); // links
  text = text.replace(/#{1,6}\s/g, ''); // headers
  text = text.replace(/[*_~`]/g, ''); // emphasis
  text = text.replace(/>\s/g, ''); // blockquotes
  text = text.replace(/[-*+]\s/g, ''); // list markers
  text = text.replace(/\d+\.\s/g, ''); // numbered lists
  text = text.replace(/---/g, ''); // horizontal rules

  // Count words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return Math.max(MIN_READING_TIME, minutes);
}

export function isStubContent(markdown: string): boolean {
  // Remove frontmatter
  const content = markdown.replace(/^---[\s\S]*?---/, '').trim();

  // Remove code blocks and markdown syntax
  let text = content.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  text = text.replace(/\[.*?\]\(.*?\)/g, '');
  text = text.replace(/[#*_~`>\-]/g, '');

  const words = text.trim().split(/\s+/).filter(word => word.length > 0);

  return words.length < STUB_THRESHOLD;
}
