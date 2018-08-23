/* eslint-disable no-unused-vars */
import FloatingIp from '../../models/FloatingIp'

const deleteFloatingIp = (req, res) => {
  // TODO: account for tenancy
  const { floatingIpId } = req.params
  console.log('Attempting to delete floatingIpId: ', floatingIpId)
  const floatingIp = FloatingIp.findById(floatingIpId)
  if (!floatingIp) {
    console.log('Floating IP NOT found')
    return res.status(404).send({ err: 'Floating IP not found' })
  }
  floatingIp.destroy()
  console.log('Floating IP destroyed')
  res.status(200).send({})
}

export default deleteFloatingIp
