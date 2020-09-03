import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { ActionDataKeys } from 'k8s/DataKeys'

export const options = {
  addUrl: '/ui/openstack/tenants/add',
  addText: 'Add Tenant',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'computeUsage', label: 'Compute usage' },
    { id: 'blockStorageUsage', label: 'Block storage usage' },
    { id: 'networkUsage', label: 'Network usage' },
  ],
  cacheKey: ActionDataKeys.Tenants,
  editUrl: '/ui/openstack/tenants/edit',
  name: 'Tenants',
  title: 'Tenants',
}

const { ListPage, List } = createCRUDComponents(options)
export const TenantsList = List

export default ListPage
