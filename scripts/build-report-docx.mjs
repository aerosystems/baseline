#!/usr/bin/env node
/**
 * Student report (markdown) → .docx in the standard college format.
 *
 * A student writes only the procedure, the answers and the conclusion. The title
 * page, the topic, the aim and the equipment come from where they already exist:
 * the title-page sample and the lab material in content/. The lab number follows
 * the curriculum of the group, so the same lab is No. 5 for KMP-23 and No. 11
 * for PZ-24.
 *
 * Usage:
 *   node scripts/build-report-docx.mjs reports/…/report.md    # given reports
 *   node scripts/build-report-docx.mjs --changed              # changed in HEAD
 *   node scripts/build-report-docx.mjs --changed --since=main
 */

import { spawnSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, mkdtempSync } from 'fs';
import { join, dirname, basename, relative } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

import { convert, run } from './lib/docx.mjs';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content', 'uk');
const REPORTS = join(ROOT, 'reports');
const TEMPLATE = join(ROOT, 'scripts', 'templates', 'report-template.docx');
const TITLE_TEMPLATES = join(ROOT, 'scripts', 'templates');

// Text width of a report: A4 minus the 25 and 10 mm margins
const LAYOUT = {
  tableWidth: 11906 - 1418 - 567,
  list: { left: 1134, hanging: 425, bullet: '–' }
};

const TEACHER = 'Костенко А.О.';

const DISCIPLINE = {
  '01-operating-systems': 'ОПЕРАЦІЙНІ СИСТЕМИ',
  '02-software-security-methods': 'ПРОГРАМНІ МЕТОДИ ЗАХИСТУ ІНФОРМАЦІЇ'
};

/**
 * Work code on the title page: ФКЗЕ. <specialty><subject><number>. <NN>ЛР
 *
 * The specialty depends on the group rather than the subject: PZ-24 is 121,
 * PZ-25 is already F2 under the new classifier, KMP is 123. The values come from
 * _programs.json, where they were copied from the curricula.
 *
 * XX is the student's position in the group roster, not the task variant — the
 * two usually coincide but not always. Two digits; without a number XX is left
 * in place so that it is visible on the title page.
 */
function workCode({ specialty, abbr, number, lab }) {
  const position = number ? String(number).padStart(2, '0') : 'XX';
  return `ФКЗЕ. ${specialty}${abbr}${position}. ${String(lab).padStart(2, '0')}ЛР`;
}

/**
 * Academic year as the title pages spell it: "2026 - 2027" for a year that
 * starts in September.
 */
