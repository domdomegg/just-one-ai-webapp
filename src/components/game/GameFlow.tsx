import {useGameStateStore} from '../../lib/stores/gameStateStore';
import {useGameSelectors} from '../../lib/stores/gameSelectors';
import {gameActions} from '../../lib/stores/gameActionsStore';
import {isCorrectGuess} from '../../lib/game/gameLogic';
import {ThinkingTooltip} from '../ui/ThinkingTooltip';

const STEP_LABELS = {
	setup: 'Game Setup',
	'clue-generation': 'Clue Generation',
	'guess-phase': 'Guesser Turn',
	'game-over': 'Game Complete',
};

const STEP_ORDER: (keyof typeof STEP_LABELS)[] = [
	'clue-generation',
	'guess-phase',
];

export const GameFlow = () => {
	const {
		currentStep,
		currentRound,
		totalRounds,
		score,
		mysteryWord,
		clues,
		guesserThinking,
		currentGuess,
		isLoading,
		error,
		rounds,
	} = useGameStateStore();

	const {
		currentGuesser,
		clueGivers,
		activeClues,
		eliminatedClues,
		isGameComplete,
		finalScore,
	} = useGameSelectors();

	const getStepStatus = (step: keyof typeof STEP_LABELS) => {
		// Handle setup step separately since it's not in STEP_ORDER
		if (currentStep === 'setup') {
			return 'pending';
		}

		const currentIndex = STEP_ORDER.indexOf(currentStep);
		const stepIndex = STEP_ORDER.indexOf(step);

		if (stepIndex < currentIndex) {
			return 'completed';
		}

		if (stepIndex === currentIndex) {
			return 'active';
		}

		return 'pending';
	};

	const getStepIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return '✓';
			case 'active':
				return '⏳';
			default:
				return '○';
		}
	};

	if (isGameComplete) {
		return (
			<div className='max-w-4xl mx-auto p-6'>
				<div className='text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg'>
					<h1 className='text-4xl font-bold mb-4'>Game Complete!</h1>
					<div className='text-2xl mb-2'>Final Score: {finalScore.score}/{totalRounds}</div>
					<div className='text-xl'>{finalScore.rating}</div>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-6'>
			{/* Header */}
			<div className='text-center mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Just One AI Theater</h1>
				<div className='text-lg text-gray-600'>
					Round {currentRound}/{totalRounds} • Score: {score}/{rounds.length + 1}
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center'>
					<span>{error}</span>
					<button
						onClick={() => {
							gameActions.resetGame();
						}}
						className='bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700'
					>
						Restart Game
					</button>
				</div>
			)}

			{/* Current Round Info */}
			{mysteryWord && (
				<div className='text-center mb-8'>
					<div className='text-2xl font-bold bg-blue-100 text-blue-800 px-6 py-3 rounded-lg inline-block'>
						Mystery Word: {mysteryWord}
					</div>
				</div>
			)}

			{/* Process Flow Steps */}
			<div className='space-y-6'>
				{STEP_ORDER.map((step) => {
					const status = getStepStatus(step);
					const isCurrentStep = step === currentStep;

					return (
						<div
							key={step}
							className={`border rounded-lg p-4 ${
								status === 'completed'
									? 'bg-green-50 border-green-200'
									: status === 'active'
										? 'bg-blue-50 border-blue-200'
										: 'bg-gray-50 border-gray-200'
							}`}
						>
							<div className='flex items-center mb-3'>
								<span className='text-2xl mr-3'>{getStepIcon(status)}</span>
								<h3 className='text-lg font-semibold'>{STEP_LABELS[step]}</h3>
								{isCurrentStep && isLoading && (
									<span className='ml-2 text-blue-600'>Processing...</span>
								)}
							</div>

							{/* Step Content */}
							{step === 'clue-generation' && (
								<div className='ml-8 space-y-4'>
									{/* Clue Generation - Always show clue givers */}
									<div>
										<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
											{clueGivers.map((player) => {
												const playerClue = clues.find((c) => c.playerId === player.id);
												return (
													<div key={player.id} className='bg-white p-3 rounded border'>
														<div className='font-medium text-sm text-gray-600 mb-1'>
															{player.name}
														</div>
														{playerClue
															? (
																<ThinkingTooltip thinking={playerClue.thinking}>
																	<div className='text-lg font-bold text-blue-600'>
																		{playerClue.text}
																	</div>
																</ThinkingTooltip>
															)
															: (
																<div className='text-gray-400 italic'>Thinking...</div>
															)}
													</div>
												);
											})}
										</div>
									</div>

									{/* Clue Elimination Results */}
									{eliminatedClues.length > 0 && (
										<div className='border-t pt-4'>
											<div className='text-sm text-red-600 mb-2'>Eliminated clues:</div>
											<div className='space-y-1'>
												{eliminatedClues.map((clue, index) => (
													<div key={index} className='text-sm'>
														<span className='line-through text-gray-500'>{clue.text}</span>
														<span className='text-red-600 ml-2'>
															({clue.eliminationReason})
														</span>
													</div>
												))}
											</div>
											{activeClues.length > 0 && (
												<div className='mt-3'>
													<div className='text-sm text-green-600 mb-2'>Active clues:</div>
													<div className='flex flex-wrap gap-2'>
														{activeClues.map((clue, index) => (
															<span key={index} className='bg-green-100 text-green-800 px-2 py-1 rounded text-sm'>
																{clue.text}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							)}

							{step === 'guess-phase' && (
								<div className='ml-8 space-y-4'>
									{/* Guesser Turn */}
									{currentGuesser && (
										<div className='bg-white p-4 rounded border'>
											<div className='font-medium text-gray-600 mb-2'>
												{currentGuesser.name}
											</div>

											{guesserThinking && <div className='text-sm'><span className='font-semibold text-blue-600'>Thinking: </span>{guesserThinking}</div>}
											{currentGuess !== null && (
												<div className='mt-8'>
													<div className='text-lg'>
														<span className='font-medium'>Guess: </span>
														<span className='font-bold text-purple-600'>{currentGuess}</span>
													</div>
													<div className='mt-1'>
														{isCorrectGuess(currentGuess, mysteryWord)
															? (
																<span className='text-green-600 font-bold'>✓ Correct!</span>
															)
															: (
																<span className='text-red-600 font-bold'>✗ Incorrect</span>
															)}
													</div>
												</div>
											)}
											{!guesserThinking && currentGuess === null && (
												<div className='text-gray-400 italic'>Waiting...</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
