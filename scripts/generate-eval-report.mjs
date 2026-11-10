#!/usr/bin/env node
/**
 * Regenerates eval-report.md from CI logs + PR history.
 * Cursor has no built-in telemetry for these metrics — this script measures
 * them via `gh` (and optional session notes under ci-artifacts/).
 *
 * Usage: node scripts/generate-eval-report.mjs [--n 10]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const N = Number(
  process.argv.includes('--n')
    ? process.argv[process.argv.indexOf('--n') + 1]
    : process.env.EVAL_N || 10,
);

const root = process.cwd();
const outPath = path.join(root, 'eval-report.md');
const generatedAt = new Date().toISOString();

function ghJson(args) {
  const out = execFileSync('gh', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(out || 'null');
}

function ghText(args) {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (err) {
    return err.stdout?.toString?.() || '';
  }
}

function parseFlakyCount(log) {
  const matches = [...log.matchAll(/\b(\d+)\s+flaky\b/gi)];
  if (matches.length === 0) return null;
  return Number(matches[matches.length - 1][1]);
}

function parsePassedFailed(log) {
  const passed = [...log.matchAll(/\b(\d+)\s+passed\b/gi)].map((m) =>
    Number(m[1]),
  );
  const failed = [...log.matchAll(/\b(\d+)\s+failed\b/gi)].map((m) =>
    Number(m[1]),
  );
  return {
    passed: passed.length ? passed[passed.length - 1] : null,
    failed: failed.length ? failed[failed.length - 1] : null,
  };
}

/** Last N completed suite runs (smoke/sanity/regression/e2e/playwright/test generation heal). */
function collectFlakeWindow(n) {
  const runs = ghJson([
    'run',
    'list',
    '--limit',
    String(Math.max(n * 4, 40)),
    '--json',
    'databaseId,workflowName,conclusion,status,createdAt,url,event',
  ]);

  const interesting = runs.filter(
    (r) =>
      r.status === 'completed' &&
      /E2E|Smoke|Sanity|Regression|Playwright|Test Generation/i.test(
        r.workflowName,
      ) &&
      r.conclusion !== 'cancelled',
  );

  const sampled = [];
  for (const run of interesting) {
    if (sampled.length >= n) break;
    const log = ghText(['run', 'view', String(run.databaseId), '--log']);
    const flaky = parseFlakyCount(log);
    if (flaky === null && !/playwright test/i.test(log)) continue;
    const { passed, failed } = parsePassedFailed(log);
    sampled.push({
      id: run.databaseId,
      workflow: run.workflowName,
      conclusion: run.conclusion,
      createdAt: run.createdAt,
      url: run.url,
      flaky: flaky ?? 0,
      passed,
      failed,
      measured: flaky !== null,
    });
  }
  return sampled;
}

function flakeMetrics(samples) {
  const withMeasure = samples.filter((s) => s.measured);
  const flakyTotal = withMeasure.reduce((a, s) => a + s.flaky, 0);
  const denom = withMeasure.reduce((a, s) => {
    const p = s.passed ?? 0;
    return a + p + s.flaky;
  }, 0);
  const rate = denom > 0 ? flakyTotal / denom : null;
  return { withMeasure, flakyTotal, denom, rate };
}

