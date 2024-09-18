import { ResCode, StepList, StepScheduler } from './scheduler';
import { Envs } from '@type/env';
import { Logger } from '../logger/index';
import { CLI_CONFIG_FILE_NAME, TEMPLATE_CONFIG_FILE_NAME } from '@constants/common';
import path from 'path';
import { Prompt, PromptList } from '@utils';
import prompts from 'prompts';

export interface CustomCliConfig {
  [key: string]: any;

  /** 自定义输出前缀列表 */
  outputPrefixList: (ctx: any) => Array<string>;
  /** 自定义输出路径集合 */
  outputPathMap: (ctx: any) => { [key: string]: string };
  /** 自定义交互列表 */
  beforePrompts: PromptList;
  /** 自定义执行时所需的数据 */
  beforeData: (ctx: any) => { [key: string]: any };
}

export interface IFrontCliOptions {
  [key: string]: any;

  /** 环境变量 */
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

  customConfigStep(context: T) {
    return {
      name: 'custom_config_step',
      remark: ``,
      callback: async (ctx: any) => {
        const { __dirname } = this.context as any;

        let customConfig: CustomCliConfig = {
          outputPrefixList: () => [],
          outputPathMap: () => ({}),
          beforePrompts: [],
          beforeData: () => ({}),
        };

        let outputPrefix = '';
        let useOutputPathMap = false;
        let customConfigMap: { [key: string]: CustomCliConfig } = {};
        let beforePromptsResult: { [key: string]: any } = {};
        let outputPathMap: { [key: string]: string } = {};

        /** 载入自定义配置模块 */
        const customConfigModule = await import(
          path.join(__dirname, `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_CONFIG_FILE_NAME}`)
        );

        /** 如果导入配置函数正常, 则获取配置 */
        if (typeof customConfigModule.default === 'function') {
          customConfigMap = customConfigModule.default(this.context) as {
            [key: string]: CustomCliConfig;
          };
        }

        /** 让用户选择自定义的配置对象 */
        if (Object.keys(customConfigMap).length) {
          const configChoices = Object.keys(customConfigMap).map((key) => ({
            title: key,
            value: key,
          }));

          const configKey = await Prompt.autocomplete('Please select custom config', configChoices);
          if (configKey) customConfig = customConfigMap[configKey];
        }

        /** 根据配置的 outputPrefix 列表选择, 输出路径的前缀 */
        if (typeof customConfig.outputPrefixList === 'function') {
          const prefixList = customConfig.outputPrefixList(this.context);
          if (Array.isArray(prefixList) && prefixList.length) {
            const prefixChoices = prefixList.map((key) => ({
              title: key,
              value: key,
            }));
            outputPrefix = await Prompt.autocomplete('Please select custom prefix', prefixChoices);
          }
        }

        /** 若设置了自定义问题则执行 */
        if (Array.isArray(customConfig.beforePrompts) && customConfig.beforeContext.length) {
          beforePromptsResult = prompts(customConfig.beforePrompts);
        }

        /** 根据用户选饿的 outputPrefix 执行, 并返回输出路径映射集合 */
        if (typeof customConfig.outputPathMap === 'function') {
          outputPathMap = customConfig.outputPathMap({
            ...customConfig.beforeData,
            prefix: outputPrefix || '',
            ...this.context,
          });

          /** 若有输出路径集合, 则询问是否 直接使用输出路径集合 */
          if (Object.keys(outputPathMap).length) {
            useOutputPathMap = await Prompt.toggle(
              'Whether to use outputPathMap as the output path',
            );
          }
        }

        return {
          code: ResCode.next,
          data: {
            customConfigStep: {
              ...beforePromptsResult,
              outputPrefix,
              outputPathMap,
              useOutputPathMap,
            },
          },
        };
      },
    };
  }
}
