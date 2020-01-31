import User from '../../models/openstack/User'

const patchUser = (req, res) => {
  const { userId } = req.params
  const { user } = req.body
  const updatedUser = User.findById(userId)
  updatedUser.update(user)
  res.status(201).send({ user: updatedUser.asJson() })
}

export default patchUser
