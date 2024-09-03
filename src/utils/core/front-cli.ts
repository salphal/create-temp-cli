import { StepList, StepScheduler } from './scheduler';
import { Envs } from '@src/types/global';
import { Logger } from '../print/logger';

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
  start() {
    try {
      this.scheduler.autoExecute();
    } catch (err: any) {
      Logger.error(err);
    }
  }
}
