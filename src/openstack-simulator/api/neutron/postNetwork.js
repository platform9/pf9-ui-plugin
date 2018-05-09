/* eslint-disable no-unused-vars */
import Network from '../../models/Network'

const postNetwork = (req, res) => {
  // TODO: account for tenancy
  const network = req.body.network
  const newNetwork = new Network(network)
  res.status(201).send({ network: newNetwork.asJson() })
}

export default postNetwork
