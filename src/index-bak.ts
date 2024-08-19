#!/usr/bin/env node


import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import {configDotenv} from "dotenv";
import {program} from "commander";

import {Envs, PickerOptionList, TempInfo, TempInfoList, TempNameList} from "../types";
import Logger from "../utils/logger";
import clone from "../utils/clone";
import {camelcase, camelCase, CamelCase} from "../utils/camelcase";
import {copy, copyDir, createDirectory} from "../utils/directory";
import {updateQuestionListByQuestion} from "../utils/questions";


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * 脚本初始化配置
 */

const __dirname = process.cwd(); // es下 获取当前运行的根目录

/** 载入自定义环境变量 */
configDotenv({
  path: path.resolve(__dirname, '.temp.env')
});

/** 仅获取以 CREATE_TEMP 开头的环境变量 */
const envs = Object.fromEntries(
  Object.entries(process.env)
    .filter(([k, v]) => /^CREATE_TEMP.*/.test(k)));


//-------------------------------------------------------------------------------------------------------------------//


/**
 * 公共配置信息
 */

/** 和用户交互的配置对象 */
let questions: any[] = [
  /** 选择模版 */
  {
    type: 'autocomplete',
    name: 'tempName',
    message: 'Please pick a template',
    choices: [
      {title: 'option1', value: 'option1'},
      {title: 'option2', value: 'option2'},
      {title: 'option3', value: 'option3'}
    ],
  },
  /** 输入组件名 */
  {
    type: 'text',
    name: 'compName',
    message: 'Please enter component name. ( default: Template )',
    initial: 'Template',
  },
  /** 输入模版文件名 */
  {
    type: 'text',
    name: 'fileName',
    message: 'Please enter component file name. ( default: template )',
    initial: 'template',
  },
  /** 输入自定义输出目录( 默认为当前项目根目录下的 __output__ ) */
  {
    type: 'text',
    name: 'outputPath',
    message: 'Please enter output directory path. ( default: __output__ ), If enter x then select custom output directory map',
    initial: '.',
  },
  /** 如果前一项的结果为 x, 则可以自定义选择预设目录 */
  {
    type: (prev: string) => prev == 'x' ? 'autocomplete' : null,
    name: 'customOutputPath',
    message: 'Please pick output directory',
    choices: [
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
    initial: '.'
  }
];

/** 默认模版目录路径 */
let tempDirPath: string = path.join(__dirname, '__template__');
/** 输出目录路径 */
let outputDirPath: string = path.join(__dirname, '__output__');

/** 所有模版信息列表集合 */
let allTempInfoList: TempInfoList = [];
/** 模版目录集合 */
let tempDirPathList: string[] = [];
/** 获取所有 去重的模版名列表 */
let tempNameList: string[] = [];


//-------------------------------------------------------------------------------------------------------------------//


async function init(config: any = {}) {

  Logger.info(`__dirname: ${__dirname}`);
  Logger.info(envs);

  setupEnvs(envs as Envs);
  tempDirPathList.push(tempDirPath);

  /** 获取所有 模版目录下的 所有模版 */
  allTempInfoList = await getAllTempInfoByTempDirPathList(tempDirPathList);
  /** 获取所有 去重的模版名列表 */
  tempNameList = getAllTempNameList(allTempInfoList, tempDirPathList)

  /** 根据扫描模版目录下的模版更新模版的选项 */
  updateTempNameChoicesByTempNameList();

  /** 判断若没有模版, 则停止 */
  if (!allTempInfoList.length) {
    Logger.error('Template directory is empty, has nothing templates')
    process.exit(1);
  }

  /** 获取用户输入的结果 */
  const response = await prompts(questions, {});
  const {tempName, compName, fileName, outputPath, customOutputPath} = response;

  /** 模版中变量的映射集合 */
  const replaceVariableMap = {
    CompName: CamelCase(compName), // 首字母大写( eg: DemoComp )
    compName: camelCase(compName), // 首字母小写 ( eg: demoExample )
    fileName: camelcase(fileName), // 全部字母小写( eg: demo-example )
  };
  Logger.info(replaceVariableMap);

  /**
   * 获取当前模板信息的文件列表
   */
  const currentTempInfoList = getCurrentTempInfoListByTempName(tempName, allTempInfoList);

  /**
   * 判断当前模版是否有效
   */
  if (!currentTempInfoList.length) {
    Logger.error('Current template info is empty');
    process.exit(1);
  }

  /** 根据用户输入更新输出目录 */
  if (typeof outputPath === 'string' && outputPath.trim() !== '.') {
    if (typeof customOutputPath === 'string') {
      outputDirPath = path.join(__dirname, customOutputPath);
    } else {
      outputDirPath = path.join(__dirname, outputPath);
    }
  }

  /** 在项目根路径下创建默认输出目录 */
  await createDirectory(outputDirPath);

  /**
   * 在输出目录下 创建输出的组件目录
   *  - 已有: 则清空该目录下的所有文件
   *  - 没有: 则创建一个
   */
  const isCreated = await createDirectory(outputDirPath, fileName);
  if (!isCreated) {
    Logger.error(`Could not create directory: ${outputDirPath}/${fileName}`);
    process.exit(1);
  }

  /**
   * 1. 读取文件
   * 2. 替换其中的变量
   * 3. 输出到指定目录的文件中
   */
  for (let i = 0; i < currentTempInfoList.length; i++) {

    const {fileName: tempName, fullPath} = currentTempInfoList[i];

    const content = await replaceFileByReplacements(fullPath, replaceVariableMap);
    const reallyFileName = templateFileNameToReallyFileName(tempName, fileName);
    const outputFullPath = path.join(outputDirPath, fileName, reallyFileName);

    fs.writeFile(outputFullPath, content as string, 'utf-8', (err) => {
      if (err) Logger.error(`${err}`);
    });
  }

  return {
    tempName,
    compName,
    fileName,
    outputDirPath,
    replaceVariableMap,
    currentTempInfoList
  };
}

// init()
//   .then((res) => {
//     Logger.success(`Success created ${res.compName} by ${res.tempName}`);
//     Logger.success(`Already written to ${res.outputDirPath}/${res.fileName} folder`);
//   })
//   .catch((err) => {
//     Logger.error(err);
//   })
//   .finally(() => {
//   });


//-------------------------------------------------------------------------------------------------------------------//


/**
 * 根据完整路径获取模版名称
 * @param fullPath - 模版完整路径
 */
function getTempNameByFullPath(fullPath: string): string {
  const match = fullPath.match(/__template__\/.*/);
  if (Array.isArray(match) && match.length) {
    const tempName = match[0].replace('__template__/', '');
    const tempNameList = tempName.split('/');
    if (tempNameList[tempNameList.length - 1].match(/(\.template)|(\.md)/)) {
      tempNameList.pop();
    }
    return tempNameList.join('/');
  } else {
    return fullPath;
  }
}

/**
 * 筛选出为目录的模版名称
 * @param tempInfoList - 模版信息列表
 * @param tempDirectoryPathList - 模版目录列表
 */
function getAllTempNameList(tempInfoList: TempInfoList, tempDirectoryPathList: Array<string>): Array<string> {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  const allTempNames = tempInfoList.map((v: TempInfo) => v.tempName);
  return Array.from(new Set(allTempNames))
    .filter((tempName) =>
      tempDirectoryPathList.some((tempDirectoryPath) =>
        fs.lstatSync(`${tempDirectoryPath}/${tempName}`).isDirectory()));
}

/**
 * 根据模版目录路径, 获取所有模版信息
 * @param templateDirectoryPath - 模版目录路径
 */
async function getAllTempInfoList(templateDirectoryPath: string): Promise<TempInfoList> {
  return new Promise((resolve, reject) => {
    fs.readdir(templateDirectoryPath, (err, fileNames) => {
      if (err) {
        reject(err);
        return;
      }
      const allFiles = [];
      (async function processFiles() {
        for (const fileName of fileNames) {
          const fullPath = path.join(templateDirectoryPath, fileName);
          const stat = await fs.promises.stat(fullPath);
          if (stat.isDirectory()) {
            const nestedFiles = await getAllTempInfoList(fullPath);
            Array.isArray(nestedFiles) && allFiles.push(...nestedFiles);
          } else {
            allFiles.push({
              tempName: getTempNameByFullPath(fullPath),
              fileName,
              fullPath,
            });
          }
        }
        resolve(allFiles);
      })();
    });
  });
}

/**
 * 根据模版名称列表, 创建 prompts 的筛选项
 * @param tempNameList - 模版名称列表
 */
function createChoicesByTempNameList(tempNameList: TempNameList): PickerOptionList {
  if (!Array.isArray(tempNameList) || !tempNameList.length) return [];
  return tempNameList.map((name) => {
    return {
      title: name,
      value: name
    }
  });
}

/**
 * 根据模版名称, 获取当前模版信息
 * @param tempName - 模版名称
 * @param tempInfoList - 模版信息列表
 */
function getCurrentTempInfoListByTempName(tempName: string, tempInfoList: TempInfoList) {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  return tempInfoList.filter((tempInfo) => tempInfo.tempName === tempName);
}

/**
 * 替换模版文件中的变量
 */
async function replaceFileByReplacements(filePath: string, replaceVariableMap: { [key: string]: any }) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      for (const [key, value] of Object.entries(replaceVariableMap)) {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        data = data.replace(regex, value);
      }
      resolve(data);
    });
  });
}

