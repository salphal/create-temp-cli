import { blue, green, red, yellow } from 'kolorist';
import { Table } from './table';
import { Banner } from './banner';
import { Loading } from '@utils';

export class Logger {
  static prefix: string = '[ log ]: ';

  static log(
    message: any,
    type: (str: string | number) => string,
    prefix?: string,
    ...objs: any[]
  ) {
    const pf = prefix || this.prefix;
    console.log('\n');
    typeof message === 'object'
      ? console.log(type(pf), message, ...objs)
      : console.log(type(pf + message), ...objs);
    console.log('\n');
  }

  static info(message: any, prefix?: string, ...objs: any[]) {
    this.log(message, blue, prefix, ...objs);
  }

  static success(message: any, prefix?: string, ...objs: any[]) {
    this.log(message, green, prefix, ...objs);
  }

  static warn(message: any, prefix?: string, ...objs: any[]) {
    this.log(message, yellow, prefix, ...objs);
  }

  static error(message: any, prefix?: string, ...objs: any[]) {
    this.log(message, red, prefix, ...objs);
  }

  static obj(message: string, type: (str: string | number) => string, ...objs: any[]) {
    console.log('\n');
    console.log(type(`[ ${message} ]`), ...objs);
    console.log('\n');
  }

  static infoObj(message: string, ...objs: any[]) {
    this.obj(message, blue, ...objs);
  }

  static successObj(message: string, ...objs: any[]) {
    this.obj(message, green, ...objs);
  }

  static warnObj(message: string, ...objs: any[]) {
    this.obj(message, yellow, ...objs);
  }

  static errorObj(message: string, ...objs: any[]) {
    this.obj(message, red, ...objs);
  }

  static table(
    dataSource: Array<string[]>,
    columns: Array<{ align?: string; width?: number }> = [],
    config?: any,
  ) {
    Table.print(dataSource, columns, config);
  }

  static banner(message: string) {
    Banner.print(message);
  }

  static startLoading(message: string) {
    Loading.start(message);
  }

  static endLoading() {
    Loading.end();
  }
}
