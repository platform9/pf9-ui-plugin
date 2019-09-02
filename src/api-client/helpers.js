import config from '../../config'
import ApiClient from './ApiClient'
import { emptyArr } from 'utils/fp'

const defaultTestTenant = 'Development Team Tenant'

export const keystoneEndpoint = `${config.host}/keystone`
export const keystoneAdminEndpoint = `${config.host}/keystone_admin`
export const makeClient = () => new ApiClient({ keystoneEndpoint })
export const makeAdminClient = () => new ApiClient({ keystoneEndpoint })

export const getUserPass = () => {
  const username = config.username || config.simulator.username
  const password = config.password || config.simulator.password
  if (!username || !password) {
    throw new Error('username and/or password not specified in config.js')
  }
  return { username, password }
}

export const makeUnscopedClient = async () => {
  const { username, password } = getUserPass()
  const client = makeClient()
  await client.keystone.authenticate(username, password)
  return client
}

export const makeScopedClient = async (tenantName = defaultTestTenant) => {
  const client = await makeUnscopedClient()
  const projects = await client.keystone.getProjects()
  const project = projects.find(x => x.name === tenantName) || projects[0]
  await client.keystone.changeProjectScope(project.id)
  return client
}

export const makeRegionedClient = async (tenantName = defaultTestTenant) => {
  const client = await makeScopedClient(tenantName)
  const regions = await client.keystone.getRegions()
  // currently set KVM-Neutron as default test environment
  client.setActiveRegion(regions.find(x => x.id === 'KVM-Neutron').id || regions[0].id)
  await client.keystone.getServicesForActiveRegion()
  return client
}

export const waitUntil = async ({ condition, delay, maxRetries }) =>
  new Promise(async (resolve, reject) => {
    let done = await condition()
    let retry = 0
    while (!done && retry++ < maxRetries) {
      await sleep(delay)
      done = await condition()
    }
    done ? resolve() : reject(new Error('Task not done within time.'))
  })

export const sleep = (delay) =>
  new Promise(resolve => setTimeout(resolve, delay))

export const getHighestRole = (roleNames) => {
  if (roleNames.includes('admin')) {
    return 'admin'
  } else if (roleNames.includes('_member_')) {
    return '_member_'
  } else {
    return roleNames[0]
  }
}

export const normalizeResponse = response => {
  const data = (response && response.hasOwnProperty('data') ? response.data : response)
  // Fix nested data.data issue
  return (data && data.hasOwnProperty('data') ? data.data : data) || emptyArr
}
