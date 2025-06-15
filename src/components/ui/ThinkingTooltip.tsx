import {useState} from 'react';

type ThinkingTooltipProps = {
	thinking: string;
	children: React.ReactNode;
	disabled?: boolean;
};

export const ThinkingTooltip = ({thinking, children, disabled = false}: ThinkingTooltipProps) => {
	const [isVisible, setIsVisible] = useState(false);

	if (disabled || !thinking) {
		return <>{children}</>;
	}

	return (
		<div className='relative inline-block'>
			<div
				onMouseEnter={() => {
					setIsVisible(true);
				}}
				onMouseLeave={() => {
					setIsVisible(false);
				}}
				className='cursor-help'
			>
				{children}
			</div>

			{isVisible && (
				<div className='absolute z-50 w-80 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 left-1/2 transform -translate-x-1/2'>
					<div className='font-semibold mb-2 text-blue-300'>Thinking:</div>
					<div className='text-gray-200 whitespace-pre-wrap'>{thinking}</div>

					{/* Arrow pointing up */}
					<div className='absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900'></div>
				</div>
			)}
		</div>
	);
};
