import {AIProvider} from './interface';
import {callAPI, type ProviderConfig} from './shared';
import {SYSTEM_PROMPT} from '../aiPrompts';
import type {AIResponse} from '../../game/gameTypes';

const createGoogleConfig = (model: string, apiKey: string): ProviderConfig => ({
	endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
	headers: {},
	formatRequest: (prompt: string) => ({
		contents: [
			{
				parts: [
					{
						text: `${SYSTEM_PROMPT}\n\n${prompt}`,
					},
				],
			},
		],
		generationConfig: {
			maxOutputTokens: 1000,
			thinkingConfig: {
				thinkingBudget: 0,
			},
		},
	}),
	extractContent: (data: any) => data.candidates?.[0]?.content?.parts?.[0]?.text || '',
});

export class GoogleProvider extends AIProvider {
	name: string;
	private readonly config: ProviderConfig;

	constructor(name: string, model: string, apiKey: string) {
		super();
		this.name = name;
		this.config = createGoogleConfig(model, apiKey);
	}

	async getText(prompt: string): Promise<AIResponse> {
		return callAPI(this.config, prompt);
	}
}
