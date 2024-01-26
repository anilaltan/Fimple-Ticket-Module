import getLocalEntries from '../../webpack/getLocalEntries';
try {
  if (process.env.LOCAL_RUN) {
    getLocalEntries([]);
  }
} catch {}

import('./bootstrap');
