import context from '../../../context'
import ApiAccess from '../../../models/qbert/ApiAccess'

export const getApiAccess = (req, res) => {
  const { clusterId } = req.params
  const apiAccess = ApiAccess.list({ context, config: { clusterId } })
  return res.send(apiAccess)
}