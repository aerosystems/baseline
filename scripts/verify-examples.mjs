#!/usr/bin/env node
/**
 * Verification of code examples in the course materials.
 *
 * Why: lectures and labs hold about a hundred C++ blocks and a few dozen
 * "program output" blocks. That output has to be real, otherwise a student runs
 * the code and sees something other than what the guide claims.
 *
 * What it does:
 *   1. Builds and runs every example that has main(). Blocks of one file
 *      complement each other: a later step refers to functions from an earlier
 *      one ("the implementation from step 2"). When a file has no such
 *      implementation, it is looked up across the whole subject — that is how
 *      labs asking to reuse sha256 from a previous work are handled.
 *   2. Prints the real output (--run <file>) so it can be pasted into the material.
 *   3. Looks for markup defects seen before: Cyrillic inside Latin words, hashes
 *      of the wrong length, foreign-language output in code blocks.
 *
 * Usage:
 *   node scripts/verify-examples.mjs                  # everything
 *   node scripts/verify-examples.mjs --lint           # markup only
 *   node scripts/verify-examples.mjs --run 08-lab-transposition
 */

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname, basename } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

// Libraries the teaching environment does not have: such examples are not built,
// their output was checked by hand
const EXTERNAL_HEADERS = ['sqlite3.h', 'openssl/', 'sodium.h', 'winsock2.h', 'windows.h'];

// Includes that the materials state in the first block of a topic and never repeat
const PRELUDE = [
  '#include <iostream>', '#include <string>', '#include <vector>', '#include <map>',
  '#include <set>', '#include <array>', '#include <algorithm>', '#include <numeric>',
  '#include <iomanip>', '#include <sstream>', '#include <cstdint>', '#include <cstring>',
  '#include <cmath>', '#include <chrono>', '#include <random>', '#include <functional>'
].join('\n');

const needsExternal = code => EXTERNAL_HEADERS.some(header => code.includes(header));

