import {useGameStateStore, initialState} from './gameStateStore';
import {getRandomWord} from '../game/wordDatabase';
import {
	processClueElimination,
	isCorrectGuess,
	rotateGuesser,
} from '../game/gameLogic';
import type {
	AIPlayer,
	Clue,
	GameStep,
	GameRound,
} from '../game/gameTypes';

export const gameActions = {
	// Setup actions
	setPlayers(players: AIPlayer[]) {
		useGameStateStore.setState({players});
	},

	startGame() {
		const {players} = useGameStateStore.getState();
		if (players.length < 3) {
			useGameStateStore.setState({error: 'Need at least 3 players to start the game'});
			return;
		}

		useGameStateStore.setState({
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
		const {currentRound, totalRounds, players} = useGameStateStore.getState();

		if (currentRound >= totalRounds) {
			useGameStateStore.setState({currentStep: 'game-over'});
			return;
		}

		const rotatedPlayers = rotateGuesser(players);

		useGameStateStore.setState({
			players: rotatedPlayers,
			currentRound: currentRound + 1,
			currentStep: 'clue-generation',
			mysteryWord: getRandomWord(),
			clues: [],
			guesserThinking: '',
			currentGuess: null,
			error: null,
		});
	},

	setCurrentStep(step: GameStep) {
		useGameStateStore.setState({currentStep: step});
	},

	// Clue actions
	addClue(clue: Clue) {
		const {clues} = useGameStateStore.getState();
		useGameStateStore.setState({clues: [...clues, clue]});
	},

	processClues() {
		const {clues, mysteryWord} = useGameStateStore.getState();
		const processedClues = processClueElimination(clues, mysteryWord);
		useGameStateStore.setState({
			clues: processedClues,
			currentStep: 'guess-phase',
		});
	},

	// Guess actions
	setGuesserThinking(thinking: string) {
		useGameStateStore.setState({guesserThinking: thinking});
	},

	makeGuess(guess: string) {
		const {mysteryWord, score} = useGameStateStore.getState();
		const isCorrect = isCorrectGuess(guess, mysteryWord);

		useGameStateStore.setState({
			currentGuess: guess,
			score: isCorrect ? score + 1 : score,
		});
	},

	skipGuess() {
		useGameStateStore.setState({
			currentGuess: null,
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
			rounds,
		} = useGameStateStore.getState();

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

		useGameStateStore.setState({
			rounds: [...rounds, roundData],
		});
	},

	nextRound() {
		const {currentRound, totalRounds} = useGameStateStore.getState();

		gameActions.completeRound();

		if (currentRound >= totalRounds) {
			useGameStateStore.setState({currentStep: 'game-over'});
		} else {
			gameActions.startNewRound();
		}
	},

	// Utility actions
	setLoading(loading: boolean) {
		useGameStateStore.setState({isLoading: loading});
	},

	setError(error: string | null) {
		useGameStateStore.setState({error});
	},

	resetGame() {
		useGameStateStore.setState(initialState);
	},
};
