process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const context = require('./context').default
const server = require('./server')
const config = require('../../config')
const User = require('./models/openstack/User').default
const Token = require('./models/openstack/Token').default

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
    const user = new User({ name: username, password })

    // construct a token with a hard-coded id to make testing easier
    new Token({ user, id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  }
}
