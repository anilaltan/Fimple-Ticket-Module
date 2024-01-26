const environments = require('../environments');
const getLocalRemotes = require('./getLocalRemotes');


module.exports = function (remotes) {
  const domain = process.env.WEB_DOMAIN || '';
  return getLocalRemotes(remotes, domain, environments.prod);
};
