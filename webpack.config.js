const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        content_script: [
            path.join(__dirname, 'src/main.ts')
        ]
    },
    optimization: {
        minimize: false,
    },
    output: {
        devtoolModuleFilenameTemplate: /** @param {{absoluteResourcePath: string}} info */ function (info) {
            return "file:///" + info.absoluteResourcePath.replace(/\\/g, '/');
        },
        filename: '[name].js',
        path: path.join(__dirname.replace('\\', '/'), 'dist/js'),
        sourceMapFilename: '[name].js.map'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js'
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/),
        new CopyPlugin([
            {
                from: 'src/background.js',
                to: 'background.js'
            },
            {
                from: 'config/config.json',
                to: '../config/config.json'
            },
            {
                from: 'images',
                to: '../images'
            },
            {
                from: 'lib',
                to: 'lib'
            },
            {
                from: 'manifest.json',
                to: '../manifest.json'
            },
            {
                from: 'src/web_accessible.js',
                to: 'web_accessible.js'
            }
        ])
    ]
}
