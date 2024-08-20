export interface NodeData {
  [key: string]: any;

  name?: string;
  callback?: (prev: any, ctx: any) => any;
}

export interface LinkedNodeOptions {
  data: NodeData;
  prev?: LinkedNode | null;
  next?: LinkedNode | null;
}

export class LinkedNode {

  /** 节点数据 */
  data: NodeData;
  /** 上一个节点 */
  prev: LinkedNode | null;
  /** 下一个节点 */
  next: LinkedNode | null;

  constructor(options: LinkedNodeOptions) {
    const {data, prev = null, next = null} = options;
    this.data = data;
    this.prev = prev;
    this.next = next;
  }
}

export interface DoublyLinkedOptions {
}

export interface IDoublyLinked {

  /** 首节点  */
  head: LinkedNode | null;
  /** 尾节点 */
  tail: LinkedNode | null;
  /** 链表的长度 */
  length: number;

  /** 向链表的最后追加一个节点 */
  append(data: NodeData): void;

  /** 向链表的最后追加一个节点 */
  push(data: NodeData): void;

  /** 删除链表的最后一项 */
  pop(): void;

  /** 删除链表的第一项 */
  shift(): void;

  /** 添加一项到链表的第一项 */
  unshift(data: NodeData): void;

  /** 向链表中指定位置插入一个节点 */
  insert(position: number, node: LinkedNode): void;

  /** 通过索引删除相应的节点 */
  remove(compare: (data: NodeData) => boolean): void;

  /** 通过信息删除相应的节点 */
  removeAt(position: number): void;

  /** 通过索引获取相应节点的信息 */
  getNode(position: number): NodeData | null;

  /** 通过节点的信息获取到相应的索引, 没有的话返回 -1 */
  indexOf(compare: (data: NodeData) => boolean): number;

  /** 修改节点的信息 */
  update(position: number, data: NodeData): void;

  /** 判断链表是否为空 */
  isEmpty(): boolean;

  /** 获取链表长度 */
  size(): number;

  /** 获取首节点 */
  getHead(): NodeData | null;

  /** 获取尾节点 */
  getTail(): NodeData | null;
}

export class DoublyLinked implements IDoublyLinked {

  head: LinkedNode | null = null;
  tail: LinkedNode | null = null;
  length = 0;

  constructor(options?: DoublyLinkedOptions) {
  }

  append(data: NodeData) {
    const newNode = new LinkedNode({data});
    if (this.length === 0) {
      this.head = newNode;
      this.tail = newNode;
    } else if (this.length > 0 && this._isLinkedNode(this.tail)) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.length += 1;
  }

  insert(position: number, data: NodeData) {
    if (position < 0 || position > this.length) {
      return false;
    }
    const newNode = new LinkedNode({data});
    if (length === 0) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (position == 0 && this._isLinkedNode(this.head)) {
        this.head.prev = newNode;
        newNode.next = this.head;
        this.head = newNode;
      } else if (position === this.length && this._isLinkedNode(this.tail)) {
        newNode.prev = this.tail;
        this.tail.next = newNode;
        this.tail = newNode;
      } else {
        let current = this.head;
        if (!this._isLinkedNode(current)) return;
        let index = 0;
        let prev = null;
        while (index < position) {
          prev = current;
          if (!current.next || !this._isLinkedNode(current)) return;
          current = current.next;
          index += 1;
        }
        if (!this._isLinkedNode(prev)) return;
        newNode.prev = prev;
        prev.next = newNode;
        newNode.next = current;
        current.prev = newNode;
      }
      this.length += 1;
    }
  }

  getNode(position: number): NodeData | null {
    if (position < 0 || position >= this.length) {
      return null;
    }
    let current = this.head;
    if (!current || !this._isLinkedNode(this.head)) return null;
    let index = 0;
    while (index < position) {
      if (!current) return null;
      current = current.next;
      index += 1;
    }
    return this._isLinkedNode(current) ? current.data : null;
  }

  indexOf(compare: (data: NodeData) => boolean): number {
    let current = this.head;
    let index = 0;
    while (current) {
      if (compare(current.data)) {
        return index;
      }
      current = current.next;
      index += 1;
    }
    return -1;
  }

  update(position: number, data: NodeData) {
    if (position < 0 || position >= this.length) {
      return false;
    }
    let current = this.head;
    let index = 0;
    while (index++ < position) {
      if (!current || !this._isLinkedNode(current)) return null;
      current = current.next;
    }
    if (!current || !this._isLinkedNode(current)) return null;
    current.data = {...current.data, ...data};
    return true;
  }

  removeAt(position: number) {
    if (position < 0 || position >= this.length) {
      return false;
    }
    if (this.length === 1) {
      this.head = null;
      this.tail = null;
    } else {
      if (position === 0 && this._isLinkedNode(this.head)) {
        this.head = this.head.next;
        this.head!.prev = null;
      } else if (position === this.length - 1 && this._isLinkedNode(this.tail)) {
        this.tail = this.tail!.prev;
        this.tail!.next = null;
      } else {
        let current = this.head;
        let index = 0;
        while (index++ < position) {
          if (!current || !this._isLinkedNode(current)) return null;
          current = current.next;
        }
        if (!this._isLinkedNode(current) || !current.prev || !current.next) return null;
        current.prev.next = current.next;
        current.next.prev = current.prev;
      }
    }
    this.length -= 1;
  }

  remove(compare: (data: NodeData) => boolean) {
    const position = this.indexOf(compare);
    if (position !== -1) {
      this.removeAt(position);
    }
  }

  push(data: NodeData) {
    this.append(data);
  }

  pop() {
    this.removeAt(this.length);
  }

  shift() {
    this.removeAt(0);
  }

  unshift(data: NodeData) {
    this.insert(0, data);
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  size(): number {
    return this.length;
  }

  getHead() {
    return this.head;
  }

  getTail() {
    return this.tail;
  }

  private _isLinkedNode(node: any): node is LinkedNode {
    return node instanceof LinkedNode;
  }
}
