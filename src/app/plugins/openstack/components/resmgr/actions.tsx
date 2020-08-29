import ApiClient from 'api-client/ApiClient'

const { resMgr } = ApiClient.getInstance()

export const getService = (service) => resMgr.getService(service)

export const updateService = (service, body) => resMgr.updateService(service, body)

export const addRole = (hostId, role, body) => resMgr.addRole(hostId, role, body)

export const getRole = (hostId, role) => resMgr.getRole(hostId, role)
