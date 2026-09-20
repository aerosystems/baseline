/**
 * Shared part of the .docx generators: running Pandoc and the post-processing
 * that a reference document cannot carry.
 *
 * Pandoc writes numbering.xml itself and sizes tables from the markdown source,
 * so list and table geometry has to be patched into the finished file. Lab
 * guides and student reports differ only in text width and indents, so those
 * values are passed in as parameters.
 */

import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Pandoc reader and writer options shared by every conversion.
// Highlighting is off: printed documents show code in plain black.
export const PANDOC_ARGS = [
  '--from=markdown+yaml_metadata_block+pipe_tables+fenced_code_blocks+task_lists+raw_attribute',
  '--to=docx',
  '--wrap=none',
  '--standalone',
  '--no-highlight'
];

/** Runs a command, throwing on a non-zero exit status */
export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });

  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

/**
 * Stretches a table to the text width, keeping the column proportions Pandoc
 * derived from the markdown source.
 */
export function stretchTable(table, tableWidth) {
  const columns = [...table.matchAll(/<w:gridCol w:w="([\d.]+)"\s*\/>/g)].map(m => parseFloat(m[1]));

  const total = columns.reduce((sum, width) => sum + width, 0);
  if (!total) return table;

  const scaled = columns.map(width => Math.round((width / total) * tableWidth));
  scaled[scaled.length - 1] += tableWidth - scaled.reduce((sum, w) => sum + w, 0);

  let index = 0;
  let out = table.replace(/<w:gridCol w:w="[\d.]+"\s*\/>/g, () => `<w:gridCol w:w="${scaled[index++]}"/>`);

  out = out.replace(/<w:tblW[^/]*\/>/, `<w:tblW w:type="dxa" w:w="${tableWidth}"/>`);

  return out.includes('<w:tblLayout')
    ? out
    : out.replace('</w:tblPr>', '<w:tblLayout w:type="fixed"/></w:tblPr>');
}

/**
 * Applies the parts of the reference layout a reference document cannot carry:
 * list indents and bullets (Pandoc writes numbering.xml itself), justified list
 * items (Pandoc shares the Compact style with table cells) and full-width
 * tables (Pandoc sizes them from the markdown source).
 */
/**
 * Timestamp every file inside the package gets before it is zipped again.
 *
 * A .docx is a zip, and zip stores the modification time of each entry. Without
 * this the repack writes the current time into every entry, so a regenerated
 * document differs byte for byte from the previous one even when its content is
 * identical — and all 56 guides show up as changed on every run.
 */
function freezeTimestamps(directory, epoch) {
  const stamp = new Date(Number(epoch) * 1000);
  const pad = value => String(value).padStart(2, '0');

  // touch -t expects CCYYMMDDhhmm.ss
  const formatted = `${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.getDate())}` +
                    `${pad(stamp.getHours())}${pad(stamp.getMinutes())}.${pad(stamp.getSeconds())}`;

  run('find', [directory, '-exec', 'touch', '-t', formatted, '{}', '+']);
}

export function applyReferenceFormatting(docxPath, { tableWidth, list, epoch }) {
  const work = mkdtempSync(join(tmpdir(), 'docx-format-'));

  try {
    run('unzip', ['-o', '-q', docxPath, '-d', work]);

    const documentPath = join(work, 'word', 'document.xml');
    const document = readFileSync(documentPath, 'utf8')
      .replace(
        /<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*?<\/w:pPr>/g,
        properties =>
          properties.includes('<w:numPr>') && !properties.includes('<w:jc ')
            ? properties.replace('</w:pPr>', '<w:jc w:val="both"/></w:pPr>')
            : properties
      )
      .replace(/<w:tbl>[\s\S]*?<\/w:tblGrid>/g, table => stretchTable(table, tableWidth));

    writeFileSync(documentPath, document);

    const numberingPath = join(work, 'word', 'numbering.xml');
    const { left, hanging, bullet } = list;
    // Checkbox markers carry meaning; every other bullet glyph Pandoc picks
    // (•, ◦, ▪, Symbol font) becomes the dash used by the reference documents
    const CHECKBOXES = ['☐', '☑', '☒'];

    const patched = !existsSync(numberingPath) ? null : readFileSync(numberingPath, 'utf8').replace(
      /<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>[\s\S]*?<\/w:lvl>/g,
      (level, ilvl) => {
        const depth = parseInt(ilvl, 10);
        const isBullet = level.includes('<w:numFmt w:val="bullet"');

        let out = level.replace(
          /<w:ind\b[^/]*\/>/,
          `<w:ind w:left="${left + depth * 567}" w:hanging="${hanging}"/>`
        );

        out = out.replace(/<w:lvlText w:val="([^"]*)"\s*\/>/, (match, glyph) =>
          isBullet && !CHECKBOXES.includes(glyph) ? `<w:lvlText w:val="${bullet}"/>` : match
        );

        // Symbol / Wingdings are only there for Pandoc's own bullet glyphs
        return out.replace(/<w:rFonts\b[^/]*w:ascii="(Symbol|Wingdings)"[^/]*\s*\/>/, '');
      }
    );

    if (patched !== null) {
      writeFileSync(numberingPath, patched);
    }

    if (epoch) freezeTimestamps(work, epoch);

    run('zip', ['-r', '-q', '-X', 'patched.docx', '.', '-x', 'patched.docx'], { cwd: work });
    copyFileSync(join(work, 'patched.docx'), docxPath);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Timestamp Pandoc writes into the document properties.
 *
 * Without it every run produces a new timestamp, so regenerating the guides
 * marks all 56 files as changed while their content is identical. Taking the
 * date of the last commit that touched the source keeps the document honest and
 * the output reproducible: unchanged material, unchanged file.
 */
function sourceDateEpoch(sourcePath) {
  const log = spawnSync('git', ['log', '-1', '--format=%ct', '--', sourcePath], { encoding: 'utf8' });
  const committed = log.status === 0 ? log.stdout.trim() : '';

  if (committed) return committed;

  // Not in git yet (a freshly written report): fall back to the file itself
  try {
    return String(Math.floor(statSync(sourcePath).mtimeMs / 1000));
  } catch {
    return String(Math.floor(Date.now() / 1000));
  }
}

/** Converts markdown to .docx against a reference document and patches the result */
export function convert(inputPath, outputPath, { referenceDoc, filter, metadata = {}, layout, cwd, resourcePath, dateFrom }) {
  const args = [inputPath, '-o', outputPath, ...PANDOC_ARGS, `--reference-doc=${referenceDoc}`];

  if (filter) args.push(`--lua-filter=${filter}`);
  // Report images sit next to the report, not in the working directory
  if (resourcePath) args.push(`--resource-path=${resourcePath}`);

  for (const [key, value] of Object.entries(metadata)) {
    args.push('--metadata', `${key}=${value}`);
  }

  const epoch = sourceDateEpoch(dateFrom ?? inputPath);

  run('pandoc', args, { cwd, env: { ...process.env, SOURCE_DATE_EPOCH: epoch } });
  applyReferenceFormatting(outputPath, { ...layout, epoch });
}
