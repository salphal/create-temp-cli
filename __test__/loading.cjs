import ora from 'ora';


/**
 * https://github.com/sindresorhus/ora
 */


const spinner = ora('Loading unicorns').start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);