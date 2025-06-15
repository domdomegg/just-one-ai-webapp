// Unified exports for the simplified store architecture
export {useGameStateStore} from './gameStateStore';
export {gameActions} from './gameActionsStore';
export {useGameSelectors} from './gameSelectors';

import {useGameStateStore} from './gameStateStore';
import {gameActions} from './gameActionsStore';

// For backward compatibility, create a unified hook that combines state and actions
export const useGameStore = () => {
	const state = useGameStateStore();
	return {
		...state,
		...gameActions,
	};
};