/**
 * 替换 模版文件名 为 真实文件名
 * @param templateFileName {string} - 文件名
 * @param reallyFileName {string} - 文件路径
 * @return {string}
 */
function templateFileNameToReallyFileName(templateFileName: string, reallyFileName: string) {
  const filename = templateFileName
    .replace(/(^[a-zA-Z]+)\./, (match) => (['template.'].includes(match) ? `${reallyFileName}.` : match))
    .replace(/(\.template$)/, '');
  Logger.info(`Rename file "${templateFileName}" to "${filename}"`);
  return filename;
}

/**
 * 获取所有 模版目录下的 所有模版
 * @param templateDirectoryPathList {Array<string>} - 模版目录列表
 */
async function getAllTempInfoByTempDirPathList(templateDirectoryPathList: string[]): Promise<TempInfoList> {
  return new Promise<TempInfoList>(async (resolve, reject) => {
    const tempInfoList: any[] = [];
    for (let i = 0; i < templateDirectoryPathList.length; i++) {
      const tempDirectoryPath = templateDirectoryPathList[i];
      const tempFilePath = await getAllTempInfoList(tempDirectoryPath);
      tempInfoList.push(...tempFilePath);
    }
    resolve(tempInfoList);
  });
}

/**
 * 根据扫描模版目录下的模版更新模版的选项
 */
