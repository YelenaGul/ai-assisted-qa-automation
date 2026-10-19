import { test as base, expect } from '@playwright/test';
import { deleteProgramById } from '../tests/helpers/didaxis-api';
import { didaxisCredentialsForProject } from '../tests/helpers/didaxis-users';

type CleanupFixtures = {
  trackProgram: (programId: string) => void;
};

export const test = base.extend<CleanupFixtures>({
  trackProgram: async ({ request }, use, testInfo) => {
    const programIds: string[] = [];
    const credentials = didaxisCredentialsForProject(testInfo.project.name);

    await use((programId: string) => {
      programIds.push(programId);
    });

    for (const programId of programIds) {
      try {
        await deleteProgramById(request, programId, credentials);
      } catch (error) {
        console.warn(`API cleanup failed for program ${programId}:`, error);
      }
    }
  },
});

export { expect };
