(function () {

  function func() {

  }

  async function asyncFunc() {

  }

  console.log('=>(test.js:4) test', typeof func);
  console.log('=>(test.js:4) test', typeof func.constructor);
  console.log('=>(test.js:4) funcName', typeof func.name);
  console.log('=>(test.js:4) isAsyncFunc', typeof asyncFunc);

}());
