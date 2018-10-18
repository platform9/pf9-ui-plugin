/* eslint-disable no-unused-vars */
import Network from '../../models/openstack/Network'

const deleteNetwork = (req, res) => {
  // TODO: account for tenancy
  const { networkId } = req.params
  console.log('Attempting to delete networkId: ', networkId)
  const network = Network.findById(networkId)
  if (!network) {
    console.log('Network NOT found')
    return res.status(404).send({ err: 'Network not found' })
  }
  network.destroy()
  console.log('Network destroyed')
  res.status(200).send({})
}

export default deleteNetwork
