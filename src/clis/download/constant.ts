export const downloadTypes = {
  template: 'template',
  templateConfig: 'templateConfig',
  publishConfig: 'publishConfig',
  all: 'all',
} as const;

export type DownloadKeys = keyof typeof downloadTypes;

export const downloadNameChoices = Object.keys(downloadTypes).map((v) => ({ title: v, value: v }));
