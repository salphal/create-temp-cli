#! /usr/bin/env node

/**
 * node create.cjs [compName] [compFileName] [create-type] [outputDirPath]
 *
 * @param {!string} compName [Template] - 组件名
 * @param {!string} compFileName [template] - 组件文件名
 * @param {comp | customComp | hook | string} createType [comp] - 创建类型
 * @param {?string} outputPath - 输出路径( 基于 lib 为根路径 )
 *  - comp -> /lib/components
 *  - custom-comp -> /lib/components
 *  - hook -> /lib/hooks
 */

import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist'
import {program} from 'commander';

const cwd = process.cwd();

program
  .version('1.0.0', '-v')
  .command('create-temp [OPTION]... [DIRECTORY]')
  .option('-v', '')
  .action((name, startOptions, cmd) => {
    console.log('=>(index.cjs:49) cmd', cmd);
  });

program.parse(process.argv);
console.log(process.argv);

let argvs = minimist(process.argv);
console.log('=>(index.cjs:34) argvs', argvs);

/** 获取启动命令的参数 */
const args = process.argv.slice(2);
console.log('=>(index.cjs:35) args', JSON.stringify(args));

const CreateTypes = {
  comp: 'comp',
  hook: 'hook',
  customComp: 'custom-comp',
};

/**
 * 参数
 * @param[0] {string} - 组件名
 * @param[1] {string} - 组件文件名
 * @param[2] {'comp' | 'hook' | 'custom-comp'} - 创建类型
 */
const [compName = 'template', _, createType = CreateTypes.comp, outputPath = ''] = args;

let compPath = args[1];

/** 模版文件基础路径 */
const baseTempsDirPath = path.resolve(__dirname, './__template__');
/** 目标模版路径 */
let targetTempDirPath = '';
/** 输出目录 */
let outputDirPath = path.resolve(__dirname, './lib');

if (!compName) {
  console.error('[ Error ]: Please check args[1]');
  process.exit(1);
}

// if (compName && !compPath) compPath = compName;
/** 模版中替换的变量集合 */
const replacements = {
  CompName: capitalizeFirstLetter(compName),
  compName: lowercaseFirstLetter(compName),
  'comp-file-name': compPath || 'template',
  CreateType: capitalizeFirstLetter(createType),
};

const tempFullPath = path.resolve(__dirname, `${baseTempsDirPath}/__${createType}__`);

/** 根据创建类型更新初始化配置 */
if (createType && fs.existsSync(tempFullPath)) {
  targetTempDirPath = tempFullPath;
  /** 如果有自定义输出目录则使用自定义 */
  if (typeof outputPath === 'string' && outputPath.length) {
    outputDirPath = path.resolve(__dirname, './lib' + outputPath);
  } else {
    /** 如果没有自定义目录则使用预先定义的 */
    if ([CreateTypes.comp, CreateTypes.customComp].includes(createType)) {
      outputDirPath = path.resolve(__dirname, './lib/components');
    } else if (createType === CreateTypes.hook) {
      outputDirPath = path.resolve(__dirname, './lib/hooks');
    }
  }
} else {
  console.log(`[ Log ]: please enter createType by parameter[2]`);
  console.log(`[ Log ]: current createType: ${createType}`);
  process.exit(1);
}

/**
 * 获取指定目录下所有文件的完整路径列表
 * @param dirPath {string} - 文件夹路径
 * @return {Promise<unknown>}
 */
async function getAllFilePathsByDirPath(dirPath) {
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
            /** 暂时不处理子文件夹中的文件 */
            const nestedFiles = await getAllFilePathsByDirPath(fullPath);
            allFiles.push(...nestedFiles);
          } else {
            allFiles.push({
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
 * 替换模版文件中的变量
 * @param filePath {string} - 文件路径
 * @return {Promise<unknown>}
 */
async function replaceFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        data = data.replace(regex, value);
      }
      resolve(data);
    });
  });
}

/**
 * 将模版文件夹中的所有文件替换变量并输出到指定文件夹下
 * @param allFilePaths {Array<{fileName: string, fullPath: string}>} - 文件信息列表
 * @return {Promise<void>}
 */
async function convertAllFiles(allFilePaths) {
  if (!Array.isArray(allFilePaths) || !allFilePaths.length) return;

  const isCreatedDir = await createDir(outputDirPath, compPath);
  if (!isCreatedDir) return;

  for (let i = 0; i < allFilePaths.length; i++) {
    const {fileName, fullPath} = allFilePaths[i];

    if (!fileName || !fullPath) return;

    const content = await replaceFile(fullPath);
    const name = convertReallyFileName(fileName, compPath);

    const outputFullPath = path.join(outputDirPath, compPath, name);

    fs.writeFile(outputFullPath, content, 'utf-8', (err) => {
      if (err) {
        console.log(`[ Error ]: ${err}`);
      }
    });
  }
}

/**
 * 创建文件夹
 * @param folderPath {string} -
 * @param folderName {string} -
 * @return {Promise<unknown>}
 */
async function createDir(folderPath, folderName) {
  return new Promise(async (resolve, reject) => {
    const fullPath = path.join(folderPath, folderName);
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdir(path.join(folderPath, folderName), (err) => {
          if (err) {
            console.error(`[ Error ]: Error creating folder: ${err}`);
            reject(err);
            return;
          }
          console.log(
            `[ Log ]: Folder created successfully at ${path.join(folderPath, folderName)}`,
          );
          resolve(1);
        });
      } else {
        clearAllOnDir(fullPath);
        console.log(`[ Log ]: Directory already exists: ${path.join(folderPath, folderName)}`);
        resolve(1);
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 清空文件夹下的所有文件
 * @param dirPath {string} - 文件夹路径
 */
function clearAllOnDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = `${dirPath}/${file}`;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      clearAllOnDir(filePath);
    } else {
      fs.unlinkSync(filePath);
      console.log(`[ Log ]: Success delete ${file} file`);
    }
  });
}

/**
 * 将文件名第一个字母大写
 * @param fileName {string} - 文件名
 * @return {string}
 */
function capitalizeFirstLetter(fileName) {
  return fileName.replace(/(^\w)/, (match) => match.toUpperCase());
}

/**
 * 将文件名第一个字母小写
 * @param fileName {string} - 文件名
 * @return {string}
 */
function lowercaseFirstLetter(fileName) {
  return fileName.replace(/(^\w)/, (match) => match.toLowerCase());
}

/**
 * 替换模版文件名为真实文件名
 * @param fileName {string} - 文件名
 * @param compPath {string} - 文件路径
 * @return {string}
 */
function convertReallyFileName(fileName, compPath) {
  const name = fileName
    .replace(/(^[a-zA-Z]+)\./, (match) => (match === 'index.' ? 'index.' : `${compPath}.`))
    .replace(/(\.template$)/, '');
  console.log(`[ Log ]: Rename file "${fileName}" to "${name}"`);
  return name;
}

(async function init() {
  /** 获取所有模版文件信息列表 */
  const allFilePaths = await getAllFilePathsByDirPath(targetTempDirPath);
  /** 如果没有模版文件则停止 */
  if (!allFilePaths.length) {
    console.log('[ Error ]: File list is empty');
    return;
  }
  /** 转换模版文件 */
  await convertAllFiles(allFilePaths);
})();
