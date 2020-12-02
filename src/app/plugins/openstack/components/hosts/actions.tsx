import ApiClient from 'api-client/ApiClient'

const { keystone } = ApiClient.getInstance()

export const getDownloadLinks = async () => {
  return keystone.getDownloadLinks()
}
