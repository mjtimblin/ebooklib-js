module.exports = {
	extends: ['airbnb/base', 'plugin:jsdoc/recommended', 'prettier'],
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-tabs': 0,
		'max-len': ['error', { code: 120, comments: 200 }],
	},
};
