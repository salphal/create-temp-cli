#!/usr/bin/env node


/**
 * https://github.com/minimistjs/minimist
 */


const args = require("minimist");


/**
 * 参数解析
 *
 * @param string - 始终将字符串或字符串参数名称数组视为字符串
 * @param boolean - 始终将其视为布尔值的布尔值、字符串或字符串数组
 * @param alias - 将字符串名称映射到字符串或字符串参数名称数组以用作别名的对象
 * @param default - 将字符串参数名称映射到默认值的对象
 * @param stopEarly - 如果为 true，则 argv._ 在第一个非选项之后填充所有内容
 */
const argv = args(process.argv.slice(2), {
  default: {help: false},
  alias: {h: 'help', t: 'template'},
  string: ['_'],
});

console.log('=>(index.ts:16) argv', argv);


/**
 * 执行当前进程的目录路径
 */
const cwd = process.cwd()
console.log('=>(index.ts:17) cwd', cwd);
