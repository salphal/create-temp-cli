import fs from 'fs-extra';
import path from 'path';

(async function () {
  const str = '/Users/alphal/github/create-temp-cli/.front-cli/publish.config1.json';

  // fs.pathExists(path, (err, exists) => {
  //   if (err) {
  //     console.error('[ PATHEXISTS ERR ]',err);
  //   } else {
  //     console.log(`${path} ${exists ? 'already' : 'does not'} exists.`);
  //     fs.stat(path, (err, stats) => {
  //       if (err || !stats) {
  //         console.error('[ STAT ERR ]',err);
  //       } else {
  //         console.log("=>(test.js:22) stats", stats);
  //       }
  //     });
  //   }
  //   console.log("=>(test.js:14) exists", exists);
  // });

  function getFileName(fullPath) {
    if (typeof fullPath !== 'string' || fullPath.length <= 0) return '';
    const pathList = fullPath.split(path.sep);
    const name = pathList[pathList.length - 1];
    if (name.indexOf('.') !== -1) {
      return name.slice(0, name.indexOf('.'));
    }
    return name;
  }

  console.log('=>(test.js:25) getFileName', getFileName(str));
})();
