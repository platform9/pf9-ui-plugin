/* eslint-disable no-unused-vars */
import Router from '../../models/openstack/Router'

const deleteRouter = (req, res) => {
  // TODO: account for tenancy
  const { routerId } = req.params
  console.log('Attempting to delete routerId: ', routerId)
  const router = Router.findById(routerId)
  if (!router) {
    console.log('Router NOT found')
    return res.status(404).send({ err: 'Router not found' })
  }
  router.destroy()
  console.log('Router destroyed')
  res.status(200).send({})
}

export default deleteRouter
