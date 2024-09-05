import path from 'path';

export class PathExtra {
  static forceSlash(path: string) {
    return path.replace(/\\/g, '/');
  }
  static fixTarExt(name: string): string {
    const ext = '.tar.gz';
    name = this.__basename(name);
    return name + ext;
  }

  static __basename(p: string): string {
    const { name, ext } = path.parse(p);
    if (/.*(\.tar)$/.test(name)) {
      return name.slice(0, name.indexOf('.'));
    } else if (ext === '.jar') {
      return name + ext;
    }
    return name;
  }

  static __dirname(p: string): string {
    return path.dirname(p);
  }
}
