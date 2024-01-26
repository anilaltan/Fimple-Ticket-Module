const getModuleDataStructure = (MODULENAME) => {
  const CONFIG = {
    MODULENAME: MODULENAME || 'defaultModuleName',
    UC_WORDS_MODULENAME: MODULENAME[0].toUpperCase() + MODULENAME.slice(1).toLowerCase(),
  };

  const moduleData = {
    FILES: {
      TYPE: 'FILE',
      FILES: {
        DOCKERFILE: {
          NAME: 'Dockerfile',
          TYPE: 'Dockerfile',
          CONTENT: `FROM node:16-alpine
                            ARG WEB_DOMAIN
                            WORKDIR /app
                            COPY ./${CONFIG.MODULENAME} ./${CONFIG.MODULENAME}
                            COPY ./component ./component
                            COPY ./package-${CONFIG.MODULENAME}.json ./package.json
                            COPY ./yarn.lock ./yarn.lock

                            RUN yarn install --legacy-peer-deps
                            RUN yarn install
                            RUN yarn global add serve

                            WORKDIR /app/${CONFIG.MODULENAME}
                            RUN npm run build

                            CMD serve -l 8087 -s dist
                            EXPOSE 8087
                        `,
        },
        PACKAGE: {
          NAME: 'package.json',
          TYPE: 'JSON',
          CONTENT: JSON.stringify(`{
            "name": "${CONFIG.MODULENAME}",
            "fi-metadata": {
              "moduleUniqueName": "${CONFIG.MODULENAME}",
            },
            "version": "1.0.0",
            "private": true,
            "scripts": {
              "start": "webpack serve --config config/webpack.local.js",
              "start:remote": "cross-env WEB_DOMAIN=https://dev.fimple.co.uk LOCAL_ENTRIES=${CONFIG.MODULENAME} webpack serve --config config/webpack.local.js",
              "build": "webpack --config config/webpack.dev.js",
              "build:release": "webpack --config config/webpack.prod.js",
              "clean": "rm -rf dist",
              "clean:node": "rm -rf node_modules"
            },
            "dependencies": {
              "@svgr/webpack": "^6.2.1",
              "react": "^17.0.1",
              "react-dom": "^17.0.1",
              "react-router-dom": "^5.2.0",
              "sass": "^1.49.7"
            },
            "devDependencies": {
              "@babel/core": "^7.12.3",
              "@babel/plugin-transform-runtime": "^7.12.1",
              "@babel/preset-env": "^7.12.1",
              "@babel/preset-react": "^7.12.1",
              "@svgr/webpack": "^6.2.1",
              "babel-loader": "^8.1.0",
              "clean-webpack-plugin": "^3.0.0",
              "cross-env": "^7.0.3",
              "css-loader": "^5.0.0",
              "dotenv-webpack": "^8.0.1",
              "external-remotes-plugin": "^1.0.0",
              "file-loader": "^6.2.0",
              "html-webpack-plugin": "^4.5.0",
              "raw-loader": "^4.0.2",
              "sass-loader": "^12.6.0",
              "style-loader": "^2.0.0",
              "webpack": "^5.4.0",
              "webpack-cli": "^4.1.0",
              "webpack-dev-server": "^3.11.0",
              "webpack-merge": "^5.2.0"
            }
          }
          `),
        },
      },
    },
    CONFIG: {
      NAME: 'config',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            DEV: {
              NAME: 'webpack.dev.js',
              TYPE: 'JS',
              CONTENT: `
const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonDevConfig = require('../../.config/webpack/commonDevConfig');
const getDevRemotes = require('../../.config/webpack/getDevRemotes');

const Dotenv = require('dotenv-webpack');
const envDevConfig = require('../../.config/webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = '${CONFIG.MODULENAME}';

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
                './${CONFIG.UC_WORDS_MODULENAME}App': './src/bootstrap',
            },
            remotes: getDevRemotes([
                'component'
            ]),
            shared: packageJson.dependencies,
        }),
        new ExternalTemplateRemotesPlugin(),
    ],
};

module.exports = merge(commonDevConfig(moduleName), devConfig);
`,
            },
            LOCAL: {
              NAME: 'webpack.local.js',
              TYPE: 'JS',
              CONTENT: `
const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonLocalConfig = require('../../.config/webpack/commonLocalConfig');
const getLocalRemotes = require('../../.config/webpack/getLocalRemotes');

const Dotenv = require('dotenv-webpack');
const envDevConfig = require('../../.config/webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = '${CONFIG.MODULENAME}';

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
                './${CONFIG.UC_WORDS_MODULENAME}App': './src/bootstrap',
            },
            remotes: getLocalRemotes([
                'container',
                'component'
            ]),
            shared: packageJson.dependencies,
        }),
        new ExternalTemplateRemotesPlugin(),
    ],
};

module.exports = merge(commonLocalConfig(moduleName), devConfig);
`,
            },
            PROD: {
              NAME: 'webpack.prod.js',
              TYPE: 'JS',
              CONTENT: `
const { merge } = require('webpack-merge');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const commonProdConfig = require('../../.config/webpack/commonProdConfig');
const getProdRemotes = require('../../.config/webpack/getProdRemotes');

const Dotenv = require('dotenv-webpack');
const envProdConfig = require('../../.config/webpack/envDevConfig');

const packageJson = require('../package.json');

const moduleName = '${CONFIG.MODULENAME}';

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
                './${CONFIG.UC_WORDS_MODULENAME}App': './src/bootstrap',
            },
            remotes: getProdRemotes([
                'component'
            ]),
            shared: packageJson.dependencies,
        }),
        new ExternalTemplateRemotesPlugin(),
    ],
};

module.exports = merge(commonProdConfig(moduleName), prodConfig);
`,
            },
          },
        },
      },
    },
    PUBLIC: {
      NAME: 'public',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            INDEX: {
              NAME: 'index.html',
              TYPE: 'HTML',
              CONTENT: `
                                <!DOCTYPE html>
                                <html>
                                <head></head>
                                <body>
                                <div id="_${CONFIG.MODULENAME}-dev-root"></div>
                                </body>
                                </html>
                            `,
            },
          },
        },
      },
    },
    SOURCE: {
      NAME: 'src',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            APP: {
              NAME: 'App.js',
              TYPE: 'JS',
              CONTENT: `
                            import React from 'react';
                            import { AppProvider } from 'component/base';
                            import routes from './routes';


                            const className = '${CONFIG.MODULENAME}';

                            export default ({
                              history,
                              defaultStore,
                              defaultI18n,
                              authenticationContext,
                              proxyContext,
                              containerContext,
                            }) => {
                              return (
                                <AppProvider
                                  {...{
                                    history,
                                    defaultStore,
                                    defaultI18n,
                                    authenticationContext,
                                    proxyContext,
                                    containerContext,
                                    routes,
                                    className,
                                  }}
                                />
                              );
                            };
                            `,
            },
            BOOTSTRAP: {
              NAME: 'bootstrap.js',
              TYPE: 'JS',
              CONTENT: `import React from 'react';
              import ReactDOM from 'react-dom';
              import { createMemoryHistory, createBrowserHistory } from 'history';
              import App from './App';
              import routes from './routes';

              // Mount function  to start up the app
              const mount = (
                el,
                { onNavigate, history: defaultHistory, initialPath, store, i18n, ...rest }
              ) => {
                const history =
                  defaultHistory ||
                  createMemoryHistory({
                    initialEntries: [initialPath],
                  });

                if (onNavigate) {
                  history.listen(onNavigate);
                }

                ReactDOM.render(
                  <App history={history} defaultStore={store} defaultI18n={i18n} {...rest} />,
                  el
                );

                return {
                  onParentNavigate({ pathname: nextPathname }) {
                    const { pathname } = history.location;

                    if (pathname !== nextPathname) {
                      history.push(nextPathname);
                    }
                  },
                };
              };

              // If we are in development and in isolation,
              // call mount immediately
              if (process.env.NODE_ENV === 'development') {
                const devRoot = document.querySelector('#_${CONFIG.MODULENAME}-dev-root');

                const history = createBrowserHistory();
                if (devRoot) {
                  if (process.env.LOCAL_RUN == true) {
                    if (history.location.pathname == '/') {
                      import('container/selfhost').then((hosting) => {
                        hosting.default(devRoot);
                      });
                    }
                  } else {
                    mount(devRoot, { defaultHistory: history });
                  }
                }
              }

              // We are running through container
              // and we should export the mount function
              export { mount, routes };`,
            },
            INDEX: {
              NAME: 'index.js',
              TYPE: 'JS',
              CONTENT: `import getLocalEntries from '../../.config/webpack/getLocalEntries';
              try {
                  if (process.env.LOCAL_RUN) {
                      getLocalEntries([]);
                  }
              } catch { }

              import('./bootstrap');`,
            },
            ROUTES: {
              NAME: 'routes.js',
              TYPE: 'JS',
              CONTENT: `
                            import { lazy } from 'react';

                            import { NotFound } from 'component/ui';


                            const SampleDefinition = lazy(() => import('./pages/sample-definition'));
                            const SampleList = lazy(() => import('./pages/sample-list'));

                            export default [
                              {
                                name: 'SampleDefinition',
                                module: '/${CONFIG.MODULENAME}',
                                path: '/sample-definition',
                                component: SampleDefinition,
                              },
                              {
                                name: 'SampleList',
                                module: '/${CONFIG.MODULENAME}',
                                path: '/sample-list',
                                component: SampleList,
                              },
                              {
                                name: 'NotFound',
                                module: '/${CONFIG.MODULENAME}',
                                path: '*',
                                component: NotFound,
                              },
                            ];
                            `,
            },
            ENUMS: {
              NAME: 'enums.js',
              TYPE: 'JS',
              CONTENT: `
              const enums = {};
              export { enums };
              export default enums;
              `,
            },
            LOCALES: {
              NAME: 'locales.js',
              TYPE: 'JS',
              CONTENT: `
              import { useTranslation, registerModuleTranslation } from 'component/base';

              import commonAr from '../locales/ar/common.json';
              import commonEn from '../locales/en-US/common.json';
              import commonTr from '../locales/tr-TR/common.json';

              import enumsAr from '../locales/ar/enums.json';
              import enumsEn from '../locales/en-US/enums.json';
              import enumsTr from '../locales/tr-TR/enums.json';

              import uiKeyAr from '../locales/ar/uiKey.json';
              import uiKeyEn from '../locales/en-US/uiKey.json';
              import uiKeyTr from '../locales/tr-TR/uiKey.json';

              import moduleInfo from './moduleInfo';

              const moduleTranslation = {
                common: {
                  'ar': commonAr,
                  'en-US': commonEn,
                  'tr-TR': commonTr
                },
                enums: {
                  'ar': enumsAr,
                  'en-US': enumsEn,
                  'tr-TR': enumsTr
                },
                uiKey: {
                  'ar': uiKeyAr,
                  'en-US': uiKeyEn,
                  'tr-TR': uiKeyTr
                },
              };

              const register = () => registerModuleTranslation(moduleInfo.name, moduleTranslation);

              const useModuleTranslation = () => useTranslation({ moduleName: moduleInfo.name });

              export { register, useModuleTranslation };
              export default { register, useModuleTranslation };
              `,
            },
            MODULEINFO: {
              NAME: 'moduleInfo.js',
              TYPE: 'JS',
              CONTENT: `
              export default { name: '${CONFIG.MODULENAME}' };
              `,
            },
          },
        },
      },
      SUBFOLDER: {
        TYPE: 'FOLDER',
        FOLDERS: {
          PAGES: {
            NAME: 'pages',
            TYPE: 'FOLDER',
            SUBFOLDER: {
              TYPE: 'FOLDER',
              FOLDERS: {
                SAMPLE_DEFINITION: {
                  NAME: 'sample-definition',
                  TYPE: 'FOLDER',
                  FOLDER_FILES: {
                    TYPE: 'FILE',
                    FILES: {
                      TYPE: 'FILE',
                      FILES: {
                        INDEX: {
                          NAME: 'index.js',
                          TYPE: 'JS',
                          CONTENT: `
                          export { default as SampleDefinition } from './SampleDefinition';
                          export { default } from './SampleDefinition';
                          `,
                        },
                        SAMPLE_DEFINITION: {
                          NAME: 'SampleDefinition.js',
                          TYPE: 'JS',
                          CONTENT: `
                                                    import React, { useEffect, useRef, useState, useMemo } from 'react';

                                                    import {
                                                      useAuthenticationContext,
                                                      useFiProxy,
                                                      useSnackbar,
                                                      useTranslation,
                                                      useTransactionContext,
                                                      scopeKeys,
                                                    } from 'component/base';
                                                    import { BasePage, Card, Checkbox, Input, Select, DatePicker, withFormPage } from 'component/ui';

                                                    import { apiUrls } from '../../constants';


                                                    /**
                                                     * UI unique identifier meta-data.
                                                     */
                                                    const uiMetadata = {
                                                      moduleName: '${CONFIG.MODULENAME}',
                                                      uiKey: 'u0x0x0x0x0x'
                                                    };


                                                    const SampleDefinition = ({ close, isBpm, Id, ...rest }) => {
                                                      const { translate } = useTranslation();
                                                      const { tenant } = useAuthenticationContext();
                                                      const { enqueueSnackbar } = useSnackbar();
                                                      const { transactionData } = useTransactionContext();

                                                      const [dataModel, setDataModel] = useState({});

                                                      const nameRef = useRef();
                                                      const codeRef = useRef();
                                                      const descriptionRef = useRef();
                                                      const isActiveRef = useRef(false);

                                                      const { executeGet, executePost, executePut } = useFiProxy();

                                                      useEffect(() => {
                                                        Id && get(Id);
                                                      }, []);

                                                      const filledState = (dataContract) => {
                                                        if (dataContract) {
                                                          nameRef.current.setValue(dataContract.Name);
                                                          codeRef.current.setValue(dataContract.Code);
                                                          descriptionRef.current.setValue(dataContract.Description);
                                                          isActiveRef.current.setValue(dataContract.IsActive);
                                                          setDataModel(dataContract);
                                                        }
                                                      }

                                                      const get = (Id) => {
                                                        executeGet(
                                                          {
                                                            url: apiUrls.sampleApi + Id
                                                          }
                                                        ).then((response) => {
                                                          if (response.Success) {
                                                            filledState(response.Value);
                                                          }
                                                        })
                                                      }

                                                      const onValueChanged = (field, value) => {
                                                        setDataModel({ ...dataModel, [field]: value });
                                                      }

                                                      const onActionClick = (action) => {
                                                        if (action.commandName === 'Save') {
                                                          if (Id > 0) {
                                                            executePut({
                                                              url: apiUrls.Api + Id,
                                                              data: {
                                                                ...dataModel,
                                                                Name: nameRef.current.value,
                                                                Code: codeRef.current.value,
                                                                Description: descriptionRef.current.value,
                                                                IsActive: isActiveRef.current && isActiveRef.current.value ? true : false,
                                                                BeginDate: dataModel.BeginDate,
                                                                EndDate: dataModel.EndDate,
                                                              }
                                                            }).then((response) => {
                                                              if (response.Success) {
                                                                close();
                                                              }
                                                            })
                                                          }
                                                          else {
                                                            executePost({
                                                              url: apiUrls.Api,
                                                              data: {
                                                                ...dataModel,
                                                                Name: nameRef.current.value,
                                                                Code: codeRef.current.value,
                                                                Description: descriptionRef.current.value,
                                                                IsActive: isActiveRef.current.value ? true : false,
                                                                BeginDate: dataModel.BeginDate,
                                                                EndDate: dataModel.EndDate,
                                                              }
                                                            }).then((response) => {
                                                              if (response.Success) {
                                                                close(true);
                                                              }
                                                            })
                                                          }
                                                        }
                                                        else if (action.commandName == 'Cancel') {
                                                          close && close(false);
                                                        }
                                                      }

                                                      return (
                                                        <BasePage
                                                          {...rest}
                                                          onActionClick={onActionClick}
                                                          actionList={[{ name: 'Cancel', variant: 'text', scopeKey: scopeKeys.View_ }, { name: 'Save', scopeKey: scopeKeys.Create_ }]}
                                                          actionPosition='bottom'
                                                        >
                                                          <Card scopeKey={scopeKeys.View_}>
                                                            <Input xs={6} required ref={nameRef} label={translate('Name')} />
                                                            <Input xs={6} required ref={codeRef} label={translate('Code')} />
                                                            <Select xs={6} name='category' label={translate('Category')} datasource={[]} onChange={(value) => onValueChanged('Category', value)} columns={['Name']} valuePath={'Category'} value={dataModel.Category} />
                                                            <DatePicker xs={6} name='beginDate' label={translate('Begin date')} value={dataModel.BeginDate} onChange={(value) => onValueChanged('BeginDate', value)} views={['year', 'month', 'day']} />
                                                            <DatePicker xs={6} name='endDate' label={translate('End date')} value={dataModel.EndDate} onChange={(value) => onValueChanged('EndDate', value)} views={['year', 'month', 'day']} />
                                                            <Checkbox xs={6} ref={isActiveRef} label={translate('Is active')} />
                                                            <Input xs={12} required ref={descriptionRef} rows={3} multiline label={translate('Description')} />
                                                          </Card>
                                                        </BasePage>
                                                      );
                                                    };

                                                    export default withFormPage(SampleDefinition, { uiMetadata })

                                                    `,
                        },
                      },
                    },
                  },
                },
                SAMPLE_LIST: {
                  NAME: 'sample-list',
                  TYPE: 'FOLDER',
                  FOLDER_FILES: {
                    TYPE: 'FILE',
                    FILES: {
                      TYPE: 'FILE',
                      FILES: {
                        INDEX: {
                          NAME: 'index.js',
                          TYPE: 'JS',
                          CONTENT: `
                          export { default as SampleList } from './SampleList';
                          export { default } from './SampleList';
                          `,
                        },
                        SAMPLE_LIST: {
                          NAME: 'SampleList.js',
                          TYPE: 'JS',
                          CONTENT: `
                                    import React, { useEffect, useMemo, useState, useCallback } from 'react';

                                    import {
                                      useAuthenticationContext,
                                      useFiProxy,
                                      useFormManagerContext,
                                      useSnackbar,
                                      useTranslation,
                                      scopeKeys,
                                    } from 'component/base';
                                    import { Card, DataGrid, BasePage, withFormPage } from 'component/ui';

                                    import SampleDefinition from '../sample-definition';
                                    import { apiUrls } from '../../constants';


                                    /**
                                     * UI unique identifier meta-data.
                                     */
                                    const uiMetadata = {
                                      moduleName: '${CONFIG.MODULENAME}',
                                      uiKey: 'u0x0x0x0x0x'
                                    };


                                    const SampleList = (props) => {
                                      const { enqueueSnackbar } = useSnackbar();
                                      const { tenant } = useAuthenticationContext();
                                      const { showDialog } = useFormManagerContext();
                                      const [dataSource, setDataSource] = useState([]);
                                      const { translate } = useTranslation();

                                      const { executeGet, executeDelete } = useFiProxy();

                                      useEffect(() => {
                                        getDataSource();
                                      }, []);

                                      const getDataSource = () => {
                                        executeGet({ url: apiUrls.sampleApi, setStateDelegate: setDataSource })
                                      };

                                      const deleteData = (id) => {
                                        if (id) {
                                          executeDelete({ url: apiUrls.sampleApi + id }).then((response) => {
                                            if (response.Success && response.Value) {
                                              getDataSource();
                                            }
                                          });
                                        }
                                      };

                                      const columns = useMemo(() => {
                                        return [
                                          { name: 'Id', header: translate('Id'), defaultFlex: 1, visible: false },
                                          { name: 'Name', header: translate('Name'), defaultFlex: 1 },
                                        ];
                                      }, []);

                                      const onActionClick = (action) => {
                                      }

                                      const addClicked = useCallback(
                                        () => {
                                          showDialog({
                                            title: translate('Add '),
                                            content: <SampleDefinition />,
                                            callback: () => {
                                              getDataSource();
                                            }
                                          });
                                        }, []);

                                      const editClicked = useCallback(
                                        (id, data) => {
                                          data && showDialog({
                                            title: translate('Edit '),
                                            content: <SampleDefinition Id={data.Id} />,
                                            callback: () => {
                                              getDataSource();
                                            }
                                          });
                                        }, []);

                                      const deleteClicked = useCallback(
                                        (id, data) => {
                                          data && deleteData(data.Id);
                                        }, []);

                                      const gridActionList = useMemo(
                                        () => [
                                          {
                                            name: 'delete',
                                            onClick: deleteClicked,
                                            scopeKey: scopeKeys.X,
                                          },
                                          {
                                            name: 'edit',
                                            onClick: editClicked,
                                            scopeKey: scopeKeys.X,
                                          }
                                        ],
                                        [deleteClicked, editClicked]
                                      );

                                      const cardActionList = useMemo(
                                        () => [
                                          {
                                            name: 'Add',
                                            icon: 'add',
                                            onClick: addClicked,
                                            scopeKey: scopeKeys.X,
                                          },
                                        ],
                                        [addClicked]
                                      );

                                      return (
                                        <BasePage
                                          {...props}
                                          onActionClick={onActionClick}
                                          >
                                          <Card scopeKey={scopeKeys.X}
                                            showHeader={true}
                                            actionList={cardActionList}
                                          >
                                            <DataGrid
                                              dataSource={dataSource}
                                              columns={columns}
                                              actionList={gridActionList}
                                            />
                                          </Card>
                                        </BasePage>
                                      );
                                    };
                                    SampleList.displayName = 'SampleList';

                                    export default withFormPage(SampleList, { uiMetadata });

                                    `,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          CONSTANTS: {
            NAME: 'constants',
            TYPE: 'FOLDER',
            FOLDER_FILES: {
              TYPE: 'FILE',
              FILES: {
                TYPE: 'FILE',
                FILES: {
                  INDEX: {
                    NAME: 'index.js',
                    TYPE: 'JS',
                    CONTENT: `
                                        export * from './apiUrls';
                                        export * from './common';
                                        `,
                  },
                  API_URLS: {
                    NAME: 'apiUrls.js',
                    TYPE: 'JS',
                    CONTENT: `
                                        const apiUrls = {
                                            sampleApi: '${CONFIG.UC_WORDS_MODULENAME}/SampleModule/SampleApi/',
                                          };

                                          export { apiUrls };
                                        `,
                  },
                  COMMON: {
                    NAME: 'common.js',
                    TYPE: 'JS',
                    CONTENT: `
                                        export const SampleEnum = [
                                            { Id: 0, Code: 'Code0', Name: 'Code 0' },
                                            { Id: 1, Code: 'Code1', Name: 'Code 1' },
                                            { Id: 2, Code: 'Code2', Name: 'Code 2' },
                                            { Id: 3, Code: 'Code3', Name: 'Code 3' },
                                            { Id: 4, Code: 'Code4', Name: 'Code 4' }
                                          ];
                                        `,
                  },
                },
              },
            },
          },
          COMPONENTS: {
            NAME: 'components',
            TYPE: 'FOLDER',
            FOLDER_FILES: {
              TYPE: 'FILE',
              FILES: {
                TYPE: 'FILE',
                FILES: {},
              },
            },
          },
        },
      },
    },
  };

  const moduleMLData = {
    ARABIC: {
      NAME: 'ar',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            ENUMS: {
              NAME: 'enums.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{
                "Sample": {
                  "Name": {
                    "First": "John",
                    "Last": "Doe"
                  }
                }
              }`),
            },
            COMMON: {
              NAME: 'common.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{ "Sample": "Sample"}`),
            },
            UI_KEY: {
              NAME: 'uiKey.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{}`),
            },
          },
        },
      },
    },
    ENGLISH: {
      NAME: 'en-US',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            ENUMS: {
              NAME: 'enums.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{
                "Sample": {
                  "Name": {
                    "First": "John",
                    "Last": "Doe"
                  }
                }
              }`),
            },
            COMMON: {
              NAME: 'common.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{ "Sample": "Sample"}`),
            },
            UI_KEY: {
              NAME: 'uiKey.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{}`),
            },
          },
        },
      },
    },
    TURKISH: {
      NAME: 'tr-TR',
      TYPE: 'FOLDER',
      FOLDER_FILES: {
        TYPE: 'FILE',
        FILES: {
          TYPE: 'FILE',
          FILES: {
            ENUMS: {
              NAME: 'enums.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{
                "Sample": {
                  "Name": {
                    "First": "John",
                    "Last": "Doe"
                  }
                }
              }`),
            },
            COMMON: {
              NAME: 'common.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{ "Sample": "Sample"}`),
            },
            UI_KEY: {
              NAME: 'uiKey.json',
              TYPE: 'JSON',
              CONTENT: JSON.stringify(`{}`),
            },
          },
        },
      },
    },
  };

  const moduleContainerData = {
    FILES: {
      TYPE: 'FILE',
      FILES: {
        SAMPLE_REMOTES: {
          NAME: `mf-${CONFIG.MODULENAME}.js`,
          TYPE: 'JS',
          CONTENT: `
          import { mount, routes } from '${CONFIG.MODULENAME}/${CONFIG.UC_WORDS_MODULENAME}App';
          import base from './base';

          const mountMF = (params) => base(mount, params);

          export { mountMF as default, routes };
          `,
        },
      },
    },
  };

  return {
    moduleData,
    moduleMLData,
    moduleContainerData,
  };
};

