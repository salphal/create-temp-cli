import {DoublyLinked, LinkedNode} from "./doubly-linked";

export const ResCode = {
	back: -1,
	next: 1
}


export interface Step {
	name?: string;
	callback?: (ctx: any) => { code: number, data?: any, msg?: string };
}

export type StepList = Array<Step>;


export interface SchedulerOptions {
	stepList: StepList
}

export interface SchedulerContext {
	[key: string]: any;
}

export interface IScheduler {

	context: SchedulerContext;

	next(): any;

	back(): any;
}

class Scheduler implements IScheduler {

	prevResult: any = null;
	context: SchedulerContext = {};

	LinkedList: DoublyLinked = new DoublyLinked();
	currentNode: LinkedNode | null = null;

	constructor(options: SchedulerOptions) {
		const {stepList} = options;
		this.initLinkedList(stepList);
		this.initLinkedNode();
	}

	initLinkedList(stepList: StepList) {
		if (!Array.isArray(stepList) || !stepList.length) return [];
		stepList.forEach(step => {
			this.LinkedList.append(step);
		});
	}

	initLinkedNode() {
		if (this.LinkedList.head) {
			this.currentNode = this.LinkedList.head;
		} else {
			console.log(`[ Log ]: Current doublyLinked.header is ${this.LinkedList.head}`);
		}
	}

	private _execute() {
		return new Promise(async (resolve, reject) => {
			const linkedNode = this.currentNode as LinkedNode;
			const {data: {name, callback}} = linkedNode;
			if (typeof callback !== 'function') return;
			let res = null;
			try {
				if (this._isAsyncFunc(callback)) {
					res = await callback(this.context);
				} else {
					res = callback(this.context);
				}
				console.log(`[ Log ]: invoked callback: ${name}`);
			} catch (err) {
				console.log('[ Log ]: Execute node error, ', err);
				reject(err);
			}
			const {code, data = {}} = res;
			if (code === ResCode.back) {
				this.currentNode = this.currentNode!.prev;
				resolve(this.context);
			} else if (code === ResCode.next) {
				this.currentNode = this.currentNode!.next;
				this.context = {...this.context, ...data}
				resolve(this.context);
			} else {
				console.log(`[ Log ]: Please return legal result: { code, data, msg }, current return:`, res)
				reject(null);
			}
		});
	}

	private _executeBefore() {
		if (!this.currentNode) {
			console.log(`[ Log ]: Current Node is ${this.currentNode}`);
			return false;
		}
		return true;
	}

	next() {
		return new Promise(async (resolve, reject) => {
			if (!this._executeBefore()) return;
			this._execute()
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				})
				.finally(() => {
				});
		});
	}

	back() {
		return new Promise(async (resolve, reject) => {
			if (!this._executeBefore()) return;
			this._execute()
				.then(res => {
					resolve(res);
				})
				.catch(err => {
					reject(err);
				})
				.finally(() => {
				});
		});
	}

	private _isAsyncFunc(func: any) {
		return func.constructor.name === "AsyncFunction";
	}
}

export default Scheduler;
