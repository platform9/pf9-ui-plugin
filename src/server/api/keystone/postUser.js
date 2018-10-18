import User from '../../models/openstack/User'

const postUser = (req, res) => {
  const user = req.body.user
  const newUser = new User(user)
  res.status(201).send({ user: newUser.asJson() })
}

export default postUser
