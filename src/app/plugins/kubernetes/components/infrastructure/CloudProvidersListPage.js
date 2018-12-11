import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteCloudProvider, loadCloudProviders } from './actions'

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/cloudProviders',
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
  loaderFn: loadCloudProviders,
  name: 'CloudProviders',
  rowActions: () => [],
  title: 'Cloud Providers',
  uniqueIdentifier: 'uuid',
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
