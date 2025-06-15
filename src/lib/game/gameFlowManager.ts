import {useGameStateStore} from '../stores/gameStateStore';
import {gameActions} from '../stores/gameActionsStore';
import {createAIProvider} from '../ai/providers/factory';
import {clueGenerationPrompt, guessPrompt} from '../ai/aiPrompts';
import type {Clue} from './gameTypes';

export type GameFlowState =
	| 'idle'
	| 'generating-clues'
	| 'processing-clues'
	| 'making-guess'
	| 'round-complete'
	| 'game-complete'
	| 'error';

export class GameFlowManager {
	private currentState: GameFlowState = 'idle';
	private abortController: AbortController | null = null;
	private isStarting = false;

	async startGame() {
		if (this.currentState !== 'idle' || this.isStarting) {
			console.warn('Game already in progress or starting');
			return;
		}

		this.isStarting = true;

		try {
			await this.runGameLoop();
		} catch (error) {
			this.handleError(error);
		} finally {
			this.isStarting = false;
		}
	}

	stop() {
		if (this.abortController) {
			this.abortController.abort();
		}

		this.setState('idle');
		this.isStarting = false;
	}

	getCurrentState(): GameFlowState {
		return this.currentState;
	}

	private async runGameLoop() {
		let state = useGameStateStore.getState();

		while (state.currentRound <= state.totalRounds && this.currentState !== 'error') {
			// eslint-disable-next-line no-await-in-loop
			await this.runRound();

			// Move to next round (this handles game completion internally)
			gameActions.nextRound();

			// Refresh store state after round completion
			state = useGameStateStore.getState();

			// Check if game is complete
			if (state.currentStep === 'game-over') {
				this.setState('game-complete');
				break;
			}
		}
	}

	private async runRound() {
		await this.generateClues();
		await this.processClues();
		await this.makeGuess();
	}

	private async generateClues() {
		this.setState('generating-clues');
		const {players, mysteryWord} = useGameStateStore.getState();

		gameActions.setCurrentStep('clue-generation');
		gameActions.setLoading(true);

		try {
			const clueGivers = players.filter((p) => !p.isGuesser);
			this.abortController = new AbortController();

			// Generate all clues in parallel
			const cluePromises = clueGivers.map(async (player) => {
				const aiProvider = createAIProvider(player.provider, player.model, player.id);
				const otherPlayers = clueGivers
					.filter((p) => p.id !== player.id)
					.map((p) => p.name);
				const prompt = clueGenerationPrompt(mysteryWord, otherPlayers);
				const response = await aiProvider.getText(prompt);

				const clue: Clue = {
					playerId: player.id,
					playerName: player.name,
					text: response.content,
					thinking: response.thinking,
					isValid: true,
					isEliminated: false,
				};

				gameActions.addClue(clue);
				return clue;
			});

			await Promise.all(cluePromises);
		} finally {
			gameActions.setLoading(false);
			this.abortController = null;
		}
	}

	private async processClues() {
		this.setState('processing-clues');

		// Process clue elimination
		gameActions.processClues();
	}

	private async makeGuess() {
		this.setState('making-guess');
		const {players, clues} = useGameStateStore.getState();

		const guesser = players.find((p) => p.isGuesser);
		if (!guesser) {
			throw new Error('No guesser found');
		}

		const activeClues = clues.filter((c) => !c.isEliminated);

		if (activeClues.length === 0) {
			gameActions.skipGuess();
			await this.delay(3000);
			return;
		}

		gameActions.setLoading(true);

		try {
			const aiProvider = createAIProvider(guesser.provider, guesser.model, guesser.id);
			const clueGivers = activeClues.map((c) => c.playerName);
			const prompt = guessPrompt(activeClues.map((c) => c.text), clueGivers);
			const response = await aiProvider.getText(prompt);

			gameActions.setGuesserThinking(response.thinking);
			gameActions.makeGuess(response.content);
			await this.delay(5000);
		} finally {
			gameActions.setLoading(false);
		}
	}

	private setState(state: GameFlowState) {
		this.currentState = state;
	}

	private async delay(ms: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	private handleError(error: unknown) {
		this.setState('error');
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		gameActions.setError(errorMessage);
		console.error('Game flow error:', error);
	}
}

// Singleton instance
export const gameFlowManager = new GameFlowManager();
