const Uglify = require("uglifyjs-webpack-plugin");

module.exports = function(env)
{
	const config = {
		entry: "./public/scripts/entry.js",
		output: {
			filename: "bundle.js",
			path: __dirname + "/public/scripts/bundles",
			publicPath: "/scripts/bundles/"
		},
		devtool: "#source-map",
		module: {
			loaders: [
				//{ test: /\.jsx$/, exclude: /node_modules/, loader: "babel-loader" },
				{ test: /\.less$/, exclude: /node_modules/, loader: "style-loader!css-loader!less-loader" }
			]
		},
		watchOptions: { poll: true },
		plugins: []
	};

	if (env && env.compress)
		config.plugins.push(new Uglify());

	return config;
};
