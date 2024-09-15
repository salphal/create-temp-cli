const path = require("path");

/**
 * @typedef {object} Context - 执行时的部门上下文信息
 *
 * @property {string} Context.__dirname - 执行脚本所在的绝对路径
 * @property {string} Context.fileName - 中划线全小写
 * @property {string} Context.compName - 小驼峰
 * @property {string} Context.CompName - 发驼峰
 * @property {string} Context.COMP_NAME - 下划线全大写
 * @property {string} Context.SHORT_COMP_NAME - 首写字母全大写
 * @property {string} Context.className - 类名( 等同于文件名 )
 */

/**
 * @typedef {object} Module - 模块配置
 *
 * @property {({}) => {}} Module.replacements - 用于替换模版中变量的集合
 * @property {any} Module.prompts - 自定义用户交互配置
 * @property {{[key: string]: any}} Module.outputPathMap - 输出路径的映射集合
 */

/**
 * 模版配置
 *
 * @param context {Context} - 执行期上下文
 *
 * @return {{
 *   front: {
 *      prefixList: Array<string>;
 *      react: Module;
 *      vue: Module;
 *   };
 *   backend: {
 *      prefixList: Array<string>;
 *      spring: Module;
 *      python: Module;
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
  const springJavaPath = joinPath(__dirname, springMainPath, 'java', springGroupPath, springArtifact);
  const springSourcesPath = joinPath(__dirname, springMainPath, 'resources');

  return {
    front: {
      prefixList: [
        "package/app1",
      ],
      react: {
        replacements: ({}) => ({}),
        outputPathMap: {},
      },
      vue: {
        replacements: ({}) => ({}),
        outputPathMap: {},
      }
    },
    backend: {
      prefixList: [],
      spring: {
        replacements: ({}) => ({
          springPackageName
        }),
        prompts: [
          {
          }
        ],
        outputPathMap: {
          controller: joinPath(springJavaPath, 'controller'),
          service: joinPath(springJavaPath, 'service'),
          ['service-impl']: joinPath(springJavaPath, 'service/impl'),
          mapper: joinPath(springJavaPath, 'mapper'),
          entity: joinPath(springJavaPath, 'entity'),
          dto: joinPath(springJavaPath, 'dto'),
          mybatis: joinPath(springSourcesPath, 'mappers'),
        }
      },
    },
  };
};

const templateConfig = createTempConfig({__dirname});
console.log("=>(template.config.cjs:85) templateConfig", templateConfig);

module.exports = createTempConfig;

