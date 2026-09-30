# Didaxis Programs — Automated Test Case Index

| Suite | Feature | Spec file | Test cases doc | Automated tests |
|-------|---------|-----------|----------------|-----------------|
| DS-1 | Create program | `tests/ds1-create-program.spec.ts` | [DS-1_automated-test-cases.md](./DS-1/DS-1_automated-test-cases.md) | 8 |
| DS-2 | Edit program | `tests/ds2-edit-program.spec.ts` | [DS-2_automated-test-cases.md](./DS-2/DS-2_automated-test-cases.md) | 8 |
| DS-3 | Name validation | `tests/ds3-program-validation.spec.ts` | [DS-3_automated-test-cases.md](./DS-3/DS-3_automated-test-cases.md) | 8 |
| DS-4 | Delete program | `tests/ds4-delete-program.spec.ts` | [DS-4_automated-test-cases.md](./DS-4/DS-4_automated-test-cases.md) | 7 |
| DS-5 | List & display | `tests/ds5-program-list.spec.ts` | [DS-5_automated-test-cases.md](./DS-5/DS-5_automated-test-cases.md) | 7 (1 skipped) |

**Total automated:** 38 active + 1 skipped (DS-5 TC-002)

## Run commands

```bash
npx playwright test tests/ds1-create-program.spec.ts
npx playwright test tests/ds2-edit-program.spec.ts tests/ds3-program-validation.spec.ts tests/ds4-delete-program.spec.ts tests/ds5-program-list.spec.ts
```

## Environment

Credentials and base URL: `.env` / `.env-example` (`DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`).
