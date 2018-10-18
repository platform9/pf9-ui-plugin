/* eslint-disable no-unused-vars */
import Flavor from '../../models/openstack/Flavor'

const deleteFlavor = (req, res) => {
  // TODO: account for tenancy
  const { flavorId, tenantId } = req.params
  console.log('Attempting to delete flavorId: ', flavorId)
  const flavor = Flavor.findById(flavorId)
  if (!flavor) {
    console.log('Flavor NOT found')
    return res.status(404).send({ err: 'Flavor not found' })
  }
  flavor.destroy()
  console.log('Flavor destroyed')
  res.status(200).send({})
}

export default deleteFlavor
