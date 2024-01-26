
var commonDevConfig = require('./commonDevConfig');

module.exports = function (moduleName) {
  return {
    module: commonDevConfig(moduleName).module,
    mode: 'production',
    devtool: 'eval-source-map',
    output: {
      filename: '[name].[contenthash].js',
      publicPath: `/web/${moduleName}/`
    }
  };
};
