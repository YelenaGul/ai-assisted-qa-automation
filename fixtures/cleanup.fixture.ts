import { test as base, expect } from '@playwright/test';
import { deleteProgramById } from '../tests/helpers/didaxis-api';

type CleanupFixtures = {
  trackProgram: (programId: string) => void;
};

export const test = base.extend<CleanupFixtures>({
  trackProgram: async ({ request }, use) => {
    const programIds: string[] = [];

    await use((programId: string) => {
      programIds.push(programId);
    });

    for (const programId of programIds) {
      try {
        await deleteProgramById(request, programId);
      } catch (error) {
        console.warn(`API cleanup failed for program ${programId}:`, error);
      }
    }
  },
});

export { expect };
