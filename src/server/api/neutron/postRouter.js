/* eslint-disable no-unused-vars */
import Router from '../../models/openstack/Router'

const postRouter = (req, res) => {
  // TODO: account for tenancy
  const router = req.body.router
  const newRouter = new Router(router)
  res.status(201).send({ router: newRouter.asJson() })
}

export default postRouter
