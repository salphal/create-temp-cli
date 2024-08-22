import fs from "fs-extra";

(async function () {

  // fs.stat('../aaa', (err, stat) => {
  //   if (err) {
  //     console.error('=>(test.js:8) err', err);
  //   } else {
  //     console.log('=>(test.js:8) stat', stat.isDirectory());
  //   }
  // });

  // await fs.pathExists('./a', (err, exists) => {
  //   console.log('=>(test.js:16) err', err);
  //   console.log('=>(test.js:16) exists', exists);
  // });

  fs.stat('.', (err, stats) => {
    console.log('=>(test.js:22) stats', stats.name);
    console.log('=>(test.js:22) stats', stats.path);
    console.log('=>(test.js:22) stats', stats.parentPath);
  });

  }());
