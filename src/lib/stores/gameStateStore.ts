import {create} from 'zustand';
import type {
	AIPlayer,
	Clue,
	GameStep,
	GameRound,
} from '../game/gameTypes';

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

export const initialState: GameState = {
	// Game configuration
	players: [],
	totalRounds: 13,

	// Current game state
	currentRound: 0,
	currentStep: 'setup',
	score: 0,

	// Current round data
	mysteryWord: '',
	clues: [],
	guesserThinking: '',
	currentGuess: null,

	// Game history
	rounds: [],

	// UI state
	isLoading: false,
	error: null,
};

export const useGameStateStore = create<GameState>(() => initialState);
