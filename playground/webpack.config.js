const path = require('path');

module.exports = {
    entry: './playground/index.ts',
    output: {
        path: path.resolve(__dirname, '../.playground'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
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
    }
};

console.log(path.join(__dirname, '../node_modules'));
