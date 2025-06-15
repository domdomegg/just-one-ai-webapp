
type FormFieldProps = {
	label: string;
	type?: 'text' | 'password' | 'url';
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	helpLink?: string;
	helpText?: string;
	className?: string;
};

export const FormField = ({
	label,
	type = 'text',
	value,
	onChange,
	placeholder,
	helpLink,
	helpText,
	className = '',
}: FormFieldProps) => {
	return (
		<div className={className}>
			<div className='flex items-center justify-between mb-3'>
				<label className='block text-sm font-black text-stone-800'>
					{label}
				</label>
				{helpLink && helpText && (
					<a
						href={helpLink}
						target='_blank'
						rel='noopener noreferrer'
						className='text-xs text-blue-600 hover:text-blue-800 font-black border-2 border-blue-400 px-2 py-1 bg-blue-50'
					>
						{helpText}
					</a>
				)}
			</div>
			<input
				type={type}
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
				}}
				placeholder={placeholder}
				className='w-full px-4 py-3 border-4 border-stone-400 focus:outline-none focus:border-blue-500 font-bold'
			/>
		</div>
	);
};
