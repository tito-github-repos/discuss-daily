// Safe to import from both server and client code (no database imports here).

export const SCENARIO_KEYS = ['STUDENT', 'FINANCE', 'WORKPLACE', 'FAMILY'] as const;

export type ScenarioKey = (typeof SCENARIO_KEYS)[number];

// The same titles as the Life Scenarios cards on the site
export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  STUDENT: 'If you are a student',
  FINANCE: 'If you have a financial goal/problem',
  WORKPLACE: 'If you have a problem in your working premises',
  FAMILY: 'If you have a problem with your family members',
};

export const isScenarioKey = (value: unknown): value is ScenarioKey =>
  typeof value === 'string' && (SCENARIO_KEYS as readonly string[]).includes(value);