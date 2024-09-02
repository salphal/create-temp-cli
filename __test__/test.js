import fs from "fs-extra";

(async function () {

  const path = '/Users/alphal/github/create-temp-cli/.front-cli/publish.config1.json';

  fs.pathExists(path, (err, exists) => {
    if (err) {
      console.error('[ PATHEXISTS ERR ]',err);
    } else {
      console.log(`${path} ${exists ? 'already' : 'does not'} exists.`);
      fs.stat(path, (err, stats) => {
        if (err || !stats) {
          console.error('[ STAT ERR ]',err);
        } else {
          console.log("=>(test.js:22) stats", stats);
        }
      });
    }
    console.log("=>(test.js:14) exists", exists);
  });



}());
