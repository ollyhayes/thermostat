module.exports = function()
{
	const config = {
		mode: 'development',
		devtool: 'source-map',
		entry: './public/scripts/entry.js' ,
		output: {
			filename: '[name].bundle.js',
			path: __dirname + '/public/scripts/bundles',
			publicPath: '/scripts/bundles/'
		},
		module: {
			rules: [
				{ test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
				{ test: /\.less$/, exclude: /node_modules/, loader: 'style-loader!css-loader!less-loader' },
			]
		}
	};

	return config;
};
