import context from '../../context'
import CloudProvider from '../../models/qbert/CloudProvider'

const postCloudProvider = (req, res) => {
  const cloudProvider = req.body
  const newCloudProvider = CloudProvider.create(cloudProvider, context)
  res.status(201).send(newCloudProvider)
}

export default postCloudProvider
