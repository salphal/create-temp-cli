import {DoublyLinked, LinkedNode} from "./doubly-linked";

export const ResCode = {
  back: -1,
  stop: 0,
  next: 1
}

export interface Step {
  name?: string;
  callback?: (ctx: any) =>
    { code: number, data?: any, msg?: string } |
    Promise<{ code: number, data?: any, msg?: string }>;
  remark?: string;
}

export type StepList = Array<Step>;

export interface SchedulerOptions {
  stepList: StepList
}

export interface SchedulerContext {
  [key: string]: any;
}

class Scheduler {

  context: SchedulerContext = {};
  LinkedList: DoublyLinked = new DoublyLinked();
  currentNode: LinkedNode | null = null;

  _isStart = false;
  _isEnd = false;

  constructor(options: SchedulerOptions) {
    const {stepList} = options;
    this._initLinkedList(stepList);
    this._initLinkedNode();
  }

  private _initLinkedList(stepList: StepList) {
    if (!Array.isArray(stepList) || !stepList.length) return [];
    stepList.forEach(step => {
      this.LinkedList.append(step);
    });
  }

  private _initLinkedNode() {
    if (this.LinkedList.head) {
      this.currentNode = this.LinkedList.head;
    } else {
      console.log(`[ Log ]: Current doublyLinked.header is ${this.LinkedList.head}`);
    }
  }

  private _executeBefore() {
    if (!this.currentNode) {
      console.log(`[ Log ]: Current Node is ${this.currentNode}`);
      return false;
    }
    return true;
  }

  execute() {
    return new Promise(async (resolve, reject) => {
      if (!this._executeBefore()) return;
      if (this._isStart) {
        console.log('[ Log ]: Already reached the first node.');
        resolve(this.context);
      } else if (this._isEnd) {
        console.log('[ Log ]: The end node has been reached.');
        resolve(this.context);
      }
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
        if (this.currentNode!.prev) {
          this._isStart = false;
          this.currentNode = this.currentNode!.prev;
        } else {
          this._isStart = true;
        }
        resolve(this.context);
      } else if (code === ResCode.next) {
        if (this.currentNode!.next) {
          this._isEnd = false;
          this.currentNode = this.currentNode!.next;
        } else {
          this._isEnd = true;
        }
        this.context = {...this.context, ...data};
        resolve(this.context);
      } else if (code === ResCode.stop) {

      } else {
        console.log(`[ Log ]: Please return legal result: { code, data, msg }, current return:`, res)
        reject(null);
      }
    });
  }

  async autoExecute() {
    while (!this._isStart && !this._isEnd) {
      await this.execute();
    }
    return this.context;
  }

  private _isAsyncFunc(func: any) {
    return func.constructor.name === "AsyncFunction";
  }
}

export default Scheduler;
