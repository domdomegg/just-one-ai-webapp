import {AIProvider} from './interface';
import {callAPI, type ProviderConfig} from './shared';
import {SYSTEM_PROMPT} from '../aiPrompts';
import type {AIResponse} from '../../game/gameTypes';

const createOllamaConfig = (model: string, endpoint: string): ProviderConfig => {
	const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
	return {
		endpoint: `${cleanEndpoint}/api/generate`,
		headers: {},
		formatRequest: (prompt: string) => ({
			model,
			prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
			stream: false,
			options: {
				num_predict: 1000,
			},
		}),
		extractContent: (data: any) => data.response || '',
	};
};

export class OllamaProvider extends AIProvider {
	name: string;
	private readonly config: ProviderConfig;

	constructor(name: string, model: string, endpoint: string) {
		super();
		this.name = name;
		this.config = createOllamaConfig(model, endpoint);
	}

	async getText(prompt: string): Promise<AIResponse> {
		return callAPI(this.config, prompt);
	}
}
