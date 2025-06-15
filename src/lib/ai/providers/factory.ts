import {type AIProvider} from './interface';
import {MockAIProvider} from './mock';
import {OpenAIProvider} from './openai';
import {AnthropicProvider} from './anthropic';
import {GoogleProvider} from './google';
import {OllamaProvider} from './ollama';

export const AVAILABLE_MODELS = {
	anthropic: [
		{id: 'claude-sonnet-4-0', name: 'Claude 4 Sonnet', provider: 'anthropic' as const},
		{id: 'claude-opus-4-0', name: 'Claude 4 Opus', provider: 'anthropic' as const},
	],
	openai: [
		{id: 'o4-mini', name: 'o4-mini', provider: 'openai' as const},
		{id: 'o3', name: 'o3', provider: 'openai' as const},
	],
	google: [
		{id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'google' as const},
		{id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', provider: 'google' as const},
	],
	other: [
		{id: 'ollama', name: 'Ollama (Local)', provider: 'ollama' as const},
		{id: 'mock-ai', name: 'Mock AI (Demo)', provider: 'mock' as const},
	],
};

export const PROVIDER_INFO = {
	openai: {name: 'OpenAI', logo: './openai.jpg'},
	anthropic: {name: 'Anthropic', logo: './anthropic.jpg'},
	google: {name: 'Google', logo: './gemini.jpg'},
	other: {name: 'Other', logo: null},
};

/**
 * Factory function to create AI providers
 */
export function createAIProvider(provider: string, model: string, playerId?: string): AIProvider {
	// Get API keys and Ollama models from localStorage
	const apiKeysJson = localStorage.getItem('ai-api-keys');
	const apiKeys = apiKeysJson ? JSON.parse(apiKeysJson) : {};

	const ollamaModelsJson = localStorage.getItem('ollama-models');
	const ollamaModels = ollamaModelsJson ? JSON.parse(ollamaModelsJson) : {};

	switch (provider) {
		case 'openai': {
			return new OpenAIProvider(model, model, apiKeys.openai || '');
		}

		case 'anthropic': {
			return new AnthropicProvider(model, model, apiKeys.anthropic || '');
		}

		case 'google': {
			return new GoogleProvider(model, model, apiKeys.google || '');
		}

		case 'ollama': {
			const customModel = playerId ? ollamaModels[playerId] : '';
			return new OllamaProvider(model, customModel, apiKeys.ollama || 'http://localhost:11434');
		}

		case 'mock':
			return new MockAIProvider(model);
		default:
			throw new Error(`Unknown AI provider: ${provider}`);
	}
}
