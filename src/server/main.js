process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const context = require('./context').default
const server = require('./server')
const config = require('../../config')
const User = require('./models/User').default

server.startServer()
context.resetContext()

const { simulator } = config
if (simulator) {
  const { preset } = simulator
  if (preset) {
    const loaderPreset = require(`./presets/${preset}.js`).default
    loaderPreset()
  }

  const { username, password } = simulator
  if (username && password) {
    new User({ name: username, password })
  }
}
