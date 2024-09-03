import { IOClients } from '@vtex/api'

import Status from './status'
import abtest from "./abtest"
import {IOInternalProxy} from './proxy'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }
  public get abtest() {
    return this.getOrSet('abtest', abtest)
  }
  public get proxy() {
    return this.getOrSet('proxy', IOInternalProxy)
  }
}
