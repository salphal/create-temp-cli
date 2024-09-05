import path from 'path';
import { PathExtra } from '@utils/path-extra';

export class TarCmd {
  /**
   * tar -czvf /path/to/dist.tar.gz -C $(dirname /path/to/dist) $(basename /path/to/dist)
   */
  static getTarCmd(src: string, dest: string | null = null): string {
    const { dir, name } = path.parse(src);

    const baseName = PathExtra.__basename(name);
    const srcFullPath = path.join(dir, baseName);

    let command = `tar -czvf ${dest}`;
    const filter = ` -C ${path.dirname(srcFullPath)} ${path.basename(srcFullPath)}`;
    // const filter = ` -C $(dirname ${srcFullPath}) $(basename ${srcFullPath})`;

    if (!dest) {
      const destName = PathExtra.fixTarExt(name);
      command = `tar -czvf ${path.join(dir, destName)}`;
    }

    command += filter;

    return command;
  }

  /**
   * tar -xzvf /path/to/dist.tar.gz -C /path/to
   */
  static getUnTarCmd(src: string, dest: string | null = null): string {
    const { dir, name } = path.parse(src);

    let command = `tar -xzvf ${src} -C ${dest}`;

    if (!dest) {
      const destName = PathExtra.fixTarExt(name);
      command = `tar -xzvf ${PathExtra.forceSlash(path.join(dir, destName))} -C ${path.dirname(src)}`;
    }
    return command;
  }
}
