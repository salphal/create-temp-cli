#!/usr/bin/env node


import {Command} from 'commander';
import minimist from "minimist";

/**  */
const argv = minimist<{
  template?: string;
  help?: boolean;
}>(process.argv.slice(2), {
  default: {help: false},
  alias: {h: 'help', t: 'template'},
  string: ['_'],
});
console.log('=>(index.ts:16) argv', argv);

/** current working directory path */
const cwd = process.cwd()
console.log('=>(index.ts:17) cwd', cwd);

const program = new Command();

/**
 * https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md
 */

/**
 * 根据入参顺序定义参数
 *
 * program.arguments(name, description)
 *  @param name {string} - 定义参数名
 *  @param description {string} - 参数描述信息
 */

/**
 * 根据名称定义参数
 *
 * program.option(flags, description, ?defaultValue);
 *  @param flags {string} - 定义参数
 *    - 定义长短参数
 *      - "-v, --version <strings...>"
 *      - "-v| --version"
 *      - "-v --version"
 *    - 自动转换为 camelCase
 *      - "--camel-case" => "camelCase""
 *    * 定义: -x: 代表命令简写, --xxx 代表命令全称
 *    * 赋值: -x demo, --xxx demo / --xxx=demo
 *  @param description {string} - 参数描述信息
 *  @param defaultValue {string} - 参数默认值
 */

program
  .name('create-temp') // 名称
  .usage('[...options]')
  .description('Create files based on templates') // 描述
  .version('1.0.0', '-v, --version') // 版本号
  // 自定义帮助提示信息
  .addHelpText("before", () => "------------------------------------------------")
  .addHelpText("after", () => "------------------------------------------------");


/**--------------------------------------------------- Example -------------------------------------------------------*/


const validateFirstParam = (param: any) => {
  if (typeof param === 'string') {
    program.error('Param not a number.')
  }
  return param;
}

program
  .command('demo') // 匹配命令的模版
  .description('demo description') // 描述
  .alias('dm') // 定义 command 别名
  .argument('<first>', 'first parameter', validateFirstParam) // 根据入参顺序定义参数
  .argument('<second>', 'second parameter') // 根据入参顺序定义参数
  .option('-p, --param <optional-parameter>', 'optional parameter', 'defaultValue') // 具名参数
  // .requiredOption('-m, --must <required-parameter>', 'required parameter', 'defaultValue') // 必填具名参数( 必须填写值, 或者具有默认值 )
  .action((first, second, opts, cmd) => { // 若匹配成功, 则执行该回调
    console.log('=>(index.ts:68) first', first); // 只有顺序入参数可以这样取值
    console.log('=>(index.ts:68) second', second); // 只有顺序入参数可以这样取值
    console.log('=>(index.ts:68) opts', opts); // option 定义的参数集合
  });


/**--------------------------------------------------- Example -------------------------------------------------------*/


program
  .command('react')
  .alias('r')
  .option('-cn [compName], --comp-name <compName>', 'Component name', 'camelCase')
  .option('-fn [fileName], --file-name [fileName]', 'File name', 'camel-case')
  .option('-ty [templateType], --template-type <templateType>', 'Template type')
  .option('-op [outputPath], --output-path [outputPath]', 'Output path')
  .action((opts, cmd) => {
    console.log('=>(index.ts:85) opts', opts);
  });


program
  .command('vue')
  .alias('v')
  .option('-cn [compName], --comp-name <compName>', 'Component name', 'camelCase')
  .option('-fn [fileName], --file-name [fileName]', 'File name', 'camel-case')
  .option('-ty [templateType], --template-type <templateType>', 'Template type')
  .option('-op [outputPath], --output-path [outputPath]', 'Output path')
  .action((opts, cmd) => {
  });


/**
 * 解析参数
 */
program.parse(process.argv);


/**
 * 获取所有参数
 */
const options = program.opts();
console.log('=>(index.ts:49) program.opts()', options);

for (const option in options) {
  console.log('=>(index.ts:49) options.option', option);
}
