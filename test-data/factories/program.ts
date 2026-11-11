import { faker } from '@faker-js/faker';

export type ProgramInput = {
  name: string;
  description: string;
};

/**
 * Happy-path program payload for UI/API creates.
 * Names are unique so parallel runs do not collide.
 */
export function buildProgram(
  overrides: Partial<ProgramInput> = {},
): ProgramInput {
  return {
    name: `Program ${faker.string.alphanumeric(8)}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
