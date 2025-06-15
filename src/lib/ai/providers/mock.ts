import {AIProvider} from './interface';
import type {AIResponse} from '../../game/gameTypes';

/**
 * Mock AI provider for testing and demonstration
 */
export class MockAIProvider extends AIProvider {
	name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	async getText(prompt: string): Promise<AIResponse> {
		// Simulate thinking time
		const delay = 200 + (Math.random() * 500);
		await new Promise((resolve) => {
			setTimeout(resolve, delay);
		});

		let content = 'MOCK_RESPONSE';
		let thinking = 'This is a mock AI response for testing purposes.';

		if (prompt.includes('CLUE')) {
			// const mockClues = ['BIG', 'ROUND', 'FAST', 'BLUE', 'SMALL', 'BRIGHT', 'SOFT', 'HARD'];
			const mockClues = ['Big', 'Round', 'Fast', 'Blue', 'Small', 'Bright', 'Soft', 'Hard'];
			content = mockClues[Math.floor(Math.random() * mockClues.length)];
			thinking = `I need to give a clue. I'll go with "${content}" as it's a good general clue.`;
		} else if (prompt.includes('GUESS')) {
			const mockGuesses = ['Elephant', 'Pizza', 'Rainbow', 'Computer', 'Ocean', 'Guitar', 'Mountain'];
			content = mockGuesses[Math.floor(Math.random() * mockGuesses.length)];
			thinking = `Looking at the clues, I think the answer is "${content}".`;
		}

		return {
			thinking,
			content,
		};
	}
}
