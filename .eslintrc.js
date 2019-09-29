module.exports = {
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended"
	],
	"parserOptions": {
		"sourceType": "module",
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 2018
	},
	"plugins": [
		"react"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"quotes": [
			"error",
			"single"
		],
		"semi": [
			"error",
			"always"
		],
		"react/prop-types": [
			"off"
		],
	}
};
