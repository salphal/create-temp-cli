import path from "path";

const str = '/Users/alpha/github/front-cli/dist.tar.gz';

const {name, dir} = path.parse(str);
console.log('=>(tar.mjs:6) dir', dir);
console.log('=>(tar.mjs:6) name', name);

const ext = '.tar.gz';

const res = path.join(dir, name + ext);
console.log('=>(tar.mjs:12) res', res);

console.log('=>(tar.mjs:12) res', path.dirname(str));
