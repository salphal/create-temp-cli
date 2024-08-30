import StepScheduler, {ResCode, StepList} from "../../../utils/core/scheduler";
import {FrontCli} from "../../../utils/core/front-cli";
import {Envs} from "../../../types/global";

interface ITempContext {
}

interface ITempOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class TempCli extends FrontCli<ITempContext> {

  context: ITempContext = {};

  stepList: StepList = [
    {
      name: "step_01",
      remark: ``,
      callback: async (ctx: ITempContext) => {
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
      callback: async (ctx: ITempContext) => {
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
      callback: async (ctx: ITempContext) => {
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

  constructor(options: ITempOptions) {
    super(options);
    this.context = {...this.context, ...options.ctx};
    this.scheduler = new StepScheduler({stepList: this.stepList});
  }
}
