import {useEffect, useRef} from 'react';
import {useGameStateStore} from '../lib/stores/gameStateStore';
import {GameSetup} from '../components/setup/GameSetup';
import {GameFlow} from '../components/game/GameFlow';
import {gameFlowManager} from '../lib/game/gameFlowManager';

const Home = () => {
	const currentStep = useGameStateStore((state) => state.currentStep);
	const currentRound = useGameStateStore((state) => state.currentRound);
	const gameStartedRef = useRef(false);

	useEffect(() => {
		// Start the game flow manager only once when the game begins (round 1)
		if (currentStep === 'clue-generation' && currentRound === 1 && !gameStartedRef.current) {
			gameStartedRef.current = true;
			void gameFlowManager.startGame();
		}

		// Reset the flag when returning to setup
		if (currentStep === 'setup') {
			gameStartedRef.current = false;
		}

		// Cleanup function to stop the game if component unmounts
		return () => {
			if (currentStep !== 'setup' && currentStep !== 'game-over') {
				gameFlowManager.stop();
			}
		};
	}, [currentStep, currentRound]);

	return (
		<div className='max-w-5xl mx-auto pt-12 pb-24 px-6'>
			{currentStep === 'setup'
				? (
					<GameSetup />
				)
				: (
					<GameFlow />
				)}
		</div>
	);
};

export default Home;
