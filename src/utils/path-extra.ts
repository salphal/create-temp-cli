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

  static __basename(p: string): string {
    const { name, ext } = path.parse(p);
    if (/.*(\.tar)$/.test(name)) {
      return name.slice(0, name.indexOf('.tar'));
    } else if (ext === '.jar') {
      return name + ext;
    }
    return name;
  }

  static __extname(p: string): string {
    if (/.*(\.tar\.gz)$/.test(p)) {
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

  static fixTarExt(name: string): string {
    const ext = '.tar.gz';
    name = this.__basename(name);
    return name + ext;
  }
}
