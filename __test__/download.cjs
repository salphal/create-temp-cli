const download = require('download-git-repo');
const path = require("path");

async function clone(config) {
  const {remote, outputPath, options = {clone: true}} = config;
  return new Promise((resolve, reject) => {
    download(remote, outputPath, options, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}


clone({
  remote: 'direct:https://github.com/salphal/request.git#main',
  outputPath: 'test'
});

