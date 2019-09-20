const path = require('path');
const fs = require('fs');
const Webpack = require('webpack');
const merge = require('webpack-merge');
const dotenv = require('dotenv');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WorkboxPlugin = require('workbox-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const getClientEnvironment = require('./utils/env');

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  path.resolve(__dirname, '../.env.production.local'),
  path.resolve(__dirname, '../.env.production'),
  path.resolve(__dirname, '../.env')
].filter(dotenvFile => fs.existsSync(dotenvFile));

console.log(`${dotenvFiles[0]} will be used.\n`);

// Load env variables
dotenv.config({
  path: dotenvFiles[0]
});

const clientEnv = getClientEnvironment('production');

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  stats: 'errors-only',
  bail: true,
  output: {
    filename: 'assets/js/[name].[chunkhash:8].js',
    chunkFilename: 'assets/js/[name].[chunkhash:8].chunk.js'
  },
  plugins: [
    new Webpack.DefinePlugin(clientEnv.stringified),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      uglifyOptions: {
        warnings: false,
        compress: {
          drop_debugger: true,
          drop_console: true
        },
        ecma: 8
      },
      sourceMap: true,
      parallel: true
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].bundle.css'
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: false,
      skipWaiting: false,
      globIgnores: ['**/.DS_Store']
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-analyzer-plugin-report.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s?css/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer(),
                cssnano(
                  {
                    preset: ['default', {
                      discardComments: {
                        removeAll: true
                      }
                    }]
                  }
                )
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
});
