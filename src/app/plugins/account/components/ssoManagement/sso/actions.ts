import ApiClient from 'api-client/ApiClient'

const { hagrid } = ApiClient.getInstance()

export const getSsoDetails = async () => hagrid.getSsoDetails()

export const loadSsoConfig = async () => hagrid.getSsoConfig()

export const createSsoConfig = async (config) => hagrid.createSsoConfig(config)

export const deleteSsoConfig = async () => hagrid.deleteSsoConfig()
