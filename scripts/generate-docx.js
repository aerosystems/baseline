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
import { readdirSync, existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(ROOT_DIR, 'content');
const OUTPUT_DIR = join(ROOT_DIR, 'public', 'labs');
const TEMPLATE_DIR = join(__dirname, 'templates');

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
 * Converts a single lab markdown file to .docx
 */
function generateDocx(lab) {
  const { path: filePath, subject, frontmatter } = lab;

  const outputSubDir = join(OUTPUT_DIR, subject);
  if (!existsSync(outputSubDir)) {
    mkdirSync(outputSubDir, { recursive: true });
  }

  const outputName = generateOutputName(frontmatter, subject);
  const outputPath = join(outputSubDir, `${outputName}.docx`);

  const templatePath = join(TEMPLATE_DIR, 'lab-template.docx');
  const hasTemplate = existsSync(templatePath);

  const args = [
    filePath,
    '-o', outputPath,
    '--from=markdown+yaml_metadata_block+pipe_tables+fenced_code_blocks',
    '--wrap=none',
    '--standalone'
  ];

  if (hasTemplate) {
    args.push('--reference-doc=' + templatePath);
  }

  try {
    const result = spawnSync('pandoc', args, {
      encoding: 'utf8',
      cwd: ROOT_DIR
    });

    if (result.status !== 0) {
      console.error(`[error] ${outputName}.docx`);
      console.error(`        ${result.stderr}`);
      return false;
    }

    console.log(`[ok] ${subject}/${outputName}.docx`);
    return true;
  } catch (error) {
    console.error(`[error] ${outputName}.docx: ${error.message}`);
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
      const outputPath = join(outputSubDir, `Критерії_оцінювання_${subjectName}.docx`);

      const templatePath = join(TEMPLATE_DIR, 'lab-template.docx');
      const hasTemplate = existsSync(templatePath);

      const args = [
        gradingPath,
        '-o', outputPath,
        '--from=markdown+yaml_metadata_block',
        '--wrap=none',
        '--standalone'
      ];

      if (hasTemplate) {
        args.push('--reference-doc=' + templatePath);
      }

      try {
        const result = spawnSync('pandoc', args, {
          encoding: 'utf8',
          cwd: ROOT_DIR
        });

        if (result.status === 0) {
          console.log(`[ok] ${subject}/Критерії_оцінювання_${subjectName}.docx`);
        } else {
          console.error(`[error] Критерії_оцінювання_${subjectName}.docx: ${result.stderr}`);
        }
      } catch (error) {
        console.error(`[error] Критерії_оцінювання_${subjectName}.docx: ${error.message}`);
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
