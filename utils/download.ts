// @ts-ignore
import download from 'download-git-repo';
import ora from 'ora';
import {red, green} from 'kolorist';

interface DownloadConfig {
	remote: string;
	branch: string;
	options?: any;
}

async function clone(config: DownloadConfig) {
	const spinner = ora("Pulling code...").start();
	const {remote, branch, options = {clone: true}} = config;
	return new Promise((resolve, reject) => {
		download(remote, branch, options, (err: any) => {
			if (err) {
				spinner.fail(red(err));
				reject(err);
			}
		});
		spinner.succeed(green(`Success pull ${remote}/${branch}`));
		resolve(0);
	});
}

export default clone;
