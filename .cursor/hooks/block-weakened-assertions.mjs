#!/usr/bin/env node
/**
 * afterFileEdit gate for tests/**.
 * Exit 0 allows. Exit 2 blocks when the edit weakened the test:
 * fewer active expect( calls than before, or an expect( was commented out.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const raw = fs.readFileSync(0, 'utf8');

let input;
try {
  input = JSON.parse(raw || '{}');
} catch (err) {
  deny(`block-weakened-assertions: hook input is not JSON (${err.message})`);
}

const filePath = String(
  input.file_path || input.filePath || input.path || '',
);

if (!filePath) {
  deny('block-weakened-assertions: hook input has no file_path');
}

if (!isUnderTests(filePath)) {
  allow();
}

const after = readAfter(filePath, input);
const before = readBefore(filePath, input, after);

if (before === null) {
  // New/untracked file with no prior snapshot — only enforce that expects stay present.
  if (countActiveExpect(after) === 0 && countCommentedExpect(after) > 0) {
    deny(
      `block-weakened-assertions blocked ${filePath}: expect( was commented out (no active expect( left)`,
    );
  }
  allow();
}

const beforeActive = countActiveExpect(before);
const afterActive = countActiveExpect(after);
const beforeCommented = countCommentedExpect(before);
const afterCommented = countCommentedExpect(after);

const reasons = [];
if (afterActive < beforeActive) {
  reasons.push(
    `fewer expect( than before (${afterActive} < ${beforeActive})`,
  );
}
if (afterCommented > beforeCommented) {
  reasons.push(
    `an expect( was commented out (commented expects ${beforeCommented} → ${afterCommented})`,
  );
}

if (reasons.length > 0) {
  deny(
    `block-weakened-assertions blocked ${filePath}: ${reasons.join('; ')}`,
  );
}

allow();

function isUnderTests(file) {
  const normalized = file.replace(/\\/g, '/');
  return /(^|\/)tests\//.test(normalized);
}

function readAfter(file, payload) {
  if (typeof payload.after === 'string') return payload.after;
  if (typeof payload.content === 'string') return payload.content;
  if (typeof payload.new_content === 'string') return payload.new_content;
  try {
    return fs.readFileSync(resolveRepoPath(file), 'utf8');
  } catch (err) {
    deny(
      `block-weakened-assertions: cannot read ${file} (${err.message})`,
    );
  }
}

function readBefore(file, payload, after) {
  if (typeof payload.before === 'string') return payload.before;
  if (typeof payload.old_content === 'string') return payload.old_content;
  if (typeof payload.previous_content === 'string') {
    return payload.previous_content;
  }

  const edits = payload.edits || payload.edit || null;
  if (Array.isArray(edits) && edits.length > 0) {
    const reconstructed = reconstructBefore(after, edits);
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

function reconstructBefore(after, edits) {
  let text = after;
  // Apply reverse edits last→first so overlapping patches stay coherent.
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const edit = edits[i] || {};
    const oldStr = edit.old_string ?? edit.oldString ?? edit.before;
    const newStr = edit.new_string ?? edit.newString ?? edit.after;
    if (typeof oldStr !== 'string' || typeof newStr !== 'string') {
      return null;
    }
    if (newStr.length === 0) {
      // Pure insert — remove one occurrence if present; otherwise prepend old.
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
    // Full-line or trailing // comments that still contain expect(
    const lineComment = line.match(/\/\/(.*)$/);
    if (!lineComment) continue;
    const commented = lineComment[1];
    // Only count when the expect is inside the comment, not live code before //
    const codeBefore = line.slice(0, lineComment.index);
    if (/\bexpect\s*\(/.test(codeBefore)) continue;
    const matches = commented.match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  // Block comments containing expect(
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
  const rel = path.relative(process.cwd(), abs).replace(/\\/g, '/');
  return rel;
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
