import {AIProvider} from './interface';
import {callAPI, type ProviderConfig} from './shared';
import {SYSTEM_PROMPT} from '../aiPrompts';
import type {AIResponse} from '../../game/gameTypes';

const createOpenAIConfig = (model: string, apiKey: string): ProviderConfig => ({
	endpoint: 'https://api.openai.com/v1/chat/completions',
	headers: {
		Authorization: `Bearer ${apiKey}`,
	},
	formatRequest: (prompt: string) => ({
		model,
		messages: [
			{role: 'system', content: SYSTEM_PROMPT},
			{role: 'user', content: prompt},
		],
		max_completion_tokens: 1000,
	}),
	extractContent: (data: any) => data.choices[0]?.message?.content || '',
});

export class OpenAIProvider extends AIProvider {
	name: string;
	private readonly config: ProviderConfig;

	constructor(name: string, model: string, apiKey: string) {
		super();
		this.name = name;
		this.config = createOpenAIConfig(model, apiKey);
	}

	async getText(prompt: string): Promise<AIResponse> {
		return callAPI(this.config, prompt);
	}
}
