import {
  Environment,
  RecordSource,
  Store,
} from 'relay-runtime';

import {
  RelayNetworkLayer,
  urlMiddleware,
  loggerMiddleware,
  perfMiddleware,
  retryMiddleware,
  cacheMiddleware,
  progressMiddleware,
} from 'react-relay-network-modern/es';

const network = new RelayNetworkLayer(
  [
    cacheMiddleware({
      size: 100, // max 100 requests
      ttl: 900000, // 15 minutes
    }),
    urlMiddleware({
      url: req => Promise.resolve('http://localhost:60000/relay/v1/cjm0jfuyj000401527ycvcx3n'),
    }),
    loggerMiddleware(),
    perfMiddleware(),
    retryMiddleware({
      fetchTimeout: 15000,
      retryDelays: attempt => Math.pow(2, attempt + 4) * 100, // or simple array [3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600],
      forceRetry: (cb, delay) => {
        window.forceRelayRetry = cb;
        console.log('call `forceRelayRetry()` for immediately retry! Or wait ' + delay + ' ms.');
      },
      statusCodes: [500, 503, 504],
    }),
    progressMiddleware({
      onProgress: (current, total) => {
        console.log('Downloaded: ' + current + ' B, total: ' + total + ' B');
      },
    }),
  ]
);

const environment = new Environment({
  network: network,
  store: new Store(new RecordSource()),
});

export default environment;
