const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  devServer: {
    contentBase: './www',
    hot: true,
    historyApiFallback: true,
    port: 9000
  },
  entry: './src/index.tsx',
  output: {
    path: resolve(__dirname, 'www'),
    publicPath: '/admin/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        resolve: {
          alias: {
            '@common': resolve(__dirname, '../common'),
          },
          extensions: ['.ts', '.tsx', '.js'],
        },
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
          },
        }],
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
        },
      },
      {
        test: /\.(woff2|woff)$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'fonts',
        },
      },
      {
        test: /\.svg$/,
        use: ['babel-loader',
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    process.env.WEBPACK_MODE === 'production' ? new CleanWebpackPlugin() : () => { },
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new DefinePlugin({
      'process.env.EXPERIMENTAL_ENABLED': false,
      'process.env.NODE_ENV': JSON.stringify(process.env.WEBPACK_MODE || 'production')
    }),
    new HtmlWebpackPlugin({
      title: 'WebRTC Admin',
    }),
  ],
};
