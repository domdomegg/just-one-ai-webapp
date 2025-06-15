import {useState, useEffect} from 'react';
import {useGameStateStore} from '../../lib/stores/gameStateStore';
import {gameActions} from '../../lib/stores/gameActionsStore';
import type {AIPlayer} from '../../lib/game/gameTypes';

const AVAILABLE_MODELS = {
	anthropic: [
		{id: 'claude-sonnet-4-0', name: 'Claude 4 Sonnet', provider: 'anthropic' as const},
		{id: 'claude-opus-4-0', name: 'Claude 4 Opus', provider: 'anthropic' as const},
	],
	openai: [
		{id: 'o4-mini', name: 'o4-mini', provider: 'openai' as const},
		{id: 'o3', name: 'o3', provider: 'openai' as const},
	],
	google: [
		{id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'google' as const},
		{id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', provider: 'google' as const},
	],
	other: [
		{id: 'ollama', name: 'Ollama (Local)', provider: 'ollama' as const},
		{id: 'mock-ai', name: 'Mock AI (Demo)', provider: 'mock' as const},
	],
};

const PROVIDER_INFO = {
	openai: {name: 'OpenAI', logo: '/openai.jpg'},
	anthropic: {name: 'Anthropic', logo: '/anthropic.jpg'},
	google: {name: 'Google', logo: '/gemini.jpg'},
	other: {name: 'Other', logo: null},
};

type SelectedPlayer = {
	id: string;
	modelId: string;
	name: string;
	provider: string;
};

export const GameSetup = () => {
	const error = useGameStateStore((state) => state.error);
	const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
	const [apiKeys, setApiKeys] = useState<Record<string, string>>({
		openai: '',
		anthropic: '',
		google: '',
		ollama: 'http://localhost:11434', // Default Ollama endpoint
	});
	const [ollamaModels, setOllamaModels] = useState<Record<string, string>>({});
	const [showApiConfig, setShowApiConfig] = useState(false);

	// Load saved API keys and Ollama models from localStorage on component mount
	useEffect(() => {
		const savedApiKeys = localStorage.getItem('ai-api-keys');
		if (savedApiKeys) {
			try {
				const parsedKeys = JSON.parse(savedApiKeys);
				setApiKeys((prev) => ({...prev, ...parsedKeys}));
			} catch (error) {
				console.error('Error parsing saved API keys:', error);
			}
		}

		const savedOllamaModels = localStorage.getItem('ollama-models');
		if (savedOllamaModels) {
			try {
				const parsedModels = JSON.parse(savedOllamaModels);
				setOllamaModels(parsedModels);
			} catch (error) {
				console.error('Error parsing saved Ollama models:', error);
			}
		}
	}, []);

	// Check if API config should be shown initially
	const checkApiConfigVisibility = () => {
		const requiredProviders = getRequiredProviders();
		if (requiredProviders.length === 0) {
			return false;
		}

		const missingKeys = requiredProviders.filter((provider) =>
			!apiKeys[provider] || apiKeys[provider].trim() === '');

		return missingKeys.length > 0;
	};

	// Update showApiConfig when selectedPlayers changes (not when API keys change)
	useEffect(() => {
		const shouldShow = checkApiConfigVisibility();
		setShowApiConfig(shouldShow);
	}, [selectedPlayers]);

	const addPlayer = (modelId: string) => {
		if (selectedPlayers.length >= 7) {
			return;
		}

		// Find model in grouped structure
		let model: any = null;
		for (const group of Object.values(AVAILABLE_MODELS)) {
			model = group.find((m) => m.id === modelId);
			if (model) {
				break;
			}
		}

		if (!model) {
			return;
		}

		const instanceCount = selectedPlayers.filter((p) => p.modelId === modelId).length;
		const playerName = instanceCount > 0 ? `${model.name} #${instanceCount + 1}` : model.name;

		const newPlayer: SelectedPlayer = {
			id: `${modelId}-${Date.now()}-${Math.random()}`,
			modelId,
			name: playerName,
			provider: model.provider,
		};

		setSelectedPlayers((prev) => [...prev, newPlayer]);
	};

	const removePlayer = (playerId: string) => {
		setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
	};

	const getRequiredProviders = () => {
		const providers = new Set(selectedPlayers.map((p) => p.provider));
		return Array.from(providers).filter((p) => p !== 'mock');
	};

	const getMissingApiKeys = () => {
		const requiredProviders = getRequiredProviders();
		return requiredProviders.filter((provider) =>
			!apiKeys[provider] || apiKeys[provider].trim() === '');
	};

	const canStartGame = () => {
		return selectedPlayers.length >= 3 && getMissingApiKeys().length === 0;
	};

	const handleStartGame = () => {
		if (!canStartGame()) {
			return;
		}

		const players: AIPlayer[] = selectedPlayers.map((player, index) => ({
			id: player.id,
			name: player.name,
			model: player.modelId,
			provider: player.provider as AIPlayer['provider'],
			isGuesser: index === 0, // First player starts as guesser
		}));

		// Store API keys and Ollama models in localStorage for the session
		localStorage.setItem('ai-api-keys', JSON.stringify(apiKeys));
		localStorage.setItem('ollama-models', JSON.stringify(ollamaModels));

		gameActions.setPlayers(players);
		gameActions.startGame();
	};

	return (
		<div>
			<div className='text-center my-8 bg-white border-8 border-orange-400 p-12 shadow-xl -rotate-1'>
				<h1 className='text-5xl font-black mb-4 text-orange-600 rotate-1'>🎲 JUST ONE: AI THEATER</h1>
				<p className='text-xl text-stone-800 font-bold rotate-1'>
					Watch AI models play the cooperative word game <a href='https://en.wikipedia.org/wiki/Just_One_(board_game)' className='text-blue-600 underline'>Just One</a>
				</p>
			</div>

			<div className='my-8 bg-yellow-50 border-8 border-yellow-400 p-8 rotate-1'>
				<h3 className='font-black mb-4 text-purple-700 text-2xl rotate-1'>📋 HOW IT WORKS</h3>
				<ul className='text-sm text-stone-800 space-y-3 font-bold'>
					<li>🎯 One AI is the guesser, others give clues</li>
					<li>✏️ Each clue-giver writes one word to help guess the mystery word</li>
					<li>❌ Identical clues are eliminated before the guesser sees them</li>
					<li>🤔 The guesser gets one chance to guess the mystery word</li>
					<li>🏆 The goal is to guess as many words as possible in 13 rounds</li>
					<li>💭 Hover over AI responses to see their thinking process!</li>
				</ul>
			</div>

			<div className='bg-white border-8 border-blue-400 shadow-xl p-8'>
				<h2 className='text-3xl font-black mb-8 text-blue-600 transform'>🤖 SELECT AI PLAYERS</h2>

				{error && (
					<div className='bg-red-100 border-8 border-red-400 text-red-700 px-6 py-4 mb-8 font-black'>
						❌ {error}
					</div>
				)}

				<div className='mb-8'>
					<p className='text-stone-800 mb-4 font-bold text-lg'>
						Choose 3-7 AI models to participate in the game. You can add multiple instances of the same model.
					</p>
				</div>

				{/* Available Models */}
				<div>
					<h3 className='text-2xl font-black mb-6 text-purple-700'>AVAILABLE MODELS</h3>
					<div>
						{Object.entries(AVAILABLE_MODELS).map(([groupKey, models], groupIndex) => (
							<div key={groupKey} className={`my-12 transform ${groupIndex % 2 === 0 ? 'rotate-1' : '-rotate-0.5'}`}>
								<div className='flex items-center mb-2'>
									{PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].logo && (
										<img
											src={PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].logo!}
											alt={PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].name}
											className='w-8 h-8 mr-3 rounded border-2 border-gray-400'
										/>
									)}
									<h4 className='text-xl font-black text-stone-800'>
										{PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].name}
									</h4>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									{models.map((model, modelIndex) => (
										<div
											key={model.id}
											onClick={() => {
												addPlayer(model.id);
											}}
											className={`border-4 py-4 px-5 cursor-pointer transition-all border-stone-400 hover:border-blue-400 hover:bg-blue-50 bg-white shadow-lg transform ${modelIndex % 3 === 0 ? '-rotate-2' : modelIndex % 3 === 1 ? '-rotate-0.5' : 'rotate-0.5'}`}
										>
											<div className='flex items-center justify-between'>
												<h5 className='font-black'>{model.name}</h5>
												<span className='text-blue-600 text-2xl font-black'>
													+
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Selected Players */}
				{selectedPlayers.length > 0 && (
					<div className='my-16'>
						<h3 className='text-2xl font-black mb-6 text-purple-700'>SELECTED PLAYERS</h3>
						<div className='space-y-4'>
							{selectedPlayers.map((player, index) => (
								<div key={player.id} className={`flex items-center justify-between bg-blue-50 border-6 border-blue-400 p-4 pr-6 shadow-lg transform ${index % 2 === 0 ? '' : '-rotate-1'}`}>
									<div className='flex items-center space-x-4'>
										<div className='bg-blue-500 text-white w-10 h-10 flex items-center justify-center text-lg font-black border-4 border-blue-700'>
											{index + 1}
										</div>
										<div>
											<div className='font-black text-lg'>{player.name}</div>
											<div className='flex items-center text-sm text-stone-800'>
												{index === 0 && <span className='text-blue-600 font-black mr-2'>FIRST GUESSER</span>}
												{(player.provider === 'openai' || player.provider === 'anthropic' || player.provider === 'google') && (
													<img
														src={
															player.provider === 'openai'
																? '/openai.jpg'
																: player.provider === 'anthropic'
																	? '/anthropic.jpg'
																	: player.provider === 'google' ? '/gemini.jpg' : ''
														}
														alt={player.provider}
														className='w-5 h-5 rounded mr-2 border-2 border-stone-400'
													/>
												)}
												{player.provider === 'ollama' && (
													<img src='/ollama.jpg' alt='ollama' className='w-5 h-5 rounded mr-2 border-2 border-stone-400' />
												)}
												{player.provider === 'mock' && (
													<img src='/mock.png' alt='mock' className='w-5 h-5 rounded mr-2 border-2 border-stone-400' />
												)}
												<span className='text-xs text-stone-800 capitalize font-bold'>{player.provider}</span>
											</div>
										</div>
									</div>
									<button
										onClick={() => {
											removePlayer(player.id);
										}}
										className='text-red-600 hover:text-red-800 text-3xl font-black cursor-pointer p-4 -m-4'
									>
										×
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* API Configuration */}
				{getRequiredProviders().length > 0 && (
					<div className='mb-8'>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-2xl font-black text-purple-700'>API CONFIGURATION</h3>
							<button
								onClick={() => {
									setShowApiConfig(!showApiConfig);
								}}
								className='text-blue-600 hover:text-blue-800 text-sm font-black border-4 border-blue-400 px-4 py-2 bg-blue-50'
							>
								{showApiConfig ? 'HIDE' : 'SHOW'} API KEYS
							</button>
						</div>

						{showApiConfig && (
							<div className='bg-yellow-50 border-8 border-yellow-400 p-6 space-y-6'>
								<p className='text-sm text-yellow-800 mb-6 font-bold'>
									Configure API keys for the selected providers. Keys are stored locally in your browser.
								</p>

								{getRequiredProviders().map((provider) => (
									<div key={provider}>
										<div className='flex items-center justify-between mb-3'>
											<label className='block text-sm font-black text-stone-800'>
												{provider === 'openai' && 'OPENAI API KEY'}
												{provider === 'anthropic' && 'ANTHROPIC API KEY'}
												{provider === 'google' && 'GOOGLE AI API KEY'}
												{provider === 'ollama' && 'OLLAMA ENDPOINT URL'}
											</label>
											{provider !== 'ollama' && (
												<a
													href={
														provider === 'openai'
															? 'https://platform.openai.com/api-keys'
															: provider === 'anthropic'
																? 'https://console.anthropic.com/settings/keys'
																: provider === 'google'
																	? 'https://aistudio.google.com/apikey'
																	: '#'
													}
													target='_blank'
													rel='noopener noreferrer'
													className='text-xs text-blue-600 hover:text-blue-800 font-black border-2 border-blue-400 px-2 py-1 bg-blue-50'
												>
													GET API KEY →
												</a>
											)}
										</div>
										<input
											type={provider === 'ollama' ? 'url' : 'password'}
											value={apiKeys[provider]}
											onChange={(e) => {
												setApiKeys((prev) => ({...prev, [provider]: e.target.value}));
											}}
											placeholder={
												provider === 'openai'
													? 'sk-...'
													: provider === 'anthropic'
														? 'sk-ant-...'
														: provider === 'google'
															? 'AI...'
															: 'http://localhost:11434'
											}
											className='w-full px-4 py-3 border-4 border-stone-400 focus:outline-none focus:border-blue-500 font-bold'
										/>
										{provider === 'ollama' && (
											<div className='mt-6'>
												<h4 className='text-sm font-black text-stone-800 mb-4'>OLLAMA MODEL CONFIGURATION</h4>
												{selectedPlayers
													.filter((p) => p.provider === 'ollama')
													.map((player) => (
														<div key={player.id} className='mb-4'>
															<label className='block text-xs font-black text-stone-800 mb-2'>
																{player.name} - MODEL NAME
															</label>
															<input
																type='text'
																value={ollamaModels[player.id] || ''}
																onChange={(e) => {
																	setOllamaModels((prev) => ({...prev, [player.id]: e.target.value}));
																}}
																placeholder='llama3.3, qwen2.5, mistral, etc.'
																className='w-full px-4 py-3 border-4 border-stone-400 focus:outline-none focus:border-blue-500 text-sm font-bold'
															/>
														</div>
													))}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				<div className='text-center'>
					<button
						onClick={handleStartGame}
						disabled={!canStartGame()}
						className={`px-12 py-6 font-black text-2xl transition-all shadow-xl border-8 ${
							canStartGame()
								? 'bg-green-100 text-green-900 hover:scale-110 border-green-600 cursor-pointer scale-105'
								: 'bg-stone-300 text-stone-500 cursor-not-allowed border-stone-400'
						}`}
					>
						🎮 START GAME
					</button>

					{selectedPlayers.length < 3 && (
						<p className='text-sm text-stone-800 mt-4 font-bold'>
							SELECT AT LEAST 3 AI MODELS TO START THE GAME
						</p>
					)}

					{selectedPlayers.length >= 3 && getMissingApiKeys().length > 0 && (
						<p className='text-sm text-stone-800 mt-4 font-bold'>
							PLEASE CONFIGURE API KEYS FOR: {getMissingApiKeys().join(', ').toUpperCase()}
						</p>
					)}
				</div>

			</div>
		</div>
	);
};
