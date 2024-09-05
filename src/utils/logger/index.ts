import { blue, green, red, yellow } from 'kolorist';
import { Table } from './table';
import { Banner } from './banner';
import { Loading } from '@utils';

export class Logger {
  static prefix = '[ Log ]: ';

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
