import {useState, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';

type ThinkingTooltipProps = {
	thinking: string;
	children: React.ReactNode;
	disabled?: boolean;
};

type TooltipPosition = {
	top: number;
	left: number;
};

export const ThinkingTooltip = ({thinking, children, disabled = false}: ThinkingTooltipProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState<TooltipPosition>({top: 0, left: 0});
	const triggerRef = useRef<HTMLDivElement>(null);

	const updatePosition = () => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			const tooltipWidth = 320; // w-80 = 20rem = 320px

			// Position tooltip below the trigger element, centered horizontally
			const left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
			const top = rect.bottom + 8; // 8px gap below trigger

			// Ensure tooltip doesn't go off screen horizontally
			const adjustedLeft = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

			setPosition({
				top,
				left: adjustedLeft,
			});
		}
	};

	useEffect(() => {
		if (isVisible) {
			updatePosition();

			// Update position on scroll or resize
			const handleUpdate = () => {
				updatePosition();
			};

			window.addEventListener('scroll', handleUpdate, true);
			window.addEventListener('resize', handleUpdate);

			return () => {
				window.removeEventListener('scroll', handleUpdate, true);
				window.removeEventListener('resize', handleUpdate);
			};
		}
	}, [isVisible]);

	if (disabled || !thinking) {
		return <>{children}</>;
	}

	const tooltipContent = isVisible && (
		<div
			className='fixed z-[9999] w-80 p-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 pointer-events-none'
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<div className='font-semibold mb-2 text-blue-300'>Thinking:</div>
			<div className='text-gray-200 whitespace-pre-wrap'>{thinking}</div>

			{/* Arrow pointing up */}
			<div
				className='absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900'
				style={{
					left: triggerRef.current
						? (triggerRef.current.getBoundingClientRect().left + (triggerRef.current.getBoundingClientRect().width / 2)) - position.left - 8
						: '50%',
				}}
			></div>
		</div>
	);

	return (
		<>
			<div
				ref={triggerRef}
				className='inline-block'
				onMouseEnter={() => {
					setIsVisible(true);
				}}
				onMouseLeave={() => {
					setIsVisible(false);
				}}
			>
				<div className='cursor-help'>
					{children}
				</div>
			</div>

			{typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
		</>
	);
};
