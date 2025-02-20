const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    output: {
        publicPath: 'http://localhost:3000/dev/static/',
    },
    devServer: {
        hot: true,
        liveReload: true,
        port: 3000,
        host: 'localhost',
        historyApiFallback: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        client: {
            progress: true,
        },
    },
});
