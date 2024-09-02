import {ResCode, StepList, StepScheduler, FsExtra, Logger, FrontCli, PromptChoices, Prompt} from "@utils";
import {Envs} from "@src/types/global";
import path from "path";
import {CONFIG_BASE_NAME} from "@constants/common";
import {PublishConfigList} from "./publish";

interface IPublishContext extends Envs {
  /** 部署信息配置列表 */
  publishConfigList: PublishConfigList;
  /**  */
  publishConfigOptions: PromptChoices;

}

interface IPublishOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class PublishCli extends FrontCli<IPublishContext> {

  context: IPublishContext = {

    publishConfigList: [],
    publishConfigOptions: [],

    argv: {},
    __dirname: "",
    __filename: "",
    envs: {}
  };

  stepList: StepList = [
    {
      name: "step_01",
      remark: ``,
      callback: async (ctx: IPublishContext) => {
        const {__dirname} = this.context;

        const jsonPath = path.resolve(__dirname, `${CONFIG_BASE_NAME}/publish.config.json`);

        const isFile = await FsExtra.isFile(jsonPath);

        if (!isFile) {
          return;
        }

        console.log("=>(index.ts:39) isFile", isFile);

        const publishConfigList = await FsExtra.readJson(jsonPath) as PublishConfigList;

        if (!Array.isArray(publishConfigList) || !publishConfigList.length) {
          Logger.error('');
          return;
        }

        this.context.publishConfigList = publishConfigList;

        const publishConfigOptions = publishConfigList.map(config => {
          const {envName, server: {connect: {host}}} = config;
          return {
            title: `[${envName}]:${host}`,
            value: envName
          };
        });

        this.context.publishConfigOptions = publishConfigOptions;

        console.log("=>(index.ts:62) publishConfigOptions", publishConfigOptions);
        console.log("=>(index.ts:41) publishConfigList", publishConfigList);

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

        const res = await Prompt.autocomplete('', this.context.publishConfigOptions);
        console.log("=>(index.ts:90) res", res);


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
