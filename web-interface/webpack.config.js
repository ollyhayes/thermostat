module.exports = {
	entry: "./public/scripts/index.js",
	output: {
		filename: "index.js",
		path: __dirname + "/public/scripts/bundles",
		publicPath: "/scripts/bundles/"
	},
	devtool: "#source-map",
	module: {
		loaders: [
			//{ test: /\.jsx$/, exclude: /node_modules/, loader: "babel-loader" },
			{ test: /\.less$/, exclude: /node_modules/, loader: "style-loader!css-loader!less-loader" }
		]
	}
};
