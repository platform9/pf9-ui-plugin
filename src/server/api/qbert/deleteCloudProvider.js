import context from '../../context'
import CloudProvider from '../../models/qbert/CloudProvider'

const deleteCloudProvider = (req, res) => {
  // TODO: account for tenancy
  const { cloudProviderId } = req.params
  console.log('Attempting to delete cloudProviderId: ', cloudProviderId)
  // this should throw an error if it doesn't exist
  CloudProvider.delete(cloudProviderId, context)
  res.status(200).send({})
}

export default deleteCloudProvider
