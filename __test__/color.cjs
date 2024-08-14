#!/usr/bin/env node


const {
  blue,
  cyan,
  green,
  gray,
  magenta,
  red,
  white,
  yellow,
  black
} = require('kolorist');


/**
 * https://github.com/marvinhagemeister/kolorist/blob/main/src/index.ts
 */


const test = `
${black('black')}
${red('red')}
${green('green')}
${yellow('yellow')}
${blue('blue')}
${magenta('magenta')}
${cyan('cyan')}
${white('white')}
${blue('blue')}
${gray('gray')}
`;

console.log("=>(color.cjs:18) test", test);
