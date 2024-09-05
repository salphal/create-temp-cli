import { FrontCli, ResCode, StepList, StepScheduler } from '@utils';
import { Envs } from '@type/env';

interface IDownloadContext extends Envs {}

interface IDownloadOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class DownloadCli extends FrontCli<IDownloadContext> {
  context: IDownloadContext = {
    argv: {},
    __dirname: '',
    __filename: '',
    envs: {},
  };

  stepList: StepList = [
    {
      name: 'step_01',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const {} = this.context;
        console.log('=> step_01', ctx);
        return {
          code: ResCode.next,
          data: {},
        };
      },
    },
    {
      name: 'step_02',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const {} = this.context;
        console.log('=> step_02', ctx);
        return {
          code: ResCode.next,
          data: {},
        };
      },
    },
    {
      name: 'step_03',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const {} = this.context;
        console.log('=> step_03', ctx);
        return {
          code: ResCode.end,
          data: {},
        };
      },
    },
  ];

  scheduler: StepScheduler;

  constructor(options: IDownloadOptions) {
    super(options);
    this.context = { ...this.context, ...options.ctx };
    this.scheduler = new StepScheduler({ stepList: this.stepList });
  }
}
