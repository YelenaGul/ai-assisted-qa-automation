# Didaxis Programs — Test Case Index

Docs below include **all plan cases** from each `DS-*_output.md`, with **automation status** and Playwright mapping where IDs differ.

| Suite | Feature | Spec file | Test cases doc | Plan TCs | Automated | Skipped | Not automated |
|-------|---------|-----------|----------------|----------|-----------|---------|---------------|
| DS-1 | Create program | `tests/ds1-create-program.spec.ts` | [DS-1_automated-test-cases.md](./DS-1/DS-1_automated-test-cases.md) | 14 | 8 | 0 | 6 (+2 partial) |
| DS-2 | Edit program | `tests/ds2-edit-program.spec.ts` | [DS-2_automated-test-cases.md](./DS-2/DS-2_automated-test-cases.md) | 11 | 8 | 0 | 3 |
| DS-3 | Name validation | `tests/ds3-program-validation.spec.ts` | [DS-3_automated-test-cases.md](./DS-3/DS-3_automated-test-cases.md) | 12 | 8 | 0 | 4 |
| DS-4 | Delete program | `tests/ds4-delete-program.spec.ts` | [DS-4_automated-test-cases.md](./DS-4/DS-4_automated-test-cases.md) | 10 | 7 | 0 | 4 (+1 supplementary spec) |
| DS-5 | List & display | `tests/ds5-program-list.spec.ts` | [DS-5_automated-test-cases.md](./DS-5/DS-5_automated-test-cases.md) | 11 | 6 | 1 | 4 (+1 supplementary spec) |

**Playwright runs:** 38 executing tests + 1 skipped (DS-5 TC-002).  
**Full catalog:** 58 plan test cases documented across DS-1–DS-5.

## Run commands

```bash
npx playwright test tests/ds1-create-program.spec.ts --project=chromium --workers=1
npx playwright test tests/ds2-edit-program.spec.ts tests/ds3-program-validation.spec.ts tests/ds4-delete-program.spec.ts tests/ds5-program-list.spec.ts --project=chromium --workers=1
```

## Environment

Credentials and base URL: `.env` / `.env-example` (`DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`).

## Common gaps (manual / future automation)

- Non-admin roles (DS-1 TC-007, DS-4 TC-006, DS-5 TC-005)
- Empty catalog / last-delete empty state (DS-5 TC-002, DS-4 plan TC-008)
- Max-length boundaries (DS-1 TC-008/009/013, DS-3 TC-009/010)
- List filter/search (DS-5 TC-008/009)
- API failure simulation (DS-4 TC-010)
