import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteCloudProvider, loadCloudProviders } from './actions'

export const options = {
  addUrl: '/ui/kubernetes/infrastructure/cloudProviders/add',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'type', label: 'Type' },
    { id: 'uuid', label: 'Unique ID' },
    // TODO: deployed capacity
    // TODO: clusters
    // TODO: nodes
  ],
  dataKey: 'cloudProviders',
  deleteFn: deleteCloudProvider,
  editUrl: '/ui/kubernetes/infrastructure/cloudProviders/edit',
  loaderFn: loadCloudProviders,
  name: 'CloudProviders',
  rowActions: () => [],
  title: 'Cloud Providers',
  uniqueIdentifier: 'uuid',
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
