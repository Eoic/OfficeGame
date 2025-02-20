const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
    entry: {
        game: {
            import: [
                path.resolve(__dirname, '../dev/assets/ts/main.ts'),
                path.resolve(__dirname, '../dev/assets/scss/main.scss'),
            ],
        },
    },
    output: {
        filename: '[name]/[contenthash].js',
        path: path.resolve(__dirname, '../dev/static'),
    },
    resolve: {
        alias: {
            game: path.resolve(__dirname, '../dev/assets'),
        },
        extensions: ['.js', '.ts'],
        extensionAlias: {
            '.js': ['.ts', '.js'],
        },
        symlinks: false,
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name]/[contenthash].css',
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../dev/assets/fonts'), to: 'fonts' },
                { from: path.resolve(__dirname, '../dev/assets/images'), to: 'images' },
            ],
        }),

        new BundleTracker({
            path: path.resolve(__dirname, '../dev/static'),
            filename: 'webpack-stats.json',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|ts)$/i,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader', options: { url: false } },
                    {
                        loader: 'sass-loader',
                        options: {
                            api: 'modern',
                            sassOptions: {
                                outputStyle: 'compressed',
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
};
