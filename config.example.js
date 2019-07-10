/*
 * This is an example of how to set up config.js.
 * Copy this file to config.js and edit.
 * Do NOT rename this file, it will show up as
 * a delete in git.
 */

const {
  OS_API_HOST,
  OS_USERNAME,
  OS_PASSWORD,
  // controls which region the GraphQL server uses
  OS_REGION,
} = (process && process.env) || {}

const config = {
  production: {
    host: '',
    apiHost: '',
    region: OS_REGION,
  },

  development: {
    host: 'http://localhost:3000',
    apiHost: 'http://localhost:4444',
    simulator: {
      preset: 'base',
      username: OS_USERNAME || 'user@domain.com',
      password: OS_PASSWORD || 'secret',
    },
    region: OS_REGION,
    // Show development version of the UI
    developer: true,
  },

  test: {
    host: 'http://localhost:3000',
    apiHost: OS_API_HOST || 'http://localhost:4444',
    simulator: {
      preset: 'base',
      username: OS_USERNAME || 'user@domain.com',
      password: OS_PASSWORD || 'secret',
    },
    // Use the following for testing against a real DU
    username: OS_USERNAME || 'user@domain.com',
    password: OS_PASSWORD || 'secret',
    region: OS_REGION,
  },
}

const env = process.env.NODE_ENV || 'development'

if (env === 'development' && !config.development.simulator) {
  throw new Error('config.development.simulator not found')
}

module.exports = config[env]
