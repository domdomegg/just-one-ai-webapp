import type React from 'react';

type CardVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type CardRotation = 'none' | 'left' | 'right' | 'slight-left' | 'slight-right';

type CardProps = {
	children: React.ReactNode;
	variant?: CardVariant;
	rotation?: CardRotation;
	className?: string;
};

type CardHeaderProps = {
	children: React.ReactNode;
	className?: string;
};

type CardContentProps = {
	children: React.ReactNode;
	className?: string;
};

const getVariantStyles = (variant: CardVariant) => {
	switch (variant) {
		case 'primary':
			return 'bg-white border-blue-400';
		case 'secondary':
			return 'bg-yellow-50 border-yellow-400';
		case 'success':
			return 'bg-green-100 border-green-400';
		case 'warning':
			return 'bg-yellow-100 border-yellow-400';
		case 'error':
			return 'bg-red-100 border-red-400';
	}
};

const getRotationStyles = (rotation: CardRotation) => {
	switch (rotation) {
		case 'left':
			return '-rotate-1';
		case 'right':
			return 'rotate-1';
		case 'slight-left':
			return '-rotate-0.5';
		case 'slight-right':
			return 'rotate-0.5';
		case 'none':
			return '';
	}
};

export const Card = ({children, variant = 'primary', rotation = 'none', className = ''}: CardProps) => {
	const variantStyles = getVariantStyles(variant);
	const rotationStyles = getRotationStyles(rotation);

	return (
		<div className={`border-8 p-8 shadow-xl transform ${variantStyles} ${rotationStyles} ${className}`}>
			{children}
		</div>
	);
};

const CardHeader = ({children, className = ''}: CardHeaderProps) => {
	return (
		<div className={`mb-6 ${className}`}>
			{children}
		</div>
	);
};

const CardContent = ({children, className = ''}: CardContentProps) => {
	return (
		<div className={className}>
			{children}
		</div>
	);
};

Card.Header = CardHeader;
Card.Content = CardContent;
