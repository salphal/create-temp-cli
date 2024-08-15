const path = '/Users/alpha/github/create-temp-cli/__template__/react/story-hook/template.test.tsx.template'


function getTemplateName(path) {
  const match = path.match(/__template__\/.*/);
  if (Array.isArray(match) && match.length) {
    const tempName = match[0].replace('__template__/', '');
    const tempNameList = tempName.split('/');
    if (tempNameList[tempNameList.length - 1].match(/\.template/)) {
      tempNameList.pop();
    }
    return tempNameList.join('/');
  } else {
    return path;
  }
}


const res = getTemplateName(path);
console.log('=>(test.js:18) res', res);
