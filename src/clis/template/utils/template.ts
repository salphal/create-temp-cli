import { Replacements, TempInfo, TempInfoList } from '../template';
import fs from 'fs-extra';
import path, { ParsedPath } from 'path';
import {
  camelcase,
  CAMELCASE,
  camelCase,
  CamelCase,
  SHORTCAMELCASE,
  PromptChoices,
  Logger,
  FsExtra,
  isObject,
} from '@utils';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* 工具函数 */

function getTempNameByDirFullPath(fullPath: string) {
  const match = fullPath.match(/\/(__.*__).*(__.*__)$/);
  if (Array.isArray(match) && match.length) {
    const p = match[0].replace(/^(\/__.*__\/)/, '');
    const { dir, name } = path.parse(p);
    return dir ? `${dir}/${name}` : name;
  }
  return '';
}

/**
 * 替换 模版文件名 为 真实文件名
 *
 * @param tempFileName {string} - 文件名
 * @param replacements {Replacements} - 文件中替换的变量
 * @return {string}
 */
export function tempFileNameToRealFileName(tempFileName: string, replacements: Replacements) {
  const { fileName, CompName } = replacements;
  const filename = tempFileName.replace(/(\.template$)/, '').replace(/[tT]emplate/, (match) => {
    if (match === 'template') {
      return fileName;
    } else if (match === 'Template') {
      return CompName;
    } else {
      return match;
    }
  });
  Logger.info(`Rename file "${tempFileName}" to "${filename}"`);
  return filename;
}

export function FileInfoListToTempInfoList(fileInfoList: ParsedPath[]): TempInfoList {
  return fileInfoList.map((parsedPath) => {
    const { dir, base, ext, name } = parsedPath;
    const fullPath = path.format(parsedPath);
    const tempName = getTempNameByDirFullPath(fullPath);
    const label = tempName.replace(/__.*__$/, (match: string) => {
      return match.replace(/__/g, '');
    });
    return {
      tempName: getTempNameByDirFullPath(fullPath),
      fileName: base,
      fullPath,
      label,
      title: label,
      value: fullPath,
      ...parsedPath,
    };
  });
}

/**
 * 根据模版名称, 获取当前模版信息
 *
 * @param tempName - 模版名称
 * @param tempInfoList - 模版信息列表
 */
export async function getCurTempInfoListByTempName(
  tempName: string,
  tempInfoList: TempInfoList,
): Promise<TempInfoList> {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  const [currentTempInfo] = tempInfoList.filter((tempInfo) => tempInfo.tempName === tempName);
  return currentTempInfo
    ? FileInfoListToTempInfoList(await FsExtra.getFilesInfo(currentTempInfo.fullPath))
    : [];
}

/**
 * 根据文件名和组件名生成 模版中替换的变量集合
 *
 * @param variables
 */
export function getReplacements(variables: { fileName: string }) {
  const { fileName: file } = variables;

  const CompName = CamelCase(file); // 首字母大写( eg: DemoComp )
  const compName = camelCase(file); // 首字母小写 ( eg: demoComp )
  const COMP_NAME = CAMELCASE(file); // 首字母小写 ( eg: DEMO_COMP )
  const SHORT_COMP_NAME = SHORTCAMELCASE(file); // 首字母小写 ( eg: DEMO_COMP )
  const className = camelcase(file); // 首字母小写 ( eg: demo-comp )
  const fileName = camelcase(file); // 全部字母小写( eg: demo-comp )

  return {
    CompName,
    compName,
    COMP_NAME,
    SHORT_COMP_NAME,
    className,
    fileName,
  };
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//

/* 逻辑函数 */

/**
 * 替换模版文件中的变量
 *
 * @param filePath {string} - 文件路径
 * @param replaceVariableMap {Replacements} - 替换模版的变量集合
 */
export async function replaceVariablesInFileByReplacements(
  filePath: string,
  replaceVariableMap: Replacements,
): Promise<string> {
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
      const allTemps = [];
      (async function processFiles() {
        for (const fileName of fileNames) {
          const fullPath = path.join(templateDirectoryPath, fileName);
          const stat = await fs.promises.stat(fullPath);
          if (stat.isDirectory()) {
            if (/__.*__/.test(fileName)) {
              const tempName = getTempNameByDirFullPath(fullPath);
              const label = tempName.replace(/__.*__$/, (match: string) => {
                return match.replace(/__/g, '');
              });
              allTemps.push({
                label,
                title: label,
                value: tempName,
                tempName,
                fileName,
                fullPath,
                ...path.parse(fullPath),
              });
            } else {
              const nestedTemps = await getAllTempInfoList(fullPath);
              Array.isArray(nestedTemps) && allTemps.push(...nestedTemps);
            }
          }
        }
        resolve(allTemps.filter((v) => !!v));
      })();
    });
  });
}

/**
 * 获取所有 模版目录下的 所有模版
 * @param tempDirPathList {Array<string>} - 模版目录列表
 */
export async function getAllTempInfoByTempDirPathList(
  tempDirPathList: string[],
): Promise<TempInfoList> {
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
export function getAllTempNameList(
  tempInfoList: TempInfoList,
  tempDirectoryPathList: Array<string>,
): Array<string> {
  if (!Array.isArray(tempInfoList) || !tempInfoList.length) return [];
  const allTempNames = tempInfoList.map((v: TempInfo) => v.tempName);
  return Array.from(new Set(allTempNames)).filter((tempName) =>
    tempDirectoryPathList.some((tempDirectoryPath) =>
      fs.lstatSync(`${tempDirectoryPath}/${tempName}`).isDirectory(),
    ),
  );
}

/**
 * 替换模版中的变量, 并写入模版
 *
 * @param curTempInfoList
 * @param config
 */
export async function writeTempListToTarget(
  curTempInfoList: TempInfoList,
  config: {
    tempName: string;
    fileName: string;
    outputDirPath: string;
    replacements: Replacements;
    customConfigStep: any;
  },
) {
  if (!Array.isArray(curTempInfoList) || !curTempInfoList.length) return false;

  const { fileName, outputDirPath, replacements, tempName, customConfigStep } = config;
  if (!fileName || !outputDirPath || !replacements || !tempName) return false;

  const outputPathList = [];

  await FsExtra.rm(path.join(outputDirPath, fileName));

  for (let i = 0; i < curTempInfoList.length; i++) {
    const { fileName: tempFileName, fullPath, dir } = curTempInfoList[i];

    const content = await replaceVariablesInFileByReplacements(fullPath, replacements);

    const tempDirPath = dir.replace(RegExp(`.*${tempName}`), '');
    const outputDirFullPath = path.join(outputDirPath, fileName, tempDirPath);

    await FsExtra.makeDir(outputDirFullPath);

    const realFileName = tempFileNameToRealFileName(tempFileName, replacements);
    console.log('=>(template.ts:257) realFileName', realFileName);

    let outputFullPath = path.join(outputDirFullPath, realFileName);

    if (
      customConfigStep.useOutputPathMap &&
      isObject(customConfigStep.outputPathMap) &&
      Object.keys(customConfigStep.outputPathMap).length
    ) {
      const dirName = tempDirPath.slice(1);
      if (typeof customConfigStep.outputPathMap[dirName] === 'string') {
        outputFullPath = path.join(customConfigStep.outputPathMap[dirName], realFileName);
      }
    }

    if (['README.md'].includes(realFileName)) continue;

    outputPathList.push(outputFullPath);
    await FsExtra.write(outputFullPath, content as string);
  }

  Logger.infoObj('output path list', outputPathList);

  return true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
