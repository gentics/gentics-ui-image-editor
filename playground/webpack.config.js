const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const outputDir =  path.resolve(__dirname, '../demo');

module.exports = env => {
    return {
        entry: './playground/index.ts',
        output: {
            path: outputDir,
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: ['ts-loader', 'angular2-template-loader']
                },
                {
                    test: /\.(html|css)$/,
                    loader: 'raw-loader'
                },
                {
                    test: /\.scss$/,
                    use: [{
                        loader: "style-loader" // creates style nodes from JS strings
                    }, {
                        loader: "css-loader" // translates CSS into CommonJS
                    }, {
                        loader: "sass-loader", // compiles Sass to CSS
                        options: {
                            includePaths: [path.join(__dirname, '../node_modules')]
                        }
                    }]
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    loader: 'url-loader'
                }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                {from: path.resolve(__dirname, './index.html'), to: outputDir},
                {
                    from: path.resolve(__dirname, './test-images/*'),
                    to: path.join(outputDir, 'test-images'),
                    flatten: true
                }
            ]),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env && env.production ? 'production' : 'development')
            }),
            new BundleAnalyzerPlugin()
        ]
    };
};
