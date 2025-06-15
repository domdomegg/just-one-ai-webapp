import {AIProvider} from './interface';
import {callAPI, type ProviderConfig} from './shared';
import {SYSTEM_PROMPT} from '../aiPrompts';
import type {AIResponse} from '../../game/gameTypes';

const createAnthropicConfig = (model: string, apiKey: string): ProviderConfig => ({
	endpoint: 'https://api.anthropic.com/v1/messages',
	headers: {
		'x-api-key': apiKey,
		'anthropic-version': '2023-06-01',
		'anthropic-dangerous-direct-browser-access': 'true',
	},
	formatRequest: (prompt: string) => ({
		model,
		max_tokens: 1000,
		system: SYSTEM_PROMPT,
		messages: [
			{
				role: 'user',
				content: prompt,
			},
		],
	}),
	extractContent: (data: any) => data.content[0]?.text || '',
});

export class AnthropicProvider extends AIProvider {
	name: string;
	private readonly config: ProviderConfig;

	constructor(name: string, model: string, apiKey: string) {
		super();
		this.name = name;
		this.config = createAnthropicConfig(model, apiKey);
	}

	async getText(prompt: string): Promise<AIResponse> {
		return callAPI(this.config, prompt);
	}
}
