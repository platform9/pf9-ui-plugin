import ApiResources from '../../../models/qbert/ApiResources'

export const getApiGroupList = (req, res) => {
  const response = {
    apiVersion: 'v1',
    kind: 'APIGroupList',
    groups: ApiResources.getApiGroupList()
  }
  return res.send(response)
}

export const getExtensionsApiResources = (req, res) => {
  const response = {
    groupVersion: 'extensions/v1beta1',
    kind: 'APIResourceList',
    resources: ApiResources.getExtensionsApiResources()
  }
  res.send(response)
}

export const getAppsApiResources = (req, res) => {
  const response = {
    apiVersion: 'v1',
    groupVersion: 'apps/v1',
    kind: 'APIResourceList',
    resources: ApiResources.getAppsApiResources()
  }
  res.send(response)
}

export const getCoreApiResources = (req, res) => {
  const response = {
    groupVersion: 'v1',
    kind: 'APIResourceList',
    resources: ApiResources.getCoreApiResources()
  }
  res.send(response)
}
