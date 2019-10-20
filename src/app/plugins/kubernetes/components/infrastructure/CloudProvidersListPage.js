import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { cloudProvidersCacheKey } from './actions'

export const options = {
  addUrl: '/ui/kubernetes/infrastructure/cloudProviders/add',
  addText: 'Add Cloud Provider',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'type', label: 'Type' },
    { id: 'uuid', label: 'Unique ID' },
    // TODO: deployed capacity
    // TODO: clusters
    // TODO: nodes
  ],
  cacheKey: cloudProvidersCacheKey,
  editUrl: '/ui/kubernetes/infrastructure/cloudProviders/edit',
  editCond: ([selectedRow]) => {
    return selectedRow.type !== 'openstack'
  },
  editDisabledInfo: ([selectedRow]) => {
    return 'Editing an Openstack cloud provider is not currently supported'
  },
  name: 'CloudProviders',
  rowActions: [],
  title: 'Cloud Providers',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
