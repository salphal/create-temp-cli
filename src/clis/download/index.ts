import { clone, FrontCli, FsExtra, Logger, ResCode, StepList, StepScheduler } from '@utils';
import { Envs } from '@type/env';
import { downloadTypes } from '@clis/download/constant';
import path from 'path';
import {
  CLI_CONFIG_FILE_NAME,
  PUBLISH_CONFIG_FILE_NAME,
  repositoryGitUrl,
  TEMP_FILE_NAME,
  TEMPLATE_FILE_NAME,
} from '@constants/common';

interface IDownloadContext extends Envs {
  /** 指定下载的名字 */
  name: keyof typeof downloadTypes;
}

interface IDownloadOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class DownloadCli extends FrontCli<IDownloadContext> {
  context: IDownloadContext = {
    argv: {},
    __dirname: '',
    __filename: '',
    envs: {},

    name: downloadTypes.all,
  };

  stepList: StepList = [
    {
      name: 'step_01',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const { __dirname, name } = this.context;

        const tmpDirPath = path.resolve(__dirname, '.tmp');
        if (await FsExtra.pathExists(tmpDirPath)) {
          await FsExtra.rm(tmpDirPath);
        }

        const config: any = await FsExtra.readJson(path.resolve(__dirname, 'package.json'));
        const remote = config.repository.url || repositoryGitUrl;

        await clone({
          remote,
          branch: 'main',
          outputPath: '.tmp',
        }).then(async (res) => {
          if (name === downloadTypes.template || name === downloadTypes.all) {
            const tempSrc = path.resolve(__dirname, `.tmp/${TEMPLATE_FILE_NAME}`);
            const destName = `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_FILE_NAME}`;
            const tempDst = path.resolve(__dirname, destName);
            await FsExtra.cp(tempSrc, tempDst);
            Logger.success(`Successfully downloaded ${destName} directory`);
          }

          if (name === downloadTypes.envConfig || name === downloadTypes.all) {
            const envSrc = path.resolve(__dirname, `.tmp/${TEMP_FILE_NAME}`);
            const destName = `${CLI_CONFIG_FILE_NAME}/${TEMP_FILE_NAME}`;
            const envDst = path.resolve(__dirname, `${CLI_CONFIG_FILE_NAME}${TEMP_FILE_NAME}`);
            await FsExtra.cp(envSrc, envDst);
            Logger.success(`Successfully downloaded ${destName} file`);
          }

          if (name === downloadTypes.publishConfig || name === downloadTypes.all) {
            const destName = `${CLI_CONFIG_FILE_NAME}/${PUBLISH_CONFIG_FILE_NAME}`;
            const envSrc = path.resolve(__dirname, `.tmp/${destName}`);
            const envDst = path.resolve(__dirname, destName);
            await FsExtra.cp(envSrc, envDst);
            Logger.success(`Successfully downloaded ${destName} file`);
          }

          const tmpPath = path.resolve(__dirname, '.tmp');
          await FsExtra.rm(tmpPath);

          Logger.success(`Success load ${name}`);
        });

        return {
          code: ResCode.end,
          data: {},
        };
      },
    },
    {
      name: 'step_02',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const {} = this.context;
        console.log('=> step_02', ctx);
        return {
          code: ResCode.next,
          data: {},
        };
      },
    },
    {
      name: 'step_03',
      remark: ``,
      callback: async (ctx: IDownloadContext) => {
        const {} = this.context;
        console.log('=> step_03', ctx);
        return {
          code: ResCode.end,
          data: {},
        };
      },
    },
  ];

  scheduler: StepScheduler;

  constructor(options: IDownloadOptions) {
    super(options);
    this.context = { ...this.context, ...options.ctx };
    this.scheduler = new StepScheduler({ stepList: this.stepList });
  }
}
