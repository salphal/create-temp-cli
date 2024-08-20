import {DoublyLinked, LinkedNode} from "./doubly-linked";


export interface Step {
  name?: string;
  callback?: () => void;
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

  autoExecute(): any;
}

class Scheduler implements IScheduler {

  result: any = null;
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
          res = await callback(this.result, this.context);
        } else {
          res = callback(this.result, this.context);
        }
        console.log(`[ Log ]: invoked callback: ${name}`);
      } catch (err) {
        console.error('[ Log ]: Execute node error, ', err);
        reject(err);
      }
      res ? resolve(res) : reject(res);
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
      const res = await this._execute();
      if (res) {
        this.currentNode = this.currentNode!.next;
      }
      resolve(res);
    });
  }

  back() {
    return new Promise(async (resolve, reject) => {
      if (!this._executeBefore()) return;
      const res = await this._execute();
      if (res) {
        this.currentNode = this.currentNode!.prev;
      }
      resolve(res);
    });
  }

  async autoExecute() {
    while (this.currentNode) {
      this.result = await this.next();
    }
  }

  private _isAsyncFunc(func: any) {
    return func.constructor.name === "AsyncFunction";
  }
}

export default Scheduler;
