import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { repositoryActions } from 'k8s/components/apps/actions'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import EditRepoClustersDialog from 'k8s/components/apps/EditRepoClustersDialog'
import { unless, isNil, join, pipe, pluck } from 'ramda'
import AddRepoDialog from 'k8s/components/apps/AddRepoDialog'

const concatClusterNames = pipe(
  pluck('clusterName'),
  unless(isNil, join(', ')),
)

export const options = {
  loaderFn: repositoryActions.list,
  deleteFn: repositoryActions.delete,
  rowActions: [
    { icon: <EditIcon />, label: 'Edit repo clusters', dialog: EditRepoClustersDialog },
  ],
  addText: 'Add New Repository',
  renderAddDialog: onClose => <AddRepoDialog onClose={onClose} />,
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'url', label: 'URL' },
    { id: 'source', label: 'Source' },
    { id: 'clusters', label: 'Clusters', render: concatClusterNames },
  ],
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'id',
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
