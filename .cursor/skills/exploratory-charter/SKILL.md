---
name: exploratory-charter
description: >-
  Turns a feature + a risk into a charter and a findings template. Use when
  the user asks for an exploratory charter, session charter, exploratory
  testing plan, or feature-plus-risk exploration. A tiny procedure that turns
  a feature + a risk into a charter and a findings template. The thinking is
  human; the skill just keeps the format.
---

# Exploratory charter

a tiny procedure that turns a feature + a risk into a charter and a findings template. The thinking is human; the skill just keeps the format.

## Inputs

Need only:

1. **Feature** — what to explore  
2. **Risk** — what could go wrong / why it matters  

If either is missing, ask once. Do not invent product analysis, browse the app, write tests, or fill findings unless the human asks.

## Procedure

1. Restate feature and risk in one line each.  
2. Output the **Charter** (fill Feature / Risk / Mission; leave the rest blank for the human).  
3. Output the empty **Findings** template.  
4. Stop.

## Charter

```markdown
# Charter

- **Feature:** <feature>
- **Risk:** <risk>
- **Mission:** Explore <feature> with attention to <risk>
- **Scope in:**
- **Scope out:**
- **Oracles / notes:**
- **Time box:**
- **Environment:**
```

## Findings

```markdown
# Findings

| # | Area | Observation | Evidence | Severity | Follow-up |
|---|------|-------------|----------|----------|-----------|
| 1 |  |  |  |  |  |

## Session notes

-

## Bugs to file

-

## Ideas for automation

-
```
