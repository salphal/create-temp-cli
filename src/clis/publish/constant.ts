export const publishTypes = {
  publish: 'publish',
  rollback: 'rollback',
} as const;

export const publishTypeChoices = Object.keys(publishTypes).map((v) => ({ title: v, value: v }));

export const backupDateFormat = 'YYYY-MM-DD-hh-mm-ss';
