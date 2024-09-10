import path from 'path';
import { PromptChoices } from '@utils';
import { CliEnvs, TempContext } from '../template';

/**
 * 挂载环境变量中的配置
 * @param envs {CliEnvs} - 环境变量
 * @param ctx {TempContext} - 创建模版时的上下文数据
 */
export function setupEnvs(envs: CliEnvs, ctx: TempContext) {
  setupTempDirs(envs, ctx);
  setupOutputDirectory(envs, ctx);
  setCustomOutputDirectoryList(envs, ctx);
}

/**
 * 挂载 默认模版目录
 * @param envs {CliEnvs} - 环境变量
 * @param ctx {TempContext} - 创建模版时的上下文数据
 */
export function setupTempDirs(envs: CliEnvs, ctx: TempContext) {
  if (!envs.DEV_CLI_TEMPLATE_DIRECTORY) return;
  const tempDirPathList = envs.DEV_CLI_TEMPLATE_DIRECTORY.split(',').filter((v) => !!v);
  ctx.tempDirPathList = Array.from(new Set([...tempDirPathList, ...ctx.tempDirPathList]));
}

/**
 * 挂载 默认输出目录
 * @param envs {CliEnvs} - 环境变量
 * @param ctx {TempContext} - 创建模版时的上下文数据
 */
export function setupOutputDirectory(envs: CliEnvs, ctx: TempContext) {
  if (!envs.DEV_CLI_OUTPUT_DIRECTORY) return;
  ctx.outputDirPath = path.join(ctx.__dirname, envs.DEV_CLI_OUTPUT_DIRECTORY);
}

/**
 * 挂载 追加自定义输出目录的选项
 * @param envs {CliEnvs} - 环境变量
 * @param ctx {TempContext} - 创建模版时的上下文数据
 */
export function setCustomOutputDirectoryList(envs: CliEnvs, ctx: TempContext) {
  if (!envs.DEV_CLI_OUTPUT_DIRECTORY_CHOICES) return;
  const outputDirectoryList = envs.DEV_CLI_OUTPUT_DIRECTORY_CHOICES.split(',').filter((v) => !!v);
  const outputPathChoices: PromptChoices = outputDirectoryList.map((v) => ({ title: v, value: v }));
  ctx.outputPathChoices = [...ctx.outputPathChoices, ...outputPathChoices];
}
