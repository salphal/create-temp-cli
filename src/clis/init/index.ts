import { FrontCli, ResCode, StepList, StepScheduler } from '@utils';
import { Envs } from '@type/env';

interface IInitContext extends Envs {}

interface IInitOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class InitCli extends FrontCli<IInitContext> {
  context: IInitContext = {
    argv: {},
    __dirname: '',
    __filename: '',
    envs: {},
  };

  stepList: StepList = [
    {
      name: 'step_01',
      remark: ``,
      data: () => ({}),
      callback: async (ctx: IInitContext) => {
        const {} = this.context;
        console.log('=> step_01', ctx);
        return {
          code: ResCode.next,
          data: { ...ctx },
        };
      },
    },
    {
      name: 'step_02',
      remark: ``,
      data: () => ({}),
      callback: async (ctx: IInitContext) => {
        const {} = this.context;
        console.log('=> step_02', ctx);
        return {
          code: ResCode.next,
          data: { ...ctx },
        };
      },
    },
    {
      name: 'step_03',
      remark: ``,
      data: () => ({}),
      callback: async (ctx: IInitContext) => {
        const {} = this.context;
        console.log('=> step_03', ctx);
        return {
          code: ResCode.end,
          data: { ...ctx },
        };
      },
    },
  ];

  scheduler: StepScheduler;

  constructor(options: IInitOptions) {
    super(options);
    this.context = { ...this.context, ...options.ctx };
    this.scheduler = new StepScheduler({ stepList: this.stepList });
  }
}
