const chalk = require('chalk');
const { Command } = require('commander');
const { readFile, writeFile, createWriteStream, existsSync, mkdirSync } = require('fs');
const https = require('https');
const { exec } = require('child_process');
const { join } = require('path');

const {
  addEnvironmentFiles,
  addContainerWebpackFiles,
  addContainerRoutesFile,
  addMultiLanguageFiles,
  createFileOrFolder,
  createModulesObjectItem,
} = require('./file.js');
const { getModuleData, getTypingData } = require('./module.js');
const { log, PATHS } = require('./helper.js');

/* Methods */

const optionsHandlers = async (options, folderPath) => {
  if (options.npm) {
    await new Promise((resolve, reject) => {
      log('Packages are being installed', 'blue');
      exec(`cd ${folderPath} && npm install`, (error, stdout, stderr) => {
        if (error) {
          log(chalk.red(`exec error: ${error}`));
          reject();
          return;
        }
        log(chalk.blue(`stdout: ${stdout}`));
        log(chalk.blue(`stderr: ${stderr}`));
        log('Packages installed', 'blue');
        resolve();
      });
    });
  }

  if (options.yarn) {
    await new Promise((resolve, reject) => {
      log('Packages are being installed', 'blue');
      exec(`cd ${folderPath} && yarn`, (error, stdout, stderr) => {
        if (error) {
          log(chalk.red(`exec error: ${error}`));
          reject();
          return;
        }
        log(chalk.blue(`stdout: ${stdout}`));
        log(chalk.blue(`stderr: ${stderr}`));
        log('Packages installed', 'blue');
        resolve();
      });
    });
  }
};

const program = new Command();

program
  .version('0.0.1')
  .command('generate-module')
  .description('Generate a new module with given name [only lowerCase, not(number,special keyword, white spaces)]')
  .argument('<moduleName>', 'module name')
  .option('-n, --npm', 'install npm packages')
  .option('-y, --yarn', 'install yarn packages')
  .action((moduleName, options) => {
    // Check if module name is valid
    if (!moduleName.match(/^[a-z]+$/)) {
      log(chalk.red('|---------------------------------------------'));
      log(chalk.red('| Invalid module name!'));
      log(chalk.red('| Module name must be only lower case, not(number,special keyword, white spaces)'));
      log(chalk.red('| Example: generate-module module'));
      log(chalk.red('|---------------------------------------------'));
      return;
    }

    // Paths
    const folderPath = join(PATHS.ROOT_PATH, moduleName);
    const mlModulesFolderPath = join(PATHS.ML_PATH);
    const mlFolderPath = join(folderPath, '/locales');

    // Check if module already exists
    if (existsSync(folderPath) && existsSync(mlFolderPath)) {
      log(chalk.bgRed(moduleName) + chalk.red(' folder already exists!'));
      return;
    }

    // defines
    const modulesJsPath = PATHS.MODULE_JS_PATH;
    const lernaFilePath = PATHS.LERNA_PATH;
    const packageJsonFilePath = PATHS.MAIN_PACKAGE_JSON_PATH;
    const containerConfigPath = join(PATHS.CONTAINER_PATH, '/config/');
    const containerRemotesPath = PATHS.CONTAINER_REMOTES_PATH;
    const containerRoutesPath = PATHS.CONTAINER_ROUTES_PATH;
    const webpackLocalFilePath = join(containerConfigPath, 'webpack.local.js');
    const webpackDevFilePath = join(containerConfigPath, 'webpack.dev.js');
    const webpackProdFilePath = join(containerConfigPath, 'webpack.prod.js');
    const mlCommonFilePath = join(mlModulesFolderPath, 'common.js');
    const mlEnumsFilePath = join(mlModulesFolderPath, 'enums.js');
    const mlUiKeyFilePath = join(mlModulesFolderPath, 'uiKey.js');

    log(chalk.green('|---------------------------------------------'));
    log(chalk.green(`| Generating `) + chalk.yellow(`${moduleName}`) + chalk.green(` module...`));
    log(chalk.green('|---------------------------------------------'));

    // promise
    const promise = new Promise((resolve, reject) => {
      // main folder creating
      mkdirSync(folderPath, { recursive: true });
      createFileOrFolder(getModuleData(moduleName).moduleData, folderPath);

      // ml folder creating
      mkdirSync(mlFolderPath, { recursive: true });
      createFileOrFolder(getModuleData(moduleName).moduleMLData, mlFolderPath);

      // ml (common.js, enums.js, uiKey.js) files upgraded
      addMultiLanguageFiles({ mlCommonFilePath, mlEnumsFilePath, mlUiKeyFilePath }, moduleName);

      // modules.js object added
      createModulesObjectItem(modulesJsPath, moduleName);

      // lerna.json & main package.json files added module name
      addEnvironmentFiles({ lernaFilePath, packageJsonFilePath }, moduleName);

      // container > webpack.dev | webpack.prod file added moduleName
      addContainerWebpackFiles({ webpackLocalFilePath, webpackDevFilePath, webpackProdFilePath }, moduleName);

      // container > remotes.js file created moduleName file
      createFileOrFolder(getModuleData(moduleName).moduleContainerData, containerRemotesPath);

      // container > routes.js added to moduleName
      addContainerRoutesFile(containerRoutesPath, moduleName);

      resolve();
    }).catch((err) => {
      log(chalk.red(err));
    });

    promise.then(() => {
      // optional parameters handling
      if (options) {
        optionsHandlers(options, folderPath).then(() => {
          log(chalk.green('|---------------------------------------------'));
          log(chalk.yellow(`| ${moduleName}`) + chalk.green(` module generated operation done!`));
          log(chalk.green('|---------------------------------------------'));
        });
      } else {
        log(chalk.green('|---------------------------------------------'));
        log(chalk.yellow(`|${moduleName}`) + chalk.green(` module generated operation done!`));
        log(chalk.green('|---------------------------------------------'));
      }
    });
  })
  .on('--help', () => {
    log(chalk.green(''));
    log(chalk.green('Examples:'));
    log(chalk.green('  $ generate-module <moduleName>'));
  });

