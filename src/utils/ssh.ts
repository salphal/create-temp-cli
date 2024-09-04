import { Client, ClientChannel } from 'ssh2';
import path from 'path';
import { PathExtra } from '@utils/path-extra';
import { TarCmd } from '@utils/tar-cmd';

interface BaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  privateKey?: string;
}

export interface ServerConfig extends BaseConfig {}

export interface JumpServerConfig extends BaseConfig {}

export interface SSHConfig {
  connect: ServerConfig;
  jumpServer?: JumpServerConfig;
}

export class SSH {
  config: SSHConfig;

  /** 服务器配置 */
  serverConfig: ServerConfig;
  /** 跳板机配置 */
  jumpServerConfig: JumpServerConfig | undefined;

  /** 服务器客户端 */
  _client = new Client();
  /** 跳板机客户端 */
  _jumpClient = new Client();

  constructor(config: SSHConfig) {
    this.config = config;
    this.serverConfig = config.connect;
    if (config.jumpServer) this.jumpServerConfig = config.jumpServer;
  }

  /**
   * 直接连接服务器
   */
  async connect(stream?: ClientChannel): Promise<SSH> {
    const _this = this;
    console.log('[ connect server config ]', _this.serverConfig);

    return new Promise(function (resolve, reject) {
      _this._client
        .on('ready', () => {
          console.log('[ connect ready ]');

          // _this.exec('ll');
          // _this.exec('ip addr show | grep 192.168');
          resolve(_this);
        })
        .on('error', (err) => {
          console.log('[ connect error ]', err);
          reject(err);
        })
        .on('close', () => {
          console.log('[ connect closed ]');
        })
        .connect(
          stream
            ? {
                sock: stream, // Use the forwarded stream to connect to the inner server
                username: _this.serverConfig.username,
                password: _this.serverConfig.password,
              }
            : {
                host: _this.serverConfig.host,
                port: _this.serverConfig.port,
                username: _this.serverConfig.username,
                password: _this.serverConfig.password,
              },
        );
    });
  }

  /**
   * 跳板机连接服务器
   */
  async forwardOutConnect(): Promise<SSH> {
    const _this = this;

    if (!_this.jumpServerConfig) {
      console.log('[ forward connect err ]: jumpServerConfig is not exists');
      return Promise.reject(false);
    }

    console.log('[ forward connect server config ]', _this.jumpServerConfig);

    return new Promise((resolve, reject) => {
      _this._jumpClient
        .on('ready', () => {
          console.log('[ forward connect ready ]');

          _this._jumpClient.forwardOut(
            _this.jumpServerConfig!.host,
            _this.jumpServerConfig!.port,
            _this.serverConfig.host,
            _this.serverConfig.port,
            async (err, stream) => {
              if (err) {
                console.error('[ forward connect err ]', err);
                reject(err);
                return;
              }

              const ssh = await this.connect(stream);
              if (ssh) resolve(ssh);
            },
          );
        })
        .on('error', (err) => {
          console.log('[ forwardout connect error ]');
          reject(err);
        })
        .on('close', () => {
          console.log('[ forwardout connect closed ]');
        })
        .connect({
          host: _this.jumpServerConfig!.host,
          port: _this.jumpServerConfig!.port,
          username: _this.jumpServerConfig!.username,
          password: _this.jumpServerConfig!.password,
        });
    });
  }

  /**
   * 在服务器上执行 shell 命令
   *
   * @param cmd {string} - 执行的 shell 命令
   * @param isEnd {boolean} - 是否是最后一条, 如果是则关闭连接
   */
  async exec(cmd: string, isEnd = false) {
    const _this = this;
    console.log(`[ exec command ]: ${cmd}`);

    return new Promise((resolve, reject) => {
      _this._client.exec(cmd, (err, stream) => {
        if (err) {
          console.log('[ exec err ]', err);
          reject(err);
        }

        let stdout = '';
        let stderr = '';

        stream
          /**
           * 标记数据流的结束, 通常用于清理和关闭连接
           *
           * @param code {number}
           *  - 0 成功
           * @param signal {string | undefined} - 进程是否终止
           *  - string 终止信号的名称
           *  - undefined 没有被终止
           */
          .on('close', (code: number, signal: string | undefined) => {
            if (code === 0) {
              resolve(stdout);
            } else {
              console.log('[ exec close ]', code, signal);
              reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
            }
            isEnd && _this.end();
          })
          /**
           * 处理来自标准输出的正常命令输出
           */
          .on('data', (data: ArrayBuffer) => {
            stdout += data.toString();
            console.log('[ exec result ]', stdout);
            resolve(stdout);
          })
          /**
           * 处理来自标准错误输出的错误信息
           */
          .stderr.on('data', (data) => {
            stderr += data.toString();
            console.log('[ exec stderr ]', stderr);
            reject(stderr);
          });
      });
    });
  }