function updateTempNameChoicesByTempNameList() {
  /** 根据 模版名列表 生成 模版选项 */
  const choices = createChoicesByTempNameList(tempNameList);
  questions = updateQuestionListByQuestion(
    {
      name: 'tempName',
      choices
    },
    questions
  );
}

function cloneTemplates() {
  clone({
    remote: 'https://github.com/salphal/create-temp-cli.git',
    branch: 'main',
    outputPath: '.tmp'
  })
    .then(res => {
      const stat = fs.statSync(path.resolve(__dirname, '.tmp/__template__'));
      if (stat.isDirectory()) {
        copyDir(path.join(__dirname, '.tmp/__template__'), path.join(__dirname, '__template__'));
        Logger.success("Successfully downloaded __template__ directory");
        copy(path.join(__dirname, '.tmp/.temp.env'), path.join(__dirname, '.temp.env'));
        Logger.success("Successfully downloaded .temp.env file");
      }
    })
    .catch(err => {
    })
    .finally(() => {
    })
}


//-------------------------------------------------------------------------------------------------------------------//


/**
 * 挂载环境变量中的配置
 */

/**
 * 挂载环境变量中的配置
 * @param envs - 环境变量
 */
function setupEnvs(envs: Envs) {
  setupTemplateDirectory(envs);
  setupOutputDirectory(envs);
  setCustomOutputDirectoryList(envs);
}

/**
 * 挂载 默认模版目录
 * @param envs - 环境变量
 */
function setupTemplateDirectory(envs: Envs) {
  if (!envs.CREATE_TEMP_TEMPLATE_DIRECTORY) return;
  const tempDirPathList = envs.CREATE_TEMP_TEMPLATE_DIRECTORY.split(',').filter(v => !!v);
  tempDirPathList.push(...tempDirPathList)
}

/**
 * 挂载 默认输出目录
 * @param envs - 环境变量
 */
function setupOutputDirectory(envs: Envs) {
  if (!envs.CREATE_TEMP_OUTPUT_DIRECTORY) return;
  outputDirPath = path.join(__dirname, envs.CREATE_TEMP_OUTPUT_DIRECTORY)
}

/**
 * 挂载 追加自定义输出目录的选项
 * @param envs - 环境变量
 */
function setCustomOutputDirectoryList(envs: Envs) {
  if (!envs.CREATE_TEMP_OUTPUT_DIRECTORY_CHOICES) return;
  const outputDirectoryList = envs.CREATE_TEMP_OUTPUT_DIRECTORY_CHOICES.split(',').filter(v => !!v);
  const customOutputPathChoices = outputDirectoryList.map(v => ({title: v, value: v}))
  questions = questions.map((question: any) => {
    if (question.name === 'customOutputPath') {
      return {
        ...question,
        choices: [...question.choices, ...customOutputPathChoices]
      };
    }
    return question;
  });
}


//-------------------------------------------------------------------------------------------------------------------//


program
  .name('temp-cli')
  .usage('[...options]')
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
        Logger.success(`Success created ${res.compName} by ${res.tempName}`);
        Logger.success(`Already written to ${res.outputDirPath}/${res.fileName} folder`);
      })
      .catch((err) => {
        Logger.error(err);
      })
      .finally(() => {
      });
  });

program
  .command('init')
  .action((opts: any, cmd: any) => {
    cloneTemplates();
  });


program.parse(process.argv);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
