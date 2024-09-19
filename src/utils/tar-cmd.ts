import path from 'path';
import { PathExtra } from '@utils/path-extra';
import { ShellExtra } from '@utils/shell-extra';

export class TarCmd {
  /**
   * tar -czvf /path/to/dist.tar.gz -C $(dirname /path/to/dist) $(basename /path/to/dist)
   *
   ** windows 不支持 $(dirname) | ${basename)
   */
  static getTarCmd(src: string, dest: string | null = null): string {
    const { dir, name, ext } = path.parse(src);

    const baseName = PathExtra.getBasenameOfTarGz(src);
    const srcFullPath = path.join(dir, baseName);

    let command = `tar -czvf ${dest}`;
    const filter = ` -C ${path.dirname(srcFullPath)} ${path.basename(srcFullPath)}`;

    if (!dest) {
      const destName = PathExtra.fixTarGzExt(name);
      console.log('=>(tar-cmd.ts:22) destName', destName);
      command = `tar -czvf ${path.join(dir, destName)}`;
    }

    command += filter;

    return command;
  }

  /**
   * tar -xzvf /path/to/dist.tar.gz -C $(dirname /path/to)
   *
   ** windows 不支持 $(dirname) | ${basename)
   */
  static getUnTarCmd(src: string, dest: string | null = null): string {
    const { dir, name, ext } = path.parse(src);

    let command = `tar -xzvf ${src} -C ${dest}`;

    if (!dest) {
      const destName = PathExtra.fixTarGzExt(src);
      command = `tar --touch -xzvf ${PathExtra.forceSlash(path.join(dir, destName))} -C ${path.dirname(src)}`;
    }
    return command;
  }
}
