import React from 'react';
import { AppProvider } from 'component/base';

import moduleInfo from './moduleInfo';
import routes from './routes';

const className = moduleInfo.name;

export default (params) => {
  return (
    <AppProvider
      {...{
        ...params,
        routes,
        className,
      }}
    />
  );
};
