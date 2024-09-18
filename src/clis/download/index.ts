import { clone, FrontCli, FsExtra, Logger, Prompt, ResCode, StepList, StepScheduler } from '@utils';
import { Envs } from '@type/env';
import { DownloadKeys, downloadTypes } from '@clis/download/constant';
import path from 'path';
import {
  CLI_CONFIG_FILE_NAME,
  OUTPUT_FILE_NAME,
  PUBLISH_CONFIG_FILE_NAME,
  repositoryGitUrl,
  TEMPLATE_CONFIG_FILE_NAME,
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

        let downloadFilesList = [];

        const downloadChoicesMap: { [key in DownloadKeys]: any } = {
          [downloadTypes.all]: downloadTypes.all,
          /** __template__ */
          [downloadTypes.template]: {
            src: TEMPLATE_FILE_NAME,
            dest: `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_FILE_NAME}`,
          },
          /** template.config.mjs */
          [downloadTypes.templateConfig]: {
            src: TEMPLATE_CONFIG_FILE_NAME,
            dest: `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_CONFIG_FILE_NAME}`,
          },
          /** publish.config.json */
          [downloadTypes.publishConfig]: {
            src: PUBLISH_CONFIG_FILE_NAME,
            dest: `${CLI_CONFIG_FILE_NAME}/${PUBLISH_CONFIG_FILE_NAME}`,
          },
        };

        const selectedFile: DownloadKeys = await Prompt.autocomplete(
          'Please select a file to download.',
          Object.keys(downloadChoicesMap).map((k) => ({ title: k, value: k })),
        );

        const selectedFileConfig = downloadChoicesMap[selectedFile];

        /** 创建临时目录, 用于存放项目 */
        const tmpDirPath = path.resolve(__dirname, '.tmp');
        if (await FsExtra.pathExists(tmpDirPath)) {
          await FsExtra.rm(tmpDirPath);
        }

        Logger.startLoading(`cloning ${name}`);

        const tmpName = '.tmp';
        await clone({
          remote: repositoryGitUrl,
          branch: 'main',
          outputPath: tmpName,
        })
          .then(async (res) => {
            const srcBasePath = path.resolve(__dirname, tmpName);

            if (name === downloadTypes.template || name === downloadTypes.all) {
              const tempSrc = path.resolve(__dirname, `.tmp/${TEMPLATE_FILE_NAME}`);
              const destName = `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_FILE_NAME}`;
              const tempDst = path.resolve(__dirname, destName);
              await FsExtra.cp(tempSrc, tempDst);
              Logger.success(`Successfully downloaded ${destName} directory`);
            }

            if (name === downloadTypes.publishConfig || name === downloadTypes.all) {
              const destName = `${CLI_CONFIG_FILE_NAME}/${PUBLISH_CONFIG_FILE_NAME}`;
              const envSrc = path.resolve(__dirname, `.tmp/${PUBLISH_CONFIG_FILE_NAME}`);
              const envDst = path.resolve(__dirname, destName);
              await FsExtra.cp(envSrc, envDst);
              Logger.success(`Successfully downloaded ${destName} file`);
            }

            const tmpPath = path.resolve(__dirname, '.tmp');
            await FsExtra.rm(tmpPath);
          })
          .catch((err) => {
            Logger.error(err);
          })
          .finally(() => {
            Logger.endLoading();
          });

        return {
          code: ResCode.next,
          data: { ...ctx },
        };
      },
    },
    {
      name: 'step_02',
      remark: `
        如果有 .gitignore 文件, 则向其中追加忽略文件
      `,
      callback: async (ctx: IDownloadContext) => {
        const { __dirname, name } = this.context;
        const ignoreFilePath = path.join(__dirname, '.gitignore');

        /**
         * 如果有 .gitignore, 则自动追加 排除 dev-cli 中的部分文件
         */
        if (await FsExtra.isFile(ignoreFilePath)) {
          const ignoreContent = await FsExtra.read(ignoreFilePath);

          if (ignoreContent) {
            const content = ignoreContent.toString();

            let ignoreConfig = '\n';

            const templateDirPath = `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_FILE_NAME}`;
            const outputDirPath = OUTPUT_FILE_NAME;

            if (content.indexOf(templateDirPath) === -1) {
              ignoreConfig += templateDirPath + '\n';
            }
            if (content.indexOf(outputDirPath) === -1) {
              ignoreConfig += outputDirPath;
            }

            if (ignoreConfig.trim()) {
              await FsExtra.write(ignoreFilePath, ignoreContent + ignoreConfig);
            }
          }
        }

        Logger.success(`Success load ${name}`);

        console.log('=> step_02', ctx);
        return {
          code: ResCode.end,
          data: { ...ctx },
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
          data: { ...ctx },
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
