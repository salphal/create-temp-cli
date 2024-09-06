import { blue, green, red, yellow } from 'kolorist';
import { Table } from './table';
import { Banner } from './banner';
import { Loading } from '@utils';

export class Logger {
  static prefix: string = '[ Log ]: ';

  static log(message: any, type: (str: string | number) => string, prefix?: string) {
    const pf = prefix || this.prefix;
    typeof message === 'object' ? console.log(type(pf), message) : console.log(type(pf + message));
  }

  static info(message: any, prefix?: string) {
    this.log(message, blue, prefix);
  }

  static success(message: any, prefix?: string) {
    this.log(message, green, prefix);
  }

  static warn(message: any, prefix?: string) {
    this.log(message, yellow, prefix);
  }

  static error(message: any, prefix?: string) {
    this.log(message, red, prefix);
  }

  static obj(message: string, type: (str: string | number) => string, ...objs: any[]) {
    console.log(type(this.prefix + message), ...objs);
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
