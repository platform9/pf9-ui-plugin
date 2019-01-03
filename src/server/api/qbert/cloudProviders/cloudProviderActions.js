import context from '../../../context'
import CloudProvider from '../../../models/qbert/CloudProvider'

export const getCloudProviders = (req, res) => {
  const cloudProviders = CloudProvider.list({ context })
  return res.send(cloudProviders)
}

export const postCloudProvider = (req, res) => {
  const cloudProvider = req.body
  const newCloudProvider = CloudProvider.create({ cloudProvider, context })
  res.status(201).send(newCloudProvider)
}

export const putCloudProvider = (req, res) => {
  const { cloudProviderId } = req.params
  const updatedCloudProvider = CloudProvider.update({ id: cloudProviderId, data: req.body, context })
  res.status(200).send(updatedCloudProvider)
}

export const deleteCloudProvider = (req, res) => {
  // TODO: account for tenancy
  const { cloudProviderId } = req.params
  console.log('Attempting to delete cloudProviderId: ', cloudProviderId)
  // this should throw an error if it doesn't exist
  CloudProvider.delete({ id: cloudProviderId, context })
  res.status(200).send({})
}
