#!/usr/bin/env node
/**
 * Перевірка прикладів коду в матеріалах курсу.
 *
 * Навіщо: у лекціях і лабораторних близько сотні блоків C++ і кілька десятків
 * блоків «Результат роботи програми». Вивід у них має бути справжній, інакше
 * студент запускає код і бачить інше, ніж у методичці.
 *
 * Що робить:
 *   1. Збирає кожен приклад із main() і запускає його. Блоки з того самого файлу
 *      доповнюють один одного: у матеріалах наступний крок посилається на функції
 *      з попереднього («реалізація з кроку 2»). Якщо реалізації в файлі немає,
 *      вона шукається серед усіх прикладів дисципліни — так працюють лабораторні,
 *      які просять узяти sha256 з попередньої роботи.
 *   2. Друкує справжній вивід (--run <файл>), щоб підставити його в матеріал.
 *   3. Шукає дефекти розмітки, які вже траплялися: кирилиця всередині латинських
 *      слів, хеші неправильної довжини, чужомовний вивід у блоках коду.
 *
 * Використання:
 *   node scripts/verify-examples.mjs                  # усе
 *   node scripts/verify-examples.mjs --lint           # тільки розмітка
 *   node scripts/verify-examples.mjs --run 08-lab-transposition
 */

import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname, basename } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

// Бібліотеки, яких немає в навчальному середовищі: такі приклади не збираються,
// їхній вивід звірявся вручну
const EXTERNAL_HEADERS = ['sqlite3.h', 'openssl/', 'sodium.h', 'winsock2.h', 'windows.h'];

// Включення, які в матеріалах стоять у першому блоці теми, а далі не повторюються
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
 * Блок, який матеріал подає саме як результат роботи програми. Розпізнається
 * за підводкою перед ним («Результат роботи програми:», «Вивід:»): поряд із
 * прикладами стоять ще й діаграми та шпаргалки, і їх звіряти немає з чим.
 */
const OUTPUT_LEAD = /результат|вивід|виведе|надрукує|програма покаже/i;

// Застереження, що конкретні числа залежать від запуску: такий вивід
// звіряти дослівно не можна (час, сіль, виміряні наносекунди)
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

/** Порівняння виводу без огляду на кінцеві пробіли й порожні рядки */
function sameOutput(a, b) {
  const normalize = text => text.split('\n').map(line => line.trimEnd()).filter(Boolean).join('\n');
  return normalize(a) === normalize(b);
}

/** Блоки коду: мова, текст, номер рядка початку */
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

/** Імена функцій, визначених у блоці */
function definedFunctions(code) {
  return (code.match(/^[A-Za-z_][\w:<>,\s&*]*?\b([A-Za-z_]\w*)\s*\([^;]*?\)\s*\{/gm) || [])
    .map(match => (match.match(/\b([A-Za-z_]\w*)\s*\(/) || [])[1])
    .filter(Boolean);
}

/**
 * Прибирає типові значення аргументів з повторних оголошень: у матеріалах
 * кожен крок наводить сигнатуру повністю, а компілятор дозволяє задати
 * типове значення лише один раз.
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

/** Вирізає визначення функції з коду — коли її вже дає інший блок */
function removeFunction(code, name) {
  const signature = new RegExp(`^[A-Za-z_][\\w:<>,\\s&*]*?\\b${name}\\s*\\([^;]*?\\)\\s*\\{`, 'm');
  const match = code.match(signature);
  if (!match) return code;

  // На місці визначення лишається оголошення: сусідні блоки далі його викликають.
  // Типові значення аргументів прибираються, щоб не дублювати їх у визначенні.
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
 * Склеює блоки в одиницю трансляції. У матеріалах наступний крок часто наводить
 * функцію з попереднього ще раз — у складеному коді лишається остання версія.
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

/** Чи придатний блок на роль бібліотеки: пояснювальні уривки («розберімо код»)
 *  складаються з голих операторів і самі по собі не компілюються */
function isReusable(library, code, work) {
  const sourcePath = join(work, 'probe.cpp');
  writeFileSync(sourcePath, translationUnit(library, code));
  return spawnSync('g++', ['-std=c++17', '-w', '-fsyntax-only', sourcePath], { encoding: 'utf8' }).status === 0;
}

/** Імена, яких бракує складеному прикладу — з помилок компілятора і компонувальника */
function missingSymbols(stderr = '') {
  const patterns = [
    /"([A-Za-z_][\w:]*)\(/g,                     // нерозв'язаний символ, зокрема метод класу
    /use of undeclared identifier '([^']+)'/g,
    /unknown type name '([^']+)'/g,
    /no template named '([^']+)'/g
  ];
  const names = patterns.flatMap(pattern => [...stderr.matchAll(pattern)].map(m => m[1]));
  // Для Class::method шукаємо і сам клас, і метод
  return [...new Set(names.flatMap(name => [name, ...name.split('::')]))].filter(Boolean);
}

