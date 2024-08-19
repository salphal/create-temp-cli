#!/usr/bin/env node


/**
 * https://github.com/marvinhagemeister/kolorist/blob/main/src/index.ts
 */


import {
  blue,
  cyan,
  green,
  gray,
  magenta,
  red,
  white,
  yellow,
  black
} from 'kolorist';


class Color {
  static black(message) {
    return `${black(message)}`;
  }

  static red(message) {
    return `${red(message)}`;
  }

  static green(message) {
    return `${green(message)}`;
  }

  static yellow(message) {
    return `${yellow(message)}`;
  }

  static blue(message) {
    return `${blue(message)}`;
  }

  static magenta(message) {
    return `${magenta(message)}`;
  }

  static cyan(message) {
    return `${cyan(message)}`;
  }

  static white(message) {
    return `${white(message)}`;
  }

  static gray(message) {
    return `${gray(message)}`;
  }
}


const test = `
${Color.black('black')}
${Color.red('red')}
${Color.green('green')}
${Color.yellow('yellow')}
${Color.blue('blue')}
${Color.magenta('magenta')}
${Color.cyan('cyan')}
${Color.white('white')}
${Color.gray('gray')}
`;

console.log("=>(color.cjs:18) test", test);
