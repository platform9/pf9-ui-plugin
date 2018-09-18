/* eslint-disable no-unused-vars */
import SshKey from '../../models/SshKey'

const postSshKey = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const sshKey = req.body.keypair
  const newSshKey = new SshKey(sshKey)
  res.status(201).send(newSshKey.asJson())
}

export default postSshKey
