const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const PugPlugin = require('pug-plugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';

const config = {
  stats: 'errors-warnings',
  entry: {
    'react-hot': 'react-hot-loader/patch',
    tab: path.resolve(__dirname, 'src/index.tsx'),
    popup: path.resolve(__dirname, 'src/popup.tsx'),
    // background: path.resolve(__dirname, 'src/background.js'),
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: [
      '.web.mjs',
      '.mjs',
      '.web.js',
      '.js',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
      '.web.jsx',
      '.jsx',
    ],
    modules: [path.resolve(__dirname, 'src'), 'node_module'],
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
          customize: require.resolve('babel-preset-react-app/webpack-overrides'),
          presets: [
            [
              require.resolve('babel-preset-react-app'),
              {
                runtime: 'automatic',
              },
            ],
          ],

          plugins: [isEnvDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
          compact: isEnvProduction,
        },
      },
      {
        test: /\.(js|mjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
      {
        test: /\.pug$/,
        loader: '@webdiscus/pug-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new PugPlugin({
      extractCss: {
        filename: 'dist/[name].[contentHash:8].css',
      },
    }),
    new CopyPlugin({
      patterns: [{ from: 'manifest.json' }, { from: 'src/icons', to: 'icons' }],
    }),
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: isEnvDevelopment,
      typescript: {
        diagnosticOptions: {
          syntactic: true,
        },
        mode: 'write-references',
      },
      issue: {
        include: [{ file: '../**/src/**/*.{ts,tsx}' }, { file: '**/src/**/*.{ts,tsx}' }],
      },
      logger: {
        infrastructure: 'silent',
      },
    }),
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
