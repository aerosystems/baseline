#!/usr/bin/env node
/**
 * Builds scripts/templates/lab-template.docx — the Pandoc reference document
 * that defines the visual style of generated lab .docx files.
 *
 * The style spec is taken from the reference documents in data/:
 *   ЛР1_ОС_Середовище_Windows.docx, ЛР2_ОС_Файли_та_каталоги_CMD.docx,
 *   ЛР1_ПМЗІ_Шифр_Цезаря.docx
 *
 *   page      A4, margins 20/14.2/20/28.4 mm (top/right/bottom/left)
 *   body      Times New Roman 14pt, line 1.3, justified, first line indent 1.25 cm
 *   headings  level 2 — centered bold; level 3+ — left bold with body indent
 *   code      Courier New 9pt, line 1.0, left aligned, no indent
 *   tables    Times New Roman 12pt, single borders, bold centered header row
 *   lists     see LIST_GEOMETRY in scripts/generate-docx.js — Pandoc builds its
 *             own numbering definitions, so list geometry is patched afterwards
 *
 * Usage: node scripts/templates/build-reference-docx.mjs
 */

import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The two documents differ only in margins and line spacing:
//   lab    — guides, margins 20/14.2/20/28.4 mm, line 1.3
//   report — student report, margins 20/10/20/25 mm, line 1.5
//            (data/Зразок оформлення для звіту.docx.pdf)
const PROFILES = {
  lab: {
    output: 'lab-template.docx',
    line: 312,
    margins: { top: 1134, right: 851, bottom: 1134, left: 1418 }
  },
  report: {
    output: 'report-template.docx',
    line: 360,
    margins: { top: 1134, right: 567, bottom: 1134, left: 1418 }
  }
};

// --- style spec (twips) ----------------------------------------------------

const BODY_FONT = 'Times New Roman';
const CODE_FONT = 'Courier New';
const BODY_SIZE = 28;   // 14pt
const TABLE_SIZE = 24;  // 12pt
const CODE_SIZE = 18;   // 9pt
let LINE = 312;         // line spacing of the profile being built
const CODE_LINE = 200;  // single spacing in code blocks
const INDENT = 709;     // 1.25 cm first line indent
const LIST_LEFT = 1134; // 2 cm — used by BlockText
const CODE_INSET = 284; // 0.5 cm between the frame of a listing and its text
const CODE_FILL = 'F4F4F4';   // background of a listing
const CODE_FRAME = 'BFBFBF';  // frame of a listing

const fonts = (name) =>
  `<w:rFonts w:ascii="${name}" w:hAnsi="${name}" w:cs="${name}" w:eastAsia="${name}"/>`;

const spacing = (before, after, line) =>
  `<w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>`;

const border = (side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`;
const allBorders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(border).join('');

// A listing is one paragraph with line breaks, so a frame around the paragraph
// frames the whole listing.
const codeFrame = ['top', 'left', 'bottom', 'right']
  .map(side => `<w:${side} w:val="single" w:sz="4" w:space="4" w:color="${CODE_FRAME}"/>`)
  .join('');

// Paragraph style: centered bold section heading ("Теоретичні відомості")
const sectionHeading = (id, name, before, after) => `
<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(before, after, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`;

// Paragraph style: left bold subsection heading ("1 Основні поняття", "Крок 1. ...")
const subHeading = (id, name, before) => `
<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(before, 0, LINE)}<w:ind w:firstLine="${INDENT}"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`;

const buildStyles = () => ({
  Normal: `
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:jc w:val="left"/></w:pPr></w:style>`,

  BodyText: `
<w:style w:type="paragraph" w:styleId="BodyText"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:firstLine="${INDENT}"/><w:jc w:val="both"/></w:pPr></w:style>`,

  FirstParagraph: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="FirstParagraph"><w:name w:val="First Paragraph"/><w:basedOn w:val="BodyText"/><w:next w:val="BodyText"/><w:qFormat/></w:style>`,

  // Pandoc gives this style both to list items and to table cells, so it must
  // not fix the alignment: cells then follow the table style (left, centred in
  // the header row) and list items are justified by scripts/generate-docx.js.
  // The left offset of a list comes from its numbering definition.
  Compact: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Compact"><w:name w:val="Compact"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:firstLine="0"/><w:contextualSpacing/></w:pPr></w:style>`,

  Title: `
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Subtitle"/><w:qFormat/>
<w:pPr>${spacing(0, 120, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  Subtitle: `
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr>${spacing(0, 240, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:b/><w:bCs/><w:caps/><w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  Heading1: sectionHeading('Heading1', 'heading 1', 240, 120),
  Heading2: sectionHeading('Heading2', 'heading 2', 240, 120),
  Heading3: subHeading('Heading3', 'heading 3', 140),
  Heading4: subHeading('Heading4', 'heading 4', 120),
  Heading5: subHeading('Heading5', 'heading 5', 120),
  Heading6: subHeading('Heading6', 'heading 6', 120),

  // Program listings are set apart from the body text: a light frame with a
  // grey fill, indented from the margin, so a listing does not read as a
  // paragraph of Courier.
  SourceCode: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="SourceCode"><w:name w:val="Source Code"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:pBdr>${codeFrame}</w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="${CODE_FILL}"/>
${spacing(120, 120, CODE_LINE)}<w:ind w:left="${CODE_INSET}" w:right="${CODE_INSET}" w:firstLine="0"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(CODE_FONT)}<w:sz w:val="${CODE_SIZE}"/><w:szCs w:val="${CODE_SIZE}"/></w:rPr></w:style>`,

  // Inline `code` keeps the body font, as in the reference documents.
  VerbatimChar: `
<w:style w:type="character" w:customStyle="1" w:styleId="VerbatimChar"><w:name w:val="Verbatim Char"/><w:basedOn w:val="DefaultParagraphFont"/>
<w:rPr>${fonts(BODY_FONT)}</w:rPr></w:style>`,

  // "Таблиця 1 — ..." above a table
  TableCaption: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="TableCaption"><w:name w:val="Table Caption"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(160, 60, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  ImageCaption: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="ImageCaption"><w:name w:val="Image Caption"/><w:basedOn w:val="Normal"/><w:next w:val="FirstParagraph"/><w:qFormat/>
<w:pPr>${spacing(60, 160, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/></w:rPr></w:style>`,

  Figure: `
<w:style w:type="paragraph" w:customStyle="1" w:styleId="Figure"><w:name w:val="Figure"/><w:basedOn w:val="Normal"/><w:next w:val="ImageCaption"/><w:qFormat/>
<w:pPr><w:keepNext/>${spacing(160, 60, LINE)}<w:ind w:firstLine="0"/><w:jc w:val="center"/></w:pPr></w:style>`,

  BlockText: `
<w:style w:type="paragraph" w:styleId="BlockText"><w:name w:val="Block Text"/><w:basedOn w:val="BodyText"/><w:qFormat/>
<w:pPr>${spacing(0, 0, LINE)}<w:ind w:left="${LIST_LEFT}" w:firstLine="0"/></w:pPr></w:style>`,

  Table: `
<w:style w:type="table" w:default="1" w:styleId="Table"><w:name w:val="Table"/><w:basedOn w:val="TableNormal"/><w:qFormat/>
<w:pPr>${spacing(0, 0, 240)}<w:ind w:firstLine="0"/><w:jc w:val="left"/></w:pPr>
<w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${TABLE_SIZE}"/><w:szCs w:val="${TABLE_SIZE}"/></w:rPr>
<w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblBorders>${allBorders}</w:tblBorders>
<w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="70" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr>
<w:tblStylePr w:type="firstRow"><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:bCs/></w:rPr>
<w:tcPr><w:vAlign w:val="center"/></w:tcPr></w:tblStylePr></w:style>`,
});

