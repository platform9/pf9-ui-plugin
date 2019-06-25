import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadRepositories, deleteRepository } from 'k8s/components/apps/actions'

export const options = {
  loaderFn: loadRepositories,
  columns: [
    { id: 'attributes.name', label: 'Name' },
    { id: 'attributes.URL', label: 'URL' },
    { id: 'attributes.source', label: 'Source' },
    { id: 'clusters', label: 'Clusters' },
  ],
  dataKey: 'repositories',
  editUrl: '/ui/kubernetes/infrastructure/repositories/edit',
  deleteFn: deleteRepository,
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'id',
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
