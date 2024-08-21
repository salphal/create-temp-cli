import fs from 'fs-extra';


const readJson = fs.readJSONSync(new URL("../package.json", import.meta.url));

console.log("=>(readJson.mjs:4) readJson", readJson);
