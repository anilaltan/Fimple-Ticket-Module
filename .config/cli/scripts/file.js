const chalk = require('chalk');
const { mkdirSync, writeFileSync, readFileSync } = require('fs');
const { formatContent } = require('./format.js');
const { log } = require('./helper.js');

const createFile = (filePath, fileName, fileContent, fileType) => {
  writeFileSync(filePath + '/' + fileName, formatContent(fileContent, fileType));
  log(chalk.redBright(fileName) + chalk.yellow(` file created successfully`));
  log(chalk.redBright(fileName) + chalk.yellow(` file created successfully`));
};

const createFolder = (folderPath, folderName) => {
  mkdirSync(folderPath + '/' + folderName);
  log(chalk.redBright(folderName) + chalk.yellow(` folder created successfully`));
};

const createFileOrFolder = (obj, parentPath) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (value.TYPE === 'FILE') {
      const FILES = value.FILES;
      Object.entries(FILES).forEach(([key, value]) => {
        createFile(parentPath, value.NAME, value.CONTENT, value.TYPE);
      });
    } else if (value.TYPE === 'FOLDER') {
      createFolder(parentPath, value.NAME);
      const subFolderPath = parentPath + '/' + value.NAME;

      if (value.SUBFOLDER) {
        createFileOrFolder(value.SUBFOLDER.FOLDERS, subFolderPath);
      }

      if (value.FOLDER_FILES) {
        createFileOrFolder(value.FOLDER_FILES, subFolderPath);
      }
    }
  });
};

const createModulesObjectItem = (filePath, moduleName) => {
  const fileContent = readFileSync(filePath, 'utf8');
  eval(fileContent);

  // check moduleName exists
  if (module.exports[moduleName]) {
    log(chalk.redBright(moduleName) + chalk.yellow(` module already exists`));
    return;
  }

  const keys = Object.keys(module.exports);
  const lastElementName = keys[keys.length - 1];
  let newPort = module.exports[lastElementName].port + 1;

  // check if exists port include in fileContent
  while (fileContent.includes(newPort)) {
    newPort++;
  }
  let newModule = `${moduleName}: {
        port: ${newPort},
    },`;

  writeFileSync(filePath, formatContent(formatContent(fileContent, 'JS').replace('};', newModule + '\n};'), 'JS'));
  log(chalk.redBright(moduleName) + chalk.yellow(` module created successfully`));
};

const readAndParseJsonFile = (filePath) => {
  const file = readFileSync(filePath, 'utf8');
  return JSON.parse(file);
};

const writeAndFormatJsonFile = (filePath, fileContent, fileName) => {
  try {
    writeFileSync(filePath, formatContent(JSON.stringify(fileContent, null, 2)));
    log(chalk.redBright(fileName) + chalk.yellow(` added successfully`));
  } catch {
    log(chalk.redBright(fileName) + chalk.yellow(` while writing file`));
  }
};

const addModuleNameToFileContent = (fileContent, moduleName, searchString, fileName) => {
  if (fileContent.includes(moduleName)) {
    log(chalk.redBright(moduleName) + chalk.yellow(` module already exists in ${fileName}`));
    return false;
  }

  const elementIndex = fileContent.findIndex((package) => package.includes(searchString));
  let sortedFileContent = fileContent;

  switch (searchString) {
    case 'component':
      fileContent.unshift(moduleName);
      sortedFileContent = fileContent.splice(0, elementIndex).sort((prev, next) => prev.localeCompare(next));
      fileContent.splice(0, 0, ...sortedFileContent);
      break;
    case 'container':
    default:
      fileContent.push(moduleName);
      sortedFileContent = fileContent
        .splice(elementIndex + 1, fileContent.length)
        .sort((prev, next) => prev.localeCompare(next));
      fileContent.splice(elementIndex + 1, 0, ...sortedFileContent);
      break;
  }

  return true;
};

const addEnvironmentFiles = ({ lernaFilePath, packageJsonFilePath }, moduleName) => {
  const lernaFileContent = readAndParseJsonFile(lernaFilePath);
  const packageJsonFileContent = readAndParseJsonFile(packageJsonFilePath);

  const isAddedLerna = addModuleNameToFileContent(lernaFileContent.packages, moduleName, 'component', 'lerna.json');
  const isAddedPackage = addModuleNameToFileContent(
    packageJsonFileContent.workspaces,
    moduleName,
    'container',
    'package.json',
  );

  if (isAddedLerna) {
    writeAndFormatJsonFile(lernaFilePath, lernaFileContent, 'lerna.json');
  }

  if (isAddedPackage) {
    writeAndFormatJsonFile(packageJsonFilePath, packageJsonFileContent, 'package.json');
  }
};

