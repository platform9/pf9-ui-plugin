import User from '../../models/openstack/User'

const deleteUser = (req, res) => {
  const { userId } = req.params
  console.log('Attempting to delete userId: ', userId)
  const user = User.findById(userId)
  if (!user) {
    console.log('User NOT found')
    return res.status(404).send({ err: 'User not found' })
  }
  user.destroy()
  console.log('User destroyed')
  res.status(200).send({})
}

export default deleteUser
