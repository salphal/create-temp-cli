import StepScheduler, {ResCode, StepList} from "../../../utils/core/scheduler";
import {FrontCli} from "../../../utils/core/front-cli";
import {Envs} from "../../../types/global";
import FsExtra from "../../../utils/file";
import path from "path";
import {CONFIG_BASE_NAME} from "../../constants/common";
import {PublishConfigList} from "./publish";

interface IPublishContext extends Envs {

}

interface IPublishOptions {
	/** 外部注入的运行时上下文的数据 */
	ctx: Envs & {};
}

export class PublishCli extends FrontCli<IPublishContext> {

	context: IPublishContext = {
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
				console.log("=>(index.ts:28) jsonPath", jsonPath);

				// fs.stat(jsonPath, (err, stats) => {
				// 	console.log("=>(index.ts:46) stats", stats);
				// });

				const isFile = await FsExtra.isFile(jsonPath);
				console.log("=>(index.ts:39) isFile", isFile);

				const configList = await FsExtra.readJson(jsonPath) as PublishConfigList;
				console.log("=>(index.ts:28) configList", configList);

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
