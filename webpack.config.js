const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';

const config = {
  // entry: [
  //   'react-hot-loader/patch',
  //   path.resolve(__dirname, 'src/index.tsx'),
  // ],
  entry: {
    'react-hot': 'react-hot-loader/patch',
    index: path.resolve(__dirname, 'src/index'),
    popup: path.resolve(__dirname, 'src/popup'),
    // background: path.resolve(__dirname, 'src/background.js'),
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.tsx',
      '.json',
      '.jsx',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            [
              require.resolve('babel-preset-react-app'),
              {
                runtime: 'automatic'
              }
            ],
              require.resolve('@babel/preset-typescript'),
              require.resolve('@babel/preset-react'),
          ],

          plugins: [require.resolve('react-hot-loader/babel'), require.resolve('babel-plugin-styled-components')],
          compact: isEnvProduction,
          cacheDirectory: true,
          babelrc: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          isEnvDevelopment && require.resolve('style-loader'),
          isEnvProduction && MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
            },
          },
        ].filter(Boolean),
      },
      {
        test: /\.png$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          }
        }
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      filename: 'index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new CopyPlugin({
      patterns: [{ from: 'manifest.json' }, { from: 'src/icons', to: 'icons' }],
    }),
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  devServer: {
    static: {
      directory: './dist',
    },
  },
};

module.exports = config;
