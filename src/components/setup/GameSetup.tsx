import {useState, useEffect} from 'react';
import {useGameStateStore} from '../../lib/stores/gameStateStore';
import {gameActions} from '../../lib/stores/gameActionsStore';
import type {AIPlayer} from '../../lib/game/gameTypes';
import {Card} from '../ui/Card';
import {SelectedPlayerCard} from '../ui/SelectedPlayerCard';
import {FormField} from '../ui/FormField';
import {Button} from '../ui/Button';
import {AVAILABLE_MODELS, PROVIDER_INFO} from '../../lib/ai/providers/factory';

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

	// Update showApiConfig when selectedPlayers changes (not when API keys change)
	useEffect(() => {
		const checkApiConfigVisibility = () => {
			const requiredProviders = getRequiredProviders();
			if (requiredProviders.length === 0) {
				return false;
			}

			const missingKeys = requiredProviders.filter((provider) =>
				!apiKeys[provider] || apiKeys[provider].trim() === '');

			return missingKeys.length > 0;
		};

		const shouldShow = checkApiConfigVisibility();
		setShowApiConfig(shouldShow);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- should not update on apiKeys change
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

	const getProviderLabel = (provider: string) => {
		switch (provider) {
			case 'openai':
				return 'OPENAI API KEY';
			case 'anthropic':
				return 'ANTHROPIC API KEY';
			case 'google':
				return 'GOOGLE AI API KEY';
			default:
				return 'OLLAMA ENDPOINT URL';
		}
	};

	const getProviderPlaceholder = (provider: string) => {
		switch (provider) {
			case 'openai':
				return 'sk-...';
			case 'anthropic':
				return 'sk-ant-...';
			case 'google':
				return 'AI...';
			default:
				return 'http://localhost:11434';
		}
	};

	const getProviderHelpLink = (provider: string) => {
		switch (provider) {
			case 'openai':
				return 'https://platform.openai.com/api-keys';
			case 'anthropic':
				return 'https://console.anthropic.com/settings/keys';
			case 'google':
				return 'https://aistudio.google.com/apikey';
			default:
				return undefined;
		}
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
		<div className='space-y-16'>
			<Card variant='primary' rotation='left' className='text-center bg-white border-orange-400'>
				<h1 className='text-5xl font-black mb-4 text-orange-600 rotate-1'>🎲 JUST ONE: AI THEATER</h1>
				<p className='text-xl text-stone-800 font-bold rotate-1'>
					Watch AI models play the cooperative word game <a href='https://en.wikipedia.org/wiki/Just_One_(board_game)' className='text-blue-600 underline'>Just One</a>
				</p>
			</Card>

			<Card variant='secondary' rotation='right'>
				<Card.Header>
					<h3 className='font-black text-purple-700 text-2xl rotate-1'>📋 HOW IT WORKS</h3>
				</Card.Header>
				<Card.Content>
					<ul className='text-stone-800 space-y-3 font-bold'>
						<li>🎯 One AI is the guesser, others give clues</li>
						<li>✏️ Each clue-giver writes one word to help guess the mystery word</li>
						<li>❌ Identical clues are eliminated before the guesser sees them</li>
						<li>🤔 The guesser gets one chance to guess the mystery word</li>
						<li>🏆 The goal is to guess as many words as possible in 13 rounds</li>
						<li>💭 Hover over AI responses to see their thinking process!</li>
					</ul>
				</Card.Content>
			</Card>

			<Card variant='primary' className='space-y-16'>
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
					<h3 className='text-2xl font-black mb-8 text-purple-700'>AVAILABLE MODELS</h3>
					<div className='space-y-12'>
						{Object.entries(AVAILABLE_MODELS).map(([groupKey, models], groupIndex) => (
							<div key={groupKey} className={`${groupIndex % 2 === 0 ? 'rotate-1' : '-rotate-0.5'}`}>
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
					<div>
						<h3 className='text-2xl font-black mb-6 text-purple-700'>SELECTED PLAYERS</h3>
						<div className='space-y-4'>
							{selectedPlayers.map((player, index) => (
								<SelectedPlayerCard
									key={player.id}
									player={player}
									index={index}
									showRemove={true}
									onRemove={removePlayer}
								/>
							))}
						</div>
					</div>
				)}

				{/* API Configuration */}
				{getRequiredProviders().length > 0 && (
					<div>
						<div className='flex items-center justify-between mb-6'>
							<h3 className='text-2xl font-black text-purple-700'>API CONFIGURATION</h3>
							<Button
								variant='secondary'
								size='sm'
								onClick={() => {
									setShowApiConfig(!showApiConfig);
								}}
							>
								{showApiConfig ? 'HIDE' : 'SHOW'} API KEYS
							</Button>
						</div>

						{showApiConfig && (
							<div className='bg-yellow-50 border-8 border-yellow-400 p-6 space-y-6'>
								<p className='text-sm text-yellow-800 mb-6 font-bold'>
									Configure API keys for the selected providers. Keys are stored locally in your browser.
								</p>

								{getRequiredProviders().map((provider) => (
									<div key={provider}>
										<FormField
											label={getProviderLabel(provider)}
											type={provider === 'ollama' ? 'url' : 'password'}
											value={apiKeys[provider]}
											onChange={(value) => {
												setApiKeys((prev) => ({...prev, [provider]: value}));
											}}
											placeholder={getProviderPlaceholder(provider)}
											helpLink={getProviderHelpLink(provider)}
											helpText={provider !== 'ollama' ? 'GET API KEY →' : undefined}
										/>
										{provider === 'ollama' && (
											<div className='mt-6'>
												<h4 className='text-sm font-black text-stone-800 mb-4'>OLLAMA MODEL CONFIGURATION</h4>
												{selectedPlayers
													.filter((p) => p.provider === 'ollama')
													.map((player) => (
														<FormField
															key={player.id}
															label={`${player.name} - MODEL NAME`}
															type='text'
															value={ollamaModels[player.id] || ''}
															onChange={(value) => {
																setOllamaModels((prev) => ({...prev, [player.id]: value}));
															}}
															placeholder='llama3.3, qwen2.5, mistral, etc.'
															className='mb-4'
														/>
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
					<Button
						variant='primary'
						size='lg'
						disabled={!canStartGame()}
						onClick={handleStartGame}
						icon='🎮'
						className={canStartGame() ? 'scale-105' : ''}
					>
						START GAME
					</Button>

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
			</Card>
		</div>
	);
};