function academicYear(date = new Date()) {
  const start = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start} - ${start + 1}`;
}

function fail(message) {
  console.error(`[error] ${message}`);
  process.exitCode = 1;
}

const escapeXml = value =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Every .md of a course — used to find a lab by its number in the group's curriculum */
function courseFiles(course) {
  const base = join(CONTENT, course);
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter(entry => statSync(join(base, entry)).isDirectory())
    .flatMap(module =>
      readdirSync(join(base, module))
        .filter(file => file.endsWith('.md'))
        .map(file => ({ key: `${module}/${file.replace(/\.md$/, '')}`, path: join(base, module, file) }))
    );
}

/**
 * The lab a report describes. The number is read against the group's curriculum:
 * _programs.json tells which lab carries number N for this particular group.
 */
function findLab({ course, group, lab }) {
  const programsPath = join(CONTENT, course, '_programs.json');
  if (!existsSync(programsPath)) throw new Error(`missing ${relative(ROOT, programsPath)}`);

  const programs = JSON.parse(readFileSync(programsPath, 'utf8'));
  const groupEntry = programs.groups?.find(entry => entry.id === group);
  if (!groupEntry) throw new Error(`group "${group}" is not listed in the curricula of ${course}`);

  const key = Object.entries(programs.lessons).find(
    ([, byProgram]) => byProgram[groupEntry.program]?.labNumber === lab
  )?.[0];

  if (!key) throw new Error(`the curriculum of ${group} has no lab number ${lab}`);

  const file = courseFiles(course).find(entry => entry.key === key);
  if (!file) throw new Error(`material ${key} not found`);

  const { data, body } = parseFrontmatter(readFileSync(file.path, 'utf8'));
  const lead = label => body.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'))?.[1]?.trim();

  return {
    topic: data.title ?? data.shortTitle ?? key,
    goal: lead('Мета'),
    equipment: lead('Обладнання') ?? data.equipment?.join('; ')
  };
}

/** Title page as raw OOXML with the values substituted */
function titlePage(report) {
  const values = {
    lab: report.lab,
    discipline: DISCIPLINE[report.course] ?? report.course,
    student: report.student,
    group: report.groupTitle,
    teacher: report.teacher ?? TEACHER,
    year: report.year ?? new Date().getFullYear(),
    academicYear: report.academicYear ?? academicYear(),
    code: workCode(report)
  };

  // Each course has its own title page: the discipline, the code and the year
  // are spelled differently in the samples
  const template = join(TITLE_TEMPLATES, `report-title-${report.course}.xml`);
  if (!existsSync(template)) throw new Error(`no title page for course ${report.course}`);

  const xml = readFileSync(template, 'utf8').replace(/^<!--[\s\S]*?-->\s*/, '');

  return xml.replace(/{{(\w+)}}/g, (match, key) =>
    key in values ? escapeXml(values[key]) : match
  );
}

/** Report path → course, group, student's login */
function parsePath(reportPath) {
  const parts = relative(REPORTS, reportPath).split('/');
  // <course>/labs/<group>/<number>/<login>/report.md
  if (parts.length !== 6 || parts[1] !== 'labs') {
    throw new Error('path must be reports/<course>/labs/<group>/<number>/<login>/report.md');
  }
  return { course: parts[0], group: parts[2], number: parts[3], login: parts[4] };
}

/**
 * A stub is a report the student has not written yet: opening an assignment
 * creates one per student, and those must not turn into documents.
 *
 * The test is structural rather than a word count: a stub holds nothing but the
 * task comment, the section headings and empty numbered items. One line of real
 * writing anywhere makes it a report, however short.
 */
function isStub(body) {
  return body
    .replace(/<!--[\s\S]*?-->/g, '')      // the task in a comment
    .split('\n')
    .map(line => line.trim())
    .every(line =>
      line === '' ||
      /^#{1,6}\s/.test(line) ||           // a section heading
      /^\d+$/.test(line)                  // a numbered item with no text
    );
}

function buildReport(reportPath) {
  const location = parsePath(reportPath);
  const { data, body } = parseFrontmatter(readFileSync(reportPath, 'utf8'));

  if (isStub(body)) {
    console.log(`[skip] ${relative(ROOT, reportPath)} — stub, nothing to build`);
    return null;
  }

  for (const field of ['course', 'group', 'lab', 'student']) {
    if (!data[field]) throw new Error(`frontmatter has no "${field}" field`);
  }
  if (data.course !== location.course || data.group !== location.group) {
    throw new Error('frontmatter does not match the path: course or group differs');
  }

  const programs = JSON.parse(readFileSync(join(CONTENT, data.course, '_programs.json'), 'utf8'));
  const groupEntry = programs.groups?.find(entry => entry.id === data.group);

  const lab = findLab(data);
  const report = {
    ...data,
    // the roster position falls back to the variant: in most groups they match
    number: data.number ?? data.variant,
    groupTitle: groupEntry?.title ?? data.group,
    specialty: groupEntry?.specialty ?? '',
    abbr: programs.abbr ?? ''
  };

  // The student writes no topic, aim or equipment — those come from the lab
  const preamble = [
    `**Тема:** ${lab.topic}.`,
    lab.goal ? `**Мета:** ${lab.goal}` : null,
    lab.equipment ? `**Обладнання:** ${lab.equipment}` : null,
    data.variant ? `**Варіант:** ${data.variant}.` : null
  ].filter(Boolean).join('\n\n');

  const source = [
    '```{=openxml}',
    titlePage(report),
    '```',
    '',
    '```{=openxml}',
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
    '```',
    '',
    preamble,
    '',
    body.trim()
  ].join('\n');

  const work = mkdtempSync(join(tmpdir(), 'report-'));
  const outputPath = join(dirname(reportPath), `ЛР${String(data.lab).padStart(2, '0')}_${location.login}.docx`);

  try {
    const sourcePath = join(work, 'report.md');
    writeFileSync(sourcePath, source);

    convert(sourcePath, outputPath, {
      dateFrom: reportPath,
      referenceDoc: TEMPLATE,
      layout: LAYOUT,
      cwd: ROOT,
      // report images are relative to the student's directory
      resourcePath: dirname(reportPath)
    });

    console.log(`[ok] ${relative(ROOT, outputPath)}`);
    return outputPath;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** Reports changed in the last commit, or against the given ref */
function changedReports(since) {
  // GitHub passes all zeros when a branch is created, and a shallow clone may
  // not contain the given commit — fall back to the last commit then
  const resolvable = since && !/^0+$/.test(since) &&
    spawnSync('git', ['rev-parse', '--verify', '--quiet', `${since}^{commit}`], { cwd: ROOT }).status === 0;

  if (since && !resolvable) {
    console.warn(`[warn] commit "${since}" is unreachable — using the last commit instead`);
  }

  const range = resolvable ? `${since}...HEAD` : 'HEAD~1..HEAD';
  const output = run('git', ['diff', '--name-only', '--diff-filter=d', range], { cwd: ROOT });

  return output
    .split('\n')
    .filter(line => /^reports\/.*\/report\.md$/.test(line))
    // underscore directories are internal (template, samples)
    .filter(line => !line.split('/').some(part => part.startsWith('_')))
    .map(line => join(ROOT, line));
}

function main() {
  const args = process.argv.slice(2);
  const since = args.find(arg => arg.startsWith('--since='))?.slice('--since='.length);

  const targets = args.includes('--changed')
    ? changedReports(since)
    : args.filter(arg => !arg.startsWith('--')).map(arg => join(ROOT, arg));

  if (!targets.length) {
    console.log('No changed reports.');
    return;
  }

  for (const target of targets) {
    try {
      buildReport(target);
    } catch (error) {
      fail(`${relative(ROOT, target)}: ${error.message}`);
    }
  }
}

main();
