import { listTablePrefs } from 'app/constants'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { routes } from 'core/utils/routes'
import React, { useMemo } from 'react'
import { pick } from 'ramda'
import { repositoryActions } from './actions'
import NoRepositoriesMessage from './no-repositories-message'

import UpdateRepositoryDialog from './update-repository-dialog'
import DataKeys from 'k8s/DataKeys'

const usePrefParams = createUsePrefParamsHook('Repositories', listTablePrefs)

const noRepositoriesHeaderMsg = 'Get started by attaching your first Helm Repository.'
const noRepositoriesSecondaryMsg = 'You can do so from the ‘+ Add New Repository’ button above.'

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams({})

    const [repositories, loading, reload] = useDataLoader(repositoryActions.list)

    const noRepositoriesMessage = useMemo(
      () =>
        loading || (repositories && repositories.length > 0) ? null : (
          <NoRepositoriesMessage
            headerMessage={noRepositoriesHeaderMsg}
            secondaryMessage={noRepositoriesSecondaryMsg}
            showAddRepositoryLink={false}
          />
        ),
      [loading, repositories],
    )

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={repositories}
        getParamsUpdater={getParamsUpdater}
        alternativeTableContent={noRepositoriesMessage}
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

const renderType = (value) => {
  return value ? 'Private' : 'Public'
}

const renderNumClusters = (value) => {
  return value?.length
}

export const options = {
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
  cacheKey: DataKeys.Repositories,
  uniqueIdentifier: 'name',
  multiSelection: false,
  searchTargets: ['name'],
  ListPage,
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default RepositoriesListPage
