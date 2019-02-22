'use strict'

import task from './lib/task'
import defaults from 'defaults'
import Config from 'getfig'

const config = Config.get('taskio') || {}

class Client {
  constructor (opts = {}) {
    opts = (typeof opts === 'object') ? opts : {}

    const baseUrl = opts.serverUrl || config.server.url || config.server.uri || process.env.TASKIO_SERVER_URL || null

    if (!baseUrl) {
      throw new Error('Taskio server url not found or invalid')
    }

    this.baseUrl = baseUrl
    this.config = defaults(opts, {
      response: null,
      baseUrl: this.baseUrl
    })
    this.task = task(this)
  }
}

module.exports = Client
