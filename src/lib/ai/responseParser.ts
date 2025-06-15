import type {AIResponse} from '../game/gameTypes';

/**
 * Parses AI response to extract thinking and content
 */
export function parseAIResponse(response: string): AIResponse {
	const thinkingMatch = /THINKING:\s*([\s\S]*?)(?=CLUE:|GUESS:|$)/.exec(response);
	const clueMatch = /CLUE:\s*([\s\S]*)$/.exec(response);
	const guessMatch = /GUESS:\s*([\s\S]*)$/.exec(response);

	const thinking = thinkingMatch?.[1]?.trim() || '';
	const content = (clueMatch?.[1] || guessMatch?.[1])?.trim() || '';

	return {
		thinking,
		content,
	};
}
