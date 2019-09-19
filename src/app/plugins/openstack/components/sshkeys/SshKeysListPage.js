import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { sshCacheKey } from './actions'

export const options = {
  addUrl: '/ui/openstack/sshkeys/add',
  addText: 'Add Key',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'fingerprint', label: 'Fingerprint' },
    { id: 'public_key', label: 'Public Key' },
  ],
  cacheKey: sshCacheKey,
  editUrl: '/ui/openstack/sshkeys/edit',
  name: 'SSHKeys',
  title: 'SSH Keys',
}

const { ListPage, List } = createCRUDComponents(options)
export const SshKeysList = List

export default ListPage
