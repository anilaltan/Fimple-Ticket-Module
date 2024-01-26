import { lazy } from 'react';

import { NotFound } from 'component/ui';

const SampleDefinition = lazy(() => import('./pages/sample-definition'));
const SampleList = lazy(() => import('./pages/sample-list'));

export default [
  {
    name: 'SampleDefinition',
    module: '/playground',
    path: '/sample-definition',
    component: SampleDefinition,
    uiKey: 'u7e7c13a017',
  },
  {
    name: 'SampleList',
    module: '/playground',
    path: '/sample-list',
    component: SampleList,
    uiKey: 'u24bddfade6',
  },
  {
    name: 'NotFound',
    module: '/playground',
    path: '*',
    component: NotFound,
  },
];
