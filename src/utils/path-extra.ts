import path from 'path';

export class PathExtra {
  static fixTarExt(name: string): string {
    const ext = '.tar.gz';
    name = this.__basename(name);
    return name + ext;
  }

  static __basename(p: string): string {
    const { name } = path.parse(p);
    if (name.indexOf('.') !== -1) {
      return name.slice(0, name.indexOf('.'));
    }
    return name;
  }

  static __dirname(p: string): string {
    return path.dirname(p);
  }
}
