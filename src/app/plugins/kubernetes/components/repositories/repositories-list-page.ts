import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { routes } from 'core/utils/routes'
import { repositoryActions } from './actions'
import UpdateRepositoryDialog from './update-repository-dialog'

const renderType = (value) => {
  return value ? 'Private' : 'Public'
}

const renderNumClusters = (value) => {
  return value?.length
}

export const options = {
  loaderFn: repositoryActions.list,
  deleteFn: repositoryActions.delete,
  addText: 'Add New Repository',
  addUrl: routes.repositories.add.path(),
  editUrl: (_, id) => routes.repositories.edit.path({ id }),
  batchActions: [
    {
      icon: 'sync',
      label: 'Update',
      dialog: UpdateRepositoryDialog,
    },
  ],
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusters', label: '# of Assigned Clusters', render: renderNumClusters },
    { id: 'private', label: 'Type', render: renderType },
  ],
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'name',
  multiSelection: false,
  searchTarget: 'name',
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
