const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonLocalConfig = require('../../webpack/commonLocalConfig');
const getLocalRemotes = require('../../webpack/getLocalRemotes');

const Dotenv = require('dotenv-webpack');
const envDevConfig = require('../../webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = 'app';

const devConfig = {
  output: {
    publicPath: 'http://localhost:50000/'
  },
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
      remotes: getLocalRemotes(['container']),
      shared: packageJson.dependencies,
    }),
    new ExternalTemplateRemotesPlugin(),
  ],
};

module.exports = merge(commonLocalConfig(moduleName), devConfig);
