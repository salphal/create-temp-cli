#!/usr/bin/env node


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import {program} from "commander";
import args from "minimist";
import {configDotenv} from "dotenv";
import path from "path";
import {fileURLToPath} from "url";

import {Envs, TempConfig, TempContext} from "../types";
import Scheduler, {ResCode, StepList} from "../utils/core/scheduler";
import Prompt from "../utils/prompt";
import {setupEnvs} from "./utils/setup-envs";
import {
  createPromptChoices,
  getAllTempInfoByTempDirPathList,
  getAllTempNameList,
  getCurTempInfoListByTempName, getReplacements,
  writeTempListToTarget
} from "./utils/template";
import Logger from "../utils/logger";
import {cloneTemplates} from "./utils/clone-temp";
import FsExtra from "../utils/file";


//-------------------------------------------------------------------------------------------------------------------//


/**
 * @param argv {object} - 执行脚本时携带的参数
 * @param __dirname {string} - 执行当前脚本的路径
 * @param envs {object} - 注入当前脚本的环境变量( 仅获取以 TEMP_CLI 开头的环境变量 )
 */
const {argv, __dirname, __filename, envs} = (function injection(): TempConfig {

  const argv = args(process.argv.slice(2), {
    default: {help: false}, // 设置参数默认值
    alias: {h: 'help'}, // 设置参数别名
    string: [], // 这里设置的参数名会始终解析为字符串
    boolean: [], // 这里设置的参数名会始终解析为布尔值
  });

  const __dirname: string = process.cwd();
  const __filename = fileURLToPath(import.meta.url);

  configDotenv({path: path.resolve(__dirname, '.temp.env')});
  const envs: Envs = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => /^TEMP_CLI.*/.test(k)));

  return {argv, __dirname, __filename, envs};
}());


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


const tempContext: TempContext = {
  tempDirPath: path.join(__dirname, '__template__'),
  outputDirPath: path.join(__dirname, '__output__'),

  allTempInfoList: [],
  tempDirPathList: [],
  tempNameList: [],

  questionResult: {
    tempName: '',
    fileName: '',
    outputPath: '',
  },
  replacements: {
    CompName: '',
    compName: '',
    COMP_NAME: '',
    SHORT_COMP_NAME: '',
    className: '',
    fileName: '',
  },
  tempNameChoices: [],
  outputPathChoices: [
    {title: '__output__', value: '.'},
    {title: 'src/pages', value: 'src/pages'},
    {title: 'src/views', value: 'src/views'},
    {title: 'src/components', value: 'src/components'},
    {title: 'src/hooks', value: 'src/hooks'},
    {title: 'src/store', value: 'src/store'},
    {title: 'lib', value: 'lib'},
    {title: 'lib/components', value: 'lib/components'},
    {title: 'lib/hooks', value: 'lib/hooks'},
  ],

  argv,
  __dirname,
  __filename,
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
      tempContext.tempNameChoices = createPromptChoices(tempNameList);

      if (!allTempInfoList.length) {
        /** 模版目录下没有任何模版 */
        Logger.error('Template directory is empty, has nothing templates')
        process.exit(1);
      } else if (!tempContext.tempNameChoices.length) {
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

      const tempName = await Prompt.autocomplete("Please pick a template", tempContext.tempNameChoices);

      // const compName = await Prompt.input("Please enter component name. ( default: Template )", {default: "Template"});

      const fileName = await Prompt.input("Please enter component file name. ( default: template )", {default: "template"})

      let outputPath = await Prompt.input("Please enter output directory path. ( default: __output__ ), If enter x then select custom output directory map", {default: '.'});

      if (outputPath.trim().toLowerCase() === 'x') {
        outputPath = await Prompt.autocomplete("Please pick a template", tempContext.outputPathChoices, {default: '.'});
      }

      /** 保存用户交互的结果 */
      tempContext.questionResult = {
        tempName,
        // compName,
        fileName,
        outputPath,
      };

      /** 模版中变量的映射集合 */
      tempContext.replacements = getReplacements({fileName})
      Logger.info(tempContext.replacements);

      return {
        code: ResCode.next,
        data: {}
      };
    },
  },

  {
    name: "step3",
    remark: `
			根据用户选择的信息更新配置
				- 更新当前选中的模版
				- 更新输出路径
		`,
    callback: async (ctx: any) => {

      const {questionResult: {tempName, outputPath}, allTempInfoList} = tempContext;

      /**
       * 获取当前模板信息的文件列表
       */
      const curTempInfoList = getCurTempInfoListByTempName(tempName, allTempInfoList);

      /**
       * 判断当前模版是否有效
       */
      if (!curTempInfoList.length) {
        Logger.error('Current template info is empty');
        process.exit(1);
      }

      /** 根据用户输入更新输出目录 */
      if (outputPath.trim() !== '.') {
        tempContext.outputDirPath = path.join(__dirname, outputPath);
      }

      return {
        code: ResCode.next,
        data: {
          curTempInfoList,
        }
      };
    },
  },

  {
    name: "step3",
    remark: `
			根据配置信息
				1. 创建输出目录( 若已有则清空该目录, 若没有则创建 )
				2. 将模版文件写入到输出目录
					a. 替换文件中的变量
		`,
    callback: async (ctx: any) => {

      const {questionResult: {fileName, tempName}, outputDirPath} = tempContext;

      /** 在项目根路径下创建默认输出目录 */
      await FsExtra.makeDir(tempContext.outputDirPath);

      /**
       * 在输出目录下 创建输出的组件目录
       *  - 已有: 则清空该目录下的所有文件
       *  - 没有: 则创建一个
       */
      const isCreated = await FsExtra.makeDir(path.join(tempContext.outputDirPath, fileName));

      if (!isCreated) {
        Logger.error(`Could not create directory: ${outputDirPath}/${fileName}`);
        process.exit(1);
      }

      /**
       * 1. 读取文件
       * 2. 替换其中的变量
       * 3. 输出到指定目录的文件中
       */
      const isWritten = await writeTempListToTarget(ctx.curTempInfoList, {
        fileName,
        outputDirPath,
        replacements: tempContext.replacements
      });

      if (isWritten) {
        Logger.success(`Success create ${fileName} by ${tempName}`);
        Logger.success(`Already written to ${outputDirPath}/${fileName}`);
      } else {
        Logger.error(`Create fail ${fileName} by ${tempName}`);
      }

      return {
        code: ResCode.end,
        data: {}
      };
    }
  }

];


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


const scheduler = new Scheduler({stepList});

async function init(opts: any) {
  try {
    await scheduler.autoExecute();
  } catch (err: any) {
    Logger.error(err);
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
 * 下载 预设模版 和 环境变量配置文件 到本地
 */
program
  .command('init')
  .action((opts: any, cmd: any) => {
    cloneTemplates(tempContext);
  });

/**
 * 下载 预设模版 和 环境变量配置文件 到本地
 */
program
  .command('test')
  .action(async (opts: any, cmd: any) => {
    const res = await FsExtra.getFilesInfo(path.resolve(__dirname, '__template__'));
  });


program.parse(process.argv);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
