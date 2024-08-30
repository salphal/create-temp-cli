import StepScheduler, {ResCode, StepList} from "../../../utils/core/scheduler";
import {FrontCli} from "../../../utils/core/front-cli";
import {Envs} from "../../../types/global";

interface IPublishContext {
}

interface IPublishOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class PublishCli extends FrontCli<IPublishContext> {

  context: IPublishContext = {};

  stepList: StepList = [
    {
      name: "step_01",
      remark: ``,
      callback: async (ctx: IPublishContext) => {
        const {} = this.context;
        console.log('=> step_01', ctx);
        return {
          code: ResCode.next,
          data: {}
        }
      }
    },
    {
      name: "step_02",
      remark: ``,
      callback: async (ctx: IPublishContext) => {
        const {} = this.context;
        console.log('=> step_02', ctx);
        return {
          code: ResCode.next,
          data: {}
        }
      }
    },
    {
      name: "step_03",
      remark: ``,
      callback: async (ctx: IPublishContext) => {
        const {} = this.context;
        console.log('=> step_03', ctx);
        return {
          code: ResCode.end,
          data: {}
        }
      }
    }
  ];

  scheduler: StepScheduler;

  constructor(options: IPublishOptions) {
    super(options);
    this.context = {...this.context, ...options.ctx};
    this.scheduler = new StepScheduler({stepList: this.stepList});
  }
}
