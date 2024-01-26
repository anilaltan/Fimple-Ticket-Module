const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonLocalConfig = require('../../.config/webpack/commonLocalConfig');
const getLocalRemotes = require('../../.config/webpack/getLocalRemotes');

const Dotenv = require('dotenv-webpack');
const envDevConfig = require('../../.config/webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = 'playground';

const devConfig = {
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
        './PlaygroundApp': './src/bootstrap',
      },
      remotes: getLocalRemotes(['component']),
      shared: packageJson.dependencies,
    }),
    new ExternalTemplateRemotesPlugin(),
  ],
};

module.exports = merge(commonLocalConfig(moduleName), devConfig);
