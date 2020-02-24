const path = require('path');
const _ = require('lodash');

const LoadablePlugin = require('@loadable/webpack-plugin');

const webpack = require('webpack');

  console.log(process.env.NODE_ENV);

const browserConfig = {
  entry: _.compact([
    'core-js/stable',
    'regenerator-runtime/runtime',
    process.env.NODE_ENV === 'development' && 'webpack-hot-middleware/client',
    './src/browser/index.js',
  ]),
  output: {
    path: path.resolve(__dirname, 'build/public'),
    filename: '[name]-[hash].js',
    publicPath: '/',
  },
  node: {
    fs: 'empty',
  },
  devtool: process.env.NODE_ENV === 'development' ?
    'source-map' : 'eval-source-map',
  mode: process.env.NODE_ENV === 'development' ?
    'development' : 'production',
  target: 'web',
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        styles: {
          name: 'styles',
          test: /\.scss/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
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
  plugins: _.compact([
    new webpack.DefinePlugin({
      __isBrowser__: 'true',
    }),
    process.env.NODE_ENV === 'development' && new webpack.HotModuleReplacementPlugin(),
    new LoadablePlugin({
      filename: 'stats.json',
      writeToDisk: {
        filename: process.env.NODE_ENV === 'production' ? './build' : './src',
      },
    }),
  ]),
};


module.exports = browserConfig;