/** Чи дає блок визначення імені: функції, класу, переліку або сталої */
function provides(code, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `\\b(class|struct|enum|union)\\s+${escaped}\\b|` +          // тип
    `\\b${escaped}\\s*\\([^;]*?\\)\\s*(const\\s*)?\\{|` +      // функція
    `\\b${escaped}\\s*(\\[[^\\]]*\\])*\\s*=`                   // стала або таблиця
  ).test(code);
}

function build(source, work, run) {
  const sourcePath = join(work, 'example.cpp');
  const binaryPath = join(work, 'example');
  writeFileSync(sourcePath, source);

  const compile = spawnSync('g++', ['-std=c++17', '-w', sourcePath, '-o', binaryPath], { encoding: 'utf8' });
  if (compile.status !== 0) {
    const error = (compile.stderr || '').split('\n').find(l => /error:|Undefined symbols/.test(l));
    return { ok: false, reason: (error || 'помилка збірки').trim().slice(0, 140), stderr: compile.stderr };
  }
  if (!run) return { ok: true };

  // Приклад, який навмисне чекає на годинник (демонстрація TOTP), працює
  // десятки секунд і завжди друкує інше — запускаємо його один раз і довше
  const waitsForClock = /sleep_for|::sleep\(/.test(source);
  const limit = waitsForClock ? 90000 : 10000;

  // input: '' — приклади, що читають stdin, мають бачити EOF, а не зависати
  const execute = () => spawnSync(binaryPath, [], { encoding: 'utf8', timeout: limit, input: '' });
  const result = execute();

  // Автентифікатор і меню працюють, доки їх не перервуть: сам факт збірки
  // перевірено, вивід звіряється вручну
  if (result.error?.code === 'ETIMEDOUT') return { ok: true, endless: true };
  if (result.error) return { ok: false, reason: `запуск: ${result.error.message}` };

  const output = (result.stdout || '').trimEnd();
  if (waitsForClock) return { ok: true, output, varies: true };

  // Сіль, час і виміряні наносекунди щоразу інші: такий вивід не можна
  // звіряти з матеріалом дослівно — визначаємо це повторним запуском
  const again = execute();
  const varies = !again.error && (again.stdout || '').trimEnd() !== output;

  return { ok: true, output, varies };
}

/**
 * Ширина рядка на екрані. Виміряно в браузері шрифтом сторінки: емодзі
 * займають дві комірки (✅ ❌ ⚠️ 🔐), а схожі на них текстові символи —
 * одну (✓ ✗ ⚙ ► ░). Різниця саме в тому, чи має символ емодзі-подання:
 * або він із діапазону емодзі, або позначений селектором U+FE0F.
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
    if (code === 0xFE0F) return;                       // селектор подання сам по собі невидимий

    const emojiByRange = code >= 0x1F300 && code <= 0x1FAFF;
    const emojiByDefault = DEFAULT_EMOJI.has(code);
    const emojiBySelector = chars[index + 1]?.codePointAt(0) === 0xFE0F;

    total += emojiByRange || emojiByDefault || emojiBySelector ? 2 : 1;
  });

  return total;
}

/**
 * Рамки діаграм мають бути прямокутними: на проєкторі «драбинка» праворуч
 * помітна одразу.
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
        kind: 'нерівна рамка діаграми',
        detail: `ширини ${[...widths].sort((a, b) => a - b).join(', ')}`
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

    // Нова рамка в тому самому блоці починається з верхньої межі
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
 * Вирівнювання рамок (`--fix-diagrams`). Рамки набрані вручну, тому права
 * межа часто «гуляє» на одну-дві колонки. Ширину задає більшість рядків
 * рамки — у матеріалах зсунутою буває саме межа, а не вміст. Змінюється
 * лише заповнювач перед межею: текст лишається недоторканим.
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

    // Рядок, довший за рамку, звузити нікуди: тоді ширшає рамка, а не рветься вміст
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

    // Вміст рамки — те, що між її межами: там може стояти вкладена рамка
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
        // Після зовнішньої межі пробіли ні на що не впливають
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

/** Дефекти розмітки, які вже траплялися в матеріалах */
function lintFile(path, text) {
  const problems = [];
  const relative = path.slice(CONTENT.length + 1);
  let inCode = false;

  text.split('\n').forEach((line, index) => {
    const number = index + 1;
    if (/^```/.test(line)) {
      inCode = !inCode;
      return;
    }

    // Кирилиця й латиниця в одному слові — типова причина «шифротекст не збігається»
    for (const token of line.match(/[A-Za-zА-Яа-яЇїІіЄєҐґ]{3,}/g) || []) {
      if (/[A-Za-z]/.test(token) && /[А-Яа-яЇїІіЄєҐґ]/.test(token) && !/^[nrt][А-ЯІЇЄҐ]/.test(token)) {
        problems.push({ number, kind: 'змішані алфавіти', detail: token });
      }
    }

    for (const hash of line.match(/\b[0-9a-f]{40,80}\b/g) || []) {
      if (hash.length !== 40 && hash.length !== 64) {
        problems.push({ number, kind: 'хеш неправильної довжини', detail: `${hash.length} символів` });
      }
    }

    if (inCode && /^[A-Za-z].*[а-яё]{4,}/.test(line) && /[ыъэё]/.test(line)) {
      problems.push({ number, kind: 'чужомовний вивід', detail: line.trim().slice(0, 50) });
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

  // Реалізації з усіх файлів дисципліни: матеріали посилаються на код сусідніх
  // тем («функція sha256 з ЛР7»), причому і на пізніші за порядком
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
    console.log(`Вирівняно рядків рамок: ${total}`);
  }

  try {
    for (const path of files) {
      const text = readFileSync(path, 'utf8');
      lintProblems.push(...lintFile(path, text));
      if (lintOnly) continue;

      const blocks = codeBlocks(text);
      if (!blocks.some(block => block.lang === 'cpp')) continue;

      // Бібліотека теми: блоки без main, які самі по собі є коректним кодом
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

        // Реалізації шукаються трьома колами: попередні блоки теми, весь файл,
        // уся дисципліна — так само, як їх шукав би студент
        // Приклад складається з мінімуму залежностей: щоразу додається тільки
        // той блок, якого бракує за повідомленням компілятора. Спершу шукаємо
        // в самій темі, далі — в інших темах дисципліни, як це робив би студент
        const nearby = fileLibrary.filter(entry => entry.index !== index);
        const inOrder = entries => [...entries].sort((a, b) => a.index - b.index).map(entry => entry.code);

        // Код із самої теми йде в порядку матеріалу (визначення перед використанням),
        // запозичений з інших тем — попереду, як підключений заздалегідь файл
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

        // Реалізація в матеріалі є, але спирається на бібліотеку, якої немає
        // в середовищі: приклад перевірено лише на рівні розмітки
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
            console.log(result.endless ? '(програма працює, доки її не перервуть)' : result.output);
          }

          // Головна перевірка: те, що написано в матеріалі як результат
          // роботи програми, має збігатися з тим, що програма друкує
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
    console.log(`[не збирається] ${failure.name}:${failure.line}: ${failure.reason}`);
  }

  for (const mismatch of mismatches) {
    console.log(`\n=== ${mismatch.name}:${mismatch.line}: вивід не збігається ===`);
    console.log('--- у матеріалі ---');
    console.log(mismatch.claimed.trimEnd());
    console.log('--- насправді ---');
    console.log(mismatch.actual);
  }

  if (lintProblems.length) {
    console.log('\n=== Дефекти розмітки ===');
    for (const problem of lintProblems) {
      console.log(`${problem.file}:${problem.number}: ${problem.kind} — ${problem.detail}`);
    }
  }

  if (!lintOnly) {
    console.log(`\nПрикладів зібрано: ${compiled} (з них ${endless} працюють до переривання), ` +
                `не зібралося: ${failures.length}, пропущено (зовнішні бібліотеки): ${skipped}`);
    console.log(`Порівняно з матеріалом: ${compiled - endless - varying}; ` +
                `розбіжностей: ${mismatches.length}; ` +
                `не звіряються (час, випадкові дані): ${varying}`);
  }
  console.log(`Дефектів розмітки: ${lintProblems.length}`);

  process.exit(failures.length + mismatches.length + lintProblems.length > 0 ? 1 : 0);
}

main();
