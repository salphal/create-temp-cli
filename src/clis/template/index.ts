import path from 'path';
import {
  ResCode,
  StepList,
  StepScheduler,
  FrontCli,
  FsExtra,
  Logger,
  PromptChoices,
  Prompt,
} from '@utils';
import {
  getAllTempInfoByTempDirPathList,
  getCurTempInfoListByTempName,
  getReplacements,
  writeTempListToTarget,
} from './utils/template';
import { Envs } from '@type/env';
import { CliEnvs, TempInfoList } from './template';
import { CLI_CONFIG_FILE_NAME, OUTPUT_FILE_NAME, TEMPLATE_FILE_NAME } from '@constants/common';

interface TemplateContext extends Envs<CliEnvs> {
  /** 默认模版目录路径 */
  tempDirPath: string;
  /** 默认输出目录路径 */
  outputDirPath: string;

  /** 所有模版信息列表集合 */
  allTempInfoList: TempInfoList;

  /** 模版目录列表 */
  tempDirPathList: string[];

  /** 用户交互的结果 */
  questionResult: {
    tempName: string;
    // compName: string;
    fileName: string;
    outputPath: string;
  };
  /** 输出选项 */
  outputPathChoices: PromptChoices;
  /** 模版选项 */
  tempNameChoices: PromptChoices;

  /** 用于模版中的变量 */
  replacements: {
    CompName: string;
    compName: string;
    COMP_NAME: string;
    SHORT_COMP_NAME: string;
    className: string;
    fileName: string;
  };
}

interface TemplateOptions {
  /** 外部注入的运行时上下文的数据 */
  ctx: Envs<CliEnvs> & {};
}

export class TemplateCli extends FrontCli<TemplateContext> {
  context: TemplateContext = {
    tempDirPath: '',
    outputDirPath: '',

    allTempInfoList: [],
    tempDirPathList: [],

    questionResult: {
      tempName: '',
      fileName: '',
      outputPath: '',
    },
    replacements: {
      CompName: '',
      compName: '',
      COMP_NAME: '',
      SHORT_COMP_NAME: '',
      className: '',
      fileName: '',
    },
    tempNameChoices: [],
    outputPathChoices: [
      { title: '__output__', value: '.' },
      { title: 'src/pages', value: 'src/pages' },
      { title: 'src/views', value: 'src/views' },
      { title: 'src/components', value: 'src/components' },
      { title: 'src/hooks', value: 'src/hooks' },
      { title: 'src/store', value: 'src/store' },
      { title: 'lib', value: 'lib' },
      { title: 'lib/components', value: 'lib/components' },
      { title: 'lib/hooks', value: 'lib/hooks' },
    ],

    argv: {},
    __dirname: '',
    __filename: '',
    envs: {},
  };

