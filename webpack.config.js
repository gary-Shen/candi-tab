const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: {
    'react-hot': 'react-hot-loader/patch',
    tab: './src/tab.js',
    popup: './src/popup.js',
    background: './src/background.js',
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'candi-tab'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [
                require.resolve('babel-plugin-module-resolver'),
              ],
            },
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        loader: '@webdiscus/pug-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]___[hash:base64:5]',
              },
            }
          },
          {
            loader: 'postcss-loader',
          },
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]___[hash:base64:5]',
              },
            }
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {},
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/tab.pug'),
      filename: 'index.html',
      // inject: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/popup.pug'),
      filename: 'popup.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/oauth.pug'),
      filename: 'oauth.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'src/icons', to: 'icons' },
      ],
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devServer: {
    'static': {
      directory: './candi-tab',
    }
  }
};

module.exports = config;