program
  .version('0.0.1')
  .command('update-typings')
  .description('Update typings.d.ts online to make intellisense works better.')
  .action(async (options) => {
    const node_modules_types = join(PATHS.ROOT_PATH, 'node_modules/@types/component');
    const download_url = 'https://sandbox.fimple.co.uk/web/component/typings.d.ts';
    const typings_d_ts_path = join(node_modules_types, 'index.d.ts');

    const prepareFolder = new Promise((resolve, reject) => {
      log(chalk.green('|---------------------------------------------'));
      log(chalk.green(`| Generating `) + chalk.yellow(`node_modules/@types/component`) + chalk.green(` folder...`));
      log(chalk.green('|---------------------------------------------'));

      // main folder creating
      mkdirSync(node_modules_types, { recursive: true });
      createFileOrFolder(getTypingData().moduleData, node_modules_types);
      resolve();
    });

    const downloadTypings = await new Promise((resolve, reject) => {
      log(chalk.green('|---------------------------------------------'));
      log(chalk.green(`| Updating typings from `) + chalk.yellow(download_url) + chalk.green(` online `));
      log(chalk.green('|---------------------------------------------'));

      const file = createWriteStream(typings_d_ts_path);
      https.get(download_url, function (response) {
        response.pipe(file);
        // after download completed close filestream
        file.on('finish', () => {
          file.close();
          console.log('Download Completed');
          resolve();
        });
      });
    });

    const replaceTypings = await new Promise((resolve, reject) => {
      log(chalk.green('|---------------------------------------------'));
      log(chalk.green(`| Replace index entries from `) + chalk.yellow('index.d.ts'));
      log(chalk.green('|---------------------------------------------'));

      readFile(typings_d_ts_path, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }

        let result = data;

        log(chalk.green(`| Replace component/base/index `) + chalk.yellow('component/base'));
        while ((result || '').includes('component/base/index')) {
          result = result.replace('component/base/index', 'component/base');
        }

        log(chalk.green(`| Replace component/ui/index `) + chalk.yellow('component/ui'));
        while ((result || '').includes('component/ui/index')) {
          result = result.replace('component/ui/index', 'component/ui');
        }
        writeFile(typings_d_ts_path, result, 'utf8', function (err) {
          resolve();
          if (err) return console.log(err);
        });
      });
    });

    const finalize = await new Promise((resolve, reject) => {
      // optional parameters handling
      if (options) {
        optionsHandlers(options, node_modules_types).then(() => {
          log(chalk.green('|---------------------------------------------'));
          log(chalk.yellow(`| @types/component`) + chalk.green(` update operation done!`));
          log(chalk.green('|---------------------------------------------'));
        });
      } else {
        log(chalk.green('|---------------------------------------------'));
        log(chalk.yellow(`| @types/component`) + chalk.green(` update operation done!`));
        log(chalk.green('|---------------------------------------------'));
      }
      resolve();
    });
  })
  .on('--help', () => {
    log(chalk.green(''));
    log(chalk.green('Examples:'));
    log(chalk.green('  $ update-typings <moduleName>'));
  });

module.exports = {
  program,
};
