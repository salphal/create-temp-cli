import { table } from 'table';

/**
 * https://github.com/gajus/table
 */

// Using commonjs?
// const { table } = require('table');

const data = [
  ['name', 'age', 'gender'],
  ['alpha', '18', 'male'],
  ['beta', '20', 'female'],
];

console.log(table(data));

class Table {
  static border = {
    topBody: `─`,
    topJoin: `┬`,
    topLeft: `┌`,
    topRight: `┐`,

    bottomBody: `─`,
    bottomJoin: `┴`,
    bottomLeft: `└`,
    bottomRight: `┘`,

    bodyLeft: `│`,
    bodyRight: `│`,
    bodyJoin: `│`,

    joinBody: `─`,
    joinLeft: `├`,
    joinRight: `┤`,
    joinJoin: `┼`,
  };

  static defaultConfig = {
    title: null,
    columnAlign: 'left',
    columnWidth: 20,
    outBorderType: 'double', // single | double
    verticalBorder: true,
    horizontalBorder: true,
  };

  static print(data, columns, options = {}) {
    const {
      title,
      columnAlign,
      columnWidth,
      outBorderType = 'double',
      verticalBorder = false,
      horizontalBorder = false,
    } = { ...this.defaultConfig, ...options };

    /** 列对齐方式: 默认全部左对齐 */
    let tableColumns = data.map(() => ({ alignment: 'left', width: columnWidth }));

    if (Array.isArray(columns) && columns.length) {
      tableColumns = columns.map((column) => ({
        alignment: column.align || columnAlign,
        width: column.width || columnWidth,
      }));
    }

    const config = {
      columns,
    };

    config.columns = tableColumns;

    /** 表格标题 */
    if (title && typeof title === 'string') {
      config.header = {
        alignment: 'center',
        content: title,
      };
    }

    /** 外边框样式: 单边 | 双边 ( 默认: 单边 ) */
    if (outBorderType === 'single') {
      config.border = this.border;
    }

    /** 水平列边框是否展示 */
    if (!horizontalBorder) {
      config.singleLine = true;
    }

    /** 垂直列边框是否展示 */
    if (!verticalBorder) {
      config.drawVerticalLine = (lineIndex, columnCount) => {
        return lineIndex === 0 || lineIndex === columnCount;
      };
    }

    console.log(table(data, config));
  }
}

Table.print(data, {});
