import {
  FrontCli,
  FsExtra,
  Logger,
  PathExtra,
  Prompt,
  PromptChoices,
  ResCode,
  ShellExtra,
  StepList,
  StepScheduler,
  SSH,
} from '@utils';
import { Envs } from '@type/env';
import path from 'path';
import { CONFIG_BASE_NAME } from '@constants/common';
import { PublishConfig, PublishConfigList } from './publish';
import { crateNameConfigChoices, getPublishConfigByEnvName } from '@clis/publish/utils/publish';
import { createBackupName, filterExpiredFiles } from '@clis/publish/utils/backup';

interface IPublishContext extends Envs {
  /** 部署信息配置列表 */
  publishConfigList: PublishConfigList;
  /** 用户选择的部署信息 */
  currentPublishConfig: PublishConfig;
  /** 部署配置选项 */
  envNameConfigChoices: PromptChoices;

  type?: 'publish' | 'rollback' | any;
}

interface IPublishOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs & {};
}

export class PublishCli extends FrontCli<IPublishContext> {
  context: IPublishContext = {
    publishConfigList: [],
    currentPublishConfig: {
      envName: 'dev',
      local: {
        outputName: 'dist.tar.gz',
      },
      server: {
        connect: {
          host: '192.168.1.1',
          username: 'root',
          port: 22,
          password: 'password',
          privateKey: '/path/to/my/key',
        },
        isBackup: true,
        backup: {
          dirName: 'time-machine',
          format: 'YYYY-MM-DD-hh-mm-ss',
          max: 5,
        },
        publishDir: '/etc/nginx/html/demo',
        appName: 'dist',
        restartCmd: 'nginx -s reload',
      },
    },
    envNameConfigChoices: [],

    argv: {},
    __dirname: '',
    __filename: '',
    envs: {},
  };

  stepList: StepList = [
    {
      name: 'step_01',
      remark: `
        获取部署配置信息列表
      `,
      callback: async (ctx: IPublishContext) => {
        const { __dirname } = this.context;

        /** 读取发布的配置文件 .json */
        const jsonPath = path.resolve(__dirname, `${CONFIG_BASE_NAME}/publish.config.json`);

        const isFile = await FsExtra.isFile(jsonPath);

        if (!isFile) {
          return;
        }

        const publishConfigList = (await FsExtra.readJson(jsonPath)) as PublishConfigList;

        if (!Array.isArray(publishConfigList) || !publishConfigList.length) {
          Logger.error('');
          return;
        }

        this.context.publishConfigList = publishConfigList;

        this.context.envNameConfigChoices = crateNameConfigChoices(publishConfigList);

        return {
          code: ResCode.next,
          data: {},
        };
      },
    },

    {
      name: 'step_02',
      remark: `
        用户选择其中一个
      `,
      callback: async (ctx: IPublishContext) => {
        const {} = this.context;

        const envName = await Prompt.autocomplete(
          'Please select publishing environment',
          this.context.envNameConfigChoices,
        );

        this.context.currentPublishConfig = getPublishConfigByEnvName(
          envName,
          this.context.publishConfigList,
        );

        Logger.info(this.context.currentPublishConfig);

        return {
          code: ResCode.next,
          data: {},
        };
      },
    },

    {
      name: 'step_03',
      remark: ``,
      callback: async (ctx: IPublishContext) => {
        const {} = this.context;

        if ('type' in this.context && typeof this.context.type === 'string') {
          if (this.context.type === 'publish') {
            await this.publish();
          } else if (this.context.type === 'rollback') {
            await this.rollback();
          }
        }

        return {
          code: ResCode.next,
          data: {},
        };
      },
    },
  ];

  scheduler: StepScheduler;

