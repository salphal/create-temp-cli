import path from "path";
import shell from "shelljs";
import {FsExtra} from "./file-extra";

export class TarExtra {

	/**
	 * 压缩文件( 默认压缩到文件所在目录 )
	 *
	 * tar -czvf dist.tar.gz dist
	 *
	 *
	 * @param src {string} - 输入的 文件/文件夹 的路径
	 * @param dest {string} - 输出目录的路径
	 */
	static async compress(src: string, dest?: string) {
		return new Promise(async (resolve, reject) => {

			const iseExists = await this.isExists(src);

			if (!iseExists) {
				console.error(`[ Tar Compress Err ]: ${src} is not exists`);
				reject(false);
			}

			const {dir, name} = path.parse(src);

			const fileName = this.getFileName(name);
			const destName = `${fileName}.tar.gz`;

			const cdSrcDirCmd = `cd ${dir}`;
			const compressCmd = `tar -czvf ${destName} ${fileName}`;
			const mvDistCmd = (destDir: string) => `mv ${dir}/${destName} ${destDir}`

			const cmdList = [
				cdSrcDirCmd,
				compressCmd,
			];

			if (typeof dest === 'string' && !!dest) {
				const destIsDir = await this.isDir(dest);
				if (destIsDir) {
					cmdList.push(mvDistCmd(dest));
				}
			}

			const command = this.getCmd(cmdList);
			console.log(`[ Compress Command ]: ${command}`);

			shell.exec(command, (error, stdout, stderr) => {
				if (error !== 0) {
					console.error('[ Tar Compress Err ]:', error);
					reject(false);
				}
				console.log(`[ TarExtra.compress ]: Success compress ${src} to ${dest || dir}`);
				resolve(`${dir}/${destName}`);
			});
		});
	}

	/**
	 * 解压文件( 默认解压到文件所在目录 )
	 *
	 * tar -xzvf dist.tar.gz
	 *
	 * @param src {string} - 输入的 文件/文件夹 的路径
	 * @param dest
	 */
	static async decompress(src: string, dest?: string) {
		return new Promise(async (resolve, reject) => {

			const isFile = await this.isFile(src);

			if (!isFile) {
				reject(false);
			}

			if (!this.isTarGzExt(src)) {
				reject(false);
			}

			const {dir, name} = path.parse(src);

			const fileName = this.getFileName(name);
			const destName = `${fileName}.tar.gz`;

			const cdSrcDirCmd = `cd ${dir}`;
			const compressCmd = `tar -xzvf ${destName}`;
			const mvDistCmd = (destDir: string) => `mv ${dir}/${fileName} ${destDir}`

			const cmdList = [
				cdSrcDirCmd,
				compressCmd,
			];

			if (typeof dest === 'string' && !!dest) {
				const destIsDir = await this.isDir(dest);
				if (destIsDir) {
					cmdList.push(mvDistCmd(dest));
				}
			}

			const command = this.getCmd(cmdList);
			console.log(`[ Compress Command ]: ${command}`);

			shell.exec(command, (error, stdout, stderr) => {
				if (error !== 0) {
					console.error('[ Tar Decompress Err ]', error);
					reject(false);
				}
				console.log(`[ TarExtra.decompress ]: Success decompress ${dir}/${fileName} to ${dest || dir}`);
				resolve(`${dir}/${destName}`)
			});

		});
	}

	static async isExists(path: string) {
		return await FsExtra.pathExists(path);
	}

	static async isFile(path: string) {
		return await FsExtra.isFile(path);
	}

	static async isDir(path: string) {
		return await FsExtra.isDir(path);
	}

	static isTarGzExt(fileName: string) {
		return /.*(\.tar\.gz)$/.test(fileName);
	}

	static getFileName(fullPath: string): string {
		if (typeof fullPath !== 'string' || fullPath.length <= 0) return "";
		const pathList = fullPath.split(path.sep);
		const name = pathList[pathList.length - 1];
		if (name.indexOf('.') !== -1) {
			return name.slice(0, name.indexOf('.'));
		}
		return name;
	}

	static getCmd(cmdList: string[]) {
		let command = "";
		cmdList.forEach((cmd, i) => {
			if (i === 0) {
				command += `${cmd}`;
			} else {
				command += ` && ${cmd}`;
			}
		});
		return command;
	}
}
