// Course materials are not plain prose: every page of text in a lecture comes
// with several ASCII diagrams and listings, and those take most of the time.
// So prose, code and diagrams are counted separately; the previous formula threw
// code blocks away and reported "4 min" for an 800-line lecture.
const WORDS_PER_MINUTE = 140; // Ukrainian technical prose, read for understanding
const CODE_LINES_PER_MINUTE = 20; // a listing is read line by line
const MINUTES_PER_DIAGRAM = 0.75; // a diagram is taken in as a whole, size barely matters

const MIN_READING_TIME = 1;
const ROUND_TO_FIVE_FROM = 10; // long estimates round to 5 min: this is an estimate, not a stopwatch
const STUB_THRESHOLD = 100; // words

const BOX_DRAWING = /[┌┐└┘├┤┬┴┼│─═║╔╗╚╝]/;
const DIAGRAM_LINE_SHARE = 0.3; // share of framed lines that makes a block a diagram

interface Blocks {
  prose: string;
  codeLines: number;
  diagrams: number;
}

/** Splits the material into prose, listings and diagrams */
function splitContent(markdown: string): Blocks {
  const body = markdown.replace(/^---[\s\S]*?---/, '');
  let codeLines = 0;
  let diagrams = 0;

  const prose = body.replace(/```[\s\S]*?```/g, block => {
    const lines = block.split('\n').slice(1, -1);
    const framed = lines.filter(line => BOX_DRAWING.test(line)).length;

    if (lines.length && framed > lines.length * DIAGRAM_LINE_SHARE) {
      diagrams++;
    } else {
      codeLines += lines.length;
    }
    return '';
  });

  return { prose, codeLines, diagrams };
}

function countWords(text: string): number {
  let clean = text.replace(/`[^`]+`/g, '');
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, ''); // images
  clean = clean.replace(/\[([^\]]*)\]\(.*?\)/g, '$1'); // links: keep the text
  clean = clean.replace(/#{1,6}\s/g, ''); // headers
  clean = clean.replace(/[*_~]/g, ''); // emphasis
  clean = clean.replace(/^\s*[>|]\s?/gm, ''); // blockquotes, table borders
  clean = clean.replace(/^\s*[-*+]\s/gm, ''); // list markers
  clean = clean.replace(/^\s*\d+\.\s/gm, ''); // numbered lists
  clean = clean.replace(/^\s*[-|: ]+$/gm, ''); // table separator rows

  return clean.split(/\s+/).filter(word => word.length > 0).length;
}

export function calculateReadingTime(markdown: string): number {
  const { prose, codeLines, diagrams } = splitContent(markdown);

  const minutes =
    countWords(prose) / WORDS_PER_MINUTE +
    codeLines / CODE_LINES_PER_MINUTE +
    diagrams * MINUTES_PER_DIAGRAM;

  const rounded =
    minutes >= ROUND_TO_FIVE_FROM ? Math.round(minutes / 5) * 5 : Math.round(minutes);

  return Math.max(MIN_READING_TIME, rounded);
}

export function isStubContent(markdown: string): boolean {
  const { prose } = splitContent(markdown);

  return countWords(prose) < STUB_THRESHOLD;
}
