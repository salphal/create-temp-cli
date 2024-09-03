import {FrontCli, FsExtra, Logger, Prompt, PromptChoices, ResCode, StepList, StepScheduler, TarExtra} from "@utils";
import {Envs} from "@src/types/global";
import path from "path";
import {CONFIG_BASE_NAME} from "@constants/common";
import {PublishConfig, PublishConfigList} from "./publish";
import {getPublishConfigByEnvName} from "@clis/publish/utils/publish";

interface IPublishContext extends Envs {
	/** 部署信息配置列表 */
	publishConfigList: PublishConfigList;
	/** 用户选择的部署信息 */
	currentPublishConfig: PublishConfig;
	/** 部署配置选项 */
	envNameConfigChoices: PromptChoices;
}

interface IPublishOptions {
	/** 外部注入的运行时上下文的数据 */
	ctx: Envs & {};
}

export class PublishCli extends FrontCli<IPublishContext> {

	context: IPublishContext = {

		publishConfigList: [],
		currentPublishConfig: {
			envName: "dev",
			local: {
				outputName: "dist"
			},
			server: {
				connect: {
					host: "192.168.1.1",
					username: "root",
					port: 22,
					password: "password",
					privateKey: "/path/to/my/key"
				},
				"backup": {
					format: "YYYY-MM-DD-hh-mm-ss",
					max: 5
				},
				staticAbsolutePath: "/etc/nginx/html/demo",
				restartCommand: "nginx -s reload"
			}
		},
		envNameConfigChoices: [],

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

				const publishConfigList = await FsExtra.readJson(jsonPath) as PublishConfigList;

				if (!Array.isArray(publishConfigList) || !publishConfigList.length) {
					Logger.error('');
					return;
				}

				this.context.publishConfigList = publishConfigList;

				this.context.envNameConfigChoices = publishConfigList.map(config => {
					const {envName, server: {connect: {host}}} = config;
					return {
						title: `[${envName}]:${host}`,
						value: envName
					};
				});

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

				const envName = await Prompt.autocomplete('Please select publishing environment', this.context.envNameConfigChoices);

				this.context.currentPublishConfig = getPublishConfigByEnvName(envName, this.context.publishConfigList);

				// const srcPath = await TarExtra.compress("/Users/alphal/github/create-temp-cli/test");
				// const srcPath = await TarExtra.compress("/Users/alphal/github/create-temp-cli/test", "/Users/alphal/github/create-temp-cli/__output__");
				// console.log('=>(index.ts:105) srcPath', srcPath);

				// const destPath = await TarExtra.decompress('/Users/alpha/github/front-cli/test.tar.gz');
				// const destPath = await TarExtra.decompress("/Users/alphal/github/create-temp-cli/test.tar.gz");
				// const destPath = await TarExtra.decompress("/Users/alphal/github/create-temp-cli/test.tar.gz", "/Users/alphal/github/create-temp-cli/__output__");
				// console.log('=>(index.ts:107) destPath', destPath);

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
