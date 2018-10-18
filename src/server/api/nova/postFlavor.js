/* eslint-disable no-unused-vars */
import Flavor from '../../models/openstack/Flavor'

const postFlavor = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const flavor = req.body.flavor
  const newFlavor = new Flavor(flavor)
  res.status(201).send({ flavor: newFlavor.asJson() })
}

export default postFlavor
