const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = {
	target: 'node',
	entry: './src/extension.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
		devtoolModuleFilenameTemplate: '../[resource-path]'
	},
	plugins: [new CleanWebpackPlugin()],
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: true,
				terserOptions: {
					ecma: 2020,
					mangle: false,
					keep_classnames: true,
					keep_fnames: true
				}
			})
		]
	},
	devtool: 'source-map',
	externals: {
		vscode: 'commonjs vscode'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader'
					}
				]
			},
			{
				loader: 'vscode-nls-dev/lib/webpack-loader',
				options: {
					base: path.join(__dirname, 'src')
				}
			}
		]
	}
};

module.exports = config;
