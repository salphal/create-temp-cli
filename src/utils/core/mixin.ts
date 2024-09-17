export function mixins(...clazzs: any[]) {
  class Mix {
    constructor() {
      for (let Clazz of clazzs) {
        copyProperties(this, new Clazz()); // 拷贝实例属性
      }
    }
  }

  for (let Clazz of clazzs) {
    copyProperties(Mix, Clazz); // 拷贝静态方法
    copyProperties(Mix.prototype, Clazz.prototype); // 拷贝原型方法
  }

  return Mix;
}

function copyProperties(target: object, source: object) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      desc && Object.defineProperty(target, key, desc);
    }
  }
}
