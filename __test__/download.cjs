const download = require('download-git-repo');

/**
 * https://gitlab.com/flippidippi/download-git-repo
 */

/**
 * @param config
 *  @property remote {string} - 远程仓库地址
 *  @property branch {string} - 远程分支名( 默认 master )
 *  @property isDirect {string} - 是否使用 http 直接从 url 下载
 *  @property outputPath {string} - 输出的本地路径( 以当前脚本为根路径, 若没有该文件夹则会自动创建, 若有则可能会冲突 )
 *  @property options {*} - clone 配置对象( 请求头等 )
 */
async function clone(config) {
  const { remote, branch, isDirect = true, outputPath, options = { clone: true } } = config;
  return new Promise((resolve, reject) => {
    /**
     * 使用 http 从 master 处的 Github 存储库下载
     * ?[bitbucket|gitlab]:[auth]/[registry]#[branch]
     *
     * 使用 http 直接从 url 下载
     * [direct]:[full_git_url]#[branch]
     */
    const url = `${isDirect ? 'direct:' : ''}${remote}#${branch}`;
    console.log('=>(download.cjs:28) url', url);
    download(
      'direct:https://github.com/salphal/create-temp-cli.git#main',
      outputPath,
      options,
      (err) => {
        // download(url, outputPath, options, (err) => {
        if (err) {
          reject(err);
        }
      },
    );
    resolve();
  });
}

clone({
  // direct:https://github.com/salphal/create-temp-cli.git#main
  remote: 'https://github.com/salphal/create-temp-cli.git',
  branch: 'main',
  outputPath: '.tmp',
});
