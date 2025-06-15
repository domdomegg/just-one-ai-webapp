import {parseAIResponse} from '../responseParser';
import type {AIResponse} from '../../game/gameTypes';

export type ProviderConfig = {
	endpoint: string;
	headers: Record<string, string>;
	formatRequest: (prompt: string) => any;
	extractContent: (response: any) => string;
};

export async function callAPI(config: ProviderConfig, prompt: string): Promise<AIResponse> {
	try {
		const requestBody = config.formatRequest(prompt);

		const response = await fetch(config.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...config.headers,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		const content = config.extractContent(data);

		if (typeof content !== 'string') {
			throw new Error('API response is not a string');
		}

		return parseAIResponse(content);
	} catch (error) {
		console.error('API error:', error);
		return {
			thinking: `Error calling API: ${String(error)}`,
			content: 'ERROR',
		};
	}
}
