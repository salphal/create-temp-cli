import { DoublyLinked, LinkedNode } from './doubly-linked';

export const ResCode = {
  back: -1,
  next: 1,
  jump: 2,
  end: 99,
};

export interface Step {
  name?: string;
  data: (...args: any[]) => { [key: string]: any };
  callback?: (
    ctx: any,
  ) =>
    | { code: number; data?: any; msg?: string }
    | Promise<{ code: number; data?: any; msg?: string } | undefined | null>
    | undefined
    | null;
  remark?: string;
}

export type StepList = Array<Step>;

export interface SchedulerOptions {
  stepList: StepList;
}

export interface SchedulerContext {
  [key: string]: any;
}

export class StepScheduler {
  context: SchedulerContext = {};
  LinkedList: DoublyLinked = new DoublyLinked();
  currentNode: LinkedNode | null = null;

  _isStart = false;
  _isEnd = false;

  constructor(options: SchedulerOptions) {
    const { stepList } = options;
    this._initLinkedList(stepList);
    this._initLinkedNode();
  }

  private _initLinkedList(stepList: StepList) {
    if (!Array.isArray(stepList) || !stepList.length) return [];
    stepList.forEach((step) => {
      this.LinkedList.append(step);
    });
  }

  private _initLinkedNode() {
    if (this.LinkedList.head) {
      this.currentNode = this.LinkedList.head;
    } else {
      console.log(`[ scheduler log ]: Current doublyLinked.header is ${this.LinkedList.head}`);
    }
  }

  private _executeBefore() {
    if (!this.currentNode) {
      console.log(`[ scheduler log ]: Current Node is ${this.currentNode}`);
      return false;
    }
    return true;
  }

  execute() {
    return new Promise(async (resolve, reject) => {
      if (!this._executeBefore()) return;

      if (this._isStart) {
        console.log('[ scheduler log ]: Already reached the first node.');
        resolve(this.context);
      } else if (this._isEnd) {
        console.log('[ scheduler log ]: The end node has been reached.');
        resolve(this.context);
      }

      const linkedNode = this.currentNode as LinkedNode;

      const {
        data: { name, callback, data },
      } = linkedNode;

      const nodeData = typeof data === 'function' ? data(this.context) : {};

      if (typeof callback !== 'function') return null;

      let res = null;

      try {
        console.log('\n');
        console.log(`${name} start -------------------------------------------------------------`);
        console.log('\n');

        if (this._isAsyncFunc(callback)) {
          res = await callback({ ...this.context, ...nodeData });
        } else {
          res = callback({ ...this.context, ...nodeData });
        }

        console.log('\n');
        console.log(`${name} end   -------------------------------------------------------------`);
        console.log('\n');
      } catch (err) {
        console.log('[ scheduler log ]: Execute node error, ', err);
        reject(err);
      }

      if (res && typeof res.code === 'number') {
        const { code, data = {} } = res;

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
          this.context = { ...this.context, ...data };
          resolve(this.context);
        } else if (code === ResCode.jump) {
          if (this.currentNode!.next && this.currentNode!.next.next) {
            this._isEnd = false;
            this.currentNode = this.currentNode!.next!.next;
          } else {
            this._isEnd = true;
          }
          this.context = { ...this.context, ...data };
          resolve(this.context);
        } else if (code === ResCode.end) {
          console.log('[ scheduler log ]: All steps completed.');
          process.exit(0);
        } else {
          console.log(
            `[ scheduler log ]: Please return legal result: { code, data, msg }, current return:`,
            res,
          );
          reject(null);
          process.exit(0);
        }
      } else {
        process.exit(0);
      }
    });
  }

  async autoExecute() {
    while (!this._isStart && !this._isEnd) {
      const res = await this.execute();
      if (!res) return this.context;
    }
    return this.context;
  }

  private _isAsyncFunc(func: any) {
    return func.constructor.name === 'AsyncFunction';
  }
}
