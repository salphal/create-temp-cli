const path = require("path");

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
 *      prefixList: Array<string>;
 *      beforePrompts: ({[key: string]: any}) => Array<any>;
 *      beforeContext: ({[key: string]: any}) => {[key: string]: any};
 *      outputPathMap: ({[key: string]: any}) => {[key: string]: any};
 *   };
 * }}
 */
createTempConfig = (context) => {
  const {__dirname} = context;
  const joinPath = (...p) => path.join(...p);

  const springGroupPath = 'com/example';
  const springArtifact = 'demo';
  const springPackageName = `com.example.${springArtifact}`;
  const springMainPath = 'src/main';
  const springJavaPath = ({prefix = ''}) => joinPath(__dirname, prefix, springMainPath, 'java', springGroupPath, springArtifact);
  const springSourcesPath = ({prefix = ''}) => joinPath(__dirname, prefix, springMainPath, 'resources');

  return {
    "front/react": {
      prefixList: [],
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({}),
      outputPathMap: (ctx) => ({}),
    },
    "front/vue": {
      prefixList: [],
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({}),
      outputPathMap: (ctx) => ({}),
    },
    "backend/spring": {
      prefixList: [],
      beforePrompts: ({}) => [],
      beforeContext: ({}) => ({
        prefix: "", // 通过选择 prefixList 后得到
        packageName: springPackageName
      }),
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

const templateConfig = createTempConfig({__dirname});
console.log("=>(template.config.cjs:85) templateConfig", templateConfig);

module.exports = createTempConfig;

