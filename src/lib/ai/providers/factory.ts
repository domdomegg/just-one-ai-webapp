import {type AIProvider} from './interface';
import {MockAIProvider} from './mock';
import {OpenAIProvider} from './openai';
import {AnthropicProvider} from './anthropic';
import {GoogleProvider} from './google';
import {OllamaProvider} from './ollama';

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
