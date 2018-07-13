import bodyParser from 'body-parser'
import express from 'express'
import http from 'http'
import { mountGraphql } from './graphql'

import {
  requestLogger,
  enableAllCors,
  injectClientInfo,
} from './middleware'

import keystone from './api/keystone'
import nova from './api/nova'
import neutron from './api/neutron'
import cinder from './api/cinder'

const defaultConfig = {
  port: 4444,
  verbose: process.env.VERBOSE === 'true' || false,
}

let serverInstance

export function startServer (config = defaultConfig) {
  console.log('Starting simulator server.')
  const app = express()

  // Since simulator is on a different port CORS applies.
  // Allow everything for the simulator.
  app.use(enableAllCors)

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  if (config.verbose) {
    app.use(requestLogger)
  }
  app.use(injectClientInfo)

  app.use('/keystone', keystone)
  app.use('/nova', nova)
  app.use('/neutron', neutron)
  app.use('/cinder', cinder)

  mountGraphql(app)

  console.log(`Simulator server currently listening on port ${config.port}`)
  serverInstance = http.createServer(app).listen(config.port)
}

export function stopServer () {
  if (serverInstance) {
    console.log('Stopping simulator server.')
    return serverInstance.close()
  }
  console.log('Simulator server is not currently running.')
}