function findMarkdown(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findMarkdown(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

/**
 * The block a material presents as the program output. Recognised by the lead-in
 * before it ("Результат роботи програми:", "Вивід:"): examples sit next to
 * diagrams and cheat sheets, and those have nothing to be compared against.
 */
const OUTPUT_LEAD = /результат|вивід|виведе|надрукує|програма покаже/i;

// A note saying the exact numbers depend on the run: such output cannot be
// compared literally (time, salt, measured nanoseconds)
const OUTPUT_VARIES = /залеж|щоразу|у кожного|будуть свої|кожного запуску|свого часу/i;

function claimedOutput(blocks, index, lines) {
  const next = blocks[index + 1];
  if (!next || next.lang) return null;

  const lead = lines.slice(blocks[index].end, next.line - 1).join(' ').trim();
  if (!lead || lead.length > 200 || !OUTPUT_LEAD.test(lead)) return null;
  if (OUTPUT_VARIES.test(lead)) return null;

  const after = lines.slice(next.end, next.end + 6).join(' ');
  if (OUTPUT_VARIES.test(after)) return null;

  return next;
}

/** Compares output ignoring trailing spaces and blank lines */
function sameOutput(a, b) {
  const normalize = text => text.split('\n').map(line => line.trimEnd()).filter(Boolean).join('\n');
  return normalize(a) === normalize(b);
}

/** Code blocks: language, text, line number where the block starts */
function codeBlocks(text) {
  const blocks = [];
  const lines = text.split('\n');
  let start = null;
  let lang = '';

  lines.forEach((line, index) => {
    const fence = line.match(/^```(\w*)\s*$/);
    if (!fence) return;
    if (start === null) {
      start = index;
      lang = fence[1];
    } else {
      blocks.push({ lang, line: start + 1, end: index + 1, code: lines.slice(start + 1, index).join('\n') });
      start = null;
    }
  });

  return blocks;
}

function stripMain(code) {
  const start = code.search(/\bint\s+main\s*\(/);
  if (start === -1) return code;

  let depth = 0;
  for (let i = code.indexOf('{', start); i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) return code.slice(0, start) + code.slice(i + 1);
  }
  return code.slice(0, start);
}

/** Names of the functions a block defines */
function definedFunctions(code) {
  return (code.match(/^[A-Za-z_][\w:<>,\s&*]*?\b([A-Za-z_]\w*)\s*\([^;]*?\)\s*\{/gm) || [])
    .map(match => (match.match(/\b([A-Za-z_]\w*)\s*\(/) || [])[1])
    .filter(Boolean);
}

/**
 * Strips default argument values from repeated declarations: every step of a
 * material spells out the full signature, while the compiler allows a default
 * value to be given only once.
 */
function dropDuplicateDefaults(code, defined) {
  return code
    .split('\n')
    .map(line => {
      const prototype = line.match(/^[A-Za-z_][\w:<>,\s&*]*?\b([A-Za-z_]\w*)\s*\([^{]*\)\s*;\s*$/);
      return prototype && defined.has(prototype[1]) ? line.replace(/\s*=\s*[^,)]+/g, '') : line;
    })
    .join('\n');
}

/** Cuts a function definition out of the code — when another block already provides it */
function removeFunction(code, name) {
  const signature = new RegExp(`^[A-Za-z_][\\w:<>,\\s&*]*?\\b${name}\\s*\\([^;]*?\\)\\s*\\{`, 'm');
  const match = code.match(signature);
  if (!match) return code;

  // A declaration is left in place of the definition: neighbouring blocks still
  // call it. Default argument values are dropped so the definition keeps them.
  const prototype = match[0].replace(/\{\s*$/, '').replace(/\s*=\s*[^,)]+/g, '').trim() + ';';

  const start = match.index;
  let depth = 0;
  for (let i = code.indexOf('{', start); i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) {
      return code.slice(0, start) + prototype + code.slice(i + 1);
    }
  }
  return code.slice(0, start) + prototype;
}

/**
 * Joins blocks into one translation unit. A later step often restates a function
 * from an earlier one — the assembled code keeps the last version.
 */
function translationUnit(library, block) {
  const seen = new Set(definedFunctions(block));
  const parts = [];

  for (const entry of [...library].reverse()) {
    const names = definedFunctions(entry);
    const fresh = names.filter(name => !seen.has(name));
    if (names.length && !fresh.length) continue;

    const trimmed = names
      .filter(name => seen.has(name))
      .reduce((code, name) => removeFunction(code, name), entry);

    fresh.forEach(name => seen.add(name));
    parts.unshift(trimmed);
  }

  const defined = new Set([...parts, block].flatMap(definedFunctions));
  const cleaned = [...parts, block].map(part => dropDuplicateDefaults(part, defined));

  return [PRELUDE, ...cleaned].join('\n\n');
}

/** Whether a block can serve as a library: explanatory fragments ("let us read
 *  the code") are bare statements and do not compile on their own */
function isReusable(library, code, work) {
  const sourcePath = join(work, 'probe.cpp');
  writeFileSync(sourcePath, translationUnit(library, code));
  return spawnSync('g++', ['-std=c++17', '-w', '-fsyntax-only', sourcePath], { encoding: 'utf8' }).status === 0;
}

/** Names the assembled example is missing — from compiler and linker errors */
function missingSymbols(stderr = '') {
  const patterns = [
    /"([A-Za-z_][\w:]*)\(/g,                     // unresolved symbol, including a class method
    /use of undeclared identifier '([^']+)'/g,
    /unknown type name '([^']+)'/g,
    /no template named '([^']+)'/g
  ];
  const names = patterns.flatMap(pattern => [...stderr.matchAll(pattern)].map(m => m[1]));
  // For Class::method look up both the class and the method
  return [...new Set(names.flatMap(name => [name, ...name.split('::')]))].filter(Boolean);
}

/** Whether a block defines a name: a function, class, enum or constant */
function provides(code, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `\\b(class|struct|enum|union)\\s+${escaped}\\b|` +          // a type
    `\\b${escaped}\\s*\\([^;]*?\\)\\s*(const\\s*)?\\{|` +      // a function
    `\\b${escaped}\\s*(\\[[^\\]]*\\])*\\s*=`                   // a constant or table
  ).test(code);
}

function build(source, work, run) {
  const sourcePath = join(work, 'example.cpp');
  const binaryPath = join(work, 'example');
  writeFileSync(sourcePath, source);

  const compile = spawnSync('g++', ['-std=c++17', '-w', sourcePath, '-o', binaryPath], { encoding: 'utf8' });
  if (compile.status !== 0) {
    const error = (compile.stderr || '').split('\n').find(l => /error:|Undefined symbols/.test(l));
    return { ok: false, reason: (error || 'build failed').trim().slice(0, 140), stderr: compile.stderr };
  }
  if (!run) return { ok: true };

  // An example that waits on the clock on purpose (the TOTP demo) runs for tens
  // of seconds and always prints something different — run it once, with more time
  const waitsForClock = /sleep_for|::sleep\(/.test(source);
  const limit = waitsForClock ? 90000 : 10000;

  // input: '' — examples reading stdin must see EOF instead of hanging
  const execute = () => spawnSync(binaryPath, [], { encoding: 'utf8', timeout: limit, input: '' });
  const result = execute();

  // An authenticator or a menu runs until interrupted: the build itself is
  // verified, the output is checked by hand
  if (result.error?.code === 'ETIMEDOUT') return { ok: true, endless: true };
  if (result.error) return { ok: false, reason: `run: ${result.error.message}` };

  const output = (result.stdout || '').trimEnd();
  if (waitsForClock) return { ok: true, output, varies: true };

  // Salt, time and measured nanoseconds differ every run: such output cannot be
  // compared with the material literally — a second run detects it
  const again = execute();
  const varies = !again.error && (again.stdout || '').trimEnd() !== output;

  return { ok: true, output, varies };
}

/**
 * On-screen width of a line. Measured in the browser with the page font: emoji
 * take two cells (✅ ❌ ⚠️ 🔐) while the text symbols that look like them take
 * one (✓ ✗ ⚙ ► ░). The difference is whether a character has emoji
 * presentation: either it is in an emoji range or it carries the U+FE0F selector.
 */
const DEFAULT_EMOJI = new Set([
  0x2705, 0x270A, 0x270B, 0x2728, 0x274C, 0x274E, 0x2753, 0x2754, 0x2755,
  0x2757, 0x2795, 0x2796, 0x2797, 0x27B0, 0x27BF, 0x2B1B, 0x2B1C, 0x2B50, 0x2B55
]);

function displayWidth(text) {
  const chars = [...text];
  let total = 0;

  chars.forEach((char, index) => {
    const code = char.codePointAt(0);
    if (code === 0xFE0F) return;                       // the presentation selector is invisible on its own

    const emojiByRange = code >= 0x1F300 && code <= 0x1FAFF;
    const emojiByDefault = DEFAULT_EMOJI.has(code);
    const emojiBySelector = chars[index + 1]?.codePointAt(0) === 0xFE0F;

    total += emojiByRange || emojiByDefault || emojiBySelector ? 2 : 1;
  });

  return total;
}

/**
 * Diagram frames have to be rectangular: a ragged right edge is obvious the
 * moment a diagram is shown on a projector.
 */
function lintDiagrams(lines) {
  const problems = [];
  let start = null;
  let lang = '';
  let rows = [];

  const checkBox = () => {
    if (rows.length < 3) return;
    const widths = new Set(rows.map(row => displayWidth(row)));
    if (widths.size > 1) {
      problems.push({
        number: start,
        kind: 'ragged diagram frame',
        detail: `widths ${[...widths].sort((a, b) => a - b).join(', ')}`
      });
    }
  };

  lines.forEach((line, index) => {
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (start === null) {
        start = index + 1;
        lang = fence[1];
        rows = [];
      } else {
        checkBox();
        start = null;
      }
      return;
    }

    if (start === null || lang) return;

    const isRow = /^[│┌└├╔╚╠]/.test(line) && /[│┐┘┤╗╝╣]$/.test(line);
    if (!isRow) {
      checkBox();
      rows = [];
      return;
    }

    // A new frame inside the same block starts with its top border
    if (/^[┌╔]/.test(line) && rows.length) {
      checkBox();
      rows = [];
    }
    rows.push(line);
    if (/^[└╚]/.test(line)) {
      checkBox();
      rows = [];
    }
  });

  return problems;
}

/**
 * Frame alignment (`--fix-diagrams`). Frames are typed by hand, so the right
 * edge often drifts by a column or two. The width is set by the majority of the
 * frame rows — in these materials it is the border that is off, not the content.
 * Only the filler before the border changes: the text is left untouched.
 */
const FRAME_CHARS = new Set([...'─━═┄┈┬┴┼├┤┌┐└┘│╔╗╚╝╠╣╦╩╬ ']);

function frameRows(lines) {
  const boxes = [];
  let current = [];
  let indent = null;

  const flush = () => {
    if (current.length) boxes.push(current);
    current = [];
    indent = null;
  };

  lines.forEach((line, index) => {
    const body = line.trim();
    const isRow = body.length > 1 && '│┌└├╔╚╠'.includes(body[0]) && '│┐┘┤╗╝╣'.includes(body[body.length - 1]);
    if (!isRow) return flush();

    const own = line.length - line.trimStart().length;
    if (current.length && (own !== indent || '┌╔'.includes(body[0]))) flush();
    if (indent === null) indent = own;

    current.push(index);
    if ('└╚'.includes(body[0])) flush();
  });

  flush();
  return boxes;
}

function alignFrames(lines) {
  const out = [...lines];
  let fixed = 0;

  const edge = line => line.trimEnd().length - 1;

  for (const rows of frameRows(lines)) {
    if (rows.length < 3) continue;

    const measure = i => displayWidth(out[i].slice(0, edge(out[i]) + 1));
    const filler = line => (edge(line) > 0 && line[edge(line) - 1] === '─' ? '─' : ' ');
    const counts = new Map();
    rows.forEach(i => counts.set(measure(i), (counts.get(measure(i)) || 0) + 1));

    let target = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];

    // A row longer than the frame cannot shrink: widen the frame instead of breaking content
    const canShrink = i => measure(i) <= target ||
      out[i].slice(0, edge(out[i])).endsWith(filler(out[i]).repeat(measure(i) - target));
    if (!rows.every(canShrink)) target = Math.max(...rows.map(measure));

    for (const i of rows) {
      const line = out[i];
      const position = edge(line);
      const gap = target - measure(i);
      if (gap === 0) continue;

      const head = line.slice(0, position);
      const border = line[position];
      const tail = line.slice(position + 1);

      if (gap > 0) {
        out[i] = head + filler(line).repeat(gap) + border + tail.slice(gap);
      } else {
        out[i] = head.slice(0, gap) + border + tail + ' '.repeat(-gap);
      }
      fixed++;
    }

    // The content of a frame is what sits between its borders: a nested frame may live there
    const indent = rows[0] !== undefined ? out[rows[0]].length - out[rows[0]].trimStart().length : 0;
    const inner = rows.map(i => out[i].slice(indent + 1, edge(out[i])));
    const [aligned, innerFixed] = alignFrames(inner);
    fixed += innerFixed;
    rows.forEach((i, position) => {
      out[i] = out[i].slice(0, indent + 1) + aligned[position] + out[i].slice(edge(out[i]));
    });
  }

  return [out, fixed];
}

function fixDiagrams(text) {
  const lines = text.split('\n');
  const result = [];
  let buffer = [];
  let inside = false;
  let lang = '';
  let fixed = 0;

  for (const line of lines) {
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence && !inside) {
      inside = true;
      lang = fence[1];
      buffer = [];
      result.push(line);
    } else if (fence && inside) {
      if (!lang && buffer.some(row => row.includes('┌') || row.includes('╔'))) {
        const [aligned, count] = alignFrames(buffer);
        fixed += count;
        // Spaces after the outer border do not affect anything
        buffer = aligned.map(row => (/[│┐┘┤╗╝╣]\s*$/.test(row) ? row.trimEnd() : row));
      }
      result.push(...buffer, line);
      inside = false;
    } else if (inside) {
      buffer.push(line);
    } else {
      result.push(line);
    }
  }

  return [result.join('\n'), fixed];
}

// A .docx has no horizontal scroll bar the way the site has: a code line wider
// than the column wraps, and an ASCII frame or an aligned comment breaks with
// it. The column takes 89 characters of Courier New 9pt on A4 (text width
// 9637 twips at 0.6 em per character); 88 leaves a character of slack.
// Materials that are never printed — lectures, self-study topics — are not
// bound by it.
const CODE_WIDTH = 88;

/** Markup defects already seen in the materials */
function lintFile(path, text) {
  const problems = [];
  const relative = path.slice(CONTENT.length + 1);
  const printed = /^type:\s*lab\s*$/m.test(text);
  let inCode = false;

  text.split('\n').forEach((line, index) => {
    const number = index + 1;
    if (/^```/.test(line)) {
      inCode = !inCode;
      return;
    }

    // Cyrillic and Latin in one word — the usual cause of "the ciphertext does not match"
    for (const token of line.match(/[A-Za-zА-Яа-яЇїІіЄєҐґ]{3,}/g) || []) {
      if (/[A-Za-z]/.test(token) && /[А-Яа-яЇїІіЄєҐґ]/.test(token) && !/^[nrt][А-ЯІЇЄҐ]/.test(token)) {
        problems.push({ number, kind: 'mixed alphabets', detail: token });
      }
    }

    for (const hash of line.match(/\b[0-9a-f]{40,80}\b/g) || []) {
      if (hash.length !== 40 && hash.length !== 64) {
        problems.push({ number, kind: 'hash of the wrong length', detail: `${hash.length} characters` });
      }
    }

    if (inCode && /^[A-Za-z].*[а-яё]{4,}/.test(line) && /[ыъэё]/.test(line)) {
      problems.push({ number, kind: 'foreign-language output', detail: line.trim().slice(0, 50) });
    }

    if (inCode && printed && [...line].length > CODE_WIDTH) {
      problems.push({
        number,
        kind: 'code line too wide for the page',
        detail: `${[...line].length} characters, ${CODE_WIDTH} fit`
      });
    }
  });

  problems.push(...lintDiagrams(text.split('\n')));

  return problems.map(problem => ({ file: relative, ...problem }));
}

function main() {
  const args = process.argv.slice(2);
  const lintOnly = args.includes('--lint');
  const fixFrames = args.includes('--fix-diagrams');
  const runIndex = args.indexOf('--run');
  const runFilter = runIndex !== -1 ? args[runIndex + 1] : null;

  const files = findMarkdown(CONTENT).sort();
  const work = mkdtempSync(join(tmpdir(), 'verify-examples-'));
  const lintProblems = [];
  const failures = [];
  const mismatches = [];
  let compiled = 0;
  let endless = 0;
  let varying = 0;
  let skipped = 0;

  // Implementations from every file of a subject: materials refer to code of
  // neighbouring topics ("the sha256 function from lab 7"), later ones included
  const topics = [];

  if (fixFrames) {
    let total = 0;
    for (const path of files) {
      const text = readFileSync(path, 'utf8');
      const [aligned, count] = fixDiagrams(text);
      if (count) {
        writeFileSync(path, aligned);
        total += count;
      }
    }
    console.log(`Frame rows aligned: ${total}`);
  }

  try {
    for (const path of files) {
      const text = readFileSync(path, 'utf8');
      lintProblems.push(...lintFile(path, text));
      if (lintOnly) continue;

      const blocks = codeBlocks(text);
      if (!blocks.some(block => block.lang === 'cpp')) continue;

      // Library of a topic: blocks without main that are valid code on their own
      const fileLibrary = [];
      blocks.forEach((block, index) => {
        if (block.lang !== 'cpp') return;
        const code = stripMain(block.code);
        const accepted = fileLibrary.map(entry => entry.code);
        if (isReusable(accepted, code, work)) fileLibrary.push({ index, code });
      });

      topics.push({
        path,
        name: basename(path, '.md'),
        course: path.slice(CONTENT.length + 1).split('/').slice(0, 2).join('/'),
        lines: text.split('\n'),
        blocks,
        fileLibrary
      });
    }

    for (const { name, course, lines, blocks, fileLibrary } of topics) {
      const courseLibrary = topics
        .filter(topic => topic.course === course && topic.name !== name)
        .map(topic => topic.fileLibrary.map(entry => entry.code));

      for (const [index, block] of blocks.entries()) {
        if (block.lang !== 'cpp' || !/\bint\s+main\s*\(/.test(block.code)) continue;
        if (needsExternal(block.code)) {
          skipped++;
          continue;
        }
        if (runFilter && !name.includes(runFilter)) continue;

        // An example is assembled from the minimum of dependencies: only the
        // block the compiler reports as missing is added. The topic itself is
        // searched first, then the other topics of the subject — the same way a
        // student would look for it
        const nearby = fileLibrary.filter(entry => entry.index !== index);
        const inOrder = entries => [...entries].sort((a, b) => a.index - b.index).map(entry => entry.code);

        // Code of the topic itself keeps the order of the material (definition
        // before use); code borrowed from other topics goes first, as a file
        // included beforehand
        const own = new Set();
        const borrowed = [];
        const scope = () => [...borrowed, ...inOrder(nearby.filter(entry => own.has(entry.code)))];

        let result = build(translationUnit(scope(), block.code), work, true);

        for (let attempt = 0; !result.ok && attempt < 12; attempt++) {
          const missing = missingSymbols(result.stderr);
          if (!missing.length) break;

          const fromTopic = nearby.filter(entry =>
            !own.has(entry.code) && missing.some(name => provides(entry.code, name)));

          if (fromTopic.length) {
            fromTopic.forEach(entry => own.add(entry.code));
          } else {
            const other = courseLibrary.find(topic =>
              topic.some(entry => missing.some(name => provides(entry, name))) &&
              !topic.every(entry => borrowed.includes(entry)));
            if (!other) break;
            borrowed.unshift(...other.filter(entry => !borrowed.includes(entry)));
          }

          result = build(translationUnit(scope(), block.code), work, true);
        }

        // The implementation exists in the material but relies on a library the
        // environment lacks: only the markup of such an example is checked
        if (!result.ok) {
          const missing = missingSymbols(result.stderr);
          const external = blocks.some(other =>
            needsExternal(other.code) && missing.some(name => provides(other.code, name)));
          if (external) {
            skipped++;
            continue;
          }
        }

        if (result.ok) {
          compiled++;
          if (result.endless) endless++;
          if (result.varies) varying++;
          if (runFilter) {
            console.log(`\n=== ${name}:${block.line} ===`);
            console.log(result.endless ? '(the program runs until interrupted)' : result.output);
          }

          // The main check: what a material claims as the program output has to
          // match what the program actually prints
          const claimed = result.endless || result.varies ? null : claimedOutput(blocks, index, lines);
          if (claimed && !sameOutput(claimed.code, result.output)) {
            mismatches.push({ name, line: claimed.line, claimed: claimed.code, actual: result.output });
          }
        } else {
          failures.push({ name, line: block.line, reason: result.reason });
          if (process.env.VERIFY_DEBUG) console.log(`\n--- ${name}:${block.line} ---\n${result.stderr}`);
        }
      }

    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }

  for (const failure of failures) {
    console.log(`[does not build] ${failure.name}:${failure.line}: ${failure.reason}`);
  }

  for (const mismatch of mismatches) {
    console.log(`\n=== ${mismatch.name}:${mismatch.line}: output does not match ===`);
    console.log('--- in the material ---');
    console.log(mismatch.claimed.trimEnd());
    console.log('--- actual ---');
    console.log(mismatch.actual);
  }

  if (lintProblems.length) {
    console.log('\n=== Markup defects ===');
    for (const problem of lintProblems) {
      console.log(`${problem.file}:${problem.number}: ${problem.kind} — ${problem.detail}`);
    }
  }

  if (!lintOnly) {
    console.log(`Examples built: ${compiled} (${endless} run until interrupted), ` +
                `failed: ${failures.length}, skipped (external libraries): ${skipped}`);
    console.log(`Compared with the material: ${compiled - endless - varying}; ` +
                `mismatches: ${mismatches.length}; ` +
                `not comparable (time, random data): ${varying}`);
  }
  console.log(`Markup defects: ${lintProblems.length}`);

  process.exit(failures.length + mismatches.length + lintProblems.length > 0 ? 1 : 0);
}

main();
