import {TempInfo, TempInfoList, TempNameList} from "../../types";
import fs from "fs-extra";
import path from "path";
import {PromptChoices} from "../../utils/prompt";
import Logger from "../../utils/logger";


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/* 工具函数 */


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
 * 创建 prompts 的筛选项
 * @param list - 模版名称列表
 */
export function createPromptChoices(list: string[]): PromptChoices {
  if (!Array.isArray(list) || !list.length) return [];
  return list.map((name: string) => ({
    title: name,
    value: name
  }));
}

/**
 * 替换 模版文件名 为 真实文件名
 *
 * @param tempFileName {string} - 文件名
 * @param realFileName {string} - 文件路径
 * @return {string}
 */
export function tempFileNameToRealFileName(tempFileName: string, realFileName: string) {
  const filename = tempFileName
    .replace(/(^[a-zA-Z]+)\./, (match) => (['template.'].includes(match) ? `${realFileName}.` : match))
    .replace(/(\.template$)/, '');
  Logger.info(`Rename file "${tempFileName}" to "${filename}"`);
  return filename;
}

/**
 * 根据模版名称, 获取当前模版信息
 *
 * @param tempName - 模版名称
 * @param tempInfoList - 模版信息列表
 */
export function getCurTempInfoListByTempName(tempName: string, tempInfoList: TempInfoList) {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  return tempInfoList.filter((tempInfo) => tempInfo.tempName === tempName);
}


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//


/* 逻辑函数 */


/**
 * 替换模版文件中的变量
 *
 * @param filePath {string} - 文件路径
 * @param replaceVariableMap {{[key: string]: any }} - 替换模版的变量集合
 */
export async function replaceVariablesInFileByReplacements(
  filePath: string,
  replaceVariableMap: { [key: string]: any }
) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      for (const [key, value] of Object.entries(replaceVariableMap)) {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        data = data.replace(regex, value);
      }
      resolve(data);
    });
  });
}

/**
 * 根据模版目录路径, 获取所有模版信息
 * @param templateDirectoryPath - 模版目录路径
 */
export async function getAllTempInfoList(templateDirectoryPath: string): Promise<TempInfoList> {
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
              ...path.parse(fullPath)
            });
          }
        }
        resolve(allFiles);
      })();
    });
  });
}

/**
 * 获取所有 模版目录下的 所有模版
 * @param tempDirPathList {Array<string>} - 模版目录列表
 */
export async function getAllTempInfoByTempDirPathList(tempDirPathList: string[]): Promise<TempInfoList> {
  return new Promise<TempInfoList>(async (resolve, reject) => {
    const tempInfoList: any[] = [];
    for (let i = 0; i < tempDirPathList.length; i++) {
      const tempDirectoryPath = tempDirPathList[i];
      const tempFilePath = await getAllTempInfoList(tempDirectoryPath);
      tempInfoList.push(...tempFilePath);
    }
    resolve(tempInfoList);
  });
}

/**
 * 筛选出为目录的模版名称
 * @param tempInfoList - 模版信息列表
 * @param tempDirectoryPathList - 模版目录列表
 */
export function getAllTempNameList(tempInfoList: TempInfoList, tempDirectoryPathList: Array<string>): Array<string> {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  const allTempNames = tempInfoList.map((v: TempInfo) => v.tempName);
  return Array.from(new Set(allTempNames))
    .filter((tempName) =>
      tempDirectoryPathList.some((tempDirectoryPath) =>
        fs.lstatSync(`${tempDirectoryPath}/${tempName}`).isDirectory()));
}

/**
 * 替换模版中的变量, 并写入模版
 *
 * @param curTempInfoList
 * @param config
 */
export async function writeTempListToTarget(curTempInfoList: TempInfoList, config: {
  fileName: string,
  outputDirPath: string,
  replaceVariableMap: any
}) {

  if (!Array.isArray(curTempInfoList) || !curTempInfoList.length) return false;

  const {fileName, outputDirPath, replaceVariableMap} = config;
  if (!fileName || !outputDirPath || !replaceVariableMap) return false;

  for (let i = 0; i < curTempInfoList.length; i++) {

    const {fileName: tempName, fullPath} = curTempInfoList[i];
    const content = await replaceVariablesInFileByReplacements(fullPath, replaceVariableMap);
    const realFileName = tempFileNameToRealFileName(tempName, fileName);
    const outputFullPath = path.join(outputDirPath, fileName, realFileName);

    if (['README.md'].includes(realFileName)) continue;

    fs.writeFile(outputFullPath, content as string, 'utf-8', (err) => {
      if (err) Logger.error(`${err}`);
    });
  }

  return true;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
