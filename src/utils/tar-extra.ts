import path from "path";
import fs from "fs-extra";
import shell from "shelljs";

export class TarExtra {

  /**
   * 压缩文件( 默认压缩到文件所在目录 )
   *
   * tar -czvf dist.tar.gz dist
   *
   *
   * @param src {string} - 输入的 文件/文件夹 的路径
   * @param dest {string} - 输出目录的路径
   */
  static async compress(src: string, dest?: string) {
    return new Promise((resolve, reject) => {

      if (!fs.existsSync(src)) {
        console.error(`[ TarExtra.compress ]: ${src} is not exists`);
        reject(false);
      }

      const {dir, name} = path.parse(src);

      let srcName = name;
      let destName = name;

      if (!(/.*(\.tar\.gz)$/.test(destName))) {
        if (destName.indexOf('.') !== -1) {
          const baseName = destName.slice(0, destName.indexOf('.') + 1);
          srcName = baseName;
          destName = `${baseName}.tar.gz`;
        }
      }

      destName = `${destName}.tar.gz`;

      const command = `cd ${dir} && tar -czvf ${destName} ${srcName}`;
      console.error(`[ Compress Command ]: ${command}`);

      shell.exec(command, (error, stdout, stderr) => {
        if (error !== 0) {
          console.error('[ Tar Compress Err ]', error);
          reject(false);
        }
        console.log(`[ TarExtra.compress ]: Success compress ${src} to ${dest || dir}`);
        resolve(`${dir}/${destName}`);
      });
    });
  }

  /**
   * 解压文件( 默认解压到文件所在目录 )
   *
   * tar -xzvf dist.tar.gz
   *
   * @param src {string} - 输入的 文件/文件夹 的路径
   */
  static async decompress(src: string) {
    return new Promise((resolve, reject) => {

      const {dir, name, ext = '.gz'} = path.parse(src);

      let destName = name;
      let srcName = `${name}${ext}`;

      if (!(/.*(\.tar\.gz)$/.test(srcName))) {
        if (srcName.indexOf('.') !== -1) {
          const baseName = srcName.slice(0, srcName.indexOf('.') + 1);
          srcName = `${baseName}.tar.gz`;
          destName = baseName;
          src = path.join(dir, srcName);
        }
      }

      if (!fs.existsSync(src)) {
        console.error(`[ TarExtra Decompress Err ]: ${src} is not exists`);
        reject(false);
      }

      srcName = `${srcName}.tar.gz`;

      if (destName.indexOf('.') !== -1) {
        destName = destName.slice(0, destName.indexOf('.') + 1);
      }

      const command = `cd ${dir} && tar -xzvf ${srcName}`;

      shell.exec(command, (error, stdout, stderr) => {
        if (error !== 0) {
          console.error('[ Tar Decompress Err ]', error);
          reject(false);
        }
        console.log(`[ TarExtra.decompress ]: Success decompress ${dir}/${srcName} to ${dir}`);
        resolve(`${dir}/${destName}`)
      });
    });
  }
}
