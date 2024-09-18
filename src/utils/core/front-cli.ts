import { ResCode, StepList, StepScheduler } from './scheduler';
import { Envs } from '@type/env';
import { Logger } from '../logger/index';
import { CLI_CONFIG_FILE_NAME, TEMPLATE_CONFIG_FILE_NAME } from '@constants/common';
import path from 'path';
import { Prompt, PromptList } from '@utils';
import prompts from 'prompts';

export interface ICustomCliConfig {
  [key: string]: any;

  /** 自定义输出前缀列表 */
  outputPrefixList: Array<string>;
  /** 自定义输出路径集合 */
  outputPathMap: (ctx: any) => { [key: string]: string };
  /** 自定义交互列表 */
  beforePrompts: PromptList;
  /** 自定义执行时所需的数据 */
  beforeData: (ctx: any) => { [key: string]: any };
}

export interface IFrontCliOptions {
  [key: string]: any;

  ctx: Envs & {};
}

export abstract class FrontCli<T = any> {
  /** 存储入参 */
  options: IFrontCliOptions;

  /** 上下文数据 */
  abstract context: T;

  /** 调度器 */
  abstract scheduler: StepScheduler;

  /** 步骤列表 */
  abstract stepList: StepList;

  protected constructor(options: IFrontCliOptions) {
    this.options = options;
  }

  /** 自动执行 */
  start(params?: any) {
    try {
      this.context = { ...this.context, ...params };
      this.scheduler.autoExecute();
    } catch (err: any) {
      Logger.error(err);
    }
  }

  beforeStep(context: T) {
    return {
      name: 'before_step',
      remark: ``,
      callback: async (ctx: any) => {
        const { __dirname } = this.context as any;

        let customConfig: ICustomCliConfig = {
          outputPrefixList: [],
          outputPathMap: () => ({}),
          beforePrompts: [],
          beforeData: () => ({}),
        };
        let customConfigMap: { [key: string]: ICustomCliConfig } = {};

        let beforePromptsResult: { [key: string]: any } = {};
        let outputPathMap: { [key: string]: string } = {};
        let outputPrefix = '';

        /** 载入自定义配置模块 */
        const customConfigModule = await import(
          path.join(__dirname, `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_CONFIG_FILE_NAME}`)
        );

        if (typeof customConfigModule.default === 'function') {
          customConfigMap = customConfigModule.default(this.context) as {
            [key: string]: ICustomCliConfig;
          };
        }

        if (Object.keys(customConfigMap).length) {
          const configChoices = Object.keys(customConfigMap).map((key) => ({
            title: key,
            value: key,
          }));

          const configKey = await Prompt.autocomplete('Please select custom config', configChoices);

          if (configKey) customConfig = customConfigMap[configKey];

          if (
            Array.isArray(customConfig.outputPrefixList) &&
            customConfig.outputPrefixList.length
          ) {
            const prefixChoices = customConfig.outputPrefixList.map((key) => ({
              title: key,
              value: key,
            }));
            outputPrefix = await Prompt.autocomplete('Please select custom prefix', prefixChoices);
          }

          if (Array.isArray(customConfig.beforePrompts) && customConfig.beforeContext.length) {
            beforePromptsResult = prompts(customConfig.beforePrompts);
          }

          if (typeof customConfig.outputPathMap === 'function') {
            outputPathMap = customConfig.outputPathMap({
              ...customConfig.beforeData,
              prefix: outputPrefix || '',
              ...this.context,
            });

            if (Object.keys(outputPathMap).length) {
            }
          }
        }

        return {
          code: ResCode.next,
          data: {
            beforeContext: {
              outputPrefix,
              ...beforePromptsResult,
              outputPathMap,
            },
          },
        };
      },
    };
  }
}
