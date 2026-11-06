---
name: self-heal
description: >-
  ALWAYS apply this skill when the user says "the build is red because a
  locator broke", "fix the drifted selector", "the test broke after a UI
  change", or "heal the suite". Heals Playwright locator drift by patching
  the POM from the Agent-Browser a11y tree, then proving the suite green
  with assertions unchanged. Use it ONLY after triage classifies the red
  run as a test issue (drift), never for a real app bug.
---

# Self-heal

Repair one drifted locator per run. Open a PR for every heal. Never weaken assertions to go green.

## Steps

1. **Require triage's drift classification.** Proceed only if triage already classified the red run as a **test issue (drift)**. If classification is missing, stop and run triage first. If triage says a real app bug, stop and route to **bug-reporter** — do not heal.

2. **Find the failing locator and its POM from the trace.** Open the Playwright trace / error for the failing test. Name the broken locator expression and the POM file/property that owns it (`pages/`). Do not change the spec yet.

3. **Re-discover the element via the Agent-Browser a11y tree.** Open the live UI. Locate the same control by **role + current accessible name** (not CSS, not XPath, not a screenshot guess). Record the new role-based locator.

4. **Patch the locator in the POM only.** Minimal role-based diff in the POM. Never edit the spec's assertions. Never touch product source.

5. **Re-run and prove green WITH assertions unchanged.** Run the scoped Playwright tests. Green must come from the healed locator, not from a weakened or deleted `expect`. If the only way to pass is a weaker assertion, treat that as a product/test-design bug and escalate (do not ship the weaken).

6. **Report the old→new locator diff + the green run.** Show the POM diff (old locator → new locator), the command that went green, and open **one PR** for this heal. One repair per run — leave other failures for the next run.
