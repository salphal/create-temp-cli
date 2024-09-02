import {table} from "table";

export class Table {

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
    joinJoin: `┼`
  }

  static defaultConfig = {
    title: null,
    columnWidth: null,
    outBorderType: 'double', // single | double
    verticalBorder: true,
    horizontalBorder: true,
  };

  static print(data: Array<string[]>, columns: Array<{ width?: number, align?: string }>, options = {}) {

    const {
      title,
      columnWidth = 20,
      outBorderType = 'double',
      verticalBorder = false,
      horizontalBorder = false,
    } = {...this.defaultConfig, ...options};

    /** 列对齐方式: 默认全部左对齐 */
    let tableColumns = data.map(() => ({alignment: 'left', width: columnWidth}));

    if (Array.isArray(columns) && columns.length) {
      tableColumns = columns.map(column => ({alignment: column.align || 'left', width: column.width || columnWidth}));
    }

    const config: any = {
      columns,
    };

    config.columns = tableColumns;

    /** 表格标题 */
    if (title && typeof title === 'string') {
      config.header = {
        alignment: 'center',
        content: title,
      }
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
      config.drawVerticalLine = (lineIndex: number, columnCount: number) => {
        return lineIndex === 0 || lineIndex === columnCount;
      }
    }

    console.log(table(data, config));
  }
}
