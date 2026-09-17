#!/usr/bin/env node
/**
 * Lab report .docx generator
 *
 * Converts markdown lab files to .docx using Pandoc.
 * Labs are discovered in course modules by scanning for files with `type: lab` in frontmatter.
 * Grading criteria files (_grading.md) are processed separately at the course level.
 *
 * Prerequisites:
 *   macOS:   brew install pandoc
 *   Ubuntu:  sudo apt install pandoc
 *   Windows: choco install pandoc
 */

import { spawnSync } from 'child_process';
import {
  readdirSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  rmSync,
  statSync
} from 'fs';
import { join, basename, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(ROOT_DIR, 'content');
const OUTPUT_DIR = join(ROOT_DIR, 'public', 'labs');
const TEMPLATE_DIR = join(__dirname, 'templates');
const TEMPLATE_PATH = join(TEMPLATE_DIR, 'lab-template.docx');
const FILTER_PATH = join(TEMPLATE_DIR, 'lab-filter.lua');

// Markdown reader extensions and writer options shared by every conversion.
// Highlighting is off: the reference guides print code in plain black.
const PANDOC_ARGS = [
  '--from=markdown+yaml_metadata_block+pipe_tables+fenced_code_blocks+task_lists',
  '--to=docx',
  '--wrap=none',
  '--standalone',
  '--no-highlight'
];

// List geometry of the reference guides (twips): 2 cm indent, 0.75 cm hanging,
// dash bullets. Pandoc builds its own numbering definitions and ignores the
// ones in the reference document, so they are rewritten after conversion.
const LIST_GEOMETRY = {
  left: 1134,
  hanging: 425,
  bullet: '–'
};

// Text width of the page in the reference guides (twips). Pandoc sizes a table
// from the markdown source and leaves narrow ones auto-width, so every table is
// stretched to the text width afterwards, keeping its column proportions.
const TABLE_WIDTH = 9637;

// Course directory to subject code mapping
const SUBJECT_MAP = {
  '01-operating-systems': 'os',
  '02-software-security-methods': 'pmzi'
};

// Subject codes to Ukrainian abbreviations for filenames
const SUBJECT_NAMES = {
  'os': 'ОС',
  'pmzi': 'ПМЗІ'
};

/**
 * Verifies Pandoc is installed and available
 */
function checkPandoc() {
  try {
    const result = spawnSync('pandoc', ['--version'], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error('Pandoc not found');
    }
    const version = result.stdout.split('\n')[0];
    console.log(`[ok] ${version}`);
    return true;
  } catch {
    console.error('[error] Pandoc not found');
    console.error('  Install Pandoc:');
    console.error('    macOS:   brew install pandoc');
    console.error('    Ubuntu:  sudo apt install pandoc');
    console.error('    Windows: choco install pandoc');
    return false;
  }
}

/**
 * Parses YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const data = {};

  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse numeric values
    if (/^\d+$/.test(value)) {
      data[key] = parseInt(value, 10);
    } else {
      data[key] = value;
    }
  });

  return data;
}

/**
 * Generates output filename in Ukrainian format
 */
function generateOutputName(frontmatter, subject) {
  const subjectName = SUBJECT_NAMES[subject] || subject.toUpperCase();
  // Use labNumber if specified, otherwise fall back to order
  const labNum = frontmatter.labNumber || frontmatter.order || 1;
  const title = frontmatter.title || 'Untitled';

  // Sanitize title for filename
  const cleanTitle = title
    .replace(/[^\wа-яіїєґА-ЯІЇЄҐ\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  return `ЛР${labNum}_${subjectName}_${cleanTitle}`;
}

/**
 * Recursively finds all .md files in a directory
 */
function findAllMdFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Discovers all lab files across course modules
 */
function findLabFiles() {
  const labs = [];

  const langDirs = readdirSync(CONTENT_DIR).filter(d =>
    statSync(join(CONTENT_DIR, d)).isDirectory()
  );

  for (const lang of langDirs) {
    const langPath = join(CONTENT_DIR, lang);

    const courseDirs = readdirSync(langPath).filter(d =>
      statSync(join(langPath, d)).isDirectory()
    );

    for (const courseDir of courseDirs) {
      const coursePath = join(langPath, courseDir);
      const subject = SUBJECT_MAP[courseDir];

      if (!subject) continue;

      const mdFiles = findAllMdFiles(coursePath);

      for (const filePath of mdFiles) {
        // Skip grading criteria files (handled separately)
        if (basename(filePath).startsWith('_')) continue;

        const content = readFileSync(filePath, 'utf8');
        const frontmatter = parseFrontmatter(content);

        // Only process files with type: lab
        if (frontmatter.type !== 'lab') continue;

        labs.push({
          path: filePath,
          subject,
          lang,
          courseDir,
          frontmatter,
          filename: basename(filePath)
        });
      }
    }
  }

  return labs;
}

/**
 * Stretches a table to the text width, keeping the column proportions Pandoc
 * derived from the markdown source.
 */
function stretchTable(table) {
  const columns = [...table.matchAll(/<w:gridCol w:w="([\d.]+)"\s*\/>/g)].map(m =>
    parseFloat(m[1])
  );

  const total = columns.reduce((sum, width) => sum + width, 0);
  if (!total) return table;

  const scaled = columns.map(width => Math.round((width / total) * TABLE_WIDTH));
  scaled[scaled.length - 1] += TABLE_WIDTH - scaled.reduce((sum, w) => sum + w, 0);

  let index = 0;
  let out = table.replace(
    /<w:gridCol w:w="[\d.]+"\s*\/>/g,
    () => `<w:gridCol w:w="${scaled[index++]}"/>`
  );

  out = out.replace(
    /<w:tblW[^/]*\/>/,
    `<w:tblW w:type="dxa" w:w="${TABLE_WIDTH}"/>`
  );

  return out.includes('<w:tblLayout')
    ? out
    : out.replace('</w:tblPr>', '<w:tblLayout w:type="fixed"/></w:tblPr>');
}

/**
 * Applies the parts of the reference layout that the reference document cannot
 * carry: list indents and bullets (Pandoc writes numbering.xml itself),
 * justified list items (Pandoc shares the Compact style with table cells) and
 * full-width tables (Pandoc sizes them from the markdown source).
 */
function applyReferenceFormatting(docxPath) {
  const work = mkdtempSync(join(tmpdir(), 'lab-docx-'));

  try {
    run('unzip', ['-o', '-q', docxPath, '-d', work]);

    const documentPath = join(work, 'word', 'document.xml');
    const document = readFileSync(documentPath, 'utf8')
      .replace(
        /<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*?<\/w:pPr>/g,
        (properties) =>
          properties.includes('<w:numPr>') && !properties.includes('<w:jc ')
            ? properties.replace('</w:pPr>', '<w:jc w:val="both"/></w:pPr>')
            : properties
      )
      .replace(/<w:tbl>[\s\S]*?<\/w:tblGrid>/g, stretchTable);

    writeFileSync(documentPath, document);

    const numberingPath = join(work, 'word', 'numbering.xml');
    const { left, hanging, bullet } = LIST_GEOMETRY;
    // Checkbox markers of task lists carry meaning; every other bullet glyph
    // Pandoc picks (•, ◦, ▪, Symbol font) becomes the dash of the guides.
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
          isBullet && !CHECKBOXES.includes(glyph)
            ? `<w:lvlText w:val="${bullet}"/>`
            : match
        );

        // Symbol / Wingdings are only there for Pandoc's own bullet glyphs.
        return out.replace(/<w:rFonts\b[^/]*w:ascii="(Symbol|Wingdings)"[^/]*\s*\/>/, '');
      }
    );

    if (patched !== null) {
      writeFileSync(numberingPath, patched);
    }

    run('zip', ['-r', '-q', '-X', 'patched.docx', '.', '-x', 'patched.docx'], { cwd: work });
    copyFileSync(join(work, 'patched.docx'), docxPath);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Runs a command, throwing on a non-zero exit status
 */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });

  if (result.status !== 0) {
    throw new Error(`${command}: ${(result.stderr || result.stdout || '').trim()}`);
  }

  return result.stdout;
}

