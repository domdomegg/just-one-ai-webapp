import type {ReactNode} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	disabled?: boolean;
	onClick?: () => void;
	icon?: string;
	className?: string;
};

const getVariantStyles = (variant: ButtonVariant, disabled: boolean) => {
	if (disabled) {
		return 'bg-stone-300 text-stone-500 cursor-not-allowed border-stone-400';
	}

	switch (variant) {
		case 'primary':
			return 'bg-green-100 text-green-900 hover:scale-110 border-green-600 cursor-pointer';
		case 'secondary':
			return 'bg-blue-50 text-blue-600 hover:text-blue-800 border-blue-400';
		case 'danger':
			return 'bg-red-600 text-white hover:bg-red-700 border-red-800';
		case 'success':
			return 'bg-orange-200 text-orange-700 hover:scale-110 border-orange-400';
	}
};

const getSizeStyles = (size: ButtonSize) => {
	switch (size) {
		case 'sm':
			return 'px-4 py-2 text-sm';
		case 'md':
			return 'px-6 py-3 text-base';
		case 'lg':
			return 'px-12 py-6 text-2xl';
	}
};

export const Button = ({
	children,
	variant = 'primary',
	size = 'md',
	disabled = false,
	onClick,
	icon,
	className = '',
}: ButtonProps) => {
	const variantStyles = getVariantStyles(variant, disabled);
	const sizeStyles = getSizeStyles(size);

	return (
		<button
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={`font-black transition-all shadow-xl border-8 ${variantStyles} ${sizeStyles} ${className}`}
		>
			{icon && <span className='mr-2'>{icon}</span>}
			{children}
		</button>
	);
};
