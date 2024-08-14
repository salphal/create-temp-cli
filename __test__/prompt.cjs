#!/usr/bin/env node


const prompts = require('prompts');


/**
 * @param type - 执行类型, 为 null 则跳过
 * @param name {string} -
 * @param message {string} - 提示消息
 * @param initial {*} - 默认值
 * @param onRender {Function} - 状态改变时回调
 * @param onState {Function} - 状态改变时回调
 */

const questions = [
  {
    type: 'text',
    name: 'text',
    message: '字符串输入',
    initial: 'default value',
  },
  {
    type: 'number',
    name: 'age',
    message: '数字输入',
    min: 2,
    max: 10
  },
  {
    type: 'confirm',
    name: 'value',
    message: '确认 弹窗',
    initial: true
  },
  {
    type: 'toggle',
    name: 'value',
    message: '是/否 确认弹窗',
    initial: true,
    active: 'yes',
    inactive: 'no'
  },

  {
    type: 'password',
    name: 'value',
    message: '密码输入'
  },

  {
    type: 'list',
    name: 'value',
    message: '输入列表',
    initial: '',
    separator: ','
  },

  {
    type: 'select',
    name: 'value',
    message: 'Select 单选',
    choices: [
      { title: 'Red', description: 'This option has a description', value: '#ff0000' },
      { title: 'Green', value: '#00ff00', disabled: true },
      { title: 'Blue', value: '#0000ff' }
    ],
    initial: 1
  },
  {
    type: 'multiselect',
    name: 'value',
    message: 'Select 多选',
    choices: [
      { title: 'Red', value: '#ff0000' },
      { title: 'Green', value: '#00ff00', disabled: true },
      { title: 'Blue', value: '#0000ff', selected: true }
    ],
    max: 2,
    hint: '- Space to select. Return to submit'
  },
  {
    type: 'multiselect',
    name: 'color',
    message: '根据输入匹配 单选',
    choices: [
      { title: 'Red', value: '#ff0000' },
      { title: 'Green', value: '#00ff00' },
      { title: 'Blue', value: '#0000ff' }
    ],
  },

  {
    type: null,
    name: 'forget me',
    message: `type 为 null, 则会跳过该提示`,
  },
];

const onCancel = prompt => {
  console.log('Never stop prompting!');
  return true;
}

(async () => {
  const response = await prompts(questions, { onCancel });
  console.log(response);
})();

