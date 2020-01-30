/*
 * This is an example of how to set up config.js.
 * Copy this file to config.js and edit.
 * Do NOT rename this file, it will show up as
 * a delete in git.
 */

const config = {
  production: {
    host: '',
    apiHost: '',
    region: '',
  },

  development: {
    host: 'http://localhost:3000',
    apiHost: 'http://localhost:4444',
    simulator: {
      preset: 'dev',
      username: 'admin@platform9.com',
      password: 'secret',
    },
    region: 'Default Region',
    // Show development version of the UI
    developer: true,
  },

  test: {
    host: 'http://localhost:3000',
    apiHost: 'http://localhost:4444',
    simulator: {
      preset: 'base',
      username: 'admin@platform9.com',
      password: 'secret',
    },
    // Use the following for testing against a real DU
    username: 'admin@platfrom9.com',
    password: 'secret',
    region: 'Default Region',
  },
}

const env = process.env.NODE_ENV || 'development'

if (env === 'development' && !config.development.simulator) {
  throw new Error('config.development.simulator not found')
}

module.exports = config[env]
