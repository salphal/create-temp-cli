import { StepList, StepScheduler } from './scheduler';
import { Envs } from '@type/env';
import { Logger } from '../logger/index';

export interface CustomCliConfig<R = { [key: string]: any }, O = { [key: string]: any }> {
  [key: string]: any;

  /** */
  outputPrefixList: Array<string>;
  /** */
  outputPathMap: (ctx: O) => { [key: string]: string };
  /** */
  beforePrompts: Array<any>;
  /** */
  beforeContext: (ctx: R) => { [key: string]: any; outputPrefix?: string };
}

export interface IFrontCliOptions {
  [key: string]: any;

  ctx: Envs & {};
}

export abstract class FrontCli<T> {
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

  initCustomConfig<R, O>(cliConfig: CustomCliConfig<R, O>) {}
}
