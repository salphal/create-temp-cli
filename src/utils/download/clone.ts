import { download } from './download';

export interface DownloadConfig {
  /** 远程仓库地址 */
  remote: string;
  /** 远程分支名( 默认 master ) */
  branch: string;
  /** 输出的本地路径( 以当前脚本为根路径, 若没有该文件夹则会自动创建, 若有则可能会冲突 ) */
  outputPath: string;
  /** 是否使用 http 直接从 url 下载 */
  isDirect?: boolean;
  /** clone 配置对象( 请求头等 ) */
  options?: any;
}

export async function clone(config: DownloadConfig) {
  const { remote, branch, outputPath, isDirect = true, options = { clone: true } } = config;
  return new Promise((resolve, reject) => {
    /**
     * 使用 http 从 master 处的 Github 存储库下载
     * ?[bitbucket|gitlab]:[auth]/[registry]#[branch]
     *
     * 使用 http 直接从 url 下载
     * [direct]:[full_git_url]#[branch]
     */
    const url = `${isDirect ? 'direct:' : ''}${remote}#${branch}`;
    download(url, outputPath, options, (err: any) => {
      if (err) reject(err);
      resolve(1);
    });
  });
}
