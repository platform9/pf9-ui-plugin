const {
  OS_HOST,
  OS_API_HOST,
  OS_USERNAME,
  OS_PASSWORD,
} = (process && process.env) || {}

const config = {
  development: {
    host: OS_HOST || 'http://localhost:3000',
    apiHost: OS_API_HOST || 'http://localhost:4444',
    simulator: {
      preset: 'dev',
      username: OS_USERNAME || 'admin@platform9.com',
      password: OS_PASSWORD || 'secret',
    }
  }
}

const env = process.env.NODE_ENV || 'development'

module.exports = config[env]
