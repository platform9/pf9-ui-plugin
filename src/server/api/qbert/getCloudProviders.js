import context from '../../context'
import CloudProvider from '../../models/qbert/CloudProvider'

const getCloudProviders = (req, res) => {
  const cloudProviders = CloudProvider.list(context)
  return res.send(cloudProviders)
}

export default getCloudProviders
