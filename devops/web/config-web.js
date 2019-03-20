const {
  OS_HOST,
  OS_API_HOST,
  OS_REGION,
} = (process && process.env) || {}

const config = {
  apiHost: OS_API_HOST || 'https://ui-staging-api.platform9.horse',
  host: OS_HOST || 'https://ui-staging.platform9.horse',
  region: OS_REGION || 'Default Region',
}

module.exports = config