  async publish() {
    const {
      currentPublishConfig: {
        local: { outputName },
        server: {
          connect,
          jumpServer,
          publishDir,
          appName,
          restartCmd,
          isBackup,
          backup: { dirName: backupDirName, format: backupFormat, max: backupMax },
        },
      },
      __dirname,
    } = this.context;

    /** 打包的产物名 */
    const outputTarName = PathExtra.fixTarExt(outputName);
    /** 基础的产物名 */
    const outputBaseName = PathExtra.__basename(outputName);

    /** 压缩本地产物 */
    ShellExtra.tar(path.join(__dirname, outputTarName));

    /** 创建 ssh 连接远程服务器 */
    const ssh = new SSH({ connect, jumpServer });

    ssh
      .connect()
      .then(async (client) => {
        const { name, dir } = path.parse(publishDir);

        /** 本地构建产物的路径 */
        const localOutputPath = path.join(__dirname, outputTarName);
        /** 发布到远程的路径 */
        const remoteOutputPath = path.join(publishDir, outputBaseName);

        /** 发布到远程的 .tar.gz 路径 */
        const remoteOutputTarPath = path.join(publishDir, outputTarName);

        /** 备份文件的路径夹路径 */
        const backupDir = path.join(publishDir, backupDirName);
        /** 是否存在备份文件夹 */
        const hasBackupDir = await client.isDir(backupDir);
        /** 没有备份文件, 创建备份文件夹 */
        if (!hasBackupDir) {
          await client.mkdir(backupDir);
        }

        /** 删除旧的构建产物 */
        await client.rm(remoteOutputPath);

        /** 上传新的构建 */
        await client.upload(localOutputPath, remoteOutputTarPath);

        /** 解压构建产物 */
        await client.untar(remoteOutputTarPath);

        /** 重命名( 若真实名称和打包名称不同时 ) */
        if (outputBaseName !== appName) {
          const oldNamePath = path.join(publishDir, outputBaseName);
          const newNamePath = path.join(publishDir, appName);
          if (await client.isDir(newNamePath)) {
            await client.rm(newNamePath);
          }
          await client.mv(oldNamePath, newNamePath);
        }

        /** 备份 */
        if (isBackup) {
          /** 新建备份文件的名称 */
          const backupFIleName = createBackupName(outputBaseName, backupFormat);
          /** 备份文件的目录路径 */
          const backupFileDir = path.join(publishDir, backupDirName);
          /** 备份文件的完整路径 */
          const backupFilePath = path.join(publishDir, backupDirName, backupFIleName);

          /** 备份当前产物 */
          await client.cp(remoteOutputTarPath, backupFilePath);

          /** 获取备份列表 */
          const backupList = await client.ls(backupDir);

          /** 获取多余的备份 */
          const expiredFiles = filterExpiredFiles(backupFileDir, backupList, backupMax);

          expiredFiles.length && Logger.info(expiredFiles);

          /** 移除多余备份 */
          if (expiredFiles.length) {
            await client.rm(...expiredFiles);
          }

          /** 删除本次构建的产物 */
          await client.rm(remoteOutputTarPath);
        }

        /** 重启服务 */
        client
          .exec(restartCmd)
          .catch(() => {})
          .finally(() => {
            client.end();
          });
      })
      .catch((err) => {})
      .finally(() => {});
  }

  async rollback() {
    const {
      currentPublishConfig: {
        local: { outputName },
        server: {
          connect,
          jumpServer,
          publishDir,
          appName,
          restartCmd,
          isBackup,
          backup: { dirName: backupDirName, format: backupFormat, max: backupMax },
        },
      },
    } = this.context;

    /** 创建 ssh 连接远程服务器 */
    const ssh = new SSH({ connect, jumpServer });

    ssh.connect().then(async (client) => {
      /** 打包的产物名 */
      const outputTarName = PathExtra.fixTarExt(outputName);
      /** 基础的产物名 */
      const outputBaseName = PathExtra.__basename(outputName);
      /** 发布到远程的路径 */
      const remoteOutputPath = path.join(publishDir, outputBaseName);
      /** 发布到远程的 .tar.gz 路径 */
      const remoteOutputTarPath = path.join(publishDir, outputTarName);
      /** 备份文件的路径夹路径 */
      const backupDir = path.join(publishDir, backupDirName);

      /** 备份 */
      if (isBackup) {
        /** 获取备份列表 */
        const backupList = await client.ls(backupDir);

        const backupChoices = backupList.map((fileName) => ({ title: fileName, value: fileName }));

        const checkedBackup = await Prompt.autocomplete(
          'Please select the version of rollback.',
          backupChoices,
        );

        if (checkedBackup) {
          const checkedBackupTarPath = path.join(backupDir, checkedBackup);
          const checkedBackupPath = path.join(backupDir, outputBaseName);

          /** 删除现有的构建产物 */
          await client.rm(remoteOutputPath);

          /** 解压构建产物 */
          await client.untar(checkedBackupTarPath);

          /** 部署产物的完整路径 */
          const publishAppPath = path.join(publishDir, appName);

          /** 删除 选中的备份和现有的产物 */
          await client.rm(publishAppPath, checkedBackupTarPath);

          /** 将选中的备份移动到部署的目录并重命名 */
          await client.mv(checkedBackupPath, publishAppPath);

          /** 重启服务 */
          client
            .exec(restartCmd)
            .catch(() => {})
            .finally(() => {
              client.end();
            });
        }
      }
    });
  }

  constructor(options: IPublishOptions) {
    super(options);
    this.context = { ...this.context, ...options.ctx };
    this.scheduler = new StepScheduler({ stepList: this.stepList });
  }
}
