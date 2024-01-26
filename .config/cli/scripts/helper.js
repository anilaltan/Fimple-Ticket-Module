const { join } = require('path');

const log = console.log;

const PATHS = {
  CONTAINER_PATH: join(__dirname, '../../../container'),
  CONTAINER_REMOTES_PATH: join(__dirname, '../../../container/src/components/remotes/'),
  CONTAINER_ROUTES_PATH: join(__dirname, '../../../container/src/routes.js'),
  LERNA_PATH: join(__dirname, '../../../lerna.json'),
  MAIN_PACKAGE_JSON_PATH: join(__dirname, '../../../package.json'),
  ML_PATH: join(__dirname, '../../../component/base/i18n/locales/'),
  MODULE_JS_PATH: join(__dirname, '../../modules.js'),
  ROOT_PATH: join(__dirname, '../../../'),
};

module.exports = { log, PATHS };
