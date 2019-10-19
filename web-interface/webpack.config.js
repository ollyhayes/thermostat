module.exports = function()
{
	const config = {
		mode: 'development',
		//devtool: 'eval-source-map',
		entry: {
			streaming: './public/scripts/entry.js',
			nonStreaming: './public/scripts/non-streaming-version/entry.js'
		},
		output: {
			filename: '[name].bundle.js',
			path: __dirname + '/public/scripts/bundles',
			publicPath: '/scripts/bundles/'
		},
		module: {
			rules: [
				{ test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
				{ test: /\.less$/, exclude: /node_modules/, loader: 'style-loader!css-loader!less-loader' },
				{ test: /\.worker\.js/, loader: 'worker-loader' }
			]
		}
	};

	return config;
};
