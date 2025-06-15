import {useGameStateStore} from './gameStateStore';
import {getActiveClues, calculateScore} from '../game/gameLogic';

export const useGameSelectors = () => {
	const state = useGameStateStore();

	return {
		// Current game info
		currentGuesser: state.players.find((p) => p.isGuesser),
		clueGivers: state.players.filter((p) => !p.isGuesser),
		activeClues: getActiveClues(state.clues),
		eliminatedClues: state.clues.filter((c) => c.isEliminated),

		// Game progress
		gameProgress: state.currentRound / state.totalRounds,
		finalScore: calculateScore(state.score, state.totalRounds),

		// Round status
		isRoundComplete: state.currentStep === 'guess-phase' && state.currentGuess !== null,
		isGameComplete: state.currentStep === 'game-over',
		canStartGame: state.players.length >= 3,
	};
};
