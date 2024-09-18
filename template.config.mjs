import path from 'node:path';

/**
 * 模版配置
 *
 * @param context {Context} - 执行期上下文
 * @property {string} Context.__dirname - 执行脚本所在的绝对路径
 * @property {string} Context.fileName - 中划线全小写
 * @property {string} Context.compName - 小驼峰
 * @property {string} Context.CompName - 发驼峰
 * @property {string} Context.COMP_NAME - 下划线全大写
 * @property {string} Context.SHORT_COMP_NAME - 首写字母全大写
 * @property {string} Context.className - 类名( 等同于文件名 )
 *
 * @return {{
 *   [keu: string]: {
 *      beforeContext: ({[key: string]: any}) => {[key: string]: any};
 *      outputPathMap: ({[key: string]: any}) => {[key: string]: any};
 *      outputPrefixList: Array<string>;
 *      beforePrompts: ({[key: string]: any}) => Array<{
 *        message: string;
 *        choices?: Array<{
 *          title: string;
 *          value: any;
 *        }>;
 *      }>;
 *   };
 * }}
 *
 */
const createTempConfig = (context) => {
  const {__dirname} = context;
  const joinPath = (...p) => path.join(...p);

  const springGroupPath = 'com/example';
  const springArtifact = 'demo';
  const springPackageName = `com.example.${springArtifact}`;
  const springMainPath = 'src/main';

  /**
   * @param ctx {object}
   */
  const springJavaPath = ({prefix = ''}) => joinPath(__dirname, prefix, springMainPath, 'java', springGroupPath, springArtifact);
  /**
   * @param ctx {object}
   */
  const springSourcesPath = ({prefix = ''}) => joinPath(__dirname, prefix, springMainPath, 'resources');

  return {
    "front/react": {
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({}),
      outputPrefixList: [],
      outputPathMap: (ctx) => ({}),
    },
    "front/vue": {
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({}),
      outputPrefixList: [],
      outputPathMap: (ctx) => ({}),
    },
    "backend/spring": {
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({
        prefix: "", // 通过选择 outputPrefixList 后得到
        packageName: springPackageName
      }),
      outputPrefixList: [
        "app1",
        "app2",
        "app3",
      ],
      outputPathMap: (ctx) => ({
        controller: joinPath(springJavaPath(ctx), 'controller'),
        service: joinPath(springJavaPath(ctx), 'service'),
        ['service-impl']: joinPath(springJavaPath(ctx), 'service/impl'),
        mapper: joinPath(springJavaPath(ctx), 'mapper'),
        mybatis: joinPath(springSourcesPath(ctx), 'mappers'),
        dto: joinPath(springJavaPath(ctx), 'dto'),
        entity: joinPath(springJavaPath(ctx), 'entity'),
      }),
    },
  };
};

export default createTempConfig;
