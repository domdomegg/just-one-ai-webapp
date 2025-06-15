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
		players,
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
				return '✅';
			case 'active':
				return '⏳';
			default:
				return '⭕';
		}
	};

	if (isGameComplete) {
		return (
			<div className='max-w-6xl mx-auto p-6 bg-orange-50 min-h-screen'>
				{/* Game Complete Header */}
				<div className='text-center bg-white border-8 border-orange-400 p-8 my-8 shadow-xl transform -rotate-1'>
					<h1 className='text-5xl font-black mb-4 text-orange-600 transform rotate-1'>🎉 GAME COMPLETE! 🎉</h1>
					<div className='text-3xl mb-3 text-stone-800 font-bold'>Final Score: <span className='text-blue-600'>{finalScore.score}</span>/<span className='text-green-600'>{totalRounds}</span></div>
					<div className='text-2xl mb-6 text-purple-600 font-bold'>{finalScore.rating}</div>
					<button
						onClick={() => {
							gameActions.resetGame();
						}}
						className='bg-orange-200 text-orange-700 px-10 py-4 font-black text-xl hover:from-orange-500 hover:to-yellow-500 transition-all transform hover:scale-110 shadow-xl border-4 border-orange-400'
					>
						🎲 PLAY AGAIN
					</button>
				</div>

				{/* Game Recap */}
				<div className='bg-white my-8 border-8 border-blue-400 shadow-xl p-8 transform rotate-1'>
					<h2 className='text-3xl font-black mb-8 text-center text-blue-600 transform -rotate-1'>📝 GAME RECAP</h2>

					<div className='space-y-8'>
						{rounds.map((round, index) => {
							// Find the guesser for this round by finding who is NOT in the clues
							const clueGiverIds = round.clues.map((c) => c.playerId);
							const guesser = players.find((p) => !clueGiverIds.includes(p.id));
							const activeClues = round.clues.filter((c) => !c.isEliminated);

							return (
								<div key={round.roundNumber} className={'border-6 border-yellow-400 p-6 bg-yellow-50 shadow-lg'}>
									<div className='flex items-center justify-between mb-6'>
										<h3 className='text-xl font-black text-purple-700'>
											🎯 ROUND {round.roundNumber}: "<span className='text-orange-600'>{round.mysteryWord}</span>"
										</h3>
										<div className={`px-6 py-3 text-lg font-black border-4 ${
											round.isCorrect
												? 'bg-green-100 text-green-700 border-green-400'
												: round.isSkipped
													? 'bg-gray-100 text-gray-700 border-gray-400'
													: 'bg-red-100 text-red-700 border-red-400'
										}`}>
											{round.isCorrect ? '✅ CORRECT!' : round.isSkipped ? '⏭️ SKIPPED' : '❌ INCORRECT'}
										</div>
									</div>

									{/* Clues Section */}
									<div className='mb-6'>
										<h4 className='font-black text-blue-700 mb-4 text-lg'>✏️ CLUES GENERATED:</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
											{round.clues.map((clue, clueIndex) => (
												<div key={clueIndex} className={`p-4 border-4 shadow-md ${
													clue.isEliminated ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'
												}`}>
													<div className='font-black text-sm text-purple-600 mb-2'>
														🤖 {clue.playerName}
													</div>
													<ThinkingTooltip thinking={clue.thinking}>
														<div className={`text-xl font-black ${
															clue.isEliminated ? 'text-red-600 line-through' : 'text-green-700'
														}`}>
															{clue.text}
														</div>
													</ThinkingTooltip>
													{clue.isEliminated && clue.eliminationReason && (
														<div className='text-xs text-red-600 mt-2 font-bold'>
															❌ {clue.eliminationReason}
														</div>
													)}
												</div>
											))}
										</div>

										{activeClues.length > 0 && (
											<div className='mb-3 p-3 bg-green-100 border-4 border-green-400'>
												<span className='text-sm text-green-700 font-black'>
													✨ ACTIVE CLUES SEEN BY GUESSER:
												</span>
												<span className='text-sm ml-2 font-bold'>
													{activeClues.map((c) => c.text).join(', ')}
												</span>
											</div>
										)}
									</div>

									{/* Guess Section */}
									<div className='border-t-4 border-yellow-400 pt-6'>
										<h4 className='font-black text-purple-700 mb-3 text-lg'>🎯 GUESS:</h4>
										{round.guess
											? (
												<div className='bg-blue-50 border-4 border-blue-400 p-4 transform rotate-1'>
													<div className='font-black text-sm text-purple-600 mb-2'>
														🤖 GUESSER: {guesser?.name || 'Unknown'}
													</div>
													{round.guesserThinking && (
														<div className='text-sm text-stone-800 mb-3 font-medium'>
															<span className='font-black text-blue-600'>💭 THINKING: </span>
															{round.guesserThinking}
														</div>
													)}
													<div className='text-xl'>
														<span className='font-black'>GUESS: </span>
														<span className='font-black text-purple-600'>{round.guess}</span>
														<span className={`ml-3 font-black text-2xl ${
															round.isCorrect ? 'text-green-600' : 'text-red-600'
														}`}>
															{round.isCorrect ? '✅' : '❌'}
														</span>
													</div>
												</div>
											)
											: (
												<div className='bg-stone-50 border-4 border-stone-400 p-4 text-stone-800 italic font-bold'>
													⚠️ NO GUESS MADE (no active clues remaining)
												</div>
											)
										}
									</div>
								</div>
							);
						})}
					</div>

					{rounds.length === 0 && (
						<div className='text-center text-stone-800 py-12 font-bold text-lg'>
							No rounds completed yet.
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-6 bg-orange-50 min-h-screen'>
			{/* Header */}
			<div className='text-center my-8 bg-white border-8 border-orange-400 p-8 shadow-xl transform -rotate-1'>
				<h1 className='text-5xl font-black mb-4 text-orange-600 transform rotate-2'>🎲 JUST ONE AI THEATER</h1>
				<div className='text-xl font-bold'>
					<span className='text-purple-600'>ROUND {currentRound}/{totalRounds}</span> •
					<span className='text-blue-600 ml-2'>SCORE: {score}/{rounds.length}</span>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-100 border-8 border-red-400 text-red-700 px-6 py-4 mb-8 flex justify-between items-center font-black transform rotate-1'>
					<span>❌ {error}</span>
					<button
						onClick={() => {
							gameActions.resetGame();
						}}
						className='bg-red-600 text-white px-6 py-3 text-sm hover:bg-red-700 font-black border-4 border-red-800'
					>
						🔄 RESTART GAME
					</button>
				</div>
			)}

			{/* Current Round Info */}
			{mysteryWord && (
				<div className='text-center my-8'>
					<div className='text-4xl font-black bg-white text-stone-600 px-10 py-6 inline-block border-8 border-stone-400 shadow-xl transform rotate-1'>
						🎯 WORD: <span className='text-stone-800'>{mysteryWord}</span>
					</div>
				</div>
			)}

			{/* Process Flow Steps */}
			<div className='space-y-8'>
				{STEP_ORDER.map((step, index) => {
					const status = getStepStatus(step);
					const isCurrentStep = step === currentStep;

					return (
						<div
							key={step}
							className={`border-8 p-8 shadow-xl transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} ${
								status === 'completed'
									? 'bg-green-100 border-green-400'
									: status === 'active'
										? 'bg-blue-100 border-blue-400'
										: 'bg-yellow-100 border-yellow-400'
							}`}
						>
							<div className='flex items-center mb-6'>
								<span className='text-4xl mr-6'>{getStepIcon(status)}</span>
								<h3 className='text-2xl font-black text-purple-700'>{STEP_LABELS[step]}</h3>
								{isCurrentStep && isLoading && (
									<span className='ml-4 text-blue-600 font-black text-lg'>⏳ PROCESSING...</span>
								)}
							</div>

							{/* Step Content */}
							{step === 'clue-generation' && (
								<div className='ml-12 space-y-6'>
									{/* Clue Generation - Always show clue givers */}
									<div>
										<div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
											{clueGivers.map((player, playerIndex) => {
												const playerClue = clues.find((c) => c.playerId === player.id);
												return (
													<div key={player.id} className={`bg-white p-6 border-6 border-purple-400 shadow-lg transform ${playerIndex % 3 === 0 ? 'rotate-2' : playerIndex % 3 === 1 ? '-rotate-1' : 'rotate-1'}`}>
														<div className='font-black text-sm text-purple-600 mb-3'>
															🤖 {player.name}
														</div>
														{playerClue
															? (
																<ThinkingTooltip thinking={playerClue.thinking}>
																	<div className='text-xl font-black text-blue-600'>
																		{playerClue.text}
																	</div>
																</ThinkingTooltip>
															)
															: (
																<div className='text-stone-400 italic font-bold'>💭 THINKING...</div>
															)}
													</div>
												);
											})}
										</div>
									</div>

									{/* Clue Elimination Results */}
									{eliminatedClues.length > 0 && (
										<div className='border-t-6 border-purple-400 pt-6'>
											<div className='text-sm text-red-600 mb-3 font-black'>❌ ELIMINATED CLUES:</div>
											<div className='space-y-2'>
												{eliminatedClues.map((clue, index) => (
													<div key={index} className='text-sm'>
														<span className='line-through text-stone-500 font-bold'>{clue.text}</span>
														<span className='text-red-600 ml-3 font-black'>
															({clue.eliminationReason})
														</span>
													</div>
												))}
											</div>
											{activeClues.length > 0 && (
												<div className='mt-4'>
													<div className='text-sm text-green-600 mb-3 font-black'>✅ ACTIVE CLUES:</div>
													<div className='flex flex-wrap gap-3'>
														{activeClues.map((clue, index) => (
															<span key={index} className='bg-green-100 text-green-800 px-4 py-2 text-sm font-black border-4 border-green-400'>
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
								<div className='ml-12 space-y-6'>
									{/* Guesser Turn */}
									{currentGuesser && (
										<div className='bg-white my-8 p-6 border-6 border-blue-400 shadow-lg transform rotate-1'>
											<div className='font-black text-purple-600 mb-3 text-lg'>
												🤖 {currentGuesser.name}
											</div>

											{guesserThinking && <div className='text-sm mb-3'><span className='font-black text-blue-600'>💭 THINKING: </span><span className='font-bold'>{guesserThinking}</span></div>}
											{currentGuess !== null && (
												<div className='mt-6'>
													<div className='text-xl'>
														<span className='font-black'>GUESS: </span>
														<span className='font-black text-purple-600'>{currentGuess}</span>
													</div>
													<div className='mt-2'>
														{isCorrectGuess(currentGuess, mysteryWord)
															? (
																<span className='text-green-600 font-black text-2xl'>✅ CORRECT!</span>
															)
															: (
																<span className='text-red-600 font-black text-2xl'>❌ INCORRECT</span>
															)}
													</div>
												</div>
											)}
											{!guesserThinking && currentGuess === null && (
												<div className='text-stone-400 italic font-bold'>⏳ WAITING...</div>
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
