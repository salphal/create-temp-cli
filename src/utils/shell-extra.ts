import shell from 'shelljs';
import { TarCmd } from '@utils/tar-cmd';

export class ShellExtra {
  static _exec(stat: any) {
    console.log('[ _exec stat ]', stat);
    stat.code !== 0 && console.log(stat.stderr);
    return stat.code === 0 ? stat.stdout || true : null;
  }

  static which(name: string) {
    const stat = shell.which(name);
    return this._exec(stat);
  }

  static pwd() {
    return shell.pwd().stdout;
  }

  static ls(path = '') {
    return shell.ls(path);
  }

  static cd(path: string) {
    const stat = shell.cd(path);
    return this._exec(stat);
  }

  static cp(src: string, dest: string) {
    const stat = shell.cp('-r', src, dest);
    return this._exec(stat);
  }

  static mv(src: string, dest: string) {
    const stat = shell.mv(src, dest);
    return this._exec(stat);
  }

  static rm(...paths: string[]) {
    const stat = shell.rm('-rf', ...paths);
    return this._exec(stat);
  }

  static touch(filename: string) {
    const stat = shell.touch(filename);
    return this._exec(stat);
  }

  static mkdir(path: string) {
    const stat = shell.mkdir('-p', path);
    return this._exec(stat);
  }

  static exists(path: string) {
    return shell.test('-e', path);
  }

  static isFile(path: string) {
    return shell.test('-f', path);
  }

  static isDir(path: string) {
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
      console.log('[ shell cmd ]', cmd);
      const stat = shell.exec(cmd);
      return this._exec(stat);
    } catch (err) {
      console.error('[ shell exec err ]', err);
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
    const command = TarCmd.getTarCmd(src, dest);
    return this.exec(command);
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
    const command = TarCmd.getUnTarCmd(src, dest);
    return this.exec(command);
  }
}
