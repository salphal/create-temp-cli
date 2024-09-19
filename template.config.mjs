import path from 'path';

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
 */
const createTempConfig = (context) => {
  const { __dirname } = context;
  const joinPath = (...p) => path.join(...p);

  const springGroupPath = 'com/example';
  const springArtifact = 'demo';
  const springPackageName = `com.example.${springArtifact}`;
  const springMainPath = 'src/main';

  /**
   * @param ctx {object}
   */
  const springJavaPath = ({ prefix = '' }) =>
    joinPath(__dirname, prefix, springMainPath, 'java', springGroupPath, springArtifact);
  /**
   * @param ctx {object}
   */
  const springSourcesPath = ({ prefix = '' }) =>
    joinPath(__dirname, prefix, springMainPath, 'resources');

  return {
    'front/react': {
      data: (ctx) => {
        return {};
      },
      promptList: [],
    },
    'front/vue': {
      data: (ctx) => {
        return {};
      },
      promptList: [],
    },
    'backend/spring': {
      data: () => {
        return {
          packageName: springPackageName,
          outputPathMap: (ctx) => ({
            controller: joinPath(springJavaPath(ctx), 'controller'),
            service: joinPath(springJavaPath(ctx), 'service'),
            ['service-impl']: joinPath(springJavaPath(ctx), 'service/impl'),
            mapper: joinPath(springJavaPath(ctx), 'mapper'),
            mybatis: joinPath(springSourcesPath(ctx), 'mappers'),
            dto: joinPath(springJavaPath(ctx), 'dto'),
            entity: joinPath(springJavaPath(ctx), 'entity'),
          }),
          prefixList: ['app1', 'app2', 'app3'],
        };
      },
      promptList: [
        {
          type: 'text',
          name: 'input',
          message: 'Please enter a demo',
          initial: 'defaultValue',
        },
        {
          type: 'autocomplete',
          name: 'select',
          message: 'Please enter a demo',
          choices: [
            { title: 'option1', value: 'option1' },
            { title: 'option2', value: 'option2' },
            { title: 'option3', value: 'option3' },
          ],
          initial: 'defaultValue',
        },
        {
          type: 'toggle',
          name: 'confirm',
          message: 'Can you confirm?',
          active: 'yes',
          inactive: 'no',
          initial: true,
        },
        {
          type: 'number',
          name: 'number',
          message: 'How old are you?',
          style: 'default',
          min: 2,
          max: 10,
          initial: 0,
        }
      ],
    },
  };
};

export default createTempConfig;
