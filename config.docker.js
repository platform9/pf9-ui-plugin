const { OS_HOST, OS_REGION, OS_API_HOST, OS_USERNAME, OS_PASSWORD } = (process && process.env) || {}

const config = {
  production: {
    host: '',
    apiHost: '',
    region: OS_REGION,
  },
  test: {
    host: OS_HOST || 'http://localhost:3000',
    apiHost: OS_API_HOST || 'http://localhost:4444',
    simulator: {
      preset: 'dev',
      username: OS_USERNAME || 'admin@platform9.com',
      password: OS_PASSWORD || 'secret',
    },
    // Use the following for testing against a real DU
    username: OS_USERNAME || 'admin@platform9.com',
    password: OS_PASSWORD || 'secret',
    region: OS_REGION || 'Default Region',
  },
}

const env = process.env.NODE_ENV || 'development'

if (env === 'development' && !config.development.simulator) {
  throw new Error('config.development.simulator not found')
}

module.exports = config[env]
