#!/usr/bin/env node
/**
 * Rebuilds scripts/templates/report-title.xml from the title-page sample in data/.
 *
 * Run it after the sample itself changes (a new year, a different teacher in the
 * signature). The script drops the authoring note that carries the only image and
 * puts placeholders where the variable values are.
 *
 * Usage: node scripts/templates/build-report-title.mjs
 */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SOURCE = join(ROOT, 'data', 'Титулка_ЛР_ОС_ПЗ-25.docx');
const OUTPUT = join(__dirname, 'report-title.xml');

// The authoring note "4 пробіл, нижнє підкреслення" is the only paragraph that
// carries an image; the generated title page does not include it
const NOTE = '4 пробіл, нижнє підкреслення';

const SUBSTITUTIONS = [
  ['З ЛАБОРАТОРНОЇ РОБОТИ №1', 'З ЛАБОРАТОРНОЇ РОБОТИ №{{lab}}'],
  ['ОПЕРАЦІЙНІ СИСТЕМИ', '{{discipline}}'],
  ['ФКЗЕ. 121ОСXX. 02ЛР / ФКЗЕ. F2ОСXX. 02ЛР', '{{code}}'],
  ['Студент    ________________________', 'Студент    {{student}}'],
  ['ПЗ-25-1/9', '{{group}}'],
  ['Костенко А.О.', '{{teacher}}'],
  ['2026', '{{year}}']
];

const HEADER = `<!--
  Title page of a lab report.

  Extracted from data/Титулка_ЛР_ОС_ПЗ-25.docx: paragraphs with direct formatting,
  no named styles and no images. Pandoc inserts this fragment into the document as
  a raw {=openxml} block, so no two .docx files have to be merged.

  Placeholders: {{lab}} {{discipline}} {{code}} {{student}} {{group}} {{teacher}} {{year}}
  Rebuild after the sample changes: node scripts/templates/build-report-title.mjs
-->
`;

const work = mkdtempSync(join(tmpdir(), 'report-title-'));

try {
  execFileSync('unzip', ['-o', '-q', SOURCE, 'word/document.xml', '-d', work]);
  const xml = readFileSync(join(work, 'word', 'document.xml'), 'utf8');

  const paragraphs = xml.match(/<w:p\b[\s\S]*?<\/w:p>/g) ?? [];
  const kept = paragraphs.filter(paragraph => !paragraph.includes(NOTE));

  if (kept.some(paragraph => paragraph.includes('<w:drawing>') || paragraph.includes('<w:pict>'))) {
    throw new Error('an image is left in the title page — it cannot be inlined this way');
  }

  let body = kept.join('\n');
  for (const [from, to] of SUBSTITUTIONS) {
    if (!body.includes(from)) throw new Error(`the title page has no line "${from}"`);
    body = body.replaceAll(from, to);
  }

  writeFileSync(OUTPUT, HEADER + body + '\n');
  console.log(`[ok] ${OUTPUT} — ${kept.length} paragraphs`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
