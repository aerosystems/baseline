// Матеріали курсу — це не суцільний текст: у лекціях на кожну сторінку прози
// припадає кілька ASCII-діаграм і лістингів, і саме вони забирають більшу
// частину часу. Тому час рахується окремо для прози, коду й діаграм; раніше
// блоки коду просто відкидалися, і лекція на 800 рядків показувала «4 хв».
const WORDS_PER_MINUTE = 140; // українська технічна проза, читання з розумінням
const CODE_LINES_PER_MINUTE = 20; // лістинг читають рядок за рядком
const MINUTES_PER_DIAGRAM = 0.75; // діаграму розглядають цілком, розмір майже не впливає

const MIN_READING_TIME = 1;
const ROUND_TO_FIVE_FROM = 10; // довгі оцінки округлюємо до 5 хв: це оцінка, а не хронометраж
const STUB_THRESHOLD = 100; // words

const BOX_DRAWING = /[┌┐└┘├┤┬┴┼│─═║╔╗╚╝]/;
const DIAGRAM_LINE_SHARE = 0.3; // частка рядків із рамкою, після якої блок вважається діаграмою

interface Blocks {
  prose: string;
  codeLines: number;
  diagrams: number;
}

/** Розділяє матеріал на прозу, лістинги та діаграми */
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
  clean = clean.replace(/\[([^\]]*)\]\(.*?\)/g, '$1'); // links: текст лишається
  clean = clean.replace(/#{1,6}\s/g, ''); // headers
  clean = clean.replace(/[*_~]/g, ''); // emphasis
  clean = clean.replace(/^\s*[>|]\s?/gm, ''); // blockquotes, межі таблиць
  clean = clean.replace(/^\s*[-*+]\s/gm, ''); // list markers
  clean = clean.replace(/^\s*\d+\.\s/gm, ''); // numbered lists
  clean = clean.replace(/^\s*[-|: ]+$/gm, ''); // розділові рядки таблиць

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
