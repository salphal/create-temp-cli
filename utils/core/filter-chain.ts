export interface FilterChainContext {
  [key: string]: any;
}

export type FilterFunc = (prevResult: any, context: any) => any;

export interface Filter {
  name?: string;
  func: FilterFunc;
  result?: any;
}

export type FilterList = Array<Filter>;

export interface FilterChainOptions {
  filterList: FilterList;
  autoExecute?: boolean;
}

class FilterChain {

  options: FilterChainOptions;
  context: FilterChainContext | { [key: string]: any } = {};
  filterList: FilterList = [];

  currentIndex: number;
  currentFilter: Filter | null;
  prevResult: any;

  constructor(options: FilterChainOptions) {
    const {filterList} = options;
    this.options = options;
    this.filterList = filterList;
    this.currentIndex = 0;
    this.currentFilter = null;
    this.prevResult = {};
    this.init();
  }

  init() {
    this.initFilterList();
    const {autoExecute = false} = this.options;
    if (autoExecute) this.autoExecute();
  }

  initFilterList() {
    if (!Array.isArray(this.filterList) || !this.filterList.length) return;
    this.filterList = this.filterList.map((filter: any, i: number) => {
      return {
        ...filter,
        name: filter.name || `filter_${i}`,
        result: null
      };
    })
  }

  async autoExecute() {
    while (this.currentIndex < this.filterList.length) {
      await this.next();
    }
    return this.prevResult;
  }

  private async _execute(currentFilter: Filter) {
    return new Promise(async (resolve, reject) => {
      let res = null;
      const {name, func} = currentFilter;
      try {
        console.log(`[ Log ]: Invoked ${name} filter`);
        if (this._isAsyncFunc(func)) {
          res = await func(this.prevResult, this.context);
        } else {
          res = func(this.prevResult, this.context);
        }
        resolve(res);
      } catch (err: any) {
        reject(`[ Log ]: Invalid error of ${err}`);
        console.error(`${name} invoked error`, err);
      }
    });
  }

  async next() {
    return new Promise(async (resolve, reject) => {
      const currentFilter = this._getCurFilter();
      this.currentFilter = currentFilter;

      if (!currentFilter) {
        reject(`[ Log ]: Current filter is ${currentFilter}`);
        return;
      }

      const res = await this._execute(currentFilter);

      if (res) {
        this.prevResult = res;
        this.filterList[this.currentIndex].result = res;
        this.currentIndex = this.currentIndex + 1;
        resolve(res);
      } else {
        reject('');
      }

      // const currentFilter = this._getCurFilter();
      // this.currentFilter = currentFilter;
      // if (!currentFilter) {
      //   reject(`[ Log ]: Current filter is ${currentFilter}`);
      //   return;
      // }
      // let res = null;
      // const {name, func} = currentFilter;
      // try {
      //   console.log(`${name} invoked`);
      //   if (this._isAsyncFunc(func)) {
      //     res = await func(this.prevResult, this.context);
      //   } else {
      //     res = func(this.prevResult, this.context);
      //   }
      //   this.prevResult = res;
      //   this.filterList[this.currentIndex].result = res;
      //   this.currentIndex = this.currentIndex + 1;
      //   resolve(res);
      // } catch (err: any) {
      //   reject(`[ Log ]: Invalid error of ${err}`);
      //   console.error(`${name} invoked error`, err);
      // }
    });
  }

  async back() {
    return new Promise(async (resolve, reject) => {
      const prevFilter = this._getPrevFilter();
      this.currentFilter = prevFilter;

      if (!prevFilter) {
        reject(`[ Log ]: Current filter is ${prevFilter}`);
        return;
      }

      const res = await this._execute(prevFilter);

      if (res) {
        this.prevResult = res;
        this.filterList[this.currentIndex].result = res;
        this.currentIndex = this.currentIndex === 0 ? this.currentIndex - 1 : 0;
        resolve(res);
      } else {
        reject('');
      }
    });
  }

  /**
   * 获取当前过滤器
   */
  private _getCurFilter() {
    let i = this.currentIndex;
    if (i < this.filterList.length) {
      const filter = this.filterList[i];
      if (typeof filter.func === 'function') {
        return filter;
      }
    }
    return null;
  }

  /**
   * 获取前一个过滤器
   */
  private _getPrevFilter() {
    let i = this.currentIndex - 1;
    if (i < this.filterList.length) {
      if (i <= 0) {
        i = 0;
      }
      const filter = this.filterList[i];
      if (typeof filter.func === 'function') {
        return filter;
      }
    }
    return null;
  }

  private _isAsyncFunc = (func: Function) => {
    return func.constructor.name === "AsyncFunction";
  }
}

export default FilterChain;
