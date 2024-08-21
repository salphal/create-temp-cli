#!/usr/bin/env node


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import {program} from "commander";
import args from "minimist";
import {configDotenv} from "dotenv";
import path from "path";

import {Envs, TempConfig, TempContext, TempInfoList} from "../types";
import Scheduler, {ResCode, StepList} from "../utils/core/scheduler";
import Prompt from "../utils/prompt";
import {setupEnvs} from "./utils/setup-envs";
import {createChoicesByTempNameList, getAllTempInfoByTempDirPathList, getAllTempNameList} from "./utils/template";
import Logger from "../utils/logger";
import {camelcase, camelCase, CamelCase} from "../utils/camelcase";


//-------------------------------------------------------------------------------------------------------------------//


/**
 * @param argv {object} - 执行脚本时携带的参数
 * @param __dirname {string} - 执行当前脚本的路径
 * @param envs {object} - 注入当前脚本的环境变量( 仅获取以 TEMP_CLI 开头的环境变量 )
 */
const {argv, __dirname, envs} = (function (): TempConfig {

  const argv = args(process.argv.slice(2), {
    default: {help: false}, // 设置参数默认值
    alias: {h: 'help'}, // 设置参数别名
    string: [], // 这里设置的参数名会始终解析为字符串
    boolean: [], // 这里设置的参数名会始终解析为布尔值
  });

  const __dirname: string = process.cwd();

  configDotenv({path: path.resolve(__dirname, '.temp.env')});
  const envs: Envs = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => /^TEMP_CLI.*/.test(k)));

  return {argv, __dirname, envs};
}())


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


const tempContext: TempContext = {
  tempDirPath: path.join(__dirname, '__template__'),
  outputDirPath: path.join(__dirname, '__output__'),

  allTempInfoList: [],
  tempDirPathList: [],
  tempNameList: [],

  questionResult: {
    tempName: '',
    compName: '',
    fileName: '',
    outputPath: '',
  },
  outputPathChoices: [],
  tempChoices: [],

  argv,
  __dirname,
  envs,
};


//-------------------------------------------------------------------------------------------------------------------//


const stepList: StepList = [

  {
    name: "step1",
    remark: `
      - 载入环境变量
      - 扫描模版目录下的所有模版文件
        - 并生成模版信息列表
        - 根据模版信息文件生成模版选项选项列表
    `,
    callback: async (ctx: any) => {

      const {tempDirPathList, tempDirPath} = tempContext;

      tempContext.tempDirPathList.push(tempDirPath);

      /** 载入环境变量中的配置 */
      setupEnvs(envs, tempContext);

      /** 获取所有 模版目录下的 所有模版 */
      const allTempInfoList = await getAllTempInfoByTempDirPathList(tempDirPathList);
      tempContext.allTempInfoList = allTempInfoList;

      /** 获取所有 去重的模版名列表 */
      const tempNameList = getAllTempNameList(allTempInfoList, tempDirPathList)
      tempContext.tempNameList = tempNameList;

      /** 根据扫描模目录下的文件, 设置模版选项列表 */
      tempContext.tempChoices = createChoicesByTempNameList(tempNameList);

      if (!allTempInfoList.length) {
        /** 模版目录下没有任何模版 */
        Logger.error('Template directory is empty, has nothing templates')
        process.exit(1);
      } else if (!tempContext.tempChoices.length) {
        /** 模版选项为空 */
        Logger.error('Has nothing template choices');
        process.exit(1);
      }

      return {
        code: ResCode.next,
        data: {}
      };
    },
  },

  {
    name: "step2",
    remark: `
      用户交互获取数据
        1. 选择模版
        2. 输入组件名
        3. 输入文件名
        4. 是否自定义输出路径
          - 是:
            - 根据预设和环境变量配置的选项选择
            - 自定义输入
          - 否: 默认输出路径( __output__ )
    `,
    callback: async (ctx: any) => {

      const tempName = await Prompt.select("Please pick a template", tempContext.tempChoices);

      const compName = await Prompt.input("Please enter component name. ( default: Template )", {default: "Template"})

      const fileName = await Prompt.input("Please enter component file name. ( default: template )", {default: "fileName"})

      const outputPath = await Prompt.input("Please enter output directory path. ( default: __output__ ), If enter x then select custom output directory map", {default: "."});

      tempContext.questionResult = {
        tempName: String(tempName),
        compName,
        fileName,
        outputPath,
      };

      /** 模版中变量的映射集合 */
      const replaceVariableMap = {
        CompName: CamelCase(compName), // 首字母大写( eg: DemoComp )
        compName: camelCase(compName), // 首字母小写 ( eg: demoExample )
        fileName: camelcase(fileName), // 全部字母小写( eg: demo-example )
      };

      return {
        code: ResCode.next,
        data: {}
      };
    },
  },

  {
    name: "step3",
    remark: "",
    callback: async (ctx: any) => {
      return {
        code: ResCode.next,
        data: {}
      };
    },
  },

];


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


const scheduler = new Scheduler({stepList});

async function init(opts: any) {
  try {
    const response = await scheduler.autoExecute();
    // const {tempName, compName, fileName, outputPath, customOutputPath} = response;
  } catch (err: any) {
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
      })
      .catch((err: any) => {
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
