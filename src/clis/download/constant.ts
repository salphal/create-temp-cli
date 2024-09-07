export const downloadTypes = {
  template: 'template',
  publishConfig: 'publishConfig',
  envConfig: 'envConfig',
  assets: 'assets',
  all: 'all',
} as const;

export const downloadNameChoices = Object.keys(downloadTypes).map((v) => ({ title: v, value: v }));
