/**
 * Checks a built student report against the report sample
 * (data/Зразок оформлення для звіту.docx) and the title-page sample.
 *
 * The build runs these on every document it writes and refuses to keep one
 * that fails, so a .docx that reaches the repository has passed them; the same
 * checks run on their own in CI on every pull request (scripts/verify-reports.mjs).
 *
 * Each check reads the unpacked package — the XML Word will read — rather than
 * the markdown, so what is checked is what gets printed.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { run, validatePackage } from './docx.mjs';

const text = xml => [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(m => m[1]).join('');

const paragraphs = xml => xml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) ?? [];

const styleOf = paragraph => paragraph.match(/<w:pStyle w:val="([^"]+)"/)?.[1];

const unescape = value => value
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** Images of the markdown body, comments left out */
function imagesOf(body) {
  return [...body.replace(/<!--[\s\S]*?-->/g, '').matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)]
    .map(([, alt, src]) => ({ alt: alt.trim(), src: src.trim() }));
}

/**
 * @param docxPath   the built document
 * @param expected   { body, student, signature, lab, code } — what the report
 *                   and the group data say the document must contain
 * @returns list of problems, empty when the document is right
 */
export function checkReport(docxPath, expected) {
  const work = mkdtempSync(join(tmpdir(), 'report-check-'));
  const problems = [];
  const expect = (condition, message) => { if (!condition) problems.push(message); };

  try {
    run('unzip', ['-o', '-q', docxPath, '-d', work]);

    // Well-formed XML, every style and relationship present
    try {
      validatePackage(work);
    } catch (error) {
      problems.push(error.message);
      return problems;
    }

    const read = path => existsSync(join(work, path)) ? readFileSync(join(work, path), 'utf8') : '';
    const document = read('word/document.xml');
    const styles = read('word/styles.xml');
    const rels = read('word/_rels/document.xml.rels');
    const all = paragraphs(document);

    // --- page numbers: top right on every page but the title page ----------
    const sectPr = document.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g)?.pop() ?? '';
    const headerOf = type => {
      const id = sectPr.match(new RegExp(`<w:headerReference\\b[^>]*w:type="${type}"[^>]*>`))?.[0]
        .match(/r:id="([^"]+)"/)?.[1];
      const target = id && rels.match(new RegExp(`<Relationship\\b[^>]*Id="${id}"[^>]*>`))?.[0]
        .match(/Target="([^"]+)"/)?.[1];
      return target ? read(`word/${target}`) : null;
    };
    const pageHeader = headerOf('default');
    const firstHeader = headerOf('first');

    expect(pageHeader && /PAGE/.test(pageHeader) && /w:jc w:val="right"/.test(pageHeader),
      'no page number in the top right corner (header with a PAGE field)');
    expect(/<w:titlePg\b/.test(sectPr) && firstHeader !== null && !/PAGE/.test(firstHeader),
      'the title page must carry no page number (titlePg with an empty first-page header)');
    expect(/w:header="227"/.test(sectPr), 'the header must sit 4 mm from the edge (w:header="227")');
    expect(/w:top="1134"/.test(sectPr) && /w:right="567"/.test(sectPr) &&
      /w:bottom="1134"/.test(sectPr) && /w:left="1418"/.test(sectPr),
      'page margins must be 20/10/20/25 mm');

    // --- title page -----------------------------------------------------------
    const pageBreak = all.findIndex(p => /<w:br w:type="page"\s*\/>/.test(p));
    expect(pageBreak > 0, 'no page break after the title page');
    const title = all.slice(0, Math.max(pageBreak, 0)).join('');
    const titleText = unescape(text(title));

    expect(titleText.includes(`З ЛАБОРАТОРНОЇ РОБОТИ №${expected.lab}`),
      `the title page does not say "З ЛАБОРАТОРНОЇ РОБОТИ №${expected.lab}"`);
    expect(!expected.code || titleText.includes(expected.code),
      `the title page does not carry the work code ${expected.code}`);

    const studentLine = paragraphs(title).find(p => text(p).startsWith('Студент'));
    const underlined = studentLine && [...studentLine.matchAll(/<w:r>([\s\S]*?)<\/w:r>/g)]
      .some(([, run]) => /<w:u w:val="single"\s*\/>/.test(run) && unescape(text(run)) === expected.signature);
    expect(underlined, `the student's name on the title page must read "${expected.signature}", underlined`);

    // --- body text ------------------------------------------------------------
    const style = id => styles.match(new RegExp(`<w:style [^>]*w:styleId="${id}"[\\s\\S]*?</w:style>`))?.[0] ?? '';
    expect(/w:firstLine="567"/.test(style('BodyText')), 'body text must have a 1 cm paragraph indent (567)');
    expect(/w:line="360"/.test(style('BodyText')) || /w:line="360"/.test(style('Normal')),
      'body text must be set at line spacing 1.5');
    expect(/w:jc w:val="center"/.test(style('Heading2')) && /<w:b\s*\/>/.test(style('Heading2')),
      'section headings must be centred and bold');

    const body = all.slice(pageBreak + 1);
    const bodyText = unescape(body.map(text).join('\n'));

    expect(!/[“”]/.test(bodyText), 'English quotes “…” in the text — Ukrainian text takes «…»');

    // --- conclusion: "Висновок: ..." in a paragraph, not a heading ------------
    expect(!body.some(p => /^Heading/.test(styleOf(p) ?? '') && /^\s*Висновок/.test(text(p))),
      '"Висновок" must not be a heading — the sample runs it into the paragraph');
    if (/^#{1,6}\s*Висновок/m.test(expected.body)) {
      expect(body.some(p => styleOf(p) === 'Conclusion' && text(p).startsWith('Висновок:')),
        'no "Висновок: ..." paragraph');
    }

    // --- figures: every picture embedded, every caption printed once ----------
    const images = imagesOf(expected.body);
    const drawings = (document.match(/<pic:pic\b/g) ?? []).length;
    expect(drawings === images.length,
      `the report shows ${images.length} picture(s), the document embeds ${drawings}`);

    for (const id of [...document.matchAll(/r:embed="([^"]+)"/g)].map(m => m[1])) {
      const target = rels.match(new RegExp(`<Relationship\\b[^>]*Id="${id}"[^>]*>`))?.[0]
        .match(/Target="([^"]+)"/)?.[1];
      expect(target && existsSync(join(work, 'word', target)), `picture ${id} points at no file in the package`);
    }

    expect(!/FigureTable/.test(document), 'a figure is wrapped in a table (FigureTable)');

    // A picture must fit the text area: 175 x 257 mm (A4 less the margins), EMU
    const TEXT_WIDTH = (11906 - 1418 - 567) * 635;
    const TEXT_HEIGHT = (16838 - 1134 - 1134) * 635;
    for (const [, cx, cy] of document.matchAll(/<wp:extent cx="(\d+)" cy="(\d+)"/g)) {
      expect(Number(cx) <= TEXT_WIDTH + 635 && Number(cy) <= TEXT_HEIGHT,
        `a picture of ${Math.round(cx / 36000)} x ${Math.round(cy / 36000)} mm does not fit the page`);
    }

    for (const { alt } of images.filter(image => /^Рисунок\s+\d+/.test(image.alt))) {
      const number = alt.match(/^Рисунок\s+(\d+)/)[1];
      const captions = body.filter(p => new RegExp(`^Рисунок\\s+${number}\\b`).test(unescape(text(p))));
      expect(captions.length === 1, `caption "Рисунок ${number}" appears ${captions.length} times`);
      expect(captions.every(p => styleOf(p) === 'ImageCaption'), `caption "Рисунок ${number}" is not styled as a caption`);
    }

    // --- tables: single spacing in cells, centred ------------------------------
    for (const table of document.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g) ?? []) {
      if (!/<w:tblStyle w:val="Table"/.test(table)) continue;
      const cells = paragraphs(table);
      expect(cells.every(p => /w:line="240"/.test(p)), 'table cells must be set at single spacing');
      expect(/<w:tblPr>[\s\S]*?<w:jc w:val="center"/.test(table), 'a table must be centred');
    }

    const tableCaptions = body.filter(p => /^Таблиця\s+\d+/.test(text(p)));
    expect(tableCaptions.every(p => styleOf(p) === 'TableCaption'), 'a table caption is not styled as one');

    // --- lists: a paragraph that continues a list item has no marker ---------
    // Pandoc numbers such paragraphs with a blank glyph; a dash there reads as
    // a new item
    const numbering = read('word/numbering.xml');
    const continuation = numbering.match(/<w:abstractNum\b[^>]*w:abstractNumId="990"[\s\S]*?<\/w:abstractNum>/)?.[0] ?? '';
    expect([...continuation.matchAll(/<w:lvlText w:val="([^"]*)"/g)].every(([, glyph]) => glyph.trim() === ''),
      'a paragraph continuing a list item is given a list marker');

    // --- document properties ---------------------------------------------------
    const core = read('docProps/core.xml');
    expect(/<dc:title>[^<]+<\/dc:title>/.test(core), 'the document has no title in its properties');
    expect(core.includes(`<dc:creator>${expected.student}</dc:creator>`), 'the document properties do not name the student');

    return problems;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** Warnings: things the report should have but that do not break the document */
export function reportWarnings(body) {
  const warnings = [];
  const lines = body.replace(/<!--[\s\S]*?-->/g, '').split('\n');

  lines.forEach((line, index) => {
    if (!/^\s*\|/.test(line) || index === 0 || /^\s*\|/.test(lines[index - 1])) return;
    // the first line of a table: the caption is the paragraph above it
    const above = lines.slice(0, index).reverse().find(l => l.trim() !== '') ?? '';
    if (!/^Таблиця\s+\d+\s*[–—-]/.test(above.trim())) {
      warnings.push(`line ${index + 1}: a table without a caption "Таблиця N – Назва" above it`);
    }
  });

  return warnings;
}