/**
 * Converts a markdown file to .docx through Pandoc
 */
function convert(inputPath, outputPath, metadata = {}) {
  const args = [
    inputPath,
    '-o', outputPath,
    ...PANDOC_ARGS,
    `--reference-doc=${TEMPLATE_PATH}`,
    `--lua-filter=${FILTER_PATH}`
  ];

  for (const [key, value] of Object.entries(metadata)) {
    args.push('--metadata', `${key}=${value}`);
  }

  run('pandoc', args, { cwd: ROOT_DIR });
  applyReferenceFormatting(outputPath);
}

/**
 * Converts a single lab markdown file to .docx
 *
 * The heading of the guide comes from the frontmatter rather than the body:
 * "Лабораторна робота №N" followed by the lab title in caps, as in the
 * reference guides.
 */
function generateDocx(lab) {
  const { path: filePath, subject, frontmatter } = lab;

  const outputSubDir = join(OUTPUT_DIR, subject);
  if (!existsSync(outputSubDir)) {
    mkdirSync(outputSubDir, { recursive: true });
  }

  const outputName = generateOutputName(frontmatter, subject);
  const outputPath = join(outputSubDir, `${outputName}.docx`);
  const labNum = frontmatter.labNumber || frontmatter.order || 1;

  try {
    convert(filePath, outputPath, {
      title: `Лабораторна робота №${labNum}`,
      subtitle: frontmatter.title || ''
    });

    console.log(`[ok] ${subject}/${outputName}.docx`);
    return true;
  } catch (error) {
    console.error(`[error] ${outputName}.docx`);
    console.error(`        ${error.message}`);
    return false;
  }
}