const addContainerWebpackFiles = ({ webpackLocalFilePath, webpackProdFilePath, webpackDevFilePath }, moduleName) => {
  const updateWebpackFile = (webpackFilePath, getRemotesFunctionName) => {
    try {
      const webpackFileContent = readFileSync(webpackFilePath, 'utf8');
      const remotesArrayIndex = webpackFileContent.indexOf(`${getRemotesFunctionName}([`);
      const remotesArrayEndIndex = webpackFileContent.indexOf(`])`) + 2;
      const remotesArray = webpackFileContent.substring(remotesArrayIndex, remotesArrayEndIndex);
      if (!remotesArray) {
        return;
      }
      const remotesArrayContent = remotesArray
        .substring(remotesArray.indexOf('[') + 1, remotesArray.indexOf(']'))
        .trim();
      const remotesArrayContentArray = remotesArrayContent
        .split(',')
        .map((item) => item.trim().replace(/'/g, ''))
        .filter((item) => item !== '' && item !== moduleName);
      remotesArrayContentArray.push(moduleName);
      remotesArrayContentArray.sort((prev, next) => prev.localeCompare(next));

      const finalContent =
        webpackFileContent.substring(0, remotesArrayIndex) +
        `${getRemotesFunctionName}([${remotesArrayContentArray.map((item) => `'${item}'`).join(',')}])` +
        webpackFileContent.substring(remotesArrayEndIndex, webpackFileContent.length);

      writeFileSync(webpackFilePath, formatContent(finalContent, 'JS'));
      log(chalk.redBright(moduleName) + chalk.yellow(` module name added successfully to ${webpackFilePath}`));
    } catch {
      log(chalk.redBright(moduleName) + chalk.yellow(` while adding module name to ${webpackFilePath}`));
    }
  };

  updateWebpackFile(webpackProdFilePath, 'getProdRemotes');
  updateWebpackFile(webpackDevFilePath, 'getDevRemotes');
  updateWebpackFile(webpackLocalFilePath, 'getLocalRemotes');
};

const addContainerRoutesFile = async (routesPath, moduleName) => {
  // paths operations
  const pathOperations = async (routesFile, moduleName) => {
    let pathsContent = routesFile.split('/* Paths Start - DO NOT REMOVE */')[1];
    pathsContent = pathsContent.split('/* Paths End - DO NOT REMOVE */')[0].trim();

    const pathsNameArray = [];
    const lines = pathsContent.split('\n');
    for (let line of lines) {
      if (!line.startsWith('const')) {
        continue;
      }

      if (!line.includes('lazy(')) {
        continue;
      }

      const componentName = line.split(' = ')[0].trim().split('const')[1].trim();
      pathsNameArray.push(componentName);
    }

    const moduleNameUcWords = moduleName[0].toUpperCase() + moduleName.slice(1);

    // check if exists
    if (pathsNameArray.includes(moduleNameUcWords)) {
      log(chalk.redBright(moduleName) + chalk.yellow(` module already exists in routes`));
      return;
    }

    pathsNameArray.push(moduleNameUcWords);
    pathsNameArray.sort((prev, next) => prev.localeCompare(next));

    const newLine = `const ${moduleNameUcWords} = lazy(() => import('./components/remotes/mf-${moduleName}').then(loadWithRouteCache.bind(this, '${moduleNameUcWords}')));`;
    lines.push(newLine);

    const paths = [];
    for (let pathName of pathsNameArray) {
      const path = lines.find((line) => line.includes(pathName));
      paths.push(path);
    }

    const finalPathsContent = paths.join('\n');

    const finalRoutesFile = routesFile.replace(pathsContent, finalPathsContent);

    await new Promise((resolve, reject) => {
      writeFileSync(routesPath, finalRoutesFile);
      resolve();
    });

    return finalRoutesFile;
  };

  // routes operations
  const routesOperations = async (routesFile, moduleName) => {
    let routesContent = routesFile.split('/* Routes Start - DO NOT REMOVE */')[1].trim();
    routesContent = routesContent.split('/* Routes End - DO NOT REMOVE */')[0].trim();

    const lines = routesContent.split('\n');

    const routesNameArray = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('name:')) {
        let lineObject = {};
        let name = lines[i].split(':')[1].trim().replace(/'/g, '').replace(/,/g, '');
        let module = lines[i + 1].split(':')[1].trim().replace(/'/g, '').replace(/,/g, '');
        let component = lines[i + 2].split(':')[1].trim().replace(/'/g, '').replace(/,/g, '');

        let path = '';
        // check other column exists like path
        if (lines[i + 3] && lines[i + 3].includes('path:')) {
          path = lines[i + 3]
            .trim()
            .replace(/'/g, '')
            .replace(/,/g, '')
            .replace('path:', '')
            .trim()
            .replace('//', '')
            .trim();
        }

        lineObject = {
          name,
          module,
          component,
        };

        if (path && path.length > 0) {
          lineObject.path = path;
        }

        routesNameArray.push(lineObject);
      }
    }

    const moduleNameUcWords = moduleName[0].toUpperCase() + moduleName.slice(1);

    // check if exists
    if (routesNameArray.find((item) => item.name === moduleNameUcWords)) {
      log(chalk.redBright(moduleName) + chalk.yellow(` module already exists in routes`));
      return;
    }

    const newRoutes = {
      name: `${moduleNameUcWords}`,
      module: `/${moduleName.toLowerCase()}`,
      component: moduleNameUcWords,
    };
    routesNameArray.push(newRoutes);

    routesNameArray.sort((prev, next) => prev.name.localeCompare(next.name));

    const routes = [];
    for (let route of routesNameArray) {
      const routeLine = `{
        name: '${route.name}',
        module: '${route.module}',
        component: ${route.component},
        ${route.path ? `path: '${route.path}',` : ''}},`;
      routes.push(routeLine);
    }

    const finalRoutesContent = routes.join('\n');
    const routesContents = `const containerRoutes = [${finalRoutesContent}];`.trim();
    const finalRoutesFile = routesFile.replace(routesContent, formatContent(routesContents, 'JS'));

    writeFileSync(routesPath, finalRoutesFile);
  };

  let routesFile = readFileSync(routesPath, 'utf-8');
  routesFile = await pathOperations(routesFile, moduleName);

  if (!routesFile) {
    return;
  }

  routesOperations(routesFile, moduleName);
  log(chalk.redBright(moduleName) + chalk.yellow(` container > routes.js added to routes file`));
};

const getOnlyFirstTwoChars = (language) => language.substring(0, 2);

const mlExportObjects = (currentData, moduleName) => {
  const result = currentData.trim();
  const lines = result.split('\n');

  let output = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('/** Common')) {
      const langName = line.split('/** Common ')[1].split('-')[0].trim();
      const newLine = `...${moduleName}.common.${langName.trim()},`;
      output += `${newLine}\n`;
      output += `${line}\n`;
    } else {
      output += `${line}\n`;
    }
  }

  // sort
  let sortedOutput = '';
  const languageArray = ['en-US', 'tr-TR', 'ar'];
  for (let i = 1; i <= 3; i++) {
    const sortedOutputArray = output
      .split(': {')
    [i].split('},')[0]
      .trim()
      .split('\n')
      .sort((prev, next) => {
        if (prev.includes('...common.common.') || next.includes('...common.common.')) {
          return 0;
        }
        return prev.localeCompare(next);
      });
    sortedOutputArray.push(
      sortedOutputArray.splice(
        sortedOutputArray.findIndex((item) => {
          if (item.includes(`/** Common ${getOnlyFirstTwoChars(languageArray[i - 1])} - DO NOT REMOVE */`)) {
            return false;
          }
          return item.includes(`/** Common ${getOnlyFirstTwoChars(languageArray[i - 1])} - DO NOT REMOVE */`);
        }),
        i,
      )[0],
    );
    sortedOutput += `"${languageArray[i - 1]}" : {\n${sortedOutputArray.join('\n')}\n},\n`;
  }
  sortedOutput += '}';

  return sortedOutput;
};

const mlModuleObjects = (mlFilePath, fileName, moduleName) => {
  try {
    const mlCommonFile = readFileSync(mlFilePath, 'utf-8');

    const moduleContent = mlCommonFile
      .split('/** Modules - DO NOT REMOVE */')[1]
      .trim()
      .split('/** Common - DO NOT REMOVE */')[0]
      .trim();
    let moduleDefinitions = moduleContent.split('\n');

    // if exists module
    if (moduleDefinitions.find((item) => item.includes(moduleName))) {
      log(chalk.redBright(moduleName) + chalk.yellow(` module already exists in ${fileName} file`));
      return;
    }

    const newModule = `import * as ${moduleName} from './modules/${moduleName}';`;
    moduleDefinitions.push(newModule);

    moduleDefinitions = moduleDefinitions.sort((prev, next) => prev.localeCompare(next)).join('\n');

    const finalMlModules = mlCommonFile.replace(moduleContent, moduleDefinitions);

    const exportDefaultArray = finalMlModules
      .slice(finalMlModules.indexOf('} : {'))
      .split('} : {')[1]
      .split(';')[0]
      .trim();

    const exportContent = mlExportObjects(exportDefaultArray, moduleName);
    const finalMlCommon = finalMlModules.replace(exportDefaultArray, exportContent);

    writeFileSync(mlFilePath, formatContent(finalMlCommon, 'JS'));
    log(chalk.redBright(moduleName) + chalk.yellow(` module name added to ${fileName} file`));
  } catch (err) {
    log(chalk.redBright(moduleName) + chalk.yellow(` module name added failed to ${fileName} file`));
    // err
    log(chalk.redBright(err));
  }
};

const addMultiLanguageFiles = ({ mlCommonFilePath, mlEnumsFilePath, mlUiKeyFilePath }, moduleName) => {
  mlModuleObjects(mlCommonFilePath, 'mlCommon', moduleName);
  mlModuleObjects(mlEnumsFilePath, 'mlEnums', moduleName);
  mlModuleObjects(mlUiKeyFilePath, 'mlUiKey', moduleName);
};

module.exports = {
  addContainerRoutesFile,
  addContainerWebpackFiles,
  addEnvironmentFiles,
  addMultiLanguageFiles,
  createFile,
  createFolder,
  createFileOrFolder,
  createModulesObjectItem,
};
