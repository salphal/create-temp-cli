import shell from 'shelljs';

export class ShellExtra {
  static _exec(stat) {
    console.log('[ _exec stat ]', stat);
    stat.code !== 0 && console.log(stat.stderr);
    return stat.code === 0 ? stat.stdout || true : null;
  }

  static which(name) {
    const stat = shell.which(name);
    return this._exec(stat);
  }

  static pwd() {
    return shell.pwd().stdout;
  }

  static ls(path = '') {
    return shell.ls(path);
  }

  static cd(path) {
    const stat = shell.cd(path);
    return this._exec(stat);
  }

  static cp(src, dest) {
    const stat = shell.cp('-r', src, dest);
    return this._exec(stat);
  }

  static mv(src, dest) {
    const stat = shell.mv(src, dest);
    return this._exec(stat);
  }

  static rm(path) {
    const stat = shell.rm('-rf', path);
    return this._exec(stat);
  }

  static touch(filename) {
    const stat = shell.touch(filename);
    return this._exec(stat);
  }

  static mkdir(directory) {
    const stat = shell.mkdir('-p', directory);
    return this._exec(stat);
  }

  static exists(path) {
    return shell.test('-e', path);
  }

  static isFile(path) {
    return shell.test('-f', path);
  }

  static isDir(path) {
    return shell.test('-d', path);
  }

  static cat(path) {
    const stat = shell.cat(path);
    return this._exec(stat);
  }

  static find(root = '.', regexp) {
    return shell.find(root).filter((file) => file.match(RegExp(regexp)));
  }

  static chmod(options, path) {
    const stat = shell.chmod(options, path);
    return this._exec(stat);
  }

  static exec(cmd) {
    try {
      console.log('[ shell cmd ]', cmd);
      const stat = shell.exec(cmd);
      return this._exec(stat);
    } catch (err) {
      console.error('[ shell exec err ]', err);
    }
  }

  static tar(src, dest = null) {
    let command = `tar -czvf ${dest} -C $(dirname ${src}) $(basename ${src})`;
    if (!dest) command = `tar -czvf ${src + '.tar.gz'} -C $(dirname ${src}) $(basename ${src})`;
    return this.exec(command);
  }

  static untar(src, dest = null) {
    let command = `tar -xzvf ${src} -C ${dest}`;
    if (!dest) command = `tar -xzvf ${src} -C $(dirname ${src})`;
    return this.exec(command);
  }
}

// console.log(ShellExtra.which('git'));
// console.log(ShellExtra.cd('/'));
// console.log(ShellExtra.pwd());
// console.log(ShellExtra.ls());
// console.log(ShellExtra.ls('/'));
// console.log(ShellExtra.cp('/Users/alphal/github/create-temp-cli/.env2', '/Users/alphal/github/create-temp-cli/.env1'));
// console.log(ShellExtra.mv('/Users/alphal/Downloads/test', '/Users/alphal/Downloads/test1'));
// console.log(ShellExtra.rm('/Users/alphal/Downloads/test'));
// console.log(ShellExtra.touch('/Users/alphal/Downloads/test.txt'));
// console.log(ShellExtra.mkdir('/Users/alphal/Downloads/test'));
// console.log(ShellExtra.exists('/Users/alphal/Downloads/testa'));
// console.log(ShellExtra.isFile('/Users/alphal/Downloads/test'));
// console.log(ShellExtra.isDir('/Users/alphal/Downloads/test'));
// console.log(ShellExtra.cat('/Users/alphal/Downloads/test1.txt'));

// console.log(ShellExtra.find('.', /.*\.mjs$/));

// console.log(ShellExtra.tar('/Users/alphal/github/create-temp-cli/dist','/Users/alphal/github/create-temp-cli/dist.tar.gz'));
// console.log(ShellExtra.tar('/Users/alphal/github/create-temp-cli/dist'));
console.log(ShellExtra.chmod(777, '/Users/alphal/github/create-temp-cli/dist'));
// console.log(ShellExtra.untar('/Users/alphal/github/create-temp-cli/dist.tar.gz'));
