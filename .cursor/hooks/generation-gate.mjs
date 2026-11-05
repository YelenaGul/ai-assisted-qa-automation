#!/usr/bin/env node
/**
 * Generation gate for Playwright specs under tests/**.
 * Exit 0 allows. Exit 2 blocks when a spec asserts nothing or uses a
 * CSS/XPath page.locator (argument contains ".", "#", or "//").
 */
import fs from 'node:fs';

const raw = fs.readFileSync(0, 'utf8');

let input;
try {
  input = JSON.parse(raw || '{}');
} catch (err) {
  deny(`generation-gate: hook input is not JSON (${err.message})`);
}

const filePath = String(
  input.file_path || input.filePath || input.path || '',
);

if (!filePath) {
  deny('generation-gate: hook input has no file_path');
}

if (!isSpec(filePath)) {
  allow();
}

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  deny(`generation-gate: cannot read ${filePath} (${err.message})`);
}

const reasons = [];
if (!content.includes('expect(')) {
  reasons.push('spec contains no expect( (a test that asserts nothing)');
}

for (const arg of locatorArguments(content)) {
  if (arg.includes('.') || arg.includes('#') || arg.includes('//')) {
    reasons.push(
      `CSS or XPath locator: page.locator(${JSON.stringify(arg)})`,
    );
    break;
  }
}

if (reasons.length > 0) {
  deny(`generation-gate blocked ${filePath}: ${reasons.join('; ')}`);
}

allow();

function isSpec(path) {
  const normalized = path.replace(/\\/g, '/');
  return /(?:^|\/)tests\/.+\.spec\.[cm]?[jt]sx?$/.test(normalized);
}

function locatorArguments(source) {
  const args = [];
  const re = /page\.locator\s*\(/g;
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
