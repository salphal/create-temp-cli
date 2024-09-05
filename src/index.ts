#!/usr/bin/env node

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { program } from 'commander';
import args from 'minimist';
import { configDotenv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { __test__ } from '@/test';
import { Envs } from '@type/env';
import { CliEnvs } from '@clis/template/template';
import { TemplateCli } from '@clis/template';
import { PublishCli } from '@clis/publish';
import { Logger, Prompt } from '@utils';

//-------------------------------------------------------------------------------------------------------------------//

/**
 * @param argv {object} - 执行脚本时携带的参数
 * @param __dirname {string} - 执行当前脚本的路径
 * @param envs {object} - 注入当前脚本的环境变量( 仅获取以 TEMP_CLI 开头的环境变量 )
 */
const envVariables = (function injection(): Envs {
  const argv = args(process.argv.slice(2), {
    default: { help: false }, // 设置参数默认值
    alias: { h: 'help' }, // 设置参数别名
    string: [], // 这里设置的参数名会始终解析为字符串
    boolean: [], // 这里设置的参数名会始终解析为布尔值
  });
  const __dirname: string = process.cwd();
  const __filename = fileURLToPath(import.meta.url);
  configDotenv({ path: path.resolve(__dirname, '.temp.env') });
  const envs: CliEnvs = Object.fromEntries(
    Object.entries(process.env).filter(([k, v]) => /^TEMP_CLI.*/.test(k)),
  );
  return { argv, __dirname, __filename, envs };
})();

const { argv, __dirname, __filename, envs } = envVariables;

//-------------------------------------------------------------------------------------------------------------------//

const templateCli = new TemplateCli({
  ctx: envVariables,
});

const publishCli = new PublishCli({
  ctx: envVariables,
});

//-------------------------------------------------------------------------------------------------------------------//

/**
 * 根据本地模版创建
 */
program
  .name('front-cli')
  .usage('[ create | download | publish ]')
  .description(
    `
  - Create components based on templates.
  - Release products based on configuration.`,
  )
  .version('1.0.0', '-v, --version');

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//

/**
 * 根据模版创建文件
 */
program
  .command('create')
  .alias('ct')
  .action((opts: any, cmd: any) => {
    templateCli.create();
  });

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//

/**
 * 下载 预设模版/环境模版/配置模版等 到本地
 */
program
  .command('download')
  .alias('dw')
  .action(async (opts: any, cmd: any) => {
    const name = await Prompt.autocomplete(
      'Please select a file to download',
      ['template', 'env', 'publish'].map((v) => ({ title: v, value: v })),
    );
    templateCli.cloneFile(name);
  });

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//

/**
 * 根据配置发布本地静态文件到服务器
 */
program
  .command('publish')
  .alias('pb')
  .option('-t, --type <type>', 'Rollback', 'publish')
  .action((opts: any, cmd: any) => {
    if (typeof opts.type === 'string' && ['publish', 'rollback'].includes(opts.type)) {
      publishCli.start({ type: opts.type });
    } else {
      Logger.table(
        [
          ['parameter', 'description'],
          ['publish( default )', 'Publish dist to server'],
          ['rollback', 'Roll back the specified version'],
        ],
        [{ width: 20 }, { width: 50 }],
        {
          title: 'front-cli publish -t [ publish | rollback ]',
        },
      );
    }
  });

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -//

program.command('test').action(async (opts: any, cmd: any) => {
  __test__();
});

program.parse(process.argv);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
