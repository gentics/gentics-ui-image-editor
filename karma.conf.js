process.env.CHROME_BIN = require('puppeteer').executablePath()

const path = require('path');
const webpack = require('webpack');

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'testing-bootstrap.js',
            { pattern: 'src/**/*.ts', watched: false, served: false, included: false }
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'testing-bootstrap.js': ['webpack', 'sourcemap']
        },

        webpack: {
            // webpack configuration
            resolve: {
                extensions: ['.js', '.ts'],
                modules: ['node_modules', 'src']
            },
            module: {
                rules: [
                    {
                        test: /\.ts/,
                        use: [
                            'ts-loader',
                            'angular2-template-loader'
                        ]
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            { loader: "raw-loader" },
                            { loader: "style-loader" },
                            { loader: "css-loader" },
                            {
                                loader: "sass-loader",
                                options: {
                                    includePaths: [path.join(__dirname, '../node_modules')]
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                        loader: 'url-loader'
                    },
                    {
                        test: /\.html$/,
                        loader: 'html-loader'
                    }
                ]
            },
            devtool: 'inline-source-map',
            mode: 'development'
        },

        webpackMiddleware: {
            stats: { chunks: false }
        },
        plugins: [
            require('karma-webpack'),
            'karma-jasmine',
            'karma-mocha-reporter',
            'karma-chrome-launcher',
            'karma-sourcemap-loader'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
