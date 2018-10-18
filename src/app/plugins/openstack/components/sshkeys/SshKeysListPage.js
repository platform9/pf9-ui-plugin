import createCRUDComponents from 'core/createCRUDComponents'
import { deleteSshKey, loadSshKeys } from './actions'

export const options = {
  baseUrl: '/ui/openstack/sshkeys',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'fingerprint', label: 'Fingerprint' },
    { id: 'public_key', label: 'Public Key' },
  ],
  dataKey: 'sshKeys',
  deleteFn: deleteSshKey,
  loaderFn: loadSshKeys,
  name: 'SSHKeys',
  title: 'SSH Keys',
}

const { ListPage, List } = createCRUDComponents(options)
export const SshKeysList = List

export default ListPage