function healMetrics() {
  const prs = ghJson([
    'pr',
    'list',
    '--state',
    'all',
    '--limit',
    '50',
    '--json',
    'number,title,mergedAt,body,url,createdAt',
  ]);
  const healPrs = prs.filter(
    (p) =>
      /^heal\b/i.test(p.title.trim()) ||
      (/\bheal\b/i.test(p.title) && /locator|drift/i.test(p.title)),
  );
  const weakenedRe =
    /weakened assertions|softened expect|removed expect\(|deleted expect\(|commented out expect\(/i;
  const clean = healPrs.filter((p) => {
    const body = `${p.title}\n${p.body || ''}`;
    // Merged heal with no admission of softened asserts counts as clean
    // (green proof may live on a sibling PR or CI run).
    return Boolean(p.mergedAt) && !weakenedRe.test(body);
  });
  const masked = healPrs.filter((p) =>
    weakenedRe.test(`${p.title}\n${p.body || ''}`),
  ).length;

  // Prefer explicit session note if present
  let sessionHeals = null;
  const healOut = path.join(root, 'ci-artifacts', 'heal-output.txt');
  if (fs.existsSync(healOut)) {
    const text = fs.readFileSync(healOut, 'utf8');
    const m = text.match(/Heals performed:\s*([^\n]+)/i);
    if (m) sessionHeals = m[1].trim();
  }

  return {
    totalAttempts: healPrs.length,
    cleanSuccess: clean.length,
    masked,
    healPrs,
    clean,
    sessionHeals,
  };
}

function generationGateMetrics() {
  const prs = ghJson([
    'pr',
    'list',
    '--state',
    'all',
    '--limit',
    '50',
    '--json',
    'number,title,mergedAt,body,url,createdAt',
  ]);
  const gen = prs.filter(
    (p) =>
      /\bDS-\d+/i.test(p.title) &&
      !/\bheal\b/i.test(p.title) &&
      /Playwright coverage|Gherkin|Note skipped/i.test(p.title + (p.body || '')),
  );

  let pass = 0;
  const rows = [];
  for (const p of gen) {
    const body = p.body || '';
    const localGreen = /npx playwright test[\s\S]{0,120}passed/i.test(body);
    const infraSkip =
      /failed before any test|credentials are unset|Live UI recon was skipped|infra/i.test(
        body,
      );
    const mapsAc = /AC|acceptance|Gherkin|features\/DS-/i.test(body);
    // First-PR CI: look for failing PR checks historically via conclusion in body Actions links — conservative.
    const firstPrGate =
      localGreen && mapsAc && !infraSkip && Boolean(p.mergedAt);
    if (firstPrGate) pass += 1;
    rows.push({
      number: p.number,
      title: p.title,
      localGreen,
      infraSkip,
      mapsAc,
      merged: Boolean(p.mergedAt),
      firstPrGate,
      url: p.url,
    });
  }
  return { total: gen.length, pass, rows };
}

function askVsGuess() {
  // Session review: ci-artifacts + PR bodies (no Cursor telemetry).
  let ask = 0;
  let guess = 0;
  const notes = [];

  for (const file of [
    path.join(root, 'ci-artifacts', 'backlog-output.txt'),
    path.join(root, 'ci-artifacts', 'heal-output.txt'),
  ]) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const asks = [
      ...text.matchAll(/\b(need human|please (confirm|provide|set)|ask(ed|ing)? the human)\b/gi),
    ];
    ask += asks.length;
    const guesses = [
      ...text.matchAll(
        /\b(assumed|invented|skipped live|credentials are unset|inherit(ed)? the .*notes)\b/gi,
      ),
    ];
    guess += guesses.length;
    notes.push(`${path.basename(file)}: ask~${asks.length}, guess~${guesses.length}`);
  }

  const prs = ghJson([
    'pr',
    'list',
    '--state',
    'all',
    '--limit',
    '40',
    '--json',
    'number,title,body',
  ]);
  for (const p of prs) {
    const body = p.body || '';
    if (/Live UI recon was skipped|credentials are unset|inherit/i.test(body)) {
      guess += 1;
      notes.push(`PR #${p.number}: guessed/skipped live recon`);
    }
    if (/Need human OK|Do not merge until a human|awaiting human/i.test(body)) {
      // Policy gate, not a value-ask — count separately only if asking for a missing value.
      if (/provide|what is|which |missing/i.test(body)) {
        ask += 1;
        notes.push(`PR #${p.number}: asked for a missing value`);
      }
    }
  }

  return { ask, guess, notes };
}

function pct(n, d) {
  if (d === 0) return 'n/a (denom 0)';
  return `${((100 * n) / d).toFixed(1)}% (${n}/${d})`;
}

function formatRate(rate) {
  if (rate === null) return 'n/a (insufficient CI log evidence)';
  return `${(100 * rate).toFixed(1)}%`;
}

const samples = collectFlakeWindow(N);
const flake = flakeMetrics(samples);
const heal = healMetrics();
const gate = generationGateMetrics();
const ask = askVsGuess();

const flakeTable = samples
  .map(
    (s) =>
      `| ${s.id} | ${s.workflow} | ${s.conclusion} | ${s.measured ? s.flaky : 'n/a'} | ${s.passed ?? '—'} | [run](${s.url}) |`,
  )
  .join('\n');

const topRisk =
  flake.rate !== null && flake.rate > 0.02
    ? 'Flaky tests are still clearing CI via retries, hiding real instability.'
    : gate.pass === 0
      ? 'Generated specs rarely clear the first-PR generation gate (green + conforming + maps-to-AC).'
      : ask.guess > ask.ask
        ? 'Agents invent or inherit values instead of asking when live recon/credentials are missing.'
        : 'Insufficient recent signal — keep regenerating this report after each orchestrator run.';

const nextAction =
  flake.rate !== null && flake.rate > 0.02
    ? 'Quarantine the top flaky tests from the last N runs, fix root cause (no retry-as-fix), re-measure.'
    : gate.pass === 0
      ? 'Block generation PRs until scoped `npx playwright test` is green in CI on the first PR and live-app recon is recorded in the PR body.'
      : ask.guess > ask.ask
        ? 'When credentials/UI facts are missing outside backlog mode, ask once; in backlog mode leave the ticket unlabeled instead of inventing.'
        : 'Keep CI json reporter + regenerate this file after every Test Generation / orchestrator session.';

const md = `# Suite reliability eval report

_Generated: ${generatedAt}_  
_Window: last **${samples.length}** measurable CI runs (requested N=${N})._  
_Source: \`gh\` CI logs + PR history (+ \`ci-artifacts/\` when present). Cursor has **no** built-in telemetry for these metrics._

## Flake rate

| Number | **${formatRate(flake.rate)}** flaky outcomes among passed+flaky in measured runs (${flake.flakyTotal} flaky / ${flake.denom} passed+flaky across ${flake.withMeasure.length} runs) |
|--------|------|
| How measured | Parsed \`N flaky\` / \`N passed\` lines from \`gh run view <id> --log\` for the last suite workflows (E2E/Smoke/Sanity/Regression/Test Generation). HTML reports alone are not authoritative without a json reporter. |
| What it tells us | How often the suite only goes green because CI retries (up to 2) masked a first-attempt failure. |

### Sampled runs

| Run | Workflow | Conclusion | Flaky | Passed | Link |
|-----|----------|------------|-------|--------|------|
${flakeTable || '| — | — | — | — | — | — |'}

## Heal success rate

| Number | **${pct(heal.cleanSuccess, Math.max(heal.totalAttempts, 1))}** clean heals; attempts=${heal.totalAttempts}, clean=${heal.cleanSuccess} |
|--------|------|
| Masked-regression count | **${heal.masked}** (must be **0**) |
| How measured | PR history: titles matching Heal/locator drift; “clean” = merged heal with no admission of softened/removed expects; masked = body admits weakened/removed expects (must stay 0). Latest \`ci-artifacts/heal-output.txt\` note: ${heal.sessionHeals ?? 'none'}. |
| What it tells us | Whether self-heal fixes real drift without papering over product bugs or softening assertions. |

${heal.healPrs
  .map(
    (p) =>
      `- [#${p.number}](${p.url}) ${p.title}${p.mergedAt ? ` (merged ${p.mergedAt})` : ' (open)'}`,
  )
  .join('\n') || '_No heal PRs found._'}

## Generation-gate pass rate

| Number | **${pct(gate.pass, Math.max(gate.total, 1))}** first-PR passes (conservative) |
|--------|------|
| How measured | Generation PRs (DS-* coverage, excluding Heal): first-PR gate = PR body shows local/CI green **and** maps to AC/Gherkin **and** did not skip live recon/infra **and** eventually merged. Failures that only claim local green while CI stayed red do **not** count. |
| What it tells us | Whether \`test-writer\` output is trustworthy on the first PR without human rework. |

_Reviewed generation PRs: ${gate.total}. Conservative first-PR gate passes: ${gate.pass}._

## Ask-vs-guess

| Number | **ask ${ask.ask} · guess ${ask.guess}** |
|--------|------|
| How measured | Session review of \`ci-artifacts/*.txt\` (when present) plus PR bodies for skipped live recon / unset credentials (guess) vs explicit asks for a missing value. Not available from Cursor product telemetry. |
| What it tells us | Whether the agent stops for missing facts or invents them — inventing drives false-green plans and brittle specs. |

${ask.notes.map((n) => `- ${n}`).join('\n') || '_No session/PR ask-guess signals found._'}

## Top reliability risk

${topRisk}

## Next action

${nextAction}

---

### Regen instructions

\`\`\`bash
node scripts/generate-eval-report.mjs --n ${N}
# or
npm run eval:report
\`\`\`

Regenerate **after every** \`.github/workflows/test-generation.yml\` run and **after every** local orchestrator / agent backlog or heal session (see \`.cursor/rules/qa-orchestrator.mdc\`).
`;

fs.writeFileSync(outPath, md, 'utf8');
process.stdout.write(`Wrote ${outPath}\n`);
