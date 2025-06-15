import {create} from 'zustand';
import type {
	GameState, AIPlayer, Clue, GameStep, GameRound,
} from '../game/gameTypes';
import {getRandomWord} from '../game/wordDatabase';
import {
	processClueElimination, getActiveClues, isCorrectGuess, rotateGuesser, calculateScore,
} from '../game/gameLogic';

type GameActions = {
	// Setup actions
	setPlayers: (players: AIPlayer[]) => void;
	startGame: () => void;

	// Round actions
	startNewRound: () => void;
	setCurrentStep: (step: GameStep) => void;

	// Clue actions
	addClue: (clue: Clue) => void;
	processClues: () => void;

	// Guess actions
	setGuesserThinking: (thinking: string) => void;
	makeGuess: (guess: string) => void;
	skipGuess: () => void;

	// Game flow
	completeRound: () => void;
	nextRound: () => void;

	// Utility actions
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	resetGame: () => void;
};

const initialState: GameState = {
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

export const useGameStore = create<GameState & GameActions>((set, get) => ({
	...initialState,

	// Setup actions
	setPlayers(players) {
		set({players});
	},

	startGame() {
		const {players} = get();
		if (players.length < 3) {
			set({error: 'Need at least 3 players to start the game'});
			return;
		}

		set({
			currentStep: 'clue-generation',
			currentRound: 1,
			mysteryWord: getRandomWord(),
			clues: [],
			guesserThinking: '',
			currentGuess: null,
			error: null,
		});
	},

	// Round actions
	startNewRound() {
		const {currentRound, totalRounds, players} = get();

		if (currentRound >= totalRounds) {
			set({currentStep: 'game-over'});
			return;
		}

		// Rotate the guesser for the new round
		const rotatedPlayers = rotateGuesser(players);

		set({
			players: rotatedPlayers,
			currentRound: currentRound + 1,
			currentStep: 'clue-generation',
			mysteryWord: getRandomWord(),
			clues: [], // Clear clues from previous round
			guesserThinking: '', // Clear previous thinking
			currentGuess: null, // Clear previous guess
			error: null, // Clear any previous errors
		});
	},

	setCurrentStep(step) {
		set({currentStep: step});
	},

	// Clue actions
	addClue(clue) {
		const {clues} = get();
		set({clues: [...clues, clue]});
	},

	processClues() {
		const {clues, mysteryWord} = get();
		const processedClues = processClueElimination(clues, mysteryWord);
		set({
			clues: processedClues,
			currentStep: 'guess-phase',
		});
	},

	// Guess actions
	setGuesserThinking(thinking) {
		set({guesserThinking: thinking});
	},

	makeGuess(guess) {
		const {mysteryWord, score} = get();
		const isCorrect = isCorrectGuess(guess, mysteryWord);

		set({
			currentGuess: guess,
			score: isCorrect ? score + 1 : score,
			// Stay in guess-phase to show the result
		});
	},

	skipGuess() {
		set({
			currentGuess: null,
			// Stay in guess-phase to show the result
		});
	},

	// Game flow
	completeRound() {
		const {
			currentRound,
			mysteryWord,
			clues,
			guesserThinking,
			currentGuess,
		} = get();

		const isCorrect = currentGuess ? isCorrectGuess(currentGuess, mysteryWord) : false;
		const isSkipped = currentGuess === null;

		const roundData: GameRound = {
			roundNumber: currentRound,
			mysteryWord,
			clues,
			guesserThinking,
			guess: currentGuess,
			isCorrect,
			isSkipped,
		};

		const {rounds} = get();
		set({
			rounds: [...rounds, roundData],
		});
	},

	nextRound() {
		const {currentRound, totalRounds} = get();

		// Complete current round
		get().completeRound();

		if (currentRound >= totalRounds) {
			set({currentStep: 'game-over'});
		} else {
			get().startNewRound();
		}
	},

	// Utility actions
	setLoading(loading) {
		set({isLoading: loading});
	},

	setError(error) {
		set({error});
	},

	resetGame() {
		set(initialState);
	},
}));

// Selectors for commonly used derived state
export const useGameSelectors = () => {
	const store = useGameStore();

	return {
		// Current game info
		currentGuesser: store.players.find((p) => p.isGuesser),
		clueGivers: store.players.filter((p) => !p.isGuesser),
		activeClues: getActiveClues(store.clues),
		eliminatedClues: store.clues.filter((c) => c.isEliminated),

		// Game progress
		gameProgress: store.currentRound / store.totalRounds,
		finalScore: calculateScore(store.score, store.totalRounds),

		// Round status
		isRoundComplete: store.currentStep === 'guess-phase' && store.currentGuess !== null,
		isGameComplete: store.currentStep === 'game-over',
		canStartGame: store.players.length >= 3,
	};
};
