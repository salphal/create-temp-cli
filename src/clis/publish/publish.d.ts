export interface LocalConfig {
	/** 构建产物的名称 */
	outputName: string;
}

export interface IServer {
	/** ip地址 */
	host: string;
	/** 端口 */
	port: number;
	/** 用户名 */
	username: string;
	/** 密码 */
	password: string;
	/** ssh 私钥 路径 */
	privateKey?: string;
}

export interface IJumpServer extends IServer {
}

export interface IBackup {
	/** 时间格式 */
	format: string;
	/** 备份最大数量 */
	max: number;
}

export interface ServerConfig {
	/** 连接服务器的配置信息 */
	connect: IServer;
	/** 跳板机配置 */
	jumpServer?: IJumpServer;
	/** 备份信服 */
	backup: IBackup;
	/** 服务器构建产物所在的据对路径 */
	staticAbsolutePath: string;
	/** 重启服务器的命令 */
	restartCommand: string;
}

export interface PublishConfig {
	/** 当前配置环境的名称 */
	envName: string;
	/** 本地配置信息 */
	local: LocalConfig;
	/** 服务器配置信息 */
	server: ServerConfig;
}


export type PublishConfigList = Array<PublishConfig>;
