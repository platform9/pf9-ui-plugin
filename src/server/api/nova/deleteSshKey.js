/* eslint-disable no-unused-vars */
import SshKey from '../../models/SshKey'

const deleteSshKey = (req, res) => {
  // TODO: account for tenancy
  const { sshKeyId, tenantId } = req.params
  console.log('Attempting to delete sshKeyId: ', sshKeyId)
  const sshKey = SshKey.findByName(sshKeyId)
  if (!sshKey) {
    console.log('SSH Key NOT found')
    return res.status(404).send({ err: 'SSH Key not found' })
  }
  sshKey.destroy()
  res.status(200).send({})
}

export default deleteSshKey
