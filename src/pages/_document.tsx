import {
	Html, Head, Main, NextScript,
} from 'next/document';

const Document = () => {
	return (
		<Html lang='en'>
			<Head />
			<body className='antialiased bg-orange-50 min-h-screen'>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
};

export default Document;
