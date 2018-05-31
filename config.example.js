/*
 * This is an example of how to set up config.js.
 * Copy this file to config.js and edit.
 * Do NOT rename this file, it will show up as
 * a delete in git.
 */
const config = {
  production: {
    host: 'https://localhost',
    apiHost: 'https://localhost',
  },

  development: {
    host: 'http://localhost:3000',
    apiHost: 'http://localhost:4444',
    simulator: {
      preset: 'base',
      username: 'user@domain.com',
      password: 'secret',
    }
  },

  test: {
    host: 'http://localhost:3000',
    apiHost: 'http://localhost:4444',
    simulator: {
      preset: 'base',
      username: 'user@domain.com',
      password: 'secret',
    }
  },
}

const env = process.env.NODE_ENV || 'development'

module.exports = config[env]