  stepList: StepList = [
    this.customConfigStep(this.context),
    {
      name: 'step_01',
      remark: `
      - 载入自定义模版配置
      - 扫描模版目录下的所有模版文件
        - 并生成模版信息列表
        - 根据模版信息文件生成模版选项选项列表
    `,
      callback: async (ctx: any) => {
        const { tempDirPathList, envs, __dirname } = this.context;

        const tempDirPath = path.join(__dirname, `${CLI_CONFIG_FILE_NAME}/${TEMPLATE_FILE_NAME}`);
        const outputDirPath = path.join(__dirname, OUTPUT_FILE_NAME);

        this.context.tempDirPath = tempDirPath;
        this.context.outputDirPath = outputDirPath;
        this.context.tempDirPathList.push(tempDirPath);

        /** 获取所有 模版目录下的 所有模版 */
        const allTempInfoList = await getAllTempInfoByTempDirPathList(tempDirPathList);
        this.context.allTempInfoList = allTempInfoList;

        /** 根据扫描模目录下的文件, 设置模版选项列表 */
        this.context.tempNameChoices = allTempInfoList;

        if (!allTempInfoList.length) {
          /** 模版目录下没有任何模版 */
          Logger.error('Template directory is empty, has nothing templates');
          process.exit(1);
        } else if (!this.context.tempNameChoices.length) {
          /** 模版选项为空 */
          Logger.error('Has nothing template choices');
          process.exit(1);
        }

        return {
          code: ResCode.next,
          data: { ...ctx },
        };
      },
    },

    {
      name: 'step_02',
      remark: `
      用户交互获取数据
        1. 选择模版
        2. 输入组件名
        3. 输入文件名
        4. 是否自定义输出路径
          - 是:
            - 根据预设和环境变量配置的选项选择
            - 自定义输入
          - 否: 默认输出路径( __output__ )
    `,
      callback: async (ctx: any) => {
        const tempName = await Prompt.autocomplete(
          'Please pick a template',
          this.context.tempNameChoices,
        );

        const fileName = await Prompt.input(
          'Please enter component file name. ( default: template )',
          { default: 'template' },
        );

        let outputPath = '.';
        /** 若使用用户自定义的输出路径则不执行该步骤 */
        if (ctx.customConfigStep && !ctx.customConfigStep.useOutputPathMap) {
          outputPath = await Prompt.autocomplete(
            'Please pick a template',
            this.context.outputPathChoices,
            { default: '.' },
          );
        }

        /** 保存用户交互的结果 */
        this.context.questionResult = {
          tempName,
          // compName,
          fileName,
          outputPath,
        };

        /** 模版中变量的映射集合 */
        this.context.replacements = getReplacements({ fileName });
        Logger.infoObj('replacements', this.context.replacements);

        return {
          code: ResCode.next,
          data: { ...ctx },
        };
      },
    },

    {
      name: 'step_03',
      remark: `
			根据用户选择的信息更新配置
				- 更新当前选中的模版
				- 更新输出路径
		`,
      callback: async (ctx: any) => {
        const {
          questionResult: { tempName, outputPath },
          allTempInfoList,
          __dirname,
        } = this.context;

        /**
         * 获取当前模板信息的文件列表
         */
        const curTempInfoList = await getCurTempInfoListByTempName(tempName, allTempInfoList);

        /**
         * 判断当前模版是否有效
         */
        if (!curTempInfoList.length) {
          Logger.error('Current template info is empty');
          process.exit(1);
        }

        /** 根据用户输入更新输出目录 */
        if (outputPath.trim() !== '.') {
          this.context.outputDirPath = path.join(__dirname, outputPath);
        }

        return {
          code: ResCode.next,
          data: {
            ...ctx,
            curTempInfoList,
          },
        };
      },
    },

    {
      name: 'step_04',
      remark: `
			根据配置信息
				1. 创建输出目录( 若已有则清空该目录, 若没有则创建 )
				2. 将模版文件写入到输出目录
					a. 替换文件中的变量
		`,
      callback: async (ctx: any) => {
        const {
          questionResult: { tempName },
          replacements: { fileName },
          outputDirPath,
        } = this.context;

        /** 在项目根路径下创建默认输出目录 */
        await FsExtra.makeDir(this.context.outputDirPath);

        /**
         * 在输出目录下 创建输出的组件目录
         *  - 已有: 则清空该目录下的所有文件
         *  - 没有: 则创建一个
         */
        const isCreated = await FsExtra.makeDir(path.join(this.context.outputDirPath, fileName));

        if (!isCreated) {
          Logger.error(`Could not create directory: ${outputDirPath}/${fileName}`);
          process.exit(1);
        }

        /**
         * 1. 读取文件
         * 2. 替换其中的变量
         * 3. 输出到指定目录的文件中
         */
        const isWritten = await writeTempListToTarget(ctx.curTempInfoList, {
          tempName,
          fileName,
          outputDirPath,
          replacements: this.context.replacements,
        });

        if (isWritten) {
          Logger.success(`Success create ${fileName} by ${tempName}`);
          Logger.success(`Already written to ${outputDirPath}/${fileName}`);
        } else {
          Logger.error(`Create fail ${fileName} by ${tempName}`);
        }

        return {
          code: ResCode.end,
          data: {},
        };
      },
    },
  ];

  scheduler: StepScheduler;

  constructor(options: TemplateOptions) {
    super(options);
    this.context = { ...this.context, ...options.ctx };
    this.scheduler = new StepScheduler({ stepList: this.stepList });
  }

  create() {
    this.start();
  }
}
