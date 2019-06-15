import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteSshKey, loadSshKeys } from './actions'

export const options = {
  addUrl: '/ui/openstack/sshkeys/add',
  addText: 'Add Key',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'fingerprint', label: 'Fingerprint' },
    { id: 'public_key', label: 'Public Key' },
  ],
  dataKey: 'sshKeys',
  deleteFn: deleteSshKey,
  editUrl: '/ui/openstack/sshkeys/edit',
  loaderFn: loadSshKeys,
  name: 'SSHKeys',
  title: 'SSH Keys',
}

const { ListPage, List } = createCRUDComponents(options)
export const SshKeysList = List

export default ListPage
