/* eslint-disable no-unused-vars */
import FloatingIp from '../../models/FloatingIp'

const postFloatingIp = (req, res) => {
  // TODO: account for tenancy
  const floatingIp = req.body.floatingip
  const newFloatingIp = new FloatingIp(floatingIp)
  res.status(201).send({ floatingip: newFloatingIp.asJson() })
}

export default postFloatingIp
