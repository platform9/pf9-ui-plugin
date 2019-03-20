const {
  OS_HOST,
  OS_API_HOST,
  OS_USERNAME,
  OS_PASSWORD,
  OS_REGION,
} = (process && process.env) || {}

const config = {
  development: {
    simulator: {
      preset: 'dev',
      username: OS_USERNAME || 'admin@platform9.com',
      password: OS_PASSWORD || 'secret',
    },
    apiHost: OS_API_HOST || 'https://ui-staging-api.platform9.horse',
    host: OS_HOST || 'https://localhost',
    region: OS_REGION || 'Default Region',
  },
}

const env = process.env.NODE_ENV || 'development'

module.exports = config[env]
