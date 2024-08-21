(function () {

  const obj = {
    a: 1,
    b: 2,
    c: 3
  };

  const {a, b, c} = obj;

  obj.a = 333;
  console.log('=>(test.js:12) obj', obj);


// function func() {
//
// }
//
// async function asyncFunc() {
//
// }
//
// console.log('=>(test.js:4) test', typeof func);
// console.log('=>(test.js:4) test', typeof func.constructor);
// console.log('=>(test.js:4) funcName', typeof func.name);
// console.log('=>(test.js:4) isAsyncFunc', typeof asyncFunc);

}());
