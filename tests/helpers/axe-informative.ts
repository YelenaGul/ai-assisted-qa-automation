import type { TestInfo } from '@playwright/test';
import type { AxeResults, Result } from 'axe-core';

function violationLines(violations: Result[]): string[] {
  return violations.map((v) => {
    const targets = v.nodes
      .map((n) => n.target.join(' '))
      .slice(0, 3)
      .join('; ');
    const more = v.nodes.length > 3 ? ` (+${v.nodes.length - 3} nodes)` : '';
    return `- **${v.id}** (${v.impact}): ${v.help} — \`${targets}\`${more}`;
  });
}

export function formatAxeSummary(results: AxeResults): string {
  const { violations, incomplete, passes } = results;
  const lines = [
    `## axe scan (informative — does not fail the test)`,
    ``,
    `| | Count |`,
    `|---|--:|`,
    `| Violations | ${violations.length} |`,
    `| Incomplete | ${incomplete.length} |`,
    `| Rules passed | ${passes.length} |`,
  ];

  if (violations.length > 0) {
    lines.push(``, `### Violations`, ...violationLines(violations));
  }
  if (incomplete.length > 0) {
    lines.push(
      ``,
      `### Incomplete (needs manual review)`,
      ...incomplete.map(
        (r) => `- **${r.id}** (${r.impact}): ${r.help}`,
      ),
    );
  }

  return lines.join('\n');
}

/** Attach axe results to the Playwright report; informative tests do not assert zero violations. */
export async function reportAxeInformative(
  testInfo: TestInfo,
  results: AxeResults,
  label = 'axe',
): Promise<void> {
  const summary = formatAxeSummary(results);
  await testInfo.attach(`${label}-summary.md`, {
    body: summary,
    contentType: 'text/markdown',
  });

  if (results.violations.length > 0 || results.incomplete.length > 0) {
    await testInfo.attach(`${label}-results.json`, {
      body: JSON.stringify(
        {
          violations: results.violations,
          incomplete: results.incomplete,
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });
  }

  testInfo.annotations.push({
    type: 'axe-violations',
    description: String(results.violations.length),
  });
  if (results.violations.length > 0) {
    console.log(`[axe informative] ${testInfo.title}\n${summary}`);
  }
}
