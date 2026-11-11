#!/usr/bin/env node
/**
 * Appends a Playwright run summary to GITHUB_STEP_SUMMARY from test-results/results.json (CI json reporter).
 */
import fs from 'node:fs';
import path from 'node:path';

const suite = process.env.PLAYWRIGHT_SUITE || 'playwright';
const command = process.env.PLAYWRIGHT_COMMAND || 'npx playwright test';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const jsonPath = path.join(process.cwd(), 'test-results', 'results.json');

function formatMs(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function collectTests(node, acc) {
  if (node.specs) {
    for (const spec of node.specs) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        const last = results[results.length - 1];
        acc.push({
          file: spec.file,
          title: spec.title,
          line: spec.line,
          status: test.status,
          project: test.projectName || '—',
          error: last?.error?.message?.split('\n')[0] || '',
        });
      }
    }
  }
  for (const child of node.suites || []) {
    collectTests(child, acc);
  }
}

function statusLabel(status) {
  switch (status) {
    case 'expected':
      return 'passed';
    case 'unexpected':
      return 'failed';
    case 'skipped':
      return 'skipped';
    case 'flaky':
      return 'flaky';
    default:
      return status || 'unknown';
  }
}

function buildBody() {
  const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : '';
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7);
  const ref = process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || '—';

  let body = `# ${suite} — what ran\n\n`;
  body += `- **Command:** \`${command}\`\n`;
  if (runUrl) body += `- **Workflow run:** ${runUrl}\n`;
  body += `- **Commit:** \`${sha}\` (\`${ref}\`)\n`;
  body += `- **Artifact:** \`playwright-report-${suite}\` (HTML report when tests produced one)\n\n`;

  if (!fs.existsSync(jsonPath)) {
    body +=
      '_Could not read `test-results/results.json`. Tests may have failed before the reporter wrote results, or `CI` was not set._\n';
    return body;
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    body += `_Failed to parse results JSON: ${err.message}_\n`;
    return body;
  }

  const stats = report.stats || {};
  const tests = [];
  for (const root of report.suites || []) {
    collectTests(root, tests);
  }

  body += `## Totals\n\n`;
  body += `| Outcome | Count |\n|--------|-------|\n`;
  body += `| Passed | ${stats.expected ?? 0} |\n`;
  body += `| Failed | ${stats.unexpected ?? 0} |\n`;
  body += `| Skipped | ${stats.skipped ?? 0} |\n`;
  body += `| Flaky | ${stats.flaky ?? 0} |\n`;
  body += `| Duration | ${formatMs(stats.duration)} |\n\n`;

  if (tests.length === 0) {
    body += '_No individual test entries in the JSON report._\n';
    return body;
  }

  body += `## Tests (${tests.length})\n\n`;
  body += `| Status | Project | Spec | Test |\n`;
  body += `|--------|---------|------|------|\n`;
  const sorted = [...tests].sort((a, b) => {
    const fa = a.file || '';
    const fb = b.file || '';
    return fa.localeCompare(fb) || (a.title || '').localeCompare(b.title || '');
  });
  for (const t of sorted) {
    const rel = t.file ? path.relative(process.cwd(), t.file).replace(/\\/g, '/') : '—';
    const title = (t.title || '—').replace(/\|/g, '\\|');
    body += `| ${statusLabel(t.status)} | ${t.project} | \`${rel}\` | ${title} |\n`;
  }

  const failed = sorted.filter(
    (t) => t.status === 'unexpected' || t.status === 'flaky',
  );
  if (failed.length > 0) {
    body += `\n## Failure detail\n\n`;
    for (const t of failed) {
      const rel = t.file ? path.relative(process.cwd(), t.file).replace(/\\/g, '/') : '—';
      body += `### ${rel} — ${t.title}\n\n`;
      if (t.error) body += `\`\`\`\n${t.error}\n\`\`\`\n\n`;
    }
  }

  return body;
}

const body = buildBody();
if (summaryPath) {
  fs.appendFileSync(summaryPath, body);
} else {
  process.stdout.write(body);
}
