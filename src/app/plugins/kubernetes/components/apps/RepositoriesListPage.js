import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadRepositories, deleteRepository } from 'k8s/components/apps/actions'
import { withDataLoader } from 'core/DataLoader'
import { loadClusters } from 'k8s/components/infrastructure/actions'

const ListPage = ({ ListContainer }) =>
  ({ context: { repositories } }) => <ListContainer data={repositories} />

export const options = {
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
  ListPage,
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default withDataLoader(
  [loadClusters, loadRepositories],
)(RepositoriesListPage)
