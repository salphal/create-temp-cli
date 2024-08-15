export interface TempInfo {
  tempName: string;
  fileName: string;
  fullPath: string;
}

export type TempInfoList = Array<TempInfo>;

export interface PickerOption {
  title: string;
  value: string;
}

export type PickerOptionList = Array<PickerOption>;

export type TempNameList = Array<string>;

export interface Envs {
  [key: string]: string | undefined;
}
