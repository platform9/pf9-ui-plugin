import context from '../../context'
import CloudProvider from '../../models/qbert/CloudProvider'

const putCloudProvider = (req, res) => {
  const { cloudProviderId } = req.params
  const updatedCloudProvider = CloudProvider.update(cloudProviderId, req.body, context)
  res.status(200).send(updatedCloudProvider)
}

export default putCloudProvider
