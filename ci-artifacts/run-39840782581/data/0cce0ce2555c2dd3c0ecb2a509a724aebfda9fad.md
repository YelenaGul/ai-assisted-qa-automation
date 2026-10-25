# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ds3-program-validation.spec.ts >> TC-010: program name over max length is rejected
- Location: tests/ds3-program-validation.spec.ts:167:5

# Error details

```
Error: Create should have been rejected by validation.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img "Didaxis Studio" [ref=e7]
          - generic [ref=e8]:
            - paragraph [ref=e9]: Didaxis
            - paragraph [ref=e10]: Studio
        - generic [ref=e11]:
          - button "📊 Dashboard" [ref=e12] [cursor=pointer]:
            - generic [ref=e13]: 📊
            - paragraph [ref=e14]: Dashboard
          - button "🎓 Programs" [ref=e15] [cursor=pointer]:
            - generic [ref=e16]: 🎓
            - paragraph [ref=e17]: Programs
          - button "📅 Calendar" [ref=e18] [cursor=pointer]:
            - generic [ref=e19]: 📅
            - paragraph [ref=e20]: Calendar
          - button "✅ Validation" [ref=e21] [cursor=pointer]:
            - generic [ref=e22]: ✅
            - paragraph [ref=e23]: Validation
          - button "⚡ Scheduler" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: ⚡
            - paragraph [ref=e26]: Scheduler
          - button "📤 Export" [ref=e27] [cursor=pointer]:
            - generic [ref=e28]: 📤
            - paragraph [ref=e29]: Export
        - button "⚙️ Settings" [ref=e31] [cursor=pointer]:
          - generic [ref=e32]: ⚙️
          - paragraph [ref=e33]: Settings
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: A
            - generic [ref=e38]:
              - paragraph [ref=e39]: Admin
              - paragraph [ref=e40]: Didaxis Studio
          - button [ref=e41] [cursor=pointer]:
            - paragraph [ref=e45]: Sign out
    - main [ref=e46]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - heading "Programs" [level=2] [ref=e51]
          - paragraph [ref=e52]: Manage academic programs and semesters
        - button "+ New Program" [ref=e54] [cursor=pointer]
  - dialog [ref=e60]:
    - banner [ref=e61]:
      - heading "New Program" [level=2] [ref=e62]
      - button [ref=e63] [cursor=pointer]
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]: Program Name *
        - textbox "Program Name" [ref=e71]:
          - /placeholder: e.g. Computer Science BSc
      - generic [ref=e72]:
        - generic [ref=e73]: Description
        - textbox "Description" [ref=e75]:
          - /placeholder: Brief description
      - separator [ref=e76]
      - button "▸ Show AI Generation Config" [ref=e77] [cursor=pointer]
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]: Total Program Hours
          - paragraph [ref=e83]: Required for AI curriculum generation
          - generic [ref=e84]:
            - textbox [ref=e85]:
              - /placeholder: e.g. 900
            - generic [ref=e87]:
              - button [aria-hidden] [ref=e88] [cursor=pointer]
              - button [aria-hidden] [ref=e91] [cursor=pointer]
        - generic [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]: Default Session Hours
            - generic [ref=e97]:
              - textbox [ref=e98]: "4"
              - generic [ref=e100]:
                - button [aria-hidden] [ref=e101] [cursor=pointer]
                - button [aria-hidden] [ref=e104] [cursor=pointer]
          - generic [ref=e107]:
            - generic [ref=e108]: Default Exam Hours
            - generic [ref=e109]:
              - textbox [ref=e110]: "3"
              - generic [ref=e112]:
                - button [aria-hidden] [ref=e113] [cursor=pointer]
                - button [aria-hidden] [ref=e116] [cursor=pointer]
        - generic [ref=e119]:
          - generic [ref=e120]: Target Audience
          - textbox [ref=e122]:
            - /placeholder: e.g. Career changers, no CS background
        - generic [ref=e123]:
          - generic [ref=e124]: Focus Areas
          - textbox [ref=e126]:
            - /placeholder: e.g. Python, SQL, Machine Learning, Data Visualization
        - generic [ref=e127]:
          - paragraph [ref=e128]: "Sync/Async Ratio: 70% sync / 30% async"
          - generic [ref=e131] [cursor=pointer]:
            - slider [ref=e133]
            - generic: All async
            - generic: 50/50
            - generic: All sync
      - generic [ref=e134]:
        - button "Cancel" [ref=e135] [cursor=pointer]
        - button "Create" [disabled] [active] [ref=e138]
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import type { ProgramsPage } from '../../pages/ProgramsPage';
  3  | import { uniqueProgramName } from './didaxis';
  4  | 
  5  | /** Confluence: Program Setup — Validation Rules */
  6  | export const PROGRAM_NAME_MAX_LENGTH = 100;
  7  | export const DESCRIPTION_MAX_LENGTH = 500;
  8  | 
  9  | export function programNameWithLength(targetLength: number, prefix: string): string {
  10 |   const base = uniqueProgramName(prefix);
  11 |   if (base.length >= targetLength) {
  12 |     return base.slice(0, targetLength);
  13 |   }
  14 |   return base + 'x'.repeat(targetLength - base.length);
  15 | }
  16 | 
  17 | export function descriptionWithLength(targetLength: number): string {
  18 |   if (targetLength <= 0) {
  19 |     return '';
  20 |   }
  21 |   return 'd'.repeat(targetLength);
  22 | }
  23 | 
  24 | /**
  25 |  * After a program with `existingName` exists, second create with same name must be blocked
  26 |  * (400/409 per validation rules) — at most one row, modal or validation error visible.
  27 |  */
  28 | export async function expectDuplicateCreateRejected(
  29 |   programs: ProgramsPage,
  30 |   existingName: string,
  31 | ): Promise<void> {
  32 |   const duplicateId = await programs.attemptCreateProgram(
  33 |     existingName,
  34 |     'Duplicate instance attempt',
  35 |   );
  36 |   if (duplicateId) {
  37 |     throw new Error(
  38 |       'Duplicate create returned a program id; server should reject duplicate names.',
  39 |     );
  40 |   }
  41 | 
  42 |   await expect(programs.programRow(existingName)).toHaveCount(1, {
  43 |     timeout: 60_000,
  44 |   });
  45 | 
  46 |   const blockedInDialog =
  47 |     (await programs.newProgramModal.nameValidationError.isVisible()) ||
  48 |     (await programs.newProgramModal.dialog.isVisible());
  49 |   expect(blockedInDialog).toBeTruthy();
  50 | }
  51 | 
  52 | export async function expectCreateRejectedWithModalOpen(
  53 |   programs: ProgramsPage,
  54 |   programName: string,
  55 | ): Promise<void> {
  56 |   const programId = await programs.submitNewProgramForm();
  57 |   if (programId) {
> 58 |     throw new Error('Create should have been rejected by validation.');
     |           ^ Error: Create should have been rejected by validation.
  59 |   }
  60 | 
  61 |   const stillOpen =
  62 |     (await programs.newProgramModal.dialog.isVisible()) ||
  63 |     (await programs.newProgramModal.nameValidationError.isVisible());
  64 |   expect(stillOpen).toBeTruthy();
  65 |   await expect(programs.programRow(programName)).toHaveCount(0);
  66 | }
  67 | 
```