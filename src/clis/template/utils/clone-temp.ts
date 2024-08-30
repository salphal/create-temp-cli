import clone from "../../../../utils/clone";
import fs from "fs-extra";
import path from "path";
import Logger from "../../../../utils/logger";
import Loading from "../../../../utils/loading";
import FsExtra from "../../../../utils/file";


/**
 * 下载预设模版和环境变量配置文件
 */
export function cloneTemplates(name: string, ctx: any) {
  /**
   * template: 只下载 __template__
   * env: 只下载 .temp.env
   * all: 下载所有
   */
  if (!['template', 'env', 'all'].includes(name)) {
    Logger.table(
      [
        ["name", "description"],
        ["template", "Only download templates files"],
        ["env", "Only download env config file"],
        ["all", "Download all files"]
      ],
      [{width: 20}, {width: 50}],
      {
        title: "front-cli download [name]",
      });
    return;
  }
  clone({
    remote: 'https://github.com/salphal/create-temp-cli.git',
    branch: 'main',
    outputPath: '.tmp'
  })
    .then(async (res) => {

      const stat = fs.statSync(path.resolve(ctx.__dirname, '.tmp/__template__'));
      Loading.start('Downloading __template__ directory and .temp_env file');

      if (stat.isDirectory() && ctx.__dirname) {

        const __dirname = ctx.__dirname;

        if (name === 'template') {
          const tempSrc = path.resolve(__dirname, '.tmp/__template__');
          const tempDst = path.resolve(__dirname, "__template__");
          await FsExtra.cp(tempSrc, tempDst);
          Logger.success("Successfully downloaded __template__ directory");
        }

        if (name === 'env') {
          const envSrc = path.resolve(__dirname, '.tmp/.temp.env');
          const envDst = path.resolve(__dirname, '.temp.env');
          await FsExtra.cp(envSrc, envDst);
          Logger.success("Successfully downloaded .temp.env file");
        }

        const tmpPath = path.resolve(__dirname, '.tmp');
        await FsExtra.rm(tmpPath);

        Logger.success(`Success load ${name}`);
      }
    })
    .catch(err => {
      Logger.error(err);
    })
    .finally(() => {
      Loading.end();
    });
}
