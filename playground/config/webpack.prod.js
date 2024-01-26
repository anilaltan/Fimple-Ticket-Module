const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonProdConfig = require('../../.config/webpack/commonProdConfig');
const getProdRemotes = require('../../.config/webpack/getProdRemotes');

const Dotenv = require('dotenv-webpack');
const envProdConfig = require('../../.config/webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = 'playground';

const prodConfig = {
  plugins: [
    new Dotenv(envProdConfig),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ModuleFederationPlugin({
      name: moduleName,
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/bootstrap',
        './PlaygroundApp': './src/bootstrap',
      },
      remotes: getProdRemotes(['component']),
      shared: packageJson.dependencies,
    }),
    new ExternalTemplateRemotesPlugin(),
  ],
};

module.exports = merge(commonProdConfig(moduleName), prodConfig);
