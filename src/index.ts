#!/usr/bin/env node


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import {program} from "commander";
import args from "minimist";
import {configDotenv} from "dotenv";
import path from "path";
import {TempInfoList} from "../types";
import Scheduler, {ResCode, StepList} from "../utils/core/scheduler";


//-------------------------------------------------------------------------------------------------------------------//


/** 获取参数 */
const argv = args(process.argv.slice(2), {
	default: {help: false}, // 设置默认值
	alias: {h: 'help', t: 'template'},
	string: ['_'],
	boolean: []
});

/** ES下 获取当前运行的根目录 */
const __dirname = process.cwd();

/** 载入自定义环境变量 */
configDotenv({path: path.resolve(__dirname, '.temp.env')});
/** 仅获取以 CREATE_TEMP 开头的环境变量 */
const envs = Object.fromEntries(
	Object.entries(process.env)
		.filter(([k, v]) => /^CREATE_TEMP.*/.test(k)));


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


/** 默认模版目录路径 */
let tempDirPath: string = path.join(__dirname, '__template__');
/** 默认输出目录路径 */
let outputDirPath: string = path.join(__dirname, '__output__');

/** 所有模版信息列表集合 */
let allTempInfoList: TempInfoList = [];
/** 模版目录列表 */
let tempDirPathList: string[] = [];
/** 获取所有去重的模版名列表 */
let tempNameList: string[] = [];


//-------------------------------------------------------------------------------------------------------------------//


const stepList: StepList = [
	{
		name: "step1",
		callback(ctx: any) {
			console.log("=>(index.ts:86) ctx", ctx);
			// return true;
			return {
				code: ResCode.next,
				data: {a : 1}
			}
		},
	},
	{
		name: "step2",
		callback(ctx: any) {
			console.log("=>(index.ts:86) ctx", ctx);
			return {
				code: ResCode.back,
				data: {b : 2}
			}
		},
	},
	{
		name: "step3",
		callback(ctx: any) {
			console.log("=>(index.ts:87) ctx", ctx);
			return {
				code: ResCode.next,
				data: {c : 3}
			}
		},
	},
];

const scheduler = new Scheduler({stepList});


// (async function testFilterChain() {
//   // await filterChain.next();
//   // await filterChain.next();
//   // const res = await filterChain.next();
//   const res = await filterChain.autoExecute();
//   console.log('=>(index.ts:51) res', res);
// }());


async function init(opts: any) {
	try {
		await scheduler.next();
		await scheduler.next();
		await scheduler.next();
		// await scheduler.next();
		// await scheduler.back();
		// await scheduler.next();
		// await scheduler.back();
		// await scheduler.autoExecute();
	} catch (err) {
		console.log("=>(index.ts:104) err", err);
	}
}


//-------------------------------------------------------------------------------------------------------------------//


/**
 * 根据本地模版创建
 */
program
	.name('temp-cli')
	.usage('[ create | init ]')
	.description('Create files based on templates')
	.version('1.0.0', '-v, --version')
	// 自定义帮助提示信息
	.addHelpText("before", () => "--------------------------------------------------------------------")
	.addHelpText("after", () => "--------------------------------------------------------------------");

program
	.command('create')
	.alias('ct')
	.option('-cn [compName], --comp-name <compName>', 'Component name', 'Template')
	.option('-fn [fileName], --file-name [fileName]', 'File name', 'template')
	.option('-op [outputPath], --output-path [outputPath]', 'Output path', '.')
	.action((opts: any, cmd: any) => {
		init(opts)
			.then((res) => {
				// Logger.success(`Success created ${res.compName} by ${res.tempName}`);
				// Logger.success(`Already written to ${res.outputDirPath}/${res.fileName} folder`);
			})
			.catch((err) => {
				// Logger.error(err);
			})
			.finally(() => {
			});
	});


/**
 * 下载预设模版到本地
 */
program
	.command('init')
	.action((opts: any, cmd: any) => {
		// cloneTemplates();
	});


program.parse(process.argv);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
