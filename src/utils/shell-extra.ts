import shell, { ShellString } from 'shelljs';
import { TarCmd } from '@utils/tar-cmd';
import * as process from 'process';
import { Logger } from '@utils/logger';

export class ShellExtra {
  /**
   * @param stat {}
   * @return
   *  - string: 当 stat.code === 0( 执行成功 )
   *  - true: 当 stat.code === 0 并且 返回为 "" 时
   *  - null: 当 stat.code !== 0 时( 执行失败 )
   */
  static _exec(stat: any): string | true | null {
    if (typeof stat === 'string') {
      if (stat.length > 300) {
        console.log('[ exec result ]', stat.slice(0, 100) + '...');
      } else {
        console.log('[ exec result ]', stat);
      }
    }
    stat.code !== 0 && console.log(stat.stderr);
    return stat.code === 0 ? stat.stdout || true : null;
  }

  static which(name: string) {
    const stat = shell.which(name);
    return this._exec(stat);
  }

  static pwd(): string {
    return shell.pwd().stdout;
  }

  static ls(path = ''): string[] {
    return shell.ls(path);
  }

  static cd(path: string) {
    const stat = shell.cd(path);
    return this._exec(stat);
  }

  static cp(src: string, dest: string) {
    // const stat = shell.cp('-r', src, dest);
    const cmd = `cp -r ${src} ${dest}`;
    return this.exec(cmd);
  }

  static mv(src: string, dest: string) {
    // const stat = shell.mv(src, dest);
    const cmd = `mv ${src} ${dest}`;
    return this.exec(cmd);
  }

  static rm(...paths: string[]) {
    // const stat = shell.rm('-rf', ...paths);
    const cmd = `rm -rf ${paths.join(' ')}`;
    return this.exec(cmd);
  }

  static touch(...filenames: string[]) {
    // const stat = shell.touch(filenames);
    const cmd = `touch ${filenames.join(' ')}`;
    return this.exec(cmd);
  }

  static mkdir(path: string) {
    // const stat = shell.mkdir('-p', path);
    const cmd = `mkdir -p ${path}`;
    return this.exec(cmd);
  }

  static exists(path: string): boolean {
    return shell.test('-e', path);
  }

  static isFile(path: string): boolean {
    return shell.test('-f', path);
  }

  static isDir(path: string): boolean {
    return shell.test('-d', path);
  }

  static cat(path: string) {
    const stat = shell.cat(path);
    return this._exec(stat);
  }

  static find(root = '.', regexp: string | RegExp) {
    return shell.find(root).filter((file) => file.match(RegExp(regexp)));
  }

  static chmod(options: string, path: string) {
    const stat = shell.chmod(options, path);
    return this._exec(stat);
  }

  static exec(cmd: string) {
    try {
      // console.log('[ ssh cmd ]', cmd);
      Logger.successObj('cmd', cmd);
      if (!cmd) process.exit(1);
      const stat = shell.exec(cmd);
      return this._exec(stat);
    } catch (err) {
      console.error('[ ssh exec err ]', err);
    }
  }

  /**
   * @param src {string} - 资源来源路径
   * @param dest {string | null} - 压缩目标路径
   *
   * eg:
   *  - tar("/path/to/dist.tar.gz");
   *  - tar("/path/to/dist", "/path/to/dist.tar.gz");
   */
  static tar(src: string, dest: string | null = null) {
    const cmd = TarCmd.getTarCmd(src, dest);
    return this.exec(cmd);
  }

  /**
   * @param src {string} - 资源来源路径
   * @param dest {string | null} - 解缩目标路径
   *
   * eg:
   *  - untar("/path/to/dist.tar.gz");
   *  - untar("/path/to/dist.tar.gz", "/path/to);
   */
  static untar(src: string, dest: string | null = null) {
    const cmd = TarCmd.getUnTarCmd(src, dest);
    return this.exec(cmd);
  }
}
