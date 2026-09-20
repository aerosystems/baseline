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
import { convert, run } from './lib/docx.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(ROOT_DIR, 'content');
const OUTPUT_DIR = join(ROOT_DIR, 'public', 'labs');
const TEMPLATE_DIR = join(__dirname, 'templates');
const TEMPLATE_PATH = join(TEMPLATE_DIR, 'lab-template.docx');
const FILTER_PATH = join(TEMPLATE_DIR, 'lab-filter.lua');

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

// Geometry patched into the finished file: text width and list indents
const LAYOUT = { tableWidth: TABLE_WIDTH, list: LIST_GEOMETRY };

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
 *
 * The file is named after the short title; the official title from the
 * curriculum goes into the document itself.
 */
function generateOutputName(frontmatter, subject, labNumber) {
  const subjectName = SUBJECT_NAMES[subject] || subject.toUpperCase();
  // The number comes from the curriculum; without curricula, from the frontmatter
  const labNum = labNumber || frontmatter.labNumber || frontmatter.order || 1;
  const title = frontmatter.shortTitle || frontmatter.title || 'Untitled';

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
/**
 * Curricula of a course. One lab has a different number and different hours in
 * different groups, so guides are generated as a separate set per curriculum.
 */
function loadPrograms(lang, courseDir) {
  const path = join(CONTENT_DIR, lang, courseDir, '_programs.json');
  if (!existsSync(path)) return null;

  return JSON.parse(readFileSync(path, 'utf8'));
}

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

        // The key in _programs.json is "module/slug", as in the content tree
        const relative = filePath.slice(coursePath.length + 1).replace(/\.md$/, '');

        labs.push({
          path: filePath,
          subject,
          lang,
          courseDir,
          frontmatter,
          key: relative,
          filename: basename(filePath)
        });
      }
    }
  }

  return labs;
}

/**
 * Converts a single lab markdown file to .docx
 *
 * The heading of the guide comes from the frontmatter rather than the body:
 * "Лабораторна робота №N" followed by the lab title in caps, as in the
 * reference guides.
 */
function generateDocx(lab, program) {
  const { path: filePath, subject, frontmatter } = lab;

  // Each group's guides live in their own subdirectory
  const outputSubDir = program ? join(OUTPUT_DIR, subject, program.id) : join(OUTPUT_DIR, subject);
  if (!existsSync(outputSubDir)) {
    mkdirSync(outputSubDir, { recursive: true });
  }

  const labNum = program?.item.labNumber || frontmatter.labNumber || frontmatter.order || 1;
  const outputName = generateOutputName(frontmatter, subject, labNum);
  const outputPath = join(outputSubDir, `${outputName}.docx`);

  // Hours differ between groups too, and the lab text states them in a
  // "Тривалість: …" paragraph — substitute the value from the curriculum
  let sourcePath = filePath;
  const hours = program?.item.hours;
  if (hours) {
    const content = readFileSync(filePath, 'utf8')
      .replace(/^\*\*Тривалість:\*\*.*$/m, `**Тривалість:** ${academicHours(hours)}.`);
    sourcePath = join(tmpdir(), `${outputName}.md`);
    writeFileSync(sourcePath, content);
  }

  try {
    convert(sourcePath, outputPath, {
      referenceDoc: TEMPLATE_PATH,
      filter: FILTER_PATH,
      layout: LAYOUT,
      cwd: ROOT_DIR,
      metadata: {
        title: `Лабораторна робота №${labNum}`,
        subtitle: frontmatter.title || ''
      }
    });

    const label = program ? `${subject}/${program.id}` : subject;
    console.log(`[ok] ${label}/${outputName}.docx`);
    return outputPath;
  } catch (error) {
    console.error(`[error] ${outputName}.docx`);
    console.error(`        ${error.message}`);
    return null;
  } finally {
    if (sourcePath !== filePath) rmSync(sourcePath, { force: true });
  }
}

/** Ukrainian plural for academic hours: "4 академічні години", "6 академічних годин" */
function academicHours(hours) {
  const form = hours >= 5 ? 'академічних годин' : 'академічні години';
  return `${hours} ${form}`;
}

/**
 * Generates grading criteria documents for each course
 */
function generateGradingDocs() {
  const written = [];

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

      const outputPath = join(outputSubDir, `${outputName}.docx`);

      try {
        convert(gradingPath, outputPath, {
          referenceDoc: TEMPLATE_PATH,
          filter: FILTER_PATH,
          layout: LAYOUT,
          cwd: ROOT_DIR,
          metadata: {
            title: frontmatter.title || 'Критерії оцінювання',
            subtitle: ''
          }
        });

        written.push(outputPath);
        console.log(`[ok] ${subject}/${outputName}.docx`);
      } catch (error) {
        console.error(`[error] ${outputName}.docx: ${error.message}`);
      }
    }
  }

  return written;
}

/**
 * Removes .docx files left over from earlier runs — renamed labs and changed
 * titles would otherwise pile up in public/labs as orphans.
 */
function removeStaleDocs(written) {
  const keep = new Set(written);

  const sweep = (dir, label) => {
    if (!existsSync(dir)) return;

    for (const name of readdirSync(dir)) {
      const path = join(dir, name);

      // Subdirectories are the per-group sets
      if (statSync(path).isDirectory()) {
        sweep(path, `${label}/${name}`);
        continue;
      }
      if (!name.endsWith('.docx') || keep.has(path)) continue;

      rmSync(path);
      console.log(`[rm] ${label}/${name}`);
    }
  };

  for (const subject of Object.values(SUBJECT_MAP)) {
    sweep(join(OUTPUT_DIR, subject), subject);
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

  const written = [];
  let failed = 0;

  // Cache curricula per course so _programs.json is not read for every lab
  const programsCache = new Map();

  for (const lab of labs) {
    const cacheKey = `${lab.lang}/${lab.courseDir}`;
    if (!programsCache.has(cacheKey)) {
      programsCache.set(cacheKey, loadPrograms(lab.lang, lab.courseDir));
    }
    const programs = programsCache.get(cacheKey);

    // A lab is issued to each group with its own number and hours; a course
    // without separate curricula keeps one set built from the frontmatter
    const variants = programs
      ? programs.programs
          .filter(program => programs.lessons[lab.key]?.[program.id])
          .map(program => ({ id: program.id, item: programs.lessons[lab.key][program.id] }))
      : [null];

    if (!variants.length) {
      console.log(`[skip] ${lab.filename} — not part of any curriculum`);
      continue;
    }

    for (const variant of variants) {
      const outputPath = generateDocx(lab, variant);
      if (outputPath) {
        written.push(outputPath);
      } else {
        failed++;
      }
    }
  }

  console.log('');
  console.log('Generating grading criteria...');
  written.push(...generateGradingDocs());

  console.log('');
  removeStaleDocs(written);

  console.log('');
  console.log(`Done: ${written.length} generated` + (failed > 0 ? `, ${failed} failed` : ''));
  console.log(`Output: ${OUTPUT_DIR}`);
}

main();
