const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const serverConfig = {
  entry: [
    'regenerator-runtime/runtime',
    './src/shared/routes.js',
  ],
  node: {
    __dirname: false,
  },
  devtool: process.env.NODE_ENV === 'development' ?
    'source-map' : 'eval-source-map',
  mode: process.env.NODE_ENV === 'development' ?
    'development' : 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build/server/client'),
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      { test: /\.(js)$/, use: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
          test: /\.(ttf|eot|otf|svg|png)$/,
          loader: 'file-loader?emitFile=false',
      },
      {
          test: /\.(woff|woff2)$/,
          loader: 'url-loader?emitFile=false',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'false',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};


module.exports = serverConfig;
