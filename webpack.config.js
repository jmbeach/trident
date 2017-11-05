var webpack = require('webpack')
var path = require('path')

module.exports = {
    entry: {
        content_script: [
            path.join(__dirname, 'src/main.ts')
        ],
        vendor: ['jquery']
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js'
    },
    module: {
        loaders: [
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
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),
        
        new webpack.IgnorePlugin(/^\.\/locale$/)
    ]
}
