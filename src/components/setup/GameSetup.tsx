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
	}, [selectedPlayers, apiKeys]);

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
		<div className='max-w-4xl mx-auto p-6'>
			<div className='text-center mb-8'>
				<h1 className='text-4xl font-bold mb-4'>Just One AI Theater</h1>
				<p className='text-lg text-gray-600'>
					Watch AI models play the cooperative word game "Just One"
				</p>
			</div>

			<div className='bg-white rounded-lg shadow-lg p-6'>
				<h2 className='text-2xl font-bold mb-6'>Select AI Players</h2>

				{error && (
					<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
						{error}
					</div>
				)}

				<div className='mb-6'>
					<p className='text-gray-600 mb-4'>
						Choose 3-7 AI models to participate in the game. You can add multiple instances of the same model.
					</p>
					<div className='text-sm text-gray-500'>
						Selected: {selectedPlayers.length}/7 (minimum 3 required)
					</div>
				</div>

				{/* Available Models */}
				<div className='mb-6'>
					<h3 className='text-lg font-semibold mb-4'>Available Models</h3>
					<div className='space-y-6'>
						{Object.entries(AVAILABLE_MODELS).map(([groupKey, models]) => (
							<div key={groupKey}>
								<div className='flex items-center mb-3'>
									{PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].logo && (
										<img
											src={PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].logo!}
											alt={PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].name}
											className='w-6 h-6 mr-2 rounded'
										/>
									)}
									<h4 className='text-md font-medium text-gray-700'>
										{PROVIDER_INFO[groupKey as keyof typeof PROVIDER_INFO].name}
									</h4>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-8'>
									{models.map((model) => (
										<div
											key={model.id}
											onClick={() => {
												addPlayer(model.id);
											}}
											className='border-2 rounded-lg p-3 cursor-pointer transition-all border-gray-200 hover:border-blue-300 hover:bg-blue-50'
										>
											<div className='flex items-center justify-between'>
												<h5 className='font-medium text-sm'>{model.name}</h5>
												<button className='text-blue-600 hover:text-blue-800 text-lg font-bold'>
													+
												</button>
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
					<div className='mb-6'>
						<h3 className='text-lg font-semibold mb-4'>Selected Players</h3>
						<div className='space-y-2'>
							{selectedPlayers.map((player, index) => (
								<div key={player.id} className='flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3'>
									<div className='flex items-center space-x-3'>
										<div className='bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
											{index + 1}
										</div>
										<div>
											<div className='font-medium'>{player.name}</div>
											<div className='flex items-center text-sm text-gray-600'>
												{index === 0 && <span className='text-blue-600 font-medium mr-2'>First Guesser</span>}
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
														className='w-4 h-4 rounded mr-1'
													/>
												)}
												{player.provider === 'ollama' && (
													<img src='/ollama.jpg' alt='ollama' className='w-4 h-4 rounded mr-1' />
												)}
												{player.provider === 'mock' && (
													<img src='/mock.png' alt='mock' className='w-4 h-4 rounded mr-1' />
												)}
												<span className='text-xs text-gray-500 capitalize'>{player.provider}</span>
											</div>
										</div>
									</div>
									<button
										onClick={() => {
											removePlayer(player.id);
										}}
										className='text-red-600 hover:text-red-800 text-xl font-bold'
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
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold'>API Configuration</h3>
							<button
								onClick={() => {
									setShowApiConfig(!showApiConfig);
								}}
								className='text-blue-600 hover:text-blue-800 text-sm'
							>
								{showApiConfig ? 'Hide' : 'Show'} API Keys
							</button>
						</div>

						{showApiConfig && (
							<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4'>
								<p className='text-sm text-yellow-800 mb-4'>
									Configure API keys for the selected providers. Keys are stored locally in your browser.
								</p>

								{getRequiredProviders().map((provider) => (
									<div key={provider}>
										<div className='flex items-center justify-between mb-2'>
											<label className='block text-sm font-medium text-gray-700'>
												{provider === 'openai' && 'OpenAI API Key'}
												{provider === 'anthropic' && 'Anthropic API Key'}
												{provider === 'google' && 'Google AI API Key'}
												{provider === 'ollama' && 'Ollama Endpoint URL'}
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
													className='text-xs text-blue-600 hover:text-blue-800'
												>
													Get API Key →
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
											className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
										{provider === 'ollama' && (
											<div className='mt-4'>
												<h4 className='text-sm font-medium text-gray-700 mb-3'>Ollama Model Configuration</h4>
												<p className='text-xs text-gray-600 mb-3'>
													Configure model names for each Ollama instance.
												</p>
												{selectedPlayers
													.filter((p) => p.provider === 'ollama')
													.map((player) => (
														<div key={player.id} className='mb-3'>
															<label className='block text-xs font-medium text-gray-600 mb-1'>
																{player.name} - Model Name
															</label>
															<input
																type='text'
																value={ollamaModels[player.id] || ''}
																onChange={(e) => {
																	setOllamaModels((prev) => ({...prev, [player.id]: e.target.value}));
																}}
																placeholder='llama3.3, qwen2.5, mistral, etc.'
																className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
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
						className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
							canStartGame()
								? 'bg-blue-600 text-white hover:bg-blue-700'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					>
						Start Game
					</button>

					{selectedPlayers.length < 3 && (
						<p className='text-sm text-gray-500 mt-2'>
							Select at least 3 AI models to start the game
						</p>
					)}

					{selectedPlayers.length >= 3 && getMissingApiKeys().length > 0 && (
						<p className='text-sm text-gray-500 mt-2'>
							Please configure API keys for: {getMissingApiKeys().join(', ')}
						</p>
					)}
				</div>

				<div className='mt-8 bg-gray-50 rounded-lg p-4'>
					<h3 className='font-semibold mb-2'>How to Play:</h3>
					<ul className='text-sm text-gray-600 space-y-1'>
						<li>• One AI is the guesser, others give clues</li>
						<li>• Each clue-giver writes one word to help guess the mystery word</li>
						<li>• Identical clues are eliminated before the guesser sees them</li>
						<li>• The guesser gets one chance to guess the mystery word</li>
						<li>• The goal is to guess as many words as possible in 13 rounds</li>
						<li>• Hover over AI responses to see their thinking process!</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