/**
 * Generates grading criteria documents for each course
 */
function generateGradingDocs() {
  const langDirs = readdirSync(CONTENT_DIR).filter(d =>
    statSync(join(CONTENT_DIR, d)).isDirectory()
  );

  for (const lang of langDirs) {
    const langPath = join(CONTENT_DIR, lang);

    const courseDirs = readdirSync(langPath).filter(d =>
      statSync(join(langPath, d)).isDirectory()
    );

    for (const courseDir of courseDirs) {
      const gradingPath = join(langPath, courseDir, '_grading.md');

      if (!existsSync(gradingPath)) continue;

      const subject = SUBJECT_MAP[courseDir];
      if (!subject) continue;

      const outputSubDir = join(OUTPUT_DIR, subject);
      if (!existsSync(outputSubDir)) {
        mkdirSync(outputSubDir, { recursive: true });
      }

      const subjectName = SUBJECT_NAMES[subject] || subject.toUpperCase();
      const outputName = `Критерії_оцінювання_${subjectName}`;
      const frontmatter = parseFrontmatter(readFileSync(gradingPath, 'utf8'));

      try {
        convert(gradingPath, join(outputSubDir, `${outputName}.docx`), {
          title: frontmatter.title || 'Критерії оцінювання',
          subtitle: ''
        });

        console.log(`[ok] ${subject}/${outputName}.docx`);
      } catch (error) {
        console.error(`[error] ${outputName}.docx: ${error.message}`);
      }
    }
  }
}

/**
 * Main entry point
 */
function main() {
  console.log('Generating lab .docx files\n');

  if (!checkPandoc()) {
    process.exit(1);
  }

  console.log('');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const labs = findLabFiles();

  if (labs.length === 0) {
    console.log('No lab files found.');
    console.log('Ensure files have frontmatter with type: lab');
    return;
  }

  console.log(`Found ${labs.length} lab files\n`);

  let success = 0;
  let failed = 0;

  for (const lab of labs) {
    if (generateDocx(lab)) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('');
  console.log('Generating grading criteria...');
  generateGradingDocs();

  console.log('');
  console.log(`Done: ${success} generated` + (failed > 0 ? `, ${failed} failed` : ''));
  console.log(`Output: ${OUTPUT_DIR}`);
}

main();
