import clone from "../../utils/clone";
import fs from "fs-extra";
import path from "path";
import {copy, copyDir} from "../../utils/module/directory";
import Logger from "../../utils/logger";
import Loading from "../../utils/loading";


/**
 * 下载预设模版和环境变量配置文件
 */
export function cloneTemplates(ctx: any) {
	clone({
		remote: 'https://github.com/salphal/create-temp-cli.git',
		branch: 'main',
		outputPath: '.tmp'
	})
		.then(res => {
			Loading.start('Downloading __template__ directory and .temp_env file');
			const stat = fs.statSync(path.resolve(ctx.__dirname, '.tmp/__template__'));
			if (stat.isDirectory()) {
				copyDir(path.join(ctx.__dirname, '.tmp/__template__'), path.join(ctx.__dirname, '__template__'));
				Logger.success("Successfully downloaded __template__ directory");
				copy(path.join(ctx.__dirname, '.tmp/.temp.env'), path.join(ctx.__dirname, '.temp.env'));
				Logger.success("Successfully downloaded .temp.env file");
				/**
				 * TODO: 删除 .tmp 临时文件
				 */
			}
		})
		.catch(err => {
			Logger.error(err);
		})
		.finally(() => {
			Loading.end();
			Logger.success('Success load __template__');
		});
}