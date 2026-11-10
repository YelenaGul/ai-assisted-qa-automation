#!/usr/bin/env node
/**
 * afterFileEdit constitution WON'T gate for tests/** and pages/**.
 * Matcher is tool type Write; path filtering happens here via file_path.
 * Exit 0 allows. Exit 2 blocks mechanically-checkable WON'T violations.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const raw = fs.readFileSync(0, 'utf8');

let input;
try {
  input = JSON.parse(raw || '{}');
} catch (err) {
  deny(`constitution-wont: hook input is not JSON (${err.message})`);
}

const filePath = String(
  input.file_path || input.filePath || input.path || '',
);

if (!filePath) {
  deny('constitution-wont: hook input has no file_path');
}

if (!isInScope(filePath)) {
  allow();
}

const after = readAfter(filePath, input);
const before = readBefore(filePath, input, after);
const reasons = [];

scanWaitForTimeout(after, reasons);
scanXPath(after, reasons);
scanAnyType(after, reasons);
scanHardcodedCredentials(after, reasons);
scanDescribeTags(after, reasons);
scanWeakenedExpect(before, after, reasons);

if (reasons.length > 0) {
  deny(
    `constitution-wont blocked ${toRepoRelative(filePath)}: ${reasons.join('; ')}`,
  );
}

allow();

function isInScope(file) {
  const normalized = file.replace(/\\/g, '/');
  return /(^|\/)(tests|pages)\//.test(normalized);
}

function readAfter(file, payload) {
  if (typeof payload.after === 'string') return payload.after;
  if (typeof payload.content === 'string') return payload.content;
  if (typeof payload.new_content === 'string') return payload.new_content;
  try {
    return fs.readFileSync(resolveRepoPath(file), 'utf8');
  } catch (err) {
    deny(`constitution-wont: cannot read ${file} (${err.message})`);
  }
}

function readBefore(file, payload, afterText) {
  if (typeof payload.before === 'string') return payload.before;
  if (typeof payload.old_content === 'string') return payload.old_content;
  if (typeof payload.previous_content === 'string') {
    return payload.previous_content;
  }

  const edits = payload.edits || payload.edit || null;
  if (Array.isArray(edits) && edits.length > 0) {
    const reconstructed = reconstructBefore(afterText, edits);
    if (reconstructed !== null) return reconstructed;
  }

  try {
    const rel = toRepoRelative(file);
    return execFileSync('git', ['show', `HEAD:${rel}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
}

function reconstructBefore(afterText, edits) {
  let text = afterText;
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const edit = edits[i] || {};
    const oldStr = edit.old_string ?? edit.oldString ?? edit.before;
    const newStr = edit.new_string ?? edit.newString ?? edit.after;
    if (typeof oldStr !== 'string' || typeof newStr !== 'string') {
      return null;
    }
    if (newStr.length === 0) {
      if (oldStr.length === 0) continue;
      text = `${oldStr}${text}`;
      continue;
    }
    const idx = text.lastIndexOf(newStr);
    if (idx === -1) return null;
    text = text.slice(0, idx) + oldStr + text.slice(idx + newStr.length);
  }
  return text;
}

function scanWaitForTimeout(source, reasons) {
  if (/\b(?:page|this\.page)\.waitForTimeout\s*\(/.test(activeCode(source))) {
    reasons.push('page.waitForTimeout is forbidden (use web-first expect)');
  }
}

function scanXPath(source, reasons) {
  const code = activeCode(source);
  for (const arg of quotedLocatorArgs(code)) {
    const trimmed = arg.trim();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('(') ||
      /^xpath\s*=/i.test(trimmed)
    ) {
      reasons.push(`XPath locator: ${JSON.stringify(arg)}`);
      return;
    }
  }
  if (/\blocator\s*\(\s*['"`]xpath\s*=/i.test(code)) {
    reasons.push('XPath locator (xpath=...)');
  }
}

function scanAnyType(source, reasons) {
  const code = activeCode(source);
  if (/\bas\s+any\b/.test(code) || /:\s*any\b/.test(code)) {
    reasons.push('TypeScript `any` is forbidden');
  }
}

function scanHardcodedCredentials(source, reasons) {
  const code = activeCode(source);
  const patterns = [
    /\b(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]+['"`]/i,
    /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|client[_-]?secret)\s*[:=]\s*['"`][^'"`]+['"`]/i,
    /\b(?:token|secret)\s*[:=]\s*['"`][A-Za-z0-9._-]{12,}['"`]/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/,
  ];
  for (const re of patterns) {
    if (re.test(code)) {
      reasons.push('hardcoded credential/secret literal');
      return;
    }
  }
}

function scanDescribeTags(source, reasons) {
  const code = activeCode(source);
  // test.describe('title', { tag: ... }, () => {})
  if (
    /\btest\.describe(?:\.(?:only|skip|fix|serial))?\s*\(\s*(?:['"`]|`)/.test(
      code,
    ) &&
    /\btest\.describe(?:\.(?:only|skip|fix|serial))?\s*\([\s\S]*?\{[\s\S]*?\btag\s*:/.test(
      code,
    )
  ) {
    // Narrow: options object with tag between describe( and the callback
    const re =
      /\btest\.describe(?:\.(?:only|skip|fix|serial))?\s*\(\s*(['"`])(?:\\.|(?!\1).)*\1\s*,\s*\{[^}]*\btag\s*:/;
    if (re.test(code)) {
      reasons.push('tag on test.describe() is forbidden (tag individual tests)');
    }
  }
}

function scanWeakenedExpect(before, after, reasons) {
  if (!/(^|\/)tests\//.test(toRepoRelative(filePath).replace(/\\/g, '/'))) {
    return;
  }

  const afterActive = countActiveExpect(after);
  const afterCommented = countCommentedExpect(after);

  if (before === null) {
    if (afterActive === 0 && afterCommented > 0) {
      reasons.push('expect( was commented out (no active expect( left)');
    }
    return;
  }

  const beforeActive = countActiveExpect(before);
  const beforeCommented = countCommentedExpect(before);

  if (afterActive < beforeActive) {
    reasons.push(
      `weakened assertions: fewer expect( than before (${afterActive} < ${beforeActive})`,
    );
  }
  if (afterCommented > beforeCommented) {
    reasons.push(
      `weakened assertions: expect( commented out (${beforeCommented} → ${afterCommented})`,
    );
  }
}

function quotedLocatorArgs(source) {
  const args = [];
  const re = /\.locator\s*\(/g;
  let match;
  while ((match = re.exec(source))) {
    let i = match.index + match[0].length;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    const quote = source[i];
    if (quote !== '"' && quote !== "'" && quote !== '`') continue;
    i += 1;
    let arg = '';
    while (i < source.length) {
      const ch = source[i];
      if (ch === '\\') {
        arg += source[i + 1] ?? '';
        i += 2;
        continue;
      }
      if (ch === quote) break;
      arg += ch;
      i += 1;
    }
    args.push(arg);
  }
  return args;
}

function activeCode(source) {
  return stripBlockComments(source)
    .split(/\r?\n/)
    .map(stripLineComment)
    .join('\n');
}

function countActiveExpect(source) {
  let count = 0;
  for (const line of stripBlockComments(source).split(/\r?\n/)) {
    const code = stripLineComment(line);
    const matches = code.match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countCommentedExpect(source) {
  let count = 0;
  for (const line of source.split(/\r?\n/)) {
    const lineComment = line.match(/\/\/(.*)$/);
    if (!lineComment) continue;
    const codeBefore = line.slice(0, lineComment.index);
    if (/\bexpect\s*\(/.test(codeBefore)) continue;
    const matches = lineComment[1].match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  const block = source.match(/\/\*[\s\S]*?\*\//g) || [];
  for (const chunk of block) {
    const matches = chunk.match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripLineComment(line) {
  let inSingle = false;
  let inDouble = false;
  let inTick = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const prev = line[i - 1];
    if (ch === "'" && !inDouble && !inTick && prev !== '\\') {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && !inTick && prev !== '\\') {
      inDouble = !inDouble;
    } else if (ch === '`' && !inSingle && !inDouble && prev !== '\\') {
      inTick = !inTick;
    } else if (
      ch === '/' &&
      line[i + 1] === '/' &&
      !inSingle &&
      !inDouble &&
      !inTick
    ) {
      return line.slice(0, i);
    }
  }
  return line;
}

function resolveRepoPath(file) {
  if (path.isAbsolute(file)) return file;
  return path.resolve(process.cwd(), file);
}

function toRepoRelative(file) {
  const abs = resolveRepoPath(file);
  return path.relative(process.cwd(), abs).replace(/\\/g, '/');
}

function allow() {
  process.stdout.write(`${JSON.stringify({ permission: 'allow' })}\n`);
  process.exit(0);
}

function deny(message) {
  process.stderr.write(`${message}\n`);
  process.stdout.write(
    `${JSON.stringify({
      permission: 'deny',
      user_message: message,
      agent_message: message,
    })}\n`,
  );
  process.exit(2);
}
