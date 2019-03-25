module.exports = function(env)
{
	const config = {
		mode: "development",
		entry: "./public/scripts/entry.js",
		output: {
			filename: "bundle.js",
			path: __dirname + "/public/scripts/bundles",
			publicPath: "/scripts/bundles/"
		},
		devtool: "#source-map",
		module: {
			rules: [
				//{ test: /\.jsx$/, exclude: /node_modules/, loader: "babel-loader" },
				{ test: /\.less$/, exclude: /node_modules/, loader: "style-loader!css-loader!less-loader" }
			]
		}
	};

	return config;
};
