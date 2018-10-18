/* eslint-disable no-unused-vars */
import SshKey from '../../models/openstack/SshKey'
import { mapAsJson } from '../../helpers'

const getSshKeys = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const sshKeys = mapAsJson(SshKey.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ keypairs: sshKeys })
}

export default getSshKeys
