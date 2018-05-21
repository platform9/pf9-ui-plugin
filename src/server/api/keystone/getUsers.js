import User from '../../models/User'
import { mapAsJson } from '../../helpers'

const getUsers = (req, res) => {
  const users = mapAsJson(User.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ users })
}

export default getUsers
