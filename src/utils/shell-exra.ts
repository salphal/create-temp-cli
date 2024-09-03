import shell from 'shelljs';

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

  static rm(path: string) {
    const stat = shell.rm('-rf', path);
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

  static tar(src: string, dest: string | null = null) {
    let command = `tar -czvf ${dest} -C $(dirname ${src}) $(basename ${src})`;
    if (!dest) command = `tar -czvf ${src + '.tar.gz'} -C $(dirname ${src}) $(basename ${src})`;
    return this.exec(command);
  }

  static untar(src: string, dest: string | null = null) {
    let command = `tar -xzvf ${src} -C ${dest}`;
    if (!dest) command = `tar -xzvf ${src} -C $(dirname ${src})`;
    return this.exec(command);
  }
}