const docDefaults = () => `<w:docDefaults><w:rPrDefault><w:rPr>${fonts(BODY_FONT)}<w:sz w:val="${BODY_SIZE}"/><w:szCs w:val="${BODY_SIZE}"/><w:lang w:val="uk-UA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr>${spacing(0, 0, LINE)}</w:pPr></w:pPrDefault></w:docDefaults>`;

// A4 with the margins of the selected profile
const sectPr = ({ top, right, bottom, left }) =>
  `<w:sectPr><w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>` +
  `<w:pgMar w:top="${top}" w:right="${right}" w:bottom="${bottom}" w:left="${left}" ` +
  `w:header="708" w:footer="708" w:gutter="0"/>` +
  `<w:pgNumType w:start="1"/><w:docGrid w:linePitch="360"/></w:sectPr>`;

// --- build -----------------------------------------------------------------

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (res.status !== 0) {
    throw new Error(`${cmd} failed: ${res.stderr || res.stdout}`);
  }
  return res.stdout;
}

function patchStyles(xml) {
  let out = xml.replace(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/, docDefaults());

  for (const [id, definition] of Object.entries(buildStyles())) {
    const existing = new RegExp(
      `<w:style [^>]*w:styleId="${id}"[^>]*>[\\s\\S]*?</w:style>`
    );
    const compact = definition.replace(/\n\s*/g, '');
    out = existing.test(out)
      ? out.replace(existing, compact)
      : out.replace('</w:styles>', `${compact}</w:styles>`);
  }

  // Heading character styles inherit Word's blue theme colour — drop them so
  // nothing in the document can pick it up.
  out = out.replace(/<w:color w:val="2F5496"[^/]*\/>/g, '');
  return out;
}

function buildTemplate(profile) {
  LINE = profile.line;

  const work = mkdtempSync(join(tmpdir(), 'reference-docx-'));

  try {
    const base = join(work, 'base.docx');
    writeFileSync(base, run('pandoc', ['--print-default-data-file', 'reference.docx'], {
      encoding: 'buffer',
    }));
    run('unzip', ['-o', '-q', base, '-d', join(work, 'docx')]);

    const stylesPath = join(work, 'docx', 'word', 'styles.xml');
    writeFileSync(stylesPath, patchStyles(readFileSync(stylesPath, 'utf8')));

    const docPath = join(work, 'docx', 'word', 'document.xml');
    const document = readFileSync(docPath, 'utf8').replace(
      /<w:sectPr[\s\S]*?<\/w:sectPr>/,
      sectPr(profile.margins)
    );
    writeFileSync(docPath, document);

    const output = join(__dirname, profile.output);
    const built = join(work, profile.output);
    run('zip', ['-r', '-q', '-X', built, '.'], { cwd: join(work, 'docx') });
    copyFileSync(built, output);

    console.log(`[ok] ${output}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

for (const profile of Object.values(PROFILES)) {
  buildTemplate(profile);
}
