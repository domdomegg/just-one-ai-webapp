import type {Clue, AIPlayer} from './gameTypes';
import {stemmer} from 'stemmer';

/**
 * Validates if a clue is valid according to Just One rules
 */
export function isValidClue(clue: string, mysteryWord: string): boolean {
	const normalizedClue = clue.toLowerCase().trim();
	const normalizedMystery = mysteryWord.toLowerCase().trim();

	// Empty clue
	if (!normalizedClue) {
		return false;
	}

	// Can't be the mystery word itself
	if (normalizedClue === normalizedMystery) {
		return false;
	}

	// Can't be a variant of the mystery word
	if (stemmer(normalizedClue) === stemmer(normalizedMystery)) {
		return false;
	}

	// Can't contain the mystery word
	if (normalizedClue.includes(normalizedMystery) || normalizedMystery.includes(normalizedClue)) {
		return false;
	}

	// Should be a single word (allow hyphens, apostrophes, numbers)
	const wordPattern = /^[a-zA-Z0-9'-]+$/;
	if (!wordPattern.test(normalizedClue)) {
		return false;
	}

	return true;
}

/**
 * Processes clues for elimination according to Just One rules
 */
export function processClueElimination(clues: Clue[], mysteryWord: string): Clue[] {
	const processedClues: Clue[] = clues.map((clue) => ({
		...clue,
		isValid: isValidClue(clue.text, mysteryWord),
		isEliminated: false,
		eliminationReason: undefined,
	}));

	// First, mark invalid clues
	processedClues.forEach((clue) => {
		if (!clue.isValid) {
			clue.isEliminated = true;
			clue.eliminationReason = 'Invalid clue';
		}
	});

	// Then check for duplicates among valid clues
	const validClues = processedClues.filter((clue) => clue.isValid);

	for (let i = 0; i < validClues.length; i++) {
		for (let j = i + 1; j < validClues.length; j++) {
			const clue1 = validClues[i];
			const clue2 = validClues[j];

			if (stemmer(clue1.text) === stemmer(clue2.text)) {
				// Mark both as eliminated
				clue1.isEliminated = true;
				clue1.eliminationReason = `Duplicate with ${clue2.playerName}`;
				clue2.isEliminated = true;
				clue2.eliminationReason = `Duplicate with ${clue1.playerName}`;
			}
		}
	}

	return processedClues;
}

/**
 * Gets the remaining active clues after elimination
 */
export function getActiveClues(clues: Clue[]): Clue[] {
	return clues.filter((clue) => !clue.isEliminated);
}

/**
 * Checks if a guess is correct (allowing for minor variations)
 */
export function isCorrectGuess(guess: string, mysteryWord: string): boolean {
	const normalizedGuess = guess.toLowerCase().trim();
	const normalizedMystery = mysteryWord.toLowerCase().trim();

	if (stemmer(normalizedGuess) === stemmer(normalizedMystery)) {
		return true;
	}

	return false;
}

/**
 * Calculates the final game score based on Just One scoring rules
 */
export function calculateScore(correctGuesses: number, totalRounds: number): {
	score: number;
	rating: string;
} {
	const score = correctGuesses;

	let rating: string;
	if (score === totalRounds) {
		rating = 'Perfect! Can you do it again?';
	} else if (score >= totalRounds * 0.9) {
		rating = 'Excellent!';
	} else if (score >= totalRounds * 0.7) {
		rating = 'Great job!';
	} else if (score >= totalRounds * 0.5) {
		rating = 'Good effort!';
	} else if (score >= totalRounds * 0.3) {
		rating = 'Keep trying!';
	} else {
		rating = 'Better luck next time!';
	}

	return {score, rating};
}

/**
 * Rotates players so the next player becomes the guesser
 */
export function rotateGuesser(players: AIPlayer[]): AIPlayer[] {
	const currentGuesserIndex = players.findIndex((p) => p.isGuesser);
	const nextGuesserIndex = (currentGuesserIndex + 1) % players.length;

	return players.map((player, index) => ({
		...player,
		isGuesser: index === nextGuesserIndex,
	}));
}
