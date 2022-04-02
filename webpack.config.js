const path = require('path');
const nodeExternals = require('webpack-node-externals');

const common = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    stats: {
        colors: true
    },
    mode: 'development',
}


const client = {
    entry: './src/ts/client/main.ts',
    output: {
        path: path.resolve(__dirname, 'build/client/js'),
        filename: 'main.bundle.js'
    },
    devtool: 'source-map',
}

const server = {
    entry: './src/ts/server/server.ts',
    output: {
        path: path.resolve(__dirname, 'build/server'),
        filename: 'server.bundle.js'
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],
}

module.exports = [
    Object.assign({}, common, client),
    Object.assign({}, common, server),
];