  /**
   * 文件上传
   *
   * @param localPath {string} - 本地文件的路径
   * @param remotePath {string} - 上传文件的服务器路径
   *
   * eg: upload("/path/to/dist.tar.gz", "/opt/dist.tar.gz");
   */
  async upload(localPath: string, remotePath: string): Promise<void> {
    const _this = this;

    return new Promise((resolve, reject) => {
      _this._client.sftp((err, sftp) => {
        if (err) {
          console.error('[ upload err ]:', err);
          reject(err);
        }

        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) {
            console.error('[ upload fast put err ]:', err);
            reject(err);
          }
          console.log(`[ upload ]: success upload ${localPath} to ${remotePath}`);
          resolve();
        });
      });
    });
  }

  /**
   * 文件下载
   *
   * @param remotePath {string} - 服务器文件的路径
   * @param localPath {string} - 下载到本地的路径
   *
   * eg: .download('/opt/dist.tar.gz', '/path/to/dist.tar.gz');
   */
  async download(remotePath: string, localPath: string): Promise<void> {
    const _this = this;

    return new Promise((resolve, reject) => {
      _this._client.sftp((err, sftp) => {
        if (err) {
          console.error('[ download error ]:', err);
          reject(err);
        }

        sftp.fastGet(remotePath, localPath, (err) => {
          if (err) {
            console.error('[ download fast get error ]:', err);
            reject(err);
          }
          console.log(`[ download ]: success download ${remotePath} to ${localPath}`);
          resolve();
        });
      });
    });
  }

  end() {
    this._client.end();
    this._jumpClient.end();
  }

  async pwd() {
    const command = `pwd`;
    return await this.exec(command);
  }

  async ls(path = '', hasAll = false) {
    const all = hasAll ? '-a' : '';
    const command = path ? `ls "${path}" ${all}` : `ls ${all}`;
    try {
      const result = (await this.exec(command)) as string;
      return result.trim().split('\n');
    } catch (err) {
      throw new Error(`Failed to list directory: ${err}`);
    }
  }

  async cd(path: string) {
    const command = `cd ${path}`;
    return await this.exec(command);
  }

  async cp(src: string, dest: string) {
    const command = `cp -r ${src} ${dest}`;
    return await this.exec(command);
  }

  async mv(src: string, dest: string) {
    const command = `mv ${src} ${dest}`;
    return await this.exec(command);
  }

  async rm(...paths: string[]) {
    const command = `rm -rf ${paths.join(' ')}`;
    return await this.exec(command);
  }

  async mkdir(path: string) {
    const command = `mkdir -p ${path}`;
    return await this.exec(command);
  }

  async touch(path: string) {
    const command = `touch ${path}`;
    return await this.exec(command);
  }

  async exist(path: string) {
    const command = `[ -e "${path}" ] && echo "true" || echo "false"`;
    const result = (await this.exec(command)) as string;
    return result.trim() === 'true';
  }

  async isFile(path: string) {
    const command = `[ -f "${path}" ] && echo "true" || echo "false"`;
    const result = (await this.exec(command)) as string;
    return result.trim() === 'true';
  }

  async isDir(path: string) {
    const command = `[ -d "${path}" ] && echo "true" || echo "false"`;
    const result = (await this.exec(command)) as string;
    return result.trim() === 'true';
  }

  /**
   * 压缩文件
   *
   * @param src {string} - 远程文件的路径
   * @param dest {string} - 压缩文件的路径
   *
   * eg: tar('/opt/dist', '/opt/dist.tar.gz');
   */
  async tar(src: string, dest: string | null = null) {
    const command = TarCmd.getTarCmd(src, dest);
    return await this.exec(command);
  }

  /**
   * 解压文件
   *
   * @param src {string} -
   * @param dest {string} -
   *
   * eg: untar('/opt/dist.tar.gz', '/opt');
   */
  async untar(src: string, dest: string | null = null) {
    const command = TarCmd.getUnTarCmd(src, dest);
    return await this.exec(command);
  }
}

// const ssh = new SSH({});
// ssh
//   .connect()
//   .then((client) => {
//      client.end();
//   })
//   .catch((err) => {})
//   .finally(() => {});
