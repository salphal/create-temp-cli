import {input, select, confirm, checkbox, search} from '@inquirer/prompts';

export interface PromptChoice {
  name: string;
  value: any;
  description?: string;
  disabled?: boolean;
}

export type PromptChoices = Array<PromptChoice>;


/**
 * https://github.com/SBoudrias/Inquirer.js
 */

class Prompt {

  /**
   * https://github.com/SBoudrias/Inquirer.js/tree/main/packages/input
   */
  static async input(message: string, config: any = {}) {
    return input({message, ...config});
  }

  /**
   * 调用接口返回的数据并生成选项
   * https://github.com/SBoudrias/Inquirer.js/blob/main/packages/search/README.md
   */
  static async search(message: string, options: () => Promise<Array<PromptChoice>>, config: any = {}) {
    return search({message, source: options, ...config});
  }

  /**
   * https://github.com/SBoudrias/Inquirer.js/tree/main/packages/select
   */
  static async select(message: string, options: PromptChoices, config: any = {}) {
    return select({message, choices: options, ...config});
  }

  /**
   * https://github.com/SBoudrias/Inquirer.js/blob/main/packages/checkbox/README.md
   */
  static async checkbox(message: string, options: PromptChoices, config: any = {}) {
    return checkbox({message, choices: options, ...config});
  }

  /**
   * https://github.com/SBoudrias/Inquirer.js/blob/main/packages/confirm/README.md
   */
  static async confirm(message: string, config: any = {}) {
    return confirm({message, ...config});
  }
}

export default Prompt;
