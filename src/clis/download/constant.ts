import {
  PUBLISH_CONFIG_FILE_NAME,
  TEMPLATE_CONFIG_FILE_NAME,
  TEMPLATE_FILE_NAME,
} from '@constants/common';

export const downloadTypes = {
  template: TEMPLATE_FILE_NAME,
  templateConfig: TEMPLATE_CONFIG_FILE_NAME,
  publishConfig: PUBLISH_CONFIG_FILE_NAME,
  all: 'all',
} as const;

export type DownloadKeys = keyof typeof downloadTypes;

export const downloadNameChoices = Object.keys(downloadTypes).map((v) => ({ title: v, value: v }));
