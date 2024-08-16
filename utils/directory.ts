import path from "path";
import fs from "fs";
import Logger from "./logger";


/**
 * 清空文件夹下的所有文件
 * @param directoryPath {string} - 文件夹路径
 */
export function clearAllOnDir(directoryPath: string) {
  const files = fs.readdirSync(directoryPath);
  files.forEach((file) => {
    const filePath = `${directoryPath}/${file}`;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      clearAllOnDir(filePath);
    } else {
      fs.unlinkSync(filePath);
      Logger.success(`Success delete ${file} file`)
    }
  });
}


/**
 * 创建文件夹
 * @param baseDirectoryPath {string} - 基础目录路径
 * @param folderName {string} - 文件夹名称
 * @return {Promise<number>}
 */
export async function createDirectory(baseDirectoryPath: string, folderName?: string) {
  return new Promise(async (resolve, reject) => {
    const fullPath = folderName ? path.join(baseDirectoryPath, folderName) : baseDirectoryPath;
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdir(fullPath, (err) => {
          if (err) {
            Logger.error(`Error creating folder: ${err}`)
            reject(err);
            return;
          }
          Logger.success(`Folder created successfully at ${fullPath}`)
          resolve(1);
        });
      } else {
        clearAllOnDir(fullPath);
        Logger.warn(`Directory already exists: ${fullPath}`)
        resolve(1);
      }
    } catch (err) {
      reject(err);
    }
  });
}


export function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, {recursive: true})
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), {recursive: true, force: true})
  }
}


