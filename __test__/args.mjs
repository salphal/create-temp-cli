#!/usr/bin/env node


/**
 * https://github.com/minimistjs/minimist
 */


import args from "minimist";


/**
 * 参数解析
 *  -x   短选项
 *  --x  长选项
 *
 * @param string - 始终将字符串或字符串参数名称数组视为字符串
 * @param boolean - 始终将其视为布尔值的布尔值、字符串或字符串数组
 * @param alias - 将字符串名称映射到字符串或字符串参数名称数组以用作别名的对象
 * @param default - 将字符串参数名称映射到默认值的对象
 * @param stopEarly - 如果为 true，则 argv._ 在第一个非选项之后填充所有内容
 * @param -- - 如果设置为 true, 则将 -- 后的所有参数放入 argv._
 */

const argv = args(process.argv.slice(2), {
  default: {help: false}, // 设置参数默认值
  alias: {h: 'help'}, // 设置参数别名
  string: [], // 这里设置的参数名会始终解析为字符串
  boolean: [], // 这里设置的参数名会始终解析为布尔值
});


console.log('=>(index.ts:16) argv', argv);


/**
 * 执行当前进程的目录路径
 */
const __dirname = process.cwd()
console.log('=>(index.ts:17) cwd', cwd);
