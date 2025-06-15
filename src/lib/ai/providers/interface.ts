import type {AIResponse} from '../../game/gameTypes';

export abstract class AIProvider {
	abstract name: string;
	abstract getText(prompt: string): Promise<AIResponse>;
}
