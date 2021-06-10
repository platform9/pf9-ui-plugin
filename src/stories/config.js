const {
  OS_HOST,
  OS_API_HOST,
  OS_USERNAME,
  OS_PASSWORD,
  // controls which region the GraphQL server uses
  OS_REGION,
} = (process && process.env) || {}
/* eslint-disable */
const envs = {
  stage: { region: 'k8s1', apiHost: 'https://ui-staging.platform9.horse' },
  dev: { region: 'k8s1', apiHost: 'https://ui-dev.platform9.horse' },
}
/* eslint-enable */
const config = {
  production: {
    host: '',
    apiHost: '',
  },
  development: {
    host: 'http://localhost:3000',
    simulator: {
      preset: 'dev',
      username: 'admin@platform9.com',
      password: 'Platform9!@ui-dev',
    },
    developer: true,
  },
  test: {
    host: OS_HOST || 'http://localhost:3000',
    apiHost: OS_API_HOST || 'http://localhost:4444',
    region: OS_REGION || 'KVM-Neutron',
    simulator: {
      preset: 'base',
      username: OS_USERNAME || 'brennan@platform9.com',
      password: OS_PASSWORD || 'OWQ0npYmst9ekiJP',
    },
    // Use the following for testing against a real DU
    username: OS_USERNAME || 'brennan@platform9.com',
    password: OS_PASSWORD || 'OWQ0npYmst9ekiJP',
  },
}
/* CHANGE ME */
const getServer = (target) => envs[target]
config.development = Object.assign(config.development, getServer('dev'))
const env = process.env.NODE_ENV || 'development'
module.exports = config[env]
