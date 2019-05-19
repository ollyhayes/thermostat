module.exports = function()
{
	const config = {
		mode: 'development',
		entry: './public/scripts/entry.js',
		output: {
			filename: 'bundle.js',
			path: __dirname + '/public/scripts/bundles',
			publicPath: '/scripts/bundles/'
		},
		module: {
			rules: [
				{ test: /\.less$/, exclude: /node_modules/, loader: 'style-loader!css-loader!less-loader' },
				{ test: /\.worker\.js/, loader: 'worker-loader' }
			]
		}
	};

	return config;
};
