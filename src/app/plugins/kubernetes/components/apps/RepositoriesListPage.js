import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { repositoryActions } from 'k8s/components/apps/actions'
import { allKey } from 'app/constants'

export const options = {
  loaderFn: repositoryActions.list,
  deleteFn: repositoryActions.delete,
  defaultParams: {
    sortBy: 'name',
    sortDirection: 'asc',
    clusterId: allKey,
  },
  editUrl: '/ui/kubernetes/infrastructure/repositories/edit',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'url', label: 'URL' },
    { id: 'source', label: 'Source' },
    { id: 'clusters', label: 'Clusters' },
  ],
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'id',
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
