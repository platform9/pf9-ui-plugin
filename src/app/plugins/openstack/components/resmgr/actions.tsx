import ApiClient from 'api-client/ApiClient'

const { resmgr } = ApiClient.getInstance()

export const getService = (service) => (
  resmgr.getService(service)
)

export const updateService = (service, body) => (
  resmgr.updateService(service, body)
)

export const addRole = (hostId, role, body) => (
  resmgr.addRole(hostId, role, body)
)

export const getRole = (hostId, role) => (
  resmgr.getRole(hostId, role)
)
