import { table } from 'table';

// Using commonjs?
// const { table } = require('table');

const data = [
  ['name', 'age', 'gender'],
  ['alpha', '18', 'male'],
  ['beta', '20', 'female'],
];

console.log(table(data));
