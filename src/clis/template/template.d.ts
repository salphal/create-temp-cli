import {PromptChoices} from "../utils/prompt";

export interface CliEnvs {
  [key: string]: string | undefined;

  TEMP_CLI_TEMPLATE_DIRECTORY?: string | undefined;
  TEMP_CLI_OUTPUT_DIRECTORY?: string | undefined;
  TEMP_CLI_OUTPUT_DIRECTORY_CHOICES?: string | undefined;
}

export interface TempInfo {
  tempName: string;
  fileName: string;
  fullPath: string;
}

export type TempInfoList = Array<TempInfo>;

export type TempNameList = Array<string>;

export interface TempContext {
  [key: string]: any;

  /** 默认模版目录路径 */
  tempDirPath: string;
  /** 默认输出目录路径 */
  outputDirPath: string;

  /** 所有模版信息列表集合 */
  allTempInfoList: TempInfoList;

  /** 模版目录列表 */
  tempDirPathList: string[];
  /** 获取所有去重的模版名列表 */
  tempNameList: string[];

  /** 用户交互的结果 */
  questionResult: {
    tempName: string;
    // compName: string;
    fileName: string;
    outputPath: string;
  };
  /** 输出选项 */
  outputPathChoices: PromptChoices;
  /** 模版选项 */
  tempNameChoices: PromptChoices;

  /** 用于模版中的变量 */
  replacements: {
    CompName: string;
    compName: string;
    COMP_NAME: string;
    SHORT_COMP_NAME: string;
    className: string;
    fileName: string;
  };
}
