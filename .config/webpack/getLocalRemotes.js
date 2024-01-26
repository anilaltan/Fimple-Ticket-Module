const environments = require('../environments');
const modules = require('../modules');

module.exports = function (remotes, domain, environment = environments.local) {
  // retrieve commit Id from environment variable.
  var versionHash = process.env.COMMIT_ID;
  if (environment == environments.local) {
    versionHash = 'local_' + Date.now();
  }

  return remotes.reduce((result, item) => {
    const currentModule = modules[item] || { port: 0, isExternal: true };

    const localDomain = `http://'+window.location.hostname+':${currentModule.port}`;

    const moduleUrl = function (entryDomain) {
      return `'${entryDomain}/remoteEntry.js?m=${item}&h=${versionHash}'`;
    };

    // localModuleEntry is applied when local start or need to force use local entry
    const localModuleEntry = moduleUrl(localDomain);

    // defaultModuleEntry returns default url render script(remote or local)
    var defaultModuleEntry = localModuleEntry;
    if (domain) {
      // remoteModuleEntry is applied when domain is specified
      defaultModuleEntry = moduleUrl(`${domain}/web/${item}`);
    } else if (environment == environments.local && currentModule.isExternal) {
      defaultModuleEntry = moduleUrl(`${process.env.WEB_DOMAIN}/web/${item}`);
    } else if (process.env.LOCAL_ENTRIES) {
      // this code block runs when start:remote is used.
      defaultModuleEntry = moduleUrl(`${process.env.WEB_DOMAIN}/web/${item}`);
    }

    // compiled script to specify how to url will be represented.
    const appliedModuleEntry = `window.webPackLocalEntry_${item} === true ? ${localModuleEntry} : ${defaultModuleEntry}`

    // runs & uses appliedModuleEntry.
    result[item] = `${item}@[${appliedModuleEntry}]`;
    return result;
  }, {});
};
