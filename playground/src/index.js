import getLocalEntries from '../../.config/webpack/getLocalEntries';
try {
    if (process.env.LOCAL_RUN) {
        getLocalEntries([]);
    }
} catch { }

import('./bootstrap');
