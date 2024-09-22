import { IOClients } from '@vtex/api'

import Proxy from './proxy'


// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get proxy() {
    return this.getOrSet('status', Proxy)
  }
}
