import { listTablePrefs } from 'app/constants'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useDataLoader from 'core/hooks/useDataLoader'
import useParams from 'core/hooks/useParams'
import { pathOr, pick } from 'ramda'
import React, { useEffect } from 'react'
import { releaseActions } from './actions'

export const viewByClustersColumns = [
  { id: 'clusterName', label: 'Cluster Name' },
  { id: 'kubernetesVersion', label: 'Kubernetes Version' },
  { id: 'numApps', label: '# of Apps' },
  { id: 'workerNodes', label: '# of Worker Nodes' },
]

// export const viewByClustersColumns = [
//   { id: 'id', label: 'Tenant Uuid' },
//   { id: 'name', label: 'Name' },
//   { id: 'description', label: 'Description' },
//   { id: 'clusters', label: 'Mapped Clusters' },
//   {
//     id: 'users',
//     label: 'Users',
//     display: false,
//   },
// ]

const options = {
  columns: viewByClustersColumns,
  name: 'Releases',
  title: 'Releases',
  uniqueIdentifier: 'id',
  showCheckboxes: false,
  compactTable: true,
}

const { ListContainer } = createCRUDComponents(options)

const searchTarget = 'name'

const filterBySearch = (data, target, searchTerm) => {
  if (!searchTerm || !target) {
    return data
  }
  return data.filter(
    (ele) => pathOr('', target.split('.'), ele).match(new RegExp(searchTerm, 'i')) !== null,
  )
}

const DeployedAppsTableClusterView = ({ searchTerm, setColumns, visibleColumns, setReloadFn }) => {
  const { params, getParamsUpdater } = useParams()
  const [releases, loadingReleases, reloadReleases] = useDataLoader(releaseActions.list)
  console.log('releases', releases)

  useEffect(() => {
    setReloadFn(() => reloadReleases())
    setColumns(viewByClustersColumns)
  }, [setReloadFn])

  const filteredData = filterBySearch(releases, searchTarget, searchTerm)

  return (
    <>
      <ListContainer
        getParamsUpdater={getParamsUpdater}
        data={filteredData}
        visibleColumns={visibleColumns}
        reload={reloadReleases}
        loading={loadingReleases}
        showCollapseArrow={true}
        {...pick(listTablePrefs, params)}
      />
    </>
  )
}

export default DeployedAppsTableClusterView

// export const clusterTableToolbarOptions = {
//   columns: viewByClustersColumns,
//   onColumnToggle: () => console.log('column toggled'),
//   visibleColumn: [],
//   searchTerm: 'cluster',
//   onSearchChange: () => console.log('search changed'),
//   rowsPerPage: 10,
//   onChangeRowsPerPage: () => console.log('rows changed'),
//   onRelead: () => console.log('reload'),
// }

// const DeployedAppsTableClusterView = ({ extraLeftToolbarContent }) => {

//   const options = {
//     columns: [
//       { id: 'id', label: 'Tenant Uuid' },
//       { id: 'name', label: 'Name' },
//       { id: 'description', label: 'Description' },
//       { id: 'clusters', label: 'Mapped Clusters' },
//       {
//         id: 'users',
//         label: 'Users',
//         display: false,
//       },
//     ],
//     loaderFn: mngmTenantActions.list,
//     name: 'Tenants',
//     title: 'Tenants',
//     uniqueIdentifier: 'id',
//     showCheckboxes: false,
//     extraLeftToolbarContent: extraLeftToolbarContent,
//   }

//   const { ListPage: AppsList } = createCRUDComponents(options)
//   return <AppsList />
// }
// export default AppsList
