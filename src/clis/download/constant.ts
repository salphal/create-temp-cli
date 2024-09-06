export const downloadTypes = {
  all: 'all',
  template: 'template',
  publishConfig: 'publishConfig',
  envConfig: 'envConfig',
} as const;

export const downloadNameChoices = Object.keys(downloadTypes).map((v) => ({ title: v, value: v }));
