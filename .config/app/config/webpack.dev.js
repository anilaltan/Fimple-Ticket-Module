const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonDevConfig = require('../../webpack/commonDevConfig');
const getDevRemotes = require('../../webpack/getDevRemotes');

const Dotenv = require('dotenv-webpack');
const envDevConfig = require('../../webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = 'app';

const devConfig = {
  devServer: {
    port: 50000,
    historyApiFallback: true,
    disableHostCheck: true,
  },
  plugins: [
    new Dotenv(envDevConfig),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ModuleFederationPlugin({
      name: moduleName,
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap',
      },
      remotes: getDevRemotes(['container']),
      shared: packageJson.dependencies,
    }),
    new ExternalTemplateRemotesPlugin(),
  ],
};

module.exports = merge(commonDevConfig(moduleName), devConfig);
