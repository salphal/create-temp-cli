import prompts from "prompts";

export interface PromptChoice {
	title: string;
	value: any;
	description?: string;
	disabled?: boolean;
}

export type PromptChoices = Array<PromptChoice>;

/**
 * prompts      v
 * https://github.com/terkelg/prompts
 * 功能更全
 */

/**
 * @inquirer/prompts
 * https://github.com/SBoudrias/Inquirer.js
 */

class Prompt {

	/**
	 * 文本输入
	 */
	static async input(message: string, config: any = {}) {
		const res = await prompts({type: 'text', name: 'value', message, ...config});
		return `${res.value || config.default}`;
	}

	/**
	 * 数字输入
	 */
	static async number(message: string, config: any = {}) {
		const res = await prompts({type: 'number', name: 'value', message, ...config});
		return +(res.value || config.default);
	}

	/**
	 * 单选
	 */
	static async singleSelect(message: string, choices: PromptChoices, config: any = {}) {
		const res = await prompts({type: 'select', name: 'value', message, choices, ...config});
		return res.value || config.default;
	}

	/**
	 * 单选, 根据输入筛选
	 */
	static async autocomplete(message: string, choices: PromptChoices, config: any = {}) {
		const res = await prompts({type: 'autocomplete', name: 'value', message, choices, ...config});
		return res.value || config.default;
	}

	/**
	 * 多选
	 */
	static async multiSelect(message: string, choices: PromptChoices, config: any = {}) {
		const res = await prompts({type: 'multiselect', name: 'value', message, choices, ...config});
		return res.value || config.default;
	}

	/**
	 * 多选, 根据输入筛选
	 */
	static async autocompleteMultiselect(message: string, choices: PromptChoices, config: any = {}) {
		const res = await prompts({type: 'autocompleteMultiselect', name: 'value', choices, message, ...config});
		return res.value || config.default;
	}

	/**
	 * y/n
	 * @return boolean
	 */
	static async confirm(message: string, config: any = {}) {
		const res = await prompts({type: 'confirm', name: 'value', message, initial: true, ...config});
		return res.value || config.default;
	}

	/**
	 * yes/no 选择( 默认 yes )
	 * @return boolean
	 */
	static async toggle(message: string, config: any = {}) {
		const res = await prompts({
			type: 'toggle', name: 'value', message, active: 'yes', inactive: 'no', initial: true, ...config
		});
		return res.value || config.default;
	}

	/**
	 * 根据指定字符分割输入内容, 返回列表
	 * @return Array<any>
	 */
	static async list(message: string, config: any = {}) {
		const res = await prompts({type: 'list', name: 'value', message, separator: ',', ...config});
		return res.value || config.default;
	}
}

export default Prompt;
