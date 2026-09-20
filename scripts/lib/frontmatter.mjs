/**
 * Frontmatter parser for course materials and student reports.
 *
 * Hand-written rather than a library: course files only ever contain strings,
 * numbers and simple lists, and an extra dependency in a GitHub Actions pipeline
 * is one more thing that can break it.
 */

/** Returns the frontmatter fields and the body without them */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const data = {};
  let listKey = null;

  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1].trim()));
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    listKey = null;

    if (value === '') {
      data[key] = [];
      listKey = key;
    } else if (/^\d+$/.test(value)) {
      data[key] = parseInt(value, 10);
    } else {
      data[key] = unquote(value);
    }
  }

  return { data, body: match[2] ?? '' };
}

function unquote(value) {
  return (value.startsWith('"') && value.endsWith('"')) ||
         (value.startsWith("'") && value.endsWith("'"))
    ? value.slice(1, -1)
    : value;
}
