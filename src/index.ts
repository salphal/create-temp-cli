#!/usr/bin/env node


import fs from "fs";
import path from "path";
import prompts from "prompts";
import {configDotenv} from "dotenv";

import {PickerOptionList, TempInfo, TempInfoList, TempNameList} from "../types";
import Logger from "../utils/logger";
import {camelcase, camelCase, CamelCase} from "../utils/camelcase";
import {createDirectory} from "../utils/directory";


const cwd = process.cwd();
Logger.info(`Current work directory: ${cwd}`);

/** 载入自定义环境变量 */
configDotenv({
  path: path.resolve(cwd, '.temp.env')
});

/** 仅获取以 CREATE_TEMP 开头的环境变量 */
const envs = Object.fromEntries(
  Object.entries(process.env)
    .filter(([k, v]) => /^CREATE_TEMP.*/.test(k)));
Logger.info(envs);

let questions: any = [
  /** 选择模版 */
  {
    type: 'autocomplete',
    name: 'tempName',
    message: 'Please pick a template',
    choices: [
      {title: 'Red', value: '#ff0000'},
      {title: 'Green', value: '#00ff00'},
      {title: 'Blue', value: '#0000ff'}
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
  {
    type: 'text',
    name: 'outputPath',
    message: 'Please enter output path. ( default: ./__output__ )',
    initial: '.',
  },
];

function getTempNameByFullPath(path: string): string {
  const match = path.match(/__template__\/.*/);
  if (Array.isArray(match) && match.length) {
    const tempName = match[0].replace('__template__/', '');
    const tempNameList = tempName.split('/');
    if (tempNameList[tempNameList.length - 1].match(/(\.template)|(\.md)/)) {
      tempNameList.pop();
    }
    return tempNameList.join('/');
  } else {
    return path;
  }
}

function getAllTempNameList(tempInfoList: TempInfoList): Array<string> {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  const allTempNames = tempInfoList.map((v: TempInfo) => v.tempName);
  return Array.from(new Set(allTempNames));
}

async function getAllTempInfoList(dirPath: string): Promise<TempInfoList> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, fileNames) => {
      if (err) {
        reject(err);
        return;
      }
      const allFiles = [];
      (async function processFiles() {
        for (const fileName of fileNames) {
          const fullPath = path.join(dirPath, fileName);
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

function createChoicesByTempNameList(tempNameList: TempNameList): PickerOptionList {
  if (!Array.isArray(tempNameList) || !tempNameList.length) return [];
  return tempNameList.map((name) => {
    return {
      title: name,
      value: name
    }
  });
}

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


async function init() {

  /** 默认模版目录路径 */
  const baseTemplateDir = path.join(cwd, './__template__');
  /** 所有模版信息列表集合 */
  const allTempInfoList: TempInfoList = [];
  /** 输出目录路径 */
  let outputDirectoryPath = path.join(cwd, './__output__');

  /** 模版集合的路径 */
  const tempDirectoryPathList = [
    baseTemplateDir
  ];

  /** 获取所有 模版目录下的 所有模版 */
  for (let i = 0; i < tempDirectoryPathList.length; i++) {
    const tempDirectoryPath = tempDirectoryPathList[i];
    const tempFilePath = await getAllTempInfoList(tempDirectoryPath);
    allTempInfoList.push(...tempFilePath);
  }

  /** 获取所有 去重的模版名列表 */
  const tempNameList = getAllTempNameList(allTempInfoList)

  /** 根据 模版名列表 生成 模版选项 */
  const choices = createChoicesByTempNameList(tempNameList);

  /** 重新赋值模版选项 */
  questions = questions.map((question: any) => {
    if (question.name === 'tempName') {
      return {
        ...question,
        choices
      };
    }
    return question;
  });

  if (!allTempInfoList.length) {
    Logger.error('Template directory is empty, has nothing templates')
    process.exit(1);
  }

  /** 获取用户输入的结果 */
  const response = await prompts(questions, {});

  const {tempName, compName, fileName, outputPath} = response;

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

  if (!currentTempInfoList.length) {
    Logger.error('Current template info is empty');
    process.exit(1);
  }

  /** 仅可输出再当前工程的子目录下 */
  if (typeof outputPath === 'string' && outputPath.trim() !== '.') {
    outputDirectoryPath = path.join(cwd, outputPath);
  } else {
    /** 在项目根路径下创建默认输出目录 */
    await createDirectory(cwd, '__output__');
  }

  /**
   * 在输出目录下 创建输出的组件目录
   *  - 已有: 则清空该目录下的所有文件
   *  - 没有: 则创建一个
   */
  const isCreated = await createDirectory(outputDirectoryPath, fileName);
  if (!isCreated) {
    Logger.error('Could not create directory')
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
    const outputFullPath = path.join(outputDirectoryPath, fileName, reallyFileName);

    fs.writeFile(outputFullPath, content as string, 'utf-8', (err) => {
      if (err) Logger.error(`${err}`);
    });
  }

  return {
    tempName,
    compName,
    fileName,
    replaceVariableMap,
    currentTempInfoList
  };
}

init()
  .then((res) => {
    Logger.success(`Success created ${res.compName} by ${res.tempName}`);
  })
  .catch((err) => {
    Logger.error(err);
  })
  .finally(() => {
  });
