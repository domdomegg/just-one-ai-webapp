type PlayerCardProps = {
	player: {id: string; name: string; provider: string};
	index: number;
	showRemove?: boolean;
	onRemove?: (playerId: string) => void;
	className?: string;
};

const getProviderLogo = (provider: string) => {
	switch (provider) {
		case 'openai':
			return '/openai.jpg';
		case 'anthropic':
			return '/anthropic.jpg';
		case 'google':
			return '/gemini.jpg';
		case 'ollama':
			return '/ollama.jpg';
		case 'mock':
			return '/mock.svg';
		default:
			return null;
	}
};

export const SelectedPlayerCard = ({
	player,
	index,
	showRemove = false,
	onRemove,
	className = '',
}: PlayerCardProps) => {
	const providerLogo = getProviderLogo(player.provider);

	return (
		<div className={`flex items-center justify-between bg-blue-50 border-blue-400 border-6 p-4 pr-6 shadow-lg transform ${index % 2 === 1 ? '-rotate-1' : ''} ${className}`}>
			<div className='flex items-center space-x-4'>
				<div className='bg-blue-500 text-white w-10 h-10 flex items-center justify-center text-lg font-black border-4 border-blue-700'>
					{index + 1}
				</div>
				<div>
					<div className='font-black text-lg'>{player.name}</div>
					<div className='flex items-center text-sm text-stone-800'>
						{index === 0 && <span className='text-blue-600 font-black mr-2'>FIRST GUESSER</span>}
						{providerLogo && (
							<img
								src={providerLogo}
								alt={player.provider}
								className='w-5 h-5 rounded mr-2 border-2 border-stone-400'
							/>
						)}
						<span className='text-xs text-stone-800 capitalize font-bold'>{player.provider}</span>
					</div>
				</div>
			</div>
			{showRemove && onRemove && (
				<button
					onClick={() => {
						onRemove(player.id);
					}}
					className='text-red-600 hover:text-red-800 text-3xl font-black cursor-pointer p-4 -m-4'
				>
					×
				</button>
			)}
		</div>
	);
};
