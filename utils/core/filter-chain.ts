export interface FilterChainContext {
	[key: string]: any;
}

export type FilterFunc = (prevResult: any, context: any) => any;

export interface Step {
	name?: string;
	func: FilterFunc;
}

export interface Filter {
	name?: string;
	func: FilterFunc;
	result?: any;
	prev: Filter | null;
	next: Filter | null;
}

export type StepList = Array<Step>;

export type FilterList = Array<Filter>

export interface FilterChainOptions {
	stepList: StepList;
	autoExecute?: boolean;
	debug?: boolean;
}

export interface IFilterChain {

}

class FilterChain implements IFilterChain {
	debug: boolean;

	options: FilterChainOptions;
	context: FilterChainContext | { [key: string]: any } = {};

	stepList: StepList = [];
	filterList: FilterList = [];

	currentIndex: number = 0;
	currentFilter: Filter | null;
	prevFilterRes: any = null;

	constructor(options: FilterChainOptions) {
		const {stepList, debug = false} = options;

		this.options = options;
		this.stepList = stepList;

		this.filterList = this.createFilterList(stepList);
		this.currentFilter = this.filterList.length ? this.filterList[0] : null;
		this.debug = debug;

		this.init();

		this.debug && console.log(`[ Log ]: Current filter list:`, this.filterList);
	}

	init() {

		// const {autoExecute = false} = this.options;
		// if (autoExecute) this.autoExecute();
	}

	createFilterList(stepList: StepList) {
		if (!Array.isArray(stepList) || !stepList.length) return [];
		return stepList.map((filter: any, i: number) => {
			let prev = null;
			let next = null;
			if (i > 0) {
				prev = stepList[i - 1];
			}
			if (i < stepList.length - 1) {
				next = stepList[i + 1];
			}
			return {
				...filter,
				name: filter.name || `filter_${i}`,
				result: null,
				prev,
				next
			};
		})
	}

	autoExecute() {
		// while (this.currentIndex < this.filterList.length) {
		// 	await this.next();
		// }
		// return this.prevFilterRes;
	}

	private async _execute(currentFilter: Filter) {
		return new Promise(async (resolve, reject) => {
			let res = null;
			const {name, func} = currentFilter;
			try {
				if (typeof func !== 'function') {
					reject(`${name}.func is not a function`);
				}
				this.debug && console.log(`[ Log ]: Invoked ${name} filter`);
				if (this._isAsyncFunc(func)) {
					res = await func(this.prevFilterRes, this.context);
				} else {
					res = func(this.prevFilterRes, this.context);
				}
				if (res) {
					currentFilter.result = res;
					resolve(res);
				} else {
					reject(`[ Log ]: Current return value is ${res}`);
				}
			} catch (err: any) {
				reject(`[ Log ]: Invalid error of ${err}`);
				this.debug && console.error(`${name} invoked error`, err);
			}
		});
	}

	async next() {
		return new Promise(async (resolve, reject) => {
			if (!this.currentFilter) return;
			const currentFilter = this._getNextFilter();
			if (!currentFilter) {
				reject(`[ Log ]: Current filter is ${currentFilter}`);
				return;
			}
			const res = await this._execute(currentFilter);
			if (res) {
				// this._updateIndex(true);
				// this.prevFilterRes = res;
				resolve(res);
			} else {
			}
		});
	}

	async back() {
		return new Promise(async (resolve, reject) => {
			if (!this.currentFilter) return;
			const prevFilter = this._getPrevFilter();
			if (!prevFilter) {
				reject(`[ Log ]: Current filter is ${prevFilter}`);
				return;
			}
			const res = await this._execute(prevFilter);
			if (res) {
				// const i = this.currentIndex - 1 <= 0 ? 0 : this.currentIndex - 1;
				// this.prevFilterRes = i === 0 ? null : this.filterList[i].result;
				// resolve(this.prevFilterRes);
				resolve(res);
				// this._updateIndex(false);
			} else {
				// this.filterList[this.currentIndex].result = null;
			}
		});
	}

	/**
	 * 获取下一个过滤器
	 */
	private _getNextFilter() {
		if (!this.currentFilter) return null;
		if (this.currentFilter.prev === null && this.currentFilter.next !== null) {
			return this.currentFilter;
		} else {
			return this.currentFilter.next;
		}
	}

	/**
	 * 获取前一个过滤器
	 */
	private _getPrevFilter() {
		if (!this.currentFilter) return null;
		if (this.currentFilter.prev !== null) {
			return this.currentFilter.prev;
		}
		return null;
	}

	/**
	 * 更新当前索引
	 */
	private _updateIndex(isAdd: boolean) {
		const min = 0;
		const max = this.filterList.length - 1;
		let i: number;
		if (isAdd) {
			i = this.currentIndex + 1;
			if (i >= max) i = max;
		} else {
			i = this.currentIndex - 1;
			if (i <= min) i = min;
		}
		this.currentIndex = i;
		this.debug && console.log(`[ Log ]: Current index: ${i}`);
	}

	/**
	 * 判断是否是异步函数
	 */
	private _isAsyncFunc = (func: Function) => {
		return func.constructor.name === "AsyncFunction";
	}
}

export default FilterChain;
