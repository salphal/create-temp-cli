import path, { FormatInputPathObject, ParsedPath } from 'path';

export class PathExtra {
  static resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }

  static join(...paths: string[]): string {
    return path.join(...paths);
  }

  static parse(p: string): ParsedPath {
    return path.parse(p);
  }

  static format(pathConfig: FormatInputPathObject): string {
    return path.format(pathConfig);
  }

  static __extname(p: string): string {
    if (/.*((\.tar\.gz)|(\.tar))$/.test(p)) {
      return '.tar.gz';
    }
    return path.extname(p);
  }

  static __dirname(p: string): string {
    return path.dirname(p);
  }

  static isAbsolute(p: string): boolean {
    return path.isAbsolute(p);
  }

  static forceSlash(path: string) {
    return path.replace(/\\/g, '/');
  }

  /**
   * 获取 正确的文件名 /path/to/file.tar.gz => file
   */
  static getBasenameOfTarGz(p: string): string {
    const fileList = p.split('/');
    return fileList[fileList.length - 1].replace(/(\.tar\.gz$)|(\.tar)/, '');
  }

  /**
   * 纠正 *.tar.gz 文件后缀
   */
  static fixTarGzExt(name: string): string {
    const ext = '.tar.gz';
    name = this.getBasenameOfTarGz(name);
    return name + ext;
  }
}
