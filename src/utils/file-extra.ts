import fs from 'fs-extra';
import path, { ParsedPath } from 'path';

/**
 * 同步方法需要 try catch 捕获错误
 * https://github.com/jprichardson/node-fs-extra
 */

export class FsExtra {
  /**
   * 复制 文件/目录
   *
   * cp -r [src] [dest]
   */
  static async cp(src: string, dest: string): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.copy(src, dest, {}, (err) => {
        if (err) {
          console.error('[ CP ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully copied ${src} to ${dest}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 移动 文件/文件夹
   *
   ** 默认覆盖现有 文件/目录
   *
   * mv [src] [dest]
   */
  static async mv(
    src: string,
    dest: string,
    options: fs.MoveOptions = { overwrite: true },
  ): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.move(src, dest, { ...options }, (err) => {
        if (err) {
          console.log('[ MV ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully moved ${src} to ${dest}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 删除 文件/文件夹
   *
   * @param path {string} - 文件/文件夹 路径
   *
   * rm -rf [path]
   */
  static async rm(path: string): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.remove(path, (err) => {
        if (err) {
          console.error('[ RM ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully removed ${path}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 创建文件
   *  - 如果创建的文件位于不存在的目录中, 则会创建这些目录
   *  - 如果该文件已存在, 则不进行修改
   *
   * @param path {string} - 文件路径
   *
   * touch [path]
   */
  static async touch(path: string): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.ensureFile(path, function (err) {
        if (err) {
          console.error('[ TOUCH ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully created ${path}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 读取文件
   *
   * @param path {string} - 文件路径
   * @param options {any} - 读取文件时的配置
   */
  static async read(path: string, options: any = { encoding: 'utf-8' }): Promise<null | Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { ...options }, (err, data) => {
        if (err) {
          console.error('[ READ ERR ]', err);
          reject(null);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 写入文件
   *  - 如果父目录不存在, 则创建它
   *
   * @param path {string} - 文件路径
   * @param data {string | NodeJS.ArrayBufferView} - 文件内容
   * @param options {fs.WriteFileOptions} - 写入文件时的配置
   */
  static async write(
    path: string,
    data: string | NodeJS.ArrayBufferView,
    options: any = { encoding: 'utf8' },
  ): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.outputFile(path, data, { ...options }, (err) => {
        if (err) {
          console.error('[ WRITE ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully wrote data to ${path}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 创建目录
   *  - 如果目录结构不存在, 则创建
   *  - 如果目录存在, 则不进行创建
   *
   * @param dirPath {string} - 目录路径
   *
   * mkdir -p /path/to
   */
  static async makeDir(dirPath: string): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.ensureDir(dirPath, (err) => {
        if (err) {
          console.error('[ MAKEDIR ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully created ${dirPath}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 清空文件夹中的内容
   *  - 目录不为空, 则删除目录内容
   *  - 该目录不存在, 则创建该目录
   *
   ** 目录本身不会被删除
   *
   * @param dirPath {string} - 目录路径
   */
  static async emptyDir(dirPath: string): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.emptyDir(dirPath, (err) => {
        if (err) {
          console.error('[ EMPTYDIR ERR ]', err);
          resolve(0);
        } else {
          console.log(`clear ${dirPath}`);
          console.log(`Successfully delete all sub-child in ${dirPath}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 是否是空目录
   *
   * @param dirPath {string} - 目录路径
   * @param compare
   */
  static async isEmptyDir(
    dirPath: string,
    compare?: (files: string[]) => boolean,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const files = fs.readdirSync(dirPath);
      if (typeof compare === 'function') {
        resolve(compare(files));
      } else {
        resolve(files.length === 0);
      }
    });
  }

  /**
   * 读取目录中的所有文件路径( 非递归, 仅获取指定路径下的文件列表 )
   *
   * @param dirPath {string} - 目录路径
   * @param callback {(fileNames: string[]) => any | Promise<any>} - 自定义处理文件路径的回调
   */
  static async readDir(
    dirPath: string,
    callback: (fileNames: string[]) => any | Promise<any>,
  ): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      const isDir = await FsExtra.isDir(dirPath);
      if (!isDir) {
        console.error(`${dirPath} is not a directory`);
        reject(null);
      }
      fs.readdir(dirPath, async (err, fileNames) => {
        if (err) {
          console.error('[ READDIR ERR ]', err);
          reject(err);
        } else {
          if (typeof callback === 'function') {
            const res = await callback(fileNames);
            resolve(res);
          } else {
            resolve(fileNames);
          }
        }
      });
    });
  }

  /**
   * 是否是 .json 文件
   *
   * @param filePath
   */
  static async isJson(filePath: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const isFile = await FsExtra.isFile(filePath);
      const extname = path.extname(filePath);
      if (isFile && extname.trim() === '.json') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * 读取 json 文件
   *
   * @param path {string} - json文件路径
   */
  static async readJson(path: string): Promise<null | JSON> {
    return new Promise((resolve, reject) => {
      fs.readJSON(path, {}, (err, data) => {
        if (err) {
          console.error('[ READJSON ERR ]', err);
          reject(null);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 写入 json 文件
   *
   * @param path {string} - json文件路径
   * @param obj {{[key: string]: any}} - 写入的对象内容
   * @param options {any} - 文件写入时的配置
   */
  static async writeJson(
    path: string,
    obj: { [key: string]: any },
    options: any = { encoding: 'utf8' },
  ): Promise<0 | 1> {
    return new Promise((resolve, reject) => {
      fs.outputJSON(path, obj, { ...options }, (err) => {
        if (err) {
          console.error('[ WRITEJSON ERR ]', err);
          reject(0);
        } else {
          console.log(`Successfully wrote data to ${path}`);
          resolve(1);
        }
      });
    });
  }

  /**
   * 路径是否存在
   *
   * @param path {string} - 路径
   */
  static async pathExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.pathExists(path, (err, exists) => {
        if (err) {
          console.error('[ PATHEXISTS ERR ]', err);
          reject(false);
        } else {
          console.log(`${path} ${exists ? 'already' : 'does not'} exists.`);
          resolve(exists);
        }
      });
    });
  }

  /**
   * 目录是否存在
   *
   * @param path {string} - 目录路径
   */
  static async dirExists(path: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const pathExists = await FsExtra.pathExists(path);
      if (pathExists) {
        const isDir = await FsExtra.isDir(path);
        resolve(isDir);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * 文件是否存在
   *
   * @param path {string} - 文件路径
   */
  static async fileExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      return new Promise(async (resolve, reject) => {
        const pathExists = await FsExtra.pathExists(path);
        if (pathExists) {
          const isFile = await FsExtra.isFile(path);
          resolve(isFile);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * 返回路径状态
   *
   * @param path {string} - 路径
   */
  static async stat(path: string): Promise<fs.Stats> {
    return new Promise(async (resolve, reject) => {
      const isExists = await FsExtra.pathExists(path);
      if (isExists) {
        fs.stat(path, (err, stats) => {
          if (err || !stats) {
            console.error('[ STAT ERR ]', err);
            reject(false);
          } else {
            resolve(stats);
          }
        });
      }
    });
  }

  /**
   * 判断路径是否是文件
   *
   * @param path {string} - 路径
   */
  static async isFile(path: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const stat = await FsExtra.stat(path);
      if (stat && typeof stat.isFile === 'function') {
        resolve(stat.isFile());
      }
      reject(false);
    });
  }

  /**
   * 判断路径是否是目录
   *
   * @param path {string} - 路径
   */
  static async isDir(path: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const stat = await FsExtra.stat(path);
      if (stat && typeof stat.isDirectory === 'function') {
        resolve(stat.isDirectory());
      }
      // reject(false);
    });
  }

  /**
   * 获取指定目录下的所有文件
   *
   * @param dirPath {string} - 目录路径
   * @param resultType {'list' | 'tree'} - 返回的结果类型
   *  - list: 返回一个包含所有文件信息的列表
   *  - tree: 返回一个文件树
   * @param save {(fullPath: string) => { [key: string]: any } } - 自定义处理文件信息的数据
   */
  static async getFilesInfo(
    dirPath: string,
    resultType: 'list' | 'tree' = 'list',
    save?: (fullPath: string) => { [key: string]: any },
  ): Promise<ParsedPath[]> {
    return new Promise(async (resolve, reject) => {
      return await FsExtra.readDir(dirPath, (fileNames) => {
        const fileList: any[] = [];
        const fileTree: any = {};
        fileNames.length &&
          (async function processFiles(resultType) {
            for (const fileName of fileNames) {
              const fullPath = path.join(dirPath, fileName);
              const isDir = await FsExtra.isDir(fullPath);
              if (isDir) {
                const nestedFiles = await FsExtra.getFilesInfo(fullPath, resultType, save);
                if (Array.isArray(nestedFiles) && resultType === 'list') {
                  fileList.push(...nestedFiles);
                } else if (resultType === 'tree') {
                  fileTree[fileName] = nestedFiles;
                }
              } else {
                const fileInfo = typeof save === 'function' ? save(fullPath) : path.parse(fullPath);
                if (resultType === 'list') fileList.push(fileInfo);
                if (resultType === 'tree') fileTree[fileName] = fileInfo;
              }
            }
            resultType === 'list' && resolve(fileList);
            resultType === 'tree' && resolve(fileTree);
          })(resultType);
      });
    });
  }
}
