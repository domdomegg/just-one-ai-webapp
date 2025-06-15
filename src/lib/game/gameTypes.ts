export type AIPlayer = {
	id: string;
	name: string;
	model: string;
	provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock';
	isGuesser: boolean;
};

export type Clue = {
	playerId: string;
	playerName: string;
	text: string;
	thinking: string;
	isValid: boolean;
	isEliminated: boolean;
	eliminationReason?: string;
};

export type GameRound = {
	roundNumber: number;
	mysteryWord: string;
	clues: Clue[];
	guesserThinking: string;
	guess: string | null;
	isCorrect: boolean | null;
	isSkipped: boolean;
};

export type GameStep =
	| 'setup'
	| 'clue-generation'
	| 'guess-phase'
	| 'game-over';

export type GameState = {
	// Game configuration
	players: AIPlayer[];
	totalRounds: number;

	// Current game state
	currentRound: number;
	currentStep: GameStep;
	score: number;

	// Current round data
	mysteryWord: string;
	clues: Clue[];
	guesserThinking: string;
	currentGuess: string | null;

	// Game history
	rounds: GameRound[];

	// UI state
	isLoading: boolean;
	error: string | null;
};

export type AIResponse = {
	thinking: string;
	content: string;
};

export type ClueGenerationRequest = {
	mysteryWord: string;
	playerId: string;
};

export type GuessRequest = {
	clues: string[];
	playerId: string;
};
