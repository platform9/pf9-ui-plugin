import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { repositoryActions } from 'k8s/components/apps/actions'

export const options = {
  loaderFn: repositoryActions.list,
  deleteFn: repositoryActions.delete,
  editUrl: '/ui/kubernetes/infrastructure/repositories/edit',
  columns: [
    { id: 'attributes.name', label: 'Name' },
    { id: 'attributes.URL', label: 'URL' },
    { id: 'attributes.source', label: 'Source' },
    { id: 'clusters', label: 'Clusters' },
  ],
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'id',
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