const getModuleData = (moduleName) => {
  const { moduleData, moduleMLData, moduleContainerData } = getModuleDataStructure(moduleName);
  return { moduleData, moduleMLData, moduleContainerData };
};

const getTypingStructure = () => {
  const CONFIG = {};

  const moduleData = {
    FILES: {
      TYPE: 'FILE',
      FILES: {
        PACKAGE: {
          NAME: 'package.json',
          TYPE: 'JSON',
          CONTENT: JSON.stringify(`{
            "name": "@types/component",
            "version": "1.0.0",
            "description": "TypeScript definitions for fi/base and fi/ui packages",
            "license": "MIT",
            "contributors": [],
            "main": "",
            "types": "index.d.ts",
            "repository": {
                "type": "git",
                "url": "https://github.com/DefinitelyTyped/DefinitelyTyped.git",
                "directory": "types/eslint"
            },
            "scripts": {},
            "dependencies": {
                "@types/react": "*"
            },
            "exports": {
                ".": {
                    "types": "./index.d.ts"
                },
                "./package.json": "./package.json"
            }
        }`),
        },
      },
    },
  };

  return {
    moduleData,
  };
};

const getTypingData = (moduleName) => {
  const { moduleData } = getTypingStructure();
  return { moduleData };
};

module.exports = {
  getModuleData,
  getTypingData,
};
