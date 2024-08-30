#!/usr/bin/env node


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import {program} from "commander";
import args from "minimist";
import {configDotenv} from "dotenv";
import path from "path";
import {fileURLToPath} from "url";

import {__test__} from "./test";
import {TemplateCli} from "./clis/template";
import {Envs} from "../types/global";
import {CliEnvs} from "./clis/template/template";


//-------------------------------------------------------------------------------------------------------------------//


/**
 * @param argv {object} - 执行脚本时携带的参数
 * @param __dirname {string} - 执行当前脚本的路径
 * @param envs {object} - 注入当前脚本的环境变量( 仅获取以 TEMP_CLI 开头的环境变量 )
 */
const envVariables = (function injection(): Envs {
  const argv = args(process.argv.slice(2), {
    default: {help: false}, // 设置参数默认值
    alias: {h: 'help'}, // 设置参数别名
    string: [], // 这里设置的参数名会始终解析为字符串
    boolean: [], // 这里设置的参数名会始终解析为布尔值
  });
  const __dirname: string = process.cwd();
  const __filename = fileURLToPath(import.meta.url);
  configDotenv({path: path.resolve(__dirname, '.temp.env')});
  const envs: CliEnvs = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => /^TEMP_CLI.*/.test(k)));
  return {argv, __dirname, __filename, envs};
}());

const {argv, __dirname, __filename, envs} = envVariables;


//-------------------------------------------------------------------------------------------------------------------//


const templateCli = new TemplateCli({
  ctx: envVariables
});


/**
 * 根据本地模版创建
 */
program
  .name('front-cli')
  .usage('[ create | init ]')
  .description('Create files based on templates')
  .version('1.0.0', '-v, --version');

program
  .command('create')
  .alias('ct')
  .option('-cn [compName], --comp-name <compName>', 'Component name', 'Template')
  .option('-fn [fileName], --file-name [fileName]', 'File name', 'template')
  .option('-op [outputPath], --output-path [outputPath]', 'Output path', '.')
  .action((opts: any, cmd: any) => {
    templateCli.create();
  });


/**
 * 下载 预设模版 和 环境变量配置文件 到本地
 */
program
  .command('download')
  .alias('dw')
  .argument('<name>', 'template name')
  .action((name, opts: any, cmd: any) => {
    templateCli.cloneFile(name);
  });

/**
 * 下载 预设模版 和 环境变量配置文件 到本地
 */
program
  .command('test')
  .action(async (opts: any, cmd: any) => {
    __test__();
  });


program.parse(process.argv);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
