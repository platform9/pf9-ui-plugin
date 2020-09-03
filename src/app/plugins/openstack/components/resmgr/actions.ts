import ApiClient from 'api-client/ApiClient'

const { resMgr } = ApiClient.getInstance()

export const getService = async (service) => resMgr.getService(service)

export const updateService = async (service, body) => resMgr.updateService(service, body)

export const addRole = async (hostId, role, body) => resMgr.addRole(hostId, role, body)

export const getRole = async <T>(hostId, role) => resMgr.getRole<T>(hostId, role)
