import type { ClientsConfig, RecorderState, ServiceContext } from "@vtex/api";
import { LRUCache, method, Service } from "@vtex/api";

import { Clients } from "./clients";
import { proxy } from "./middlewares/proxy";
import { validate } from "./middlewares/validate";
import { abtest } from "./middlewares/abtest";
import { searchRedirect } from "./middlewares/searchRedirect";

export const TIMEOUT_MS = 20000;

// Create a LRU memory cache for the Status client.
// The 'max' parameter sets the size of the cache.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
// Note that the response from the API being called must include an 'etag' header
// or a 'cache-control' header with a 'max-age' value. If neither exist, the response will not be cached.
// To force responses to be cached, consider adding the `forceMaxAge` option to your client methods.
const memoryCache = new LRUCache<string, any>({ max: 5000 });

metrics.trackCache("home", memoryCache);
metrics.trackCache("styles", memoryCache);
metrics.trackCache("live", memoryCache);
metrics.trackCache("fonts", memoryCache);

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    home: {
      memoryCache,
    },
    styles: {
      memoryCache,
    },
    live: {
      memoryCache,
    }
  },
};

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>;

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    abtest: boolean;
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    // `status` is the route ID from service.json. It maps to an array of middlewares (or a single handler).
    home: method({
      GET: [abtest, proxy],
    }),
    styles: method({
      GET: [abtest, proxy],
    }),
    live: method({
      GET: [proxy],
    }),
    fonts: method({
      GET: [proxy],
    }),
    deco: method({
      GET: [proxy],
      POST: [proxy]
    }),
    fresh: method({
      GET: [proxy],
    }),
    image: method({
      GET: [proxy],
    }),
    sprites: method({
      GET: [proxy],
    }),
    webmanifest: method({
      GET: [proxy],
    }),
    serviceworker: method({
      GET: [proxy]
    }),
    search: method({
      GET: [searchRedirect, proxy]
    })
  },
});
