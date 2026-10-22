# Didaxis Programs — Test Case Index

Docs below include **all plan cases** from each `DS-*_output.md`, with **automation status** and Playwright mapping where IDs differ.

| Suite | Feature | Spec file | Test cases doc | Plan TCs | In-spec automated | Cross-suite / partial | Skipped | Not automated |
|-------|---------|-----------|----------------|----------|---------------------|------------------------|---------|---------------|
| DS-1 | Create program | `tests/ds1-create-program.spec.ts` | [DS-1_automated-test-cases.md](./DS-1/DS-1_automated-test-cases.md) | 14 | 8 | 2 *(TC-006, TC-008)* | 0 | 6 |
| DS-2 | Edit program | `tests/ds2-edit-program.spec.ts` | [DS-2_automated-test-cases.md](./DS-2/DS-2_automated-test-cases.md) | 11 | 11 | 0 | 0 | 0 |
| DS-3 | Name validation | `tests/ds3-program-validation.spec.ts` | [DS-3_automated-test-cases.md](./DS-3/DS-3_automated-test-cases.md) | 12 | 11 | 1 *(TC-011 → DS-2 TC-006)* | 0 | 0 |
| DS-4 | Delete program | `tests/ds4-delete-program.spec.ts` | [DS-4_automated-test-cases.md](./DS-4/DS-4_automated-test-cases.md) | 10 | 7 | 1 *(supplementary list TC-008)* | 0 | 4 |
| DS-5 | List & display | `tests/ds5-program-list.spec.ts` | [DS-5_automated-test-cases.md](./DS-5/DS-5_automated-test-cases.md) | 11 | 6 | 1 *(layout spec TC-010 ≠ plan TC-010)* | 1 *(TC-002)* | 4 |

**Related Playwright (not DS-numbered specs):** `tests/programs.spec.ts` (create/list smoke, overlaps DS-1 IDs); `tests/programs.a11y.spec.ts` (informative axe on Programs / New Program modal — `@informative`, does not fail CI on violations).

**Playwright runs:** **45** executing tests in DS-1–DS-5 specs + **1** skipped (DS-5 TC-002 on shared tenant).  
**Full catalog:** 58 plan test cases documented across DS-1–DS-5.

## Run commands

```bash
npx playwright test tests/ds1-create-program.spec.ts --project=chromium-user-1 --workers=1
npx playwright test tests/ds2-edit-program.spec.ts tests/ds3-program-validation.spec.ts tests/ds4-delete-program.spec.ts tests/ds5-program-list.spec.ts --project=chromium-user-1 --workers=1
```

Use the `chromium-user-*` project that matches your configured Didaxis user (see `playwright.config.ts`).

## Environment

Credentials and base URL: `.env` / `.env-example` (`DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`; optional `DIDAXIS_USER_*` and `DIDAXIS_API_TOKEN`).

## Common gaps (manual / future automation)

- Non-admin roles (DS-1 TC-007, DS-4 TC-006, DS-5 TC-005)
- Empty catalog / last-delete empty state (DS-5 TC-002 skipped, DS-4 plan TC-008)
- DS-1 max-length plan TC-008/009/013 vs DS-3 TC-009/010 *(255/256 create validation automated in DS-3)*
- List filter/search and large-catalog pagination (DS-5 TC-008/009/010 plan)
- API failure simulation (DS-4 TC-010)
- Name/description max length per [Program Setup — Validation Rules](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233111553/Program+Setup+Validation+Rules): **100** / **500** chars (`tests/helpers/program-validation.ts`)